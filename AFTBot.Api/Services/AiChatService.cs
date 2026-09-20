using System.ClientModel;
using System.Net.Mail;
using System.Text.Json;
using System.Text.RegularExpressions;
using Azure.AI.OpenAI;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OpenAI.Chat;
using AFTBot.Api.Configuration;
using AFTBot.Api.DTOs.Ai;
using AFTBot.Api.Interfaces;

namespace AFTBot.Api.Services;

public class AiChatService : IAiChatService
{
    private readonly AiOptions _aiOptions;
    private readonly IQualificationFlowService _flowService;
    private readonly IAiResponseValidator _validator;
    private readonly ILogger<AiChatService> _logger;

    public static readonly List<string> StandardPurposes = new()
    {
        "Software / Product Enquiry",
        "Training",
        "Internship",
        "Software Development",
        "AI / IoT Solutions",
        "School / College Solutions",
        "Other"
    };

    public static readonly List<string> ContactChoices = new()
    {
        "Yes, contact me",
        "I'll contact you later"
    };

    public AiChatService(
        IOptions<AiOptions> aiOptions, 
        IQualificationFlowService flowService,
        IAiResponseValidator validator,
        ILogger<AiChatService> logger)
    {
        _aiOptions = aiOptions.Value;
        _flowService = flowService;
        _validator = validator;
        _logger = logger;
    }

