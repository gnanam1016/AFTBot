namespace AFTBot.Api.DTOs.Common;

public class HealthCheckResponseDto
{
    public string Status { get; set; } = "Healthy";
    public string Service { get; set; } = "AFTBot.Api";
    public string Environment { get; set; } = string.Empty;
    public string Version { get; set; } = "1.0.0";
    public TimeSpan Uptime { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public DatabaseHealthStatusDto Database { get; set; } = new();
}

public class DatabaseHealthStatusDto
{
    public string Status { get; set; } = "Healthy";
    public string Details { get; set; } = "Connected";
    public long ResponseTimeMs { get; set; }
}
