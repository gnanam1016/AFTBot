using System.Text.Json;
using AFTBot.Api.DTOs.Ai;
using AFTBot.Api.DTOs.Chat;
using AFTBot.Api.DTOs.Lead;
using AFTBot.Api.Interfaces;
using AFTBot.Api.Models;

namespace AFTBot.Api.Services;

public class ChatService : IChatService
{
    private readonly IChatRepository _chatRepository;
    private readonly IVisitorRepository _visitorRepository;
    private readonly ILeadRepository _leadRepository;
    private readonly ILeadService _leadService;
    private readonly IAiChatService _aiChatService;
    private readonly ILogger<ChatService> _logger;

    public ChatService(
        IChatRepository chatRepository,
        IVisitorRepository visitorRepository,
        ILeadRepository leadRepository,
        ILeadService leadService,
        IAiChatService aiChatService,
        ILogger<ChatService> logger)
    {
        _chatRepository = chatRepository;
        _visitorRepository = visitorRepository;
        _leadRepository = leadRepository;
        _leadService = leadService;
        _aiChatService = aiChatService;
        _logger = logger;
    }

    public async Task<ChatSessionResponseDto> InitializeOrGetSessionAsync(CreateSessionRequestDto request, CancellationToken cancellationToken = default)
    {
        // 1. Create or update visitor
        var visitor = await _visitorRepository.CreateOrUpdateVisitorAsync(
            request.SessionId,
            request.Name,
            request.Mobile,
            request.Email,
            request.IPAddress,
            request.UserAgent,
            cancellationToken
        );

        // 2. Create or resume chat session
        var session = await _chatRepository.CreateOrGetChatSessionAsync(
            request.SessionId,
            visitor.VisitorId,
            null,
            cancellationToken
        );

        // 3. Retrieve existing messages if any
        var messages = (await _chatRepository.GetChatMessagesAsync(session.ChatSessionId, cancellationToken)).ToList();

        // 4. If no messages yet, seed friendly welcome message
        if (messages.Count == 0)
        {
            var welcomeText = "Hi! Welcome to Apex Falcon Technologies 👋\n\nI'm AFTBot, your virtual assistant.\n\nI can help you with our software products, training programs, internships and technology solutions.\n\nMay I know your name?";
            var botMsg = await _chatRepository.AddChatMessageAsync(
                session.ChatSessionId,
                "Bot",
                welcomeText,
                "Text",
                null,
                cancellationToken
            );
            messages.Add(botMsg);
        }

        var messageDtos = messages.Select(m => new ChatMessageResponseDto
        {
            ChatMessageId = m.ChatMessageId,
            ChatSessionId = m.ChatSessionId,
            SenderType = m.SenderType,
            Message = m.Message,
            MessageType = m.MessageType,
            Metadata = m.Metadata,
            CreatedDate = m.CreatedDate,
            QuickReplies = ParseQuickReplies(m.Metadata)
        }).ToList();

        var lastMessage = messageDtos.LastOrDefault();

        return new ChatSessionResponseDto
        {
            ChatSessionId = session.ChatSessionId,
            SessionId = session.SessionId,
            VisitorId = session.VisitorId,
            Status = session.Status,
            Purpose = session.Purpose,
            LeadId = session.LeadId,
            StartedDate = session.StartedDate,
            Messages = messageDtos,
            SuggestedReplies = lastMessage?.QuickReplies ?? new List<string>()
        };
    }

