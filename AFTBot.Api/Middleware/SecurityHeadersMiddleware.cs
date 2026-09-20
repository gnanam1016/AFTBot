namespace AFTBot.Api.Middleware;

public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IConfiguration _configuration;

    public SecurityHeadersMiddleware(RequestDelegate next, IConfiguration configuration)
    {
        _next = next;
        _configuration = configuration;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Add Correlation ID if not present
        if (!context.Request.Headers.TryGetValue("X-Correlation-ID", out var correlationId) || string.IsNullOrWhiteSpace(correlationId))
        {
            correlationId = Guid.NewGuid().ToString("N");
        }
        context.Response.Headers["X-Correlation-ID"] = correlationId;

        // Security headers
        context.Response.Headers["X-Content-Type-Options"] = "nosniff";
        context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
        context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

        // Dynamic CSP frame-ancestors allowing apexfalcontechnologies.com and development origins
        var allowedOrigins = _configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? new[] { "https://apexfalcontechnologies.com", "https://www.apexfalcontechnologies.com", "http://localhost:4200", "http://localhost:5000" };

        var frameAncestors = string.Join(" ", allowedOrigins);
        context.Response.Headers["Content-Security-Policy"] = $"frame-ancestors 'self' {frameAncestors};";

        await _next(context);
    }
}
