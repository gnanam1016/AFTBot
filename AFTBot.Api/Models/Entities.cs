namespace AFTBot.Api.Models;

public class Visitor
{
    public long VisitorId { get; set; }
    public string SessionId { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Mobile { get; set; }
    public string? Email { get; set; }
    public string? IPAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime LastActivityDate { get; set; }
}

public class ChatSession
{
    public long ChatSessionId { get; set; }
    public string SessionId { get; set; } = string.Empty;
    public long VisitorId { get; set; }
    public string Status { get; set; } = "Active";
    public string? Purpose { get; set; }
    public long? LeadId { get; set; }
    public DateTime StartedDate { get; set; }
    public DateTime? EndedDate { get; set; }
}

public class ChatMessage
{
    public long ChatMessageId { get; set; }
    public long ChatSessionId { get; set; }
    public string SenderType { get; set; } = "Visitor"; // Visitor, Bot, System
    public string Message { get; set; } = string.Empty;
    public string MessageType { get; set; } = "Text"; // Text, QuickReply, Structured
    public string? Metadata { get; set; }
    public DateTime CreatedDate { get; set; }
}

public class Lead
{
    public long LeadId { get; set; }
    public long VisitorId { get; set; }
    public long ChatSessionId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Mobile { get; set; }
    public string? Email { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public string? InterestedProduct { get; set; }
    public string? OrganizationType { get; set; }
    public string? Requirement { get; set; }
    public string? AdditionalDetails { get; set; }
    public int LeadScore { get; set; }
    public string LeadPriority { get; set; } = "Low";
    public bool ContactRequested { get; set; }
    public string LeadStatus { get; set; } = "New";
    public DateTime CreatedDate { get; set; }
    public DateTime UpdatedDate { get; set; }
}

public class LeadDetail
{
    public long LeadDetailId { get; set; }
    public long LeadId { get; set; }
    public string FieldName { get; set; } = string.Empty;
    public string FieldValue { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
}
