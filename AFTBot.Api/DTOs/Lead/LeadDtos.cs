using System.ComponentModel.DataAnnotations;

namespace AFTBot.Api.DTOs.Lead;

public class CreateLeadRequestDto
{
    public long VisitorId { get; set; }
    public long ChatSessionId { get; set; }
    [Required]
    public string Name { get; set; } = string.Empty;
    public string? Mobile { get; set; }
    public string? Email { get; set; }
    [Required]
    public string Purpose { get; set; } = string.Empty;
    public string? InterestedProduct { get; set; }
    public string? OrganizationType { get; set; }
    public string? Requirement { get; set; }
    public string? AdditionalDetails { get; set; }
    public bool ContactRequested { get; set; } = false;
    public Dictionary<string, string>? PurposeSpecificDetails { get; set; }
}

public class UpdateLeadRequestDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public string? Mobile { get; set; }
    public string? Email { get; set; }
    [Required]
    public string Purpose { get; set; } = string.Empty;
    public string? InterestedProduct { get; set; }
    public string? OrganizationType { get; set; }
    public string? Requirement { get; set; }
    public string? AdditionalDetails { get; set; }
    public int? LeadScore { get; set; }
    public string? LeadPriority { get; set; }
    public bool? ContactRequested { get; set; }
    public string? LeadStatus { get; set; }
}

public class UpdateLeadStatusRequestDto
{
    [Required]
    public string LeadStatus { get; set; } = "New";
}

public class LeadResponseDto
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
    public string? IPAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime? SessionStartedDate { get; set; }
    public string? SessionStatus { get; set; }
    public List<LeadDetailDto> Details { get; set; } = new();
}

public class LeadDetailDto
{
    public long LeadDetailId { get; set; }
    public long LeadId { get; set; }
    public string FieldName { get; set; } = string.Empty;
    public string FieldValue { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
}