    public async Task<ChatMessageResponseDto> ProcessUserMessageAsync(SendMessageRequestDto request, CancellationToken cancellationToken = default)
    {
        // 1. Look up session
        var session = await _chatRepository.GetChatSessionBySessionIdAsync(request.SessionId, cancellationToken);
        if (session == null)
        {
            var init = await InitializeOrGetSessionAsync(new CreateSessionRequestDto { SessionId = request.SessionId }, cancellationToken);
            session = await _chatRepository.GetChatSessionBySessionIdAsync(request.SessionId, cancellationToken)!;
        }

        // 2. Save visitor message
        await _chatRepository.AddChatMessageAsync(
            session!.ChatSessionId,
            "Visitor",
            request.Message,
            request.MessageType ?? "Text",
            request.Metadata,
            cancellationToken
        );

        // 3. Load visitor context & history
        var visitor = await _visitorRepository.GetVisitorByIdAsync(session.VisitorId, cancellationToken);
        var messages = (await _chatRepository.GetChatMessagesAsync(session.ChatSessionId, cancellationToken)).ToList();
        var existingLead = await _leadRepository.GetLeadByChatSessionIdAsync(session.ChatSessionId, cancellationToken);
        var existingDetails = new Dictionary<string, string>();
        if (existingLead != null)
        {
            var detailsList = await _leadRepository.GetLeadDetailsAsync(existingLead.LeadId, cancellationToken);
            foreach (var d in detailsList)
            {
                existingDetails[d.FieldName] = d.FieldValue;
            }
        }

        var context = new ChatContext
        {
            SessionId = request.SessionId,
            VisitorName = visitor?.Name ?? existingLead?.Name,
            VisitorMobile = visitor?.Mobile ?? existingLead?.Mobile,
            VisitorEmail = visitor?.Email ?? existingLead?.Email,
            SelectedPurpose = session.Purpose ?? existingLead?.Purpose,
            Requirement = existingLead?.Requirement,
            InterestedProduct = existingLead?.InterestedProduct,
            ContactRequested = existingLead?.ContactRequested,
            CustomFields = existingDetails,
            UserLatestMessage = request.Message,
            History = messages.Select(m => new ChatMessageContextDto
            {
                SenderType = m.SenderType,
                Message = m.Message
            }).ToList()
        };

        // 4. Generate AI response
        var aiResponse = await _aiChatService.GenerateResponseAsync(context, cancellationToken);

        // 5. If purpose changed or identified, update session
        if (!string.IsNullOrWhiteSpace(aiResponse.Purpose) && session.Purpose != aiResponse.Purpose)
        {
            await _chatRepository.UpdateChatSessionPurposeAsync(session.ChatSessionId, aiResponse.Purpose, cancellationToken);
            session.Purpose = aiResponse.Purpose;
        }

        // 6. If contact or lead info captured, create or update lead
        if (aiResponse.LeadData != null)
        {
            var leadData = aiResponse.LeadData;

            // Update visitor if we have new contact info
            if (!string.IsNullOrWhiteSpace(leadData.Name) || !string.IsNullOrWhiteSpace(leadData.Mobile) || !string.IsNullOrWhiteSpace(leadData.Email))
            {
                await _visitorRepository.CreateOrUpdateVisitorAsync(
                    session.SessionId,
                    leadData.Name ?? visitor?.Name,
                    leadData.Mobile ?? visitor?.Mobile,
                    leadData.Email ?? visitor?.Email,
                    visitor?.IPAddress,
                    visitor?.UserAgent,
                    cancellationToken
                );
            }

            // If we have a purpose and at least name/contact, save/update Lead
            var purpose = leadData.Purpose ?? session.Purpose ?? existingLead?.Purpose;
            var name = leadData.Name ?? visitor?.Name ?? existingLead?.Name;

            if (!string.IsNullOrWhiteSpace(purpose) && !string.IsNullOrWhiteSpace(name))
            {
                var leadDto = new CreateLeadRequestDto
                {
                    VisitorId = session.VisitorId,
                    ChatSessionId = session.ChatSessionId,
                    Name = name,
                    Mobile = leadData.Mobile ?? visitor?.Mobile ?? existingLead?.Mobile,
                    Email = leadData.Email ?? visitor?.Email ?? existingLead?.Email,
                    Purpose = purpose,
                    InterestedProduct = leadData.InterestedProduct ?? existingLead?.InterestedProduct,
                    OrganizationType = leadData.OrganizationType ?? existingLead?.OrganizationType,
                    Requirement = leadData.Requirement ?? existingLead?.Requirement,
                    AdditionalDetails = leadData.AdditionalDetails ?? existingLead?.AdditionalDetails,
                    ContactRequested = leadData.ContactRequested ?? existingLead?.ContactRequested ?? false,
                    PurposeSpecificDetails = leadData.CustomFields
                };

                await _leadService.CreateLeadAsync(leadDto, cancellationToken);
            }
        }

        // 7. Save Bot message
        string? metaJson = null;
        if (aiResponse.QuickReplies != null && aiResponse.QuickReplies.Count > 0)
        {
            metaJson = JsonSerializer.Serialize(new { quickReplies = aiResponse.QuickReplies });
        }

        var botMessage = await _chatRepository.AddChatMessageAsync(
            session.ChatSessionId,
            "Bot",
            aiResponse.Reply,
            aiResponse.QuickReplies?.Count > 0 ? "QuickReply" : "Text",
            metaJson,
            cancellationToken
        );

        return new ChatMessageResponseDto
        {
            ChatMessageId = botMessage.ChatMessageId,
            ChatSessionId = botMessage.ChatSessionId,
            SenderType = botMessage.SenderType,
            Message = botMessage.Message,
            MessageType = botMessage.MessageType,
            Metadata = botMessage.Metadata,
            CreatedDate = botMessage.CreatedDate,
            QuickReplies = aiResponse.QuickReplies
        };
    }

    public async Task<ChatSessionResponseDto?> GetSessionDetailsAsync(string sessionId, CancellationToken cancellationToken = default)
    {
        var session = await _chatRepository.GetChatSessionBySessionIdAsync(sessionId, cancellationToken);
        if (session == null) return null;

        var messages = await _chatRepository.GetChatMessagesAsync(session.ChatSessionId, cancellationToken);
        var messageDtos = messages.Select(m => new ChatMessageResponseDto
        {
            ChatMessageId = m.ChatMessageId,
            ChatSessionId = m.ChatSessionId,
            SenderType = m.SenderType,
            Message = m.Message,
            MessageType = m.MessageType,
            Metadata = m.Metadata,
            CreatedDate = m.CreatedDate,
            QuickReplies = ParseQuickReplies(m.Metadata)
        }).ToList();

        var lastMessage = messageDtos.LastOrDefault();

        return new ChatSessionResponseDto
        {
            ChatSessionId = session.ChatSessionId,
            SessionId = session.SessionId,
            VisitorId = session.VisitorId,
            Status = session.Status,
            Purpose = session.Purpose,
            LeadId = session.LeadId,
            StartedDate = session.StartedDate,
            Messages = messageDtos,
            SuggestedReplies = lastMessage?.QuickReplies ?? new List<string>()
        };
    }

    public async Task<IEnumerable<ChatSessionSummaryDto>> GetRecentSessionsAsync(int limit = 50, CancellationToken cancellationToken = default)
    {
        return await _chatRepository.GetRecentChatSessionsAsync(limit, cancellationToken);
    }

    private static List<string>? ParseQuickReplies(string? metadata)
    {
        if (string.IsNullOrWhiteSpace(metadata)) return null;
        try
        {
            using var doc = JsonDocument.Parse(metadata);
            if (doc.RootElement.TryGetProperty("quickReplies", out var repliesProp) && repliesProp.ValueKind == JsonValueKind.Array)
            {
                return repliesProp.EnumerateArray().Select(x => x.GetString() ?? "").Where(x => !string.IsNullOrEmpty(x)).ToList();
            }
        }
        catch
        {
            // Ignore JSON parse errors
        }
        return null;
    }
}