    public async Task<AiChatResponse> GenerateResponseAsync(ChatContext context, CancellationToken cancellationToken = default)
    {
        // Check if Azure OpenAI is configured
        if (IsAzureOpenAiConfigured())
        {
            try
            {
                var azureResponse = await CallAzureOpenAiAsync(context, cancellationToken);
                if (azureResponse != null)
                {
                    if (_validator.TryValidateAndSanitize(azureResponse, out var error))
                    {
                        _logger.LogInformation("Successfully generated structured response via Azure OpenAI.");
                        return azureResponse;
                    }
                    else
                    {
                        _logger.LogWarning("Azure OpenAI response validation failed: {Error}. Falling back to rule-based engine.", error);
                    }
                }
                else
                {
                    _logger.LogWarning("Azure OpenAI returned empty or null response. Falling back to rule-based engine.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Azure OpenAI request failed: {Message}. Falling back to rule-based engine.", ex.Message);
            }
        }

        // Fallback to robust conversational state machine
        return EvaluateConversationFlow(context);
    }

    private bool IsAzureOpenAiConfigured()
    {
        return !string.IsNullOrWhiteSpace(_aiOptions.Endpoint) 
            && !string.IsNullOrWhiteSpace(_aiOptions.ApiKey) 
            && !string.IsNullOrWhiteSpace(_aiOptions.DeploymentName)
            && !_aiOptions.ApiKey.StartsWith("YOUR_", StringComparison.OrdinalIgnoreCase);
    }

    private async Task<AiChatResponse?> CallAzureOpenAiAsync(ChatContext context, CancellationToken cancellationToken)
    {
        var endpoint = new Uri(_aiOptions.Endpoint);
        var credential = new ApiKeyCredential(_aiOptions.ApiKey);
        var azureClient = new AzureOpenAIClient(endpoint, credential);
        var chatClient = azureClient.GetChatClient(_aiOptions.DeploymentName);

        var systemPrompt = BuildSystemPrompt(context);
        var messages = new List<OpenAI.Chat.ChatMessage>
        {
            new SystemChatMessage(systemPrompt)
        };

        // Add history
        foreach (var msg in context.History.TakeLast(10))
        {
            if (msg.SenderType == "Bot")
            {
                messages.Add(new AssistantChatMessage(msg.Message));
            }
            else
            {
                messages.Add(new UserChatMessage(msg.Message));
            }
        }

        // Add current user message
        messages.Add(new UserChatMessage(context.UserLatestMessage));

        var options = new ChatCompletionOptions
        {
            ResponseFormat = ChatResponseFormat.CreateJsonObjectFormat(),
            Temperature = 0.3f
        };

        var completion = await chatClient.CompleteChatAsync(messages, options, cancellationToken);
        var responseJson = completion.Value.Content[0].Text;

        _logger.LogDebug("Azure OpenAI raw JSON: {RawJson}", responseJson);

        var serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        return JsonSerializer.Deserialize<AiChatResponse>(responseJson, serializerOptions);
    }

    private string BuildSystemPrompt(ChatContext context)
    {
        var basePrompt = !string.IsNullOrWhiteSpace(_aiOptions.SystemPrompt)
            ? _aiOptions.SystemPrompt
            : "You are AFTBot, the virtual assistant for Apex Falcon Technologies. Engage visitors, identify purpose, collect contact info, and qualify leads.";

        var currentContextInfo = $@"
CURRENT VISITOR CONTEXT:
- Visitor Name: {(string.IsNullOrEmpty(context.VisitorName) ? "Unknown (Collect this first)" : context.VisitorName)}
- Mobile: {(string.IsNullOrEmpty(context.VisitorMobile) ? "Unknown" : context.VisitorMobile)}
- Email: {(string.IsNullOrEmpty(context.VisitorEmail) ? "Unknown" : context.VisitorEmail)}
- Selected Purpose: {(string.IsNullOrEmpty(context.SelectedPurpose) ? "Unknown (Present choices: Software / Product Enquiry, Training, Internship, Software Development, AI / IoT Solutions, School / College Solutions, Other)" : context.SelectedPurpose)}
- Existing Requirement: {context.Requirement ?? "None"}

INSTRUCTIONS:
1. Always respond in JSON format conforming to this schema:
{{
  ""reply"": ""your natural, friendly, concise message to the visitor"",
  ""purpose"": ""one of: Software / Product Enquiry, Training, Internship, Software Development, AI / IoT Solutions, School / College Solutions, Other"",
  ""nextQuestion"": ""name of question being asked"",
  ""quickReplies"": [""Option 1"", ""Option 2""],
  ""leadData"": {{
    ""name"": ""extracted name or null"",
    ""mobile"": ""extracted phone or null"",
    ""email"": ""extracted email or null"",
    ""purpose"": ""selected purpose or null"",
    ""interestedProduct"": ""product name or null"",
    ""organizationType"": ""org type or null"",
    ""requirement"": ""requirement summary or null"",
    ""additionalDetails"": ""additional info or null"",
    ""contactRequested"": true/false/null,
    ""customFields"": {{}}
  }},
  ""isLeadComplete"": true/false
}}
2. Never invent pricing, guarantees, or false company information.
3. Keep questions concise and ask one or two at a time.
4. When enough information has been collected, ask if they want our team to contact them.";

        return basePrompt + "\n\n" + currentContextInfo;
    }

    private AiChatResponse EvaluateConversationFlow(ChatContext context)
    {
        var userMsg = context.UserLatestMessage.Trim();
        var extractedData = new ExtractedLeadData
        {
            Name = context.VisitorName,
            Mobile = context.VisitorMobile,
            Email = context.VisitorEmail,
            Purpose = context.SelectedPurpose,
            Requirement = context.Requirement,
            InterestedProduct = context.InterestedProduct,
            ContactRequested = context.ContactRequested,
            CustomFields = new Dictionary<string, string>(context.CustomFields)
        };

        // Check if user is answering contact consent question
        bool isContactChoice = userMsg.Equals("Yes, contact me", StringComparison.OrdinalIgnoreCase) ||
                               userMsg.Equals("I'll contact you later", StringComparison.OrdinalIgnoreCase) ||
                               userMsg.Contains("contact me", StringComparison.OrdinalIgnoreCase) ||
                               userMsg.Contains("contact later", StringComparison.OrdinalIgnoreCase);

        if (isContactChoice || (!string.IsNullOrWhiteSpace(context.Requirement) && (userMsg.Contains("yes", StringComparison.OrdinalIgnoreCase) || userMsg.Contains("no", StringComparison.OrdinalIgnoreCase) || userMsg.Contains("later", StringComparison.OrdinalIgnoreCase))))
        {
            bool wantsContact = !userMsg.Contains("later", StringComparison.OrdinalIgnoreCase) &&
                                !userMsg.Contains("no", StringComparison.OrdinalIgnoreCase) &&
                                (userMsg.Contains("yes", StringComparison.OrdinalIgnoreCase) || userMsg.Contains("contact me", StringComparison.OrdinalIgnoreCase) || userMsg.Contains("sure", StringComparison.OrdinalIgnoreCase));

            extractedData.ContactRequested = wantsContact;
            return new AiChatResponse
            {
                Reply = wantsContact
                    ? "Thank you! Our expert team at Apex Falcon Technologies will get in touch with you shortly. Have a great day! 🚀"
                    : "No problem at all! Feel free to explore our website or reach back anytime. We're always here to help! 👋",
                LeadData = extractedData,
                IsLeadComplete = true,
                QuickReplies = new List<string> { "Ask another question", "Visit Apex Falcon Website" }
            };
        }

        // 1. Check if name is needed
        if (string.IsNullOrWhiteSpace(context.VisitorName))
        {
            var extractedName = CleanName(userMsg);
            extractedData.Name = extractedName;

            return new AiChatResponse
            {
                Reply = $"Nice to meet you, {extractedName}! 👋 Could you please share your mobile number and email address so we can connect?",
                LeadData = extractedData,
                NextQuestion = "ContactInfo"
            };
        }

        // 2. Check if mobile/email is needed
        if (string.IsNullOrWhiteSpace(context.VisitorMobile) && string.IsNullOrWhiteSpace(context.VisitorEmail))
        {
            ExtractContacts(userMsg, out var mobile, out var email);
            if (!string.IsNullOrWhiteSpace(mobile)) extractedData.Mobile = mobile;
            if (!string.IsNullOrWhiteSpace(email)) extractedData.Email = email;

            return new AiChatResponse
            {
                Reply = "Thank you! What brings you to Apex Falcon Technologies today?",
                QuickReplies = StandardPurposes,
                LeadData = extractedData,
                NextQuestion = "Purpose"
            };
        }

        // 3. Purpose selection & dynamic questions
        var purpose = context.SelectedPurpose;
        if (string.IsNullOrWhiteSpace(purpose))
        {
            purpose = MatchPurpose(userMsg);
            extractedData.Purpose = purpose;

            // Get first qualification question for the purpose
            var firstQ = _flowService.GetNextQuestion(purpose, extractedData.CustomFields);
            if (firstQ != null)
            {
                return new AiChatResponse
                {
                    Reply = firstQ.QuestionText,
                    QuickReplies = firstQ.Options,
                    LeadData = extractedData,
                    Purpose = purpose,
                    NextQuestion = firstQ.StepKey
                };
            }
        }
        else
        {
            // Record answer for current step
            var currentQ = _flowService.GetNextQuestion(purpose, extractedData.CustomFields);
            if (currentQ != null)
            {
                _flowService.ExtractFields(purpose, currentQ.StepKey, userMsg, extractedData.CustomFields);
            }

            // Check if another qualification question remains
            var nextQ = _flowService.GetNextQuestion(purpose, extractedData.CustomFields);
            if (nextQ != null)
            {
                return new AiChatResponse
                {
                    Reply = nextQ.QuestionText,
                    QuickReplies = nextQ.Options,
                    LeadData = extractedData,
                    Purpose = purpose,
                    NextQuestion = nextQ.StepKey
                };
            }
        }

        // 4. All qualification questions for purpose are answered
        if (string.IsNullOrWhiteSpace(extractedData.Requirement))
        {
            extractedData.Requirement = extractedData.CustomFields.Count > 0 
                ? string.Join("; ", extractedData.CustomFields.Select(kv => $"{kv.Key}: {kv.Value}"))
                : userMsg;
            extractedData.InterestedProduct = ExtractProduct(extractedData.Requirement, purpose);
            extractedData.AdditionalDetails = extractedData.Requirement;
        }

        return new AiChatResponse
        {
            Reply = "Thank you for sharing those details! Would you like our team to contact you regarding your requirement?",
            QuickReplies = ContactChoices,
            LeadData = extractedData,
            NextQuestion = "ContactConsent"
        };
    }

    private static string CleanName(string input)
    {
        var cleaned = Regex.Replace(input, @"^(my name is|i am|i'm|this is)\s+", "", RegexOptions.IgnoreCase).Trim();
        if (cleaned.Length > 50) cleaned = cleaned.Substring(0, 50);
        return char.ToUpper(cleaned[0]) + (cleaned.Length > 1 ? cleaned.Substring(1) : "");
    }

    private static void ExtractContacts(string text, out string? mobile, out string? email)
    {
        mobile = null;
        email = null;

        var emailMatch = Regex.Match(text, @"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}");
        if (emailMatch.Success) email = emailMatch.Value;

        var phoneMatch = Regex.Match(text, @"(\+?[0-9]{1,3}[-.\s]?)?(\(?[0-9]{2,4}\)?[-.\s]?)?[0-9]{3,4}[-.\s]?[0-9]{3,4}");
        if (phoneMatch.Success && phoneMatch.Value.Length >= 7) mobile = phoneMatch.Value.Trim();
    }

    private static string MatchPurpose(string input)
    {
        foreach (var p in StandardPurposes)
        {
            if (input.Contains(p, StringComparison.OrdinalIgnoreCase)) return p;
        }

        if (input.Contains("train", StringComparison.OrdinalIgnoreCase) || input.Contains("course", StringComparison.OrdinalIgnoreCase))
            return "Training";
        if (input.Contains("intern", StringComparison.OrdinalIgnoreCase))
            return "Internship";
        if (input.Contains("software", StringComparison.OrdinalIgnoreCase) || input.Contains("develop", StringComparison.OrdinalIgnoreCase) || input.Contains("app", StringComparison.OrdinalIgnoreCase) || input.Contains("website", StringComparison.OrdinalIgnoreCase))
            return "Software Development";
        if (input.Contains("ai", StringComparison.OrdinalIgnoreCase) || input.Contains("iot", StringComparison.OrdinalIgnoreCase) || input.Contains("machine learning", StringComparison.OrdinalIgnoreCase))
            return "AI / IoT Solutions";
        if (input.Contains("school", StringComparison.OrdinalIgnoreCase) || input.Contains("college", StringComparison.OrdinalIgnoreCase) || input.Contains("student", StringComparison.OrdinalIgnoreCase))
            return "School / College Solutions";
        if (input.Contains("product", StringComparison.OrdinalIgnoreCase) || input.Contains("erp", StringComparison.OrdinalIgnoreCase) || input.Contains("crm", StringComparison.OrdinalIgnoreCase))
            return "Software / Product Enquiry";

        return "Other";
    }

    private static string? ExtractProduct(string text, string? purpose)
    {
        if (purpose == "School / College Solutions") return "Apex Campus ERP";
        if (purpose == "Software / Product Enquiry") return "Enterprise Suite";
        if (purpose == "Training") return "Technical Certification";
        if (purpose == "Internship") return "Tech Internship Program";
        return purpose;
    }
}
