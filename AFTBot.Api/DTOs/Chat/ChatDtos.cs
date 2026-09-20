using System.ComponentModel.DataAnnotations;

namespace AFTBot.Api.DTOs.Chat;

public class CreateSessionRequestDto
{
    [Required]
    public string SessionId { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Mobile { get; set; }
    public string? Email { get; set; }
    public string? IPAddress { get; set; }
    public string? UserAgent { get; set; }
}

public class ChatSessionResponseDto
{
    public long ChatSessionId { get; set; }
    public string SessionId { get; set; } = string.Empty;
    public long VisitorId { get; set; }
    public string Status { get; set; } = "Active";
    public string? Purpose { get; set; }
    public long? LeadId { get; set; }
    public DateTime StartedDate { get; set; }
    public List<ChatMessageResponseDto> Messages { get; set; } = new();
    public List<string> SuggestedReplies { get; set; } = new();
}

public class SendMessageRequestDto
{
    [Required]
    public string SessionId { get; set; } = string.Empty;
    [Required]
    public string Message { get; set; } = string.Empty;
    public string? SenderType { get; set; } = "Visitor";
    public string? MessageType { get; set; } = "Text";
    public string? Metadata { get; set; }
}

public class ChatMessageResponseDto
{
    public long ChatMessageId { get; set; }
    public long ChatSessionId { get; set; }
    public string SenderType { get; set; } = "Bot"; // Visitor, Bot, System
    public string Message { get; set; } = string.Empty;
    public string MessageType { get; set; } = "Text";
    public string? Metadata { get; set; }
    public DateTime CreatedDate { get; set; }
    public List<string>? QuickReplies { get; set; }
}
