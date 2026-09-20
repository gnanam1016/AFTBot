using System.Threading.RateLimiting;
using AFTBot.Api.DTOs.Common;
using AFTBot.Api.Extensions;
using AFTBot.Api.Health;
using AFTBot.Api.Middleware;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Add controllers
builder.Services.AddControllers();

// Configure CORS for Angular frontend and existing website
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:4200", "https://localhost:4200", "https://apexfalcontechnologies.com", "https://www.apexfalcontechnologies.com" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AFTBotCorsPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.ContentType = "application/json";
        var response = ApiResponse<object>.Fail("Too many requests. Please slow down and try again later.");
        await context.HttpContext.Response.WriteAsJsonAsync(response, cancellationToken: token);
    };

    // Chat limiter: 60 requests per minute per IP
    options.AddPolicy("ChatPolicy", httpContext =>
    {
        var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 60,
            Window = TimeSpan.FromMinutes(1),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 2
        });
    });

    // Session creation limiter: 20 per minute per IP
    options.AddPolicy("SessionPolicy", httpContext =>
    {
        var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 20,
            Window = TimeSpan.FromMinutes(1),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0
        });
    });
});

// Configure Health Checks
builder.Services.AddHealthChecks()
    .AddCheck<DatabaseHealthCheck>("sqlserver");

// Configure Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.OpenApiInfo
    {
        Title = "AFTBot API - Apex Falcon Technologies",
        Version = "v1",
        Description = "AI Website Visitor Engagement, Lead Collection & Qualification API"
    });
});

// Add AFTBot Services & Repositories
builder.Services.AddAFTBotServices(builder.Configuration);

var app = builder.Build();

// Pipeline: Security Headers & Request Correlation
app.UseMiddleware<SecurityHeadersMiddleware>();

// Pipeline: Request Diagnostics & Timing
app.UseMiddleware<RequestLoggingMiddleware>();

// Pipeline: Global Exception Handling
app.UseMiddleware<GlobalExceptionMiddleware>();

// Configure HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "AFTBot API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AFTBotCorsPolicy");

app.UseHttpsRedirection();

app.UseRateLimiter();

app.UseAuthorization();

// Health check endpoint (for load balancers and container probes)
app.MapHealthChecks("/health");

app.MapControllers();

app.Run();
