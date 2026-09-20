using System.Diagnostics;
using AFTBot.Api.DTOs.Common;
using AFTBot.Api.Interfaces;
using Dapper;
using Microsoft.AspNetCore.Mvc;

namespace AFTBot.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly IHostEnvironment _env;
    private static readonly DateTime _startTime = DateTime.UtcNow;

    public HealthController(IDbConnectionFactory connectionFactory, IHostEnvironment env)
    {
        _connectionFactory = connectionFactory;
        _env = env;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<HealthCheckResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetHealth(CancellationToken cancellationToken)
    {
        var dbStatus = new DatabaseHealthStatusDto();
        var sw = Stopwatch.StartNew();

        try
        {
            using var conn = _connectionFactory.CreateConnection();
            var res = await conn.ExecuteScalarAsync<int>(new CommandDefinition("SELECT 1;", cancellationToken: cancellationToken));
            sw.Stop();
            dbStatus.ResponseTimeMs = sw.ElapsedMilliseconds;
            dbStatus.Status = res == 1 ? "Healthy" : "Degraded";
            dbStatus.Details = "SQL Server connection successful.";
        }
        catch (Exception ex)
        {
            sw.Stop();
            dbStatus.ResponseTimeMs = sw.ElapsedMilliseconds;
            dbStatus.Status = "Unhealthy";
            dbStatus.Details = ex.Message;
        }

        var response = new HealthCheckResponseDto
        {
            Status = dbStatus.Status == "Healthy" ? "Healthy" : "Degraded",
            Environment = _env.EnvironmentName,
            Uptime = DateTime.UtcNow - _startTime,
            Timestamp = DateTime.UtcNow,
            Database = dbStatus
        };

        return Ok(ApiResponse<HealthCheckResponseDto>.Ok(response));
    }
}
