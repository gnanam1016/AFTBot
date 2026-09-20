using System.Data;
using AFTBot.Api.Interfaces;
using Dapper;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace AFTBot.Api.Health;

public class DatabaseHealthCheck : IHealthCheck
{
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly ILogger<DatabaseHealthCheck> _logger;

    public DatabaseHealthCheck(IDbConnectionFactory connectionFactory, ILogger<DatabaseHealthCheck> logger)
    {
        _connectionFactory = connectionFactory;
        _logger = logger;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            using var connection = _connectionFactory.CreateConnection();
            if (connection.State != ConnectionState.Open)
            {
                if (connection is System.Data.Common.DbConnection dbConn)
                {
                    await dbConn.OpenAsync(cancellationToken);
                }
                else
                {
                    connection.Open();
                }
            }

            var result = await connection.ExecuteScalarAsync<int>(new CommandDefinition("SELECT 1;", cancellationToken: cancellationToken));
            if (result == 1)
            {
                return HealthCheckResult.Healthy("Database connection to AFTBotDb is responsive.");
            }

            return HealthCheckResult.Degraded("Database returned unexpected response.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database health check failed.");
            return HealthCheckResult.Unhealthy("Database connection failed.", ex);
        }
    }
}
