using System.Diagnostics;

namespace AFTBot.Api.Middleware;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Don't log health check noise if pinged continuously
        if (context.Request.Path.StartsWithSegments("/health"))
        {
            await _next(context);
            return;
        }

        var stopwatch = Stopwatch.StartNew();
        var method = context.Request.Method;
        var path = context.Request.Path;
        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var correlationId = context.Response.Headers["X-Correlation-ID"].ToString();

        _logger.LogInformation("[{CorrelationId}] Incoming HTTP {Method} {Path} from {IP}", correlationId, method, path, ip);

        try
        {
            await _next(context);
            stopwatch.Stop();

            var statusCode = context.Response.StatusCode;
            if (statusCode >= 400)
            {
                _logger.LogWarning("[{CorrelationId}] HTTP {Method} {Path} completed with status {StatusCode} in {ElapsedMs}ms",
                    correlationId, method, path, statusCode, stopwatch.ElapsedMilliseconds);
            }
            else
            {
                _logger.LogInformation("[{CorrelationId}] HTTP {Method} {Path} completed with status {StatusCode} in {ElapsedMs}ms",
                    correlationId, method, path, statusCode, stopwatch.ElapsedMilliseconds);
            }
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _logger.LogError(ex, "[{CorrelationId}] HTTP {Method} {Path} failed after {ElapsedMs}ms",
                correlationId, method, path, stopwatch.ElapsedMilliseconds);
            throw;
        }
    }
}
