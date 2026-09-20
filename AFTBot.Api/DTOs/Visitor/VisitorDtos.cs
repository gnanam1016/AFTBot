using System.ComponentModel.DataAnnotations;

namespace AFTBot.Api.DTOs.Visitor;

public class CreateVisitorRequestDto
{
    [Required]
    public string SessionId { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Mobile { get; set; }
    public string? Email { get; set; }
    public string? IPAddress { get; set; }
    public string? UserAgent { get; set; }
}

public class VisitorResponseDto
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
