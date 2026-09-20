using AFTBot.Api.DTOs.Dashboard;

namespace AFTBot.Api.Interfaces;

public interface IDashboardRepository
{
    Task<DashboardSummaryDto> GetDashboardSummaryAsync(CancellationToken cancellationToken = default);
}
