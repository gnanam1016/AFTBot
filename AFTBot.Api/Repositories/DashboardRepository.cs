using System.Data;
using Dapper;
using AFTBot.Api.DTOs.Dashboard;
using AFTBot.Api.Interfaces;

namespace AFTBot.Api.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public DashboardRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        var command = new CommandDefinition(
            "[dbo].[sp_GetDashboardSummary]",
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken
        );

        using var multi = await connection.QueryMultipleAsync(command);
        var summary = await multi.ReadFirstAsync<DashboardSummaryDto>();
        var purposes = await multi.ReadAsync<PurposeCountDto>();
        summary.PurposeBreakdown = purposes.AsList();

        return summary;
    }
}
