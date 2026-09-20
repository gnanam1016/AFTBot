namespace AFTBot.Api.DTOs.Dashboard;

public class DashboardSummaryDto
{
    public int TotalLeads { get; set; }
    public int NewLeads { get; set; }
    public int ContactedLeads { get; set; }
    public int QualifiedLeads { get; set; }
    public int ConvertedLeads { get; set; }
    public int TodayLeads { get; set; }
    public int HighPriorityLeads { get; set; }
    public int ContactRequestedCount { get; set; }
    public List<PurposeCountDto> PurposeBreakdown { get; set; } = new();
}

public class PurposeCountDto
{
    public string Purpose { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class LeadFilterDto
{
    public string? Purpose { get; set; }
    public string? Status { get; set; }
    public string? Priority { get; set; }
    public string? Product { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? SearchTerm { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class PagedResultDto<T>
{
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public List<T> Items { get; set; } = new();
}
