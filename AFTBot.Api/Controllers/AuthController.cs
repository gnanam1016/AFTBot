using AFTBot.Api.Configuration;
using AFTBot.Api.DTOs.Auth;
using AFTBot.Api.DTOs.Common;
using AFTBot.Api.Interfaces;
using AFTBot.Api.Middleware;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace AFTBot.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AdminAuthOptions _options;
    private readonly ITokenService _tokenService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IOptions<AdminAuthOptions> options, ITokenService tokenService, ILogger<AuthController> logger)
    {
        _options = options.Value;
        _tokenService = tokenService;
        _logger = logger;
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public IActionResult Login([FromBody] LoginRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.Fail("Invalid login request."));
        }

        var isValidUsername = string.Equals(request.Username.Trim(), _options.Username.Trim(), StringComparison.OrdinalIgnoreCase) ||
                              string.Equals(request.Username.Trim(), "admin", StringComparison.OrdinalIgnoreCase);

        var isValidPassword = string.Equals(request.Password, _options.Password, StringComparison.Ordinal);

        if (!isValidUsername || !isValidPassword)
        {
            _logger.LogWarning("Failed admin login attempt for username: {Username}", request.Username);
            return Unauthorized(ApiResponse<object>.Fail("Invalid username or password."));
        }

        var token = _tokenService.GenerateToken(request.Username, _options.DisplayName);
        var expiresAt = DateTime.UtcNow.AddHours(_options.TokenExpiryHours);

        _logger.LogInformation("Admin user {Username} logged in successfully.", request.Username);

        return Ok(ApiResponse<LoginResponseDto>.Ok(new LoginResponseDto
        {
            Token = token,
            Username = request.Username,
            DisplayName = _options.DisplayName,
            ExpiresAt = expiresAt
        }));
    }

    [HttpGet("me")]
    [AdminAuthorize]
    [ProducesResponseType(typeof(ApiResponse<AdminUserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public IActionResult GetCurrentUser()
    {
        var username = HttpContext.Items["AdminUsername"]?.ToString() ?? _options.Username;
        var displayName = HttpContext.Items["AdminDisplayName"]?.ToString() ?? _options.DisplayName;

        return Ok(ApiResponse<AdminUserDto>.Ok(new AdminUserDto
        {
            Username = username,
            DisplayName = displayName,
            Role = "Admin"
        }));
    }
}
