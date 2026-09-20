using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using AFTBot.Api.DTOs.Common;
using AFTBot.Api.Interfaces;

namespace AFTBot.Api.Middleware;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class AdminAuthorizeAttribute : Attribute, IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var tokenService = context.HttpContext.RequestServices.GetRequiredService<ITokenService>();

        string? authHeader = context.HttpContext.Request.Headers["Authorization"];
        if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            context.Result = new UnauthorizedObjectResult(ApiResponse<object>.Fail("Unauthorized. Missing or invalid Authorization header."));
            return;
        }

        var token = authHeader.Substring("Bearer ".Length).Trim();
        if (!tokenService.ValidateToken(token, out var username, out var displayName))
        {
            context.Result = new UnauthorizedObjectResult(ApiResponse<object>.Fail("Unauthorized. Invalid or expired token."));
            return;
        }

        context.HttpContext.Items["AdminUsername"] = username;
        context.HttpContext.Items["AdminDisplayName"] = displayName;

        await next();
    }
}
