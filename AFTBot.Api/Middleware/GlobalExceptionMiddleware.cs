using System.Net;
using System.Text.Json;
using AFTBot.Api.DTOs.Common;

namespace AFTBot.Api.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        var message = _env.IsDevelopment() ? exception.Message : "An unexpected internal server error occurred. Please try again later.";
        var errors = _env.IsDevelopment() ? new List<string> { exception.StackTrace ?? "" } : new List<string>();

        var response = ApiResponse<object>.Fail(message, errors);
        var json = JsonSerializer.Serialize(response);

        await context.Response.WriteAsync(json);
    }
}
