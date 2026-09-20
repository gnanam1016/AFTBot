namespace AFTBot.Api.DTOs.Chat;

public class ChatSessionSummaryDto
{
    public long ChatSessionId { get; set; }
    public string SessionId { get; set; } = string.Empty;
    public long VisitorId { get; set; }
    public string? VisitorName { get; set; }
    public string? VisitorMobile { get; set; }
    public string? VisitorEmail { get; set; }
    public string Status { get; set; } = "Active";
    public string? Purpose { get; set; }
    public long? LeadId { get; set; }
    public int MessageCount { get; set; }
    public DateTime StartedDate { get; set; }
    public DateTime? LastActivityDate { get; set; }
}
