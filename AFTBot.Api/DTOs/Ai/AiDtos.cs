namespace AFTBot.Api.DTOs.Ai;

public class ChatContext
{
    public string SessionId { get; set; } = string.Empty;
    public string? VisitorName { get; set; }
    public string? VisitorMobile { get; set; }
    public string? VisitorEmail { get; set; }
    public string? SelectedPurpose { get; set; }
    public string? Requirement { get; set; }
    public string? InterestedProduct { get; set; }
    public bool? ContactRequested { get; set; }
    public Dictionary<string, string> CustomFields { get; set; } = new();
    public List<ChatMessageContextDto> History { get; set; } = new();
    public string UserLatestMessage { get; set; } = string.Empty;
}

public class ChatMessageContextDto
{
    public string SenderType { get; set; } = string.Empty; // Visitor or Bot
    public string Message { get; set; } = string.Empty;
}

public class AiChatResponse
{
    public string Reply { get; set; } = string.Empty;
    public string? Purpose { get; set; }
    public string? NextQuestion { get; set; }
    public List<string>? QuickReplies { get; set; }
    public ExtractedLeadData? LeadData { get; set; }
    public bool IsLeadComplete { get; set; }
}

public class ExtractedLeadData
{
    public string? Name { get; set; }
    public string? Mobile { get; set; }
    public string? Email { get; set; }
    public string? Purpose { get; set; }
    public string? InterestedProduct { get; set; }
    public string? OrganizationType { get; set; }
    public string? Requirement { get; set; }
    public string? AdditionalDetails { get; set; }
    public bool? ContactRequested { get; set; }
    public Dictionary<string, string> CustomFields { get; set; } = new();
}
