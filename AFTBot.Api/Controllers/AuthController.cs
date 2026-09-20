using AFTBot.Api.Configuration;
using AFTBot.Api.DTOs.Auth;
using AFTBot.Api.DTOs.Common;
using AFTBot.Api.Interfaces;
using AFTBot.Api.Middleware;
using AFTBot.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace AFTBot.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAdminUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly JwtOptions _jwtOptions;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IAdminUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService,
        IOptions<JwtOptions> jwtOptions,
        ILogger<AuthController> logger)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _jwtOptions = jwtOptions.Value;
        _logger = logger;
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.Fail("Invalid login request."));
        }

        var user = await _userRepository.GetByUsernameOrEmailAsync(request.Username, cancellationToken);
        if (user == null || !user.IsActive)
        {
            _logger.LogWarning("Failed login attempt: User '{Username}' not found or inactive.", request.Username);
            return Unauthorized(ApiResponse<object>.Fail("Invalid username or password."));
        }

        var isPasswordValid = _passwordHasher.VerifyPassword(request.Password, user.PasswordHash, user.PasswordSalt);
        if (!isPasswordValid)
        {
            _logger.LogWarning("Failed login attempt: Invalid password for user '{Username}'.", request.Username);
            return Unauthorized(ApiResponse<object>.Fail("Invalid username or password."));
        }

        // Update last login timestamp asynchronously
        await _userRepository.UpdateLastLoginAsync(user.AdminUserId, cancellationToken);

        var token = _tokenService.GenerateToken(user.Username, user.DisplayName, user.Role);
        var expiresAt = DateTime.UtcNow.AddHours(_jwtOptions.TokenExpiryHours);

        _logger.LogInformation("Admin user '{Username}' ({DisplayName}) logged in successfully.", user.Username, user.DisplayName);

        return Ok(ApiResponse<LoginResponseDto>.Ok(new LoginResponseDto
        {
            Token = token,
            Username = user.Username,
            DisplayName = user.DisplayName,
            ExpiresAt = expiresAt
        }));
    }

    [HttpGet("me")]
    [AdminAuthorize]
    [ProducesResponseType(typeof(ApiResponse<AdminUserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public IActionResult GetCurrentUser()
    {
        var username = HttpContext.Items["AdminUsername"]?.ToString() ?? "admin";
        var displayName = HttpContext.Items["AdminDisplayName"]?.ToString() ?? "Admin";

        return Ok(ApiResponse<AdminUserDto>.Ok(new AdminUserDto
        {
            Username = username,
            DisplayName = displayName,
            Role = "Admin"
        }));
    }

    [HttpPost("users")]
    [AdminAuthorize]
    [ProducesResponseType(typeof(ApiResponse<AdminUserResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateUser([FromBody] CreateAdminUserRequestDto request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.Fail("Invalid user creation request."));
        }

        var existingUser = await _userRepository.GetByUsernameOrEmailAsync(request.Username, cancellationToken);
        if (existingUser != null)
        {
            return BadRequest(ApiResponse<object>.Fail("Username is already taken."));
        }

        var existingEmail = await _userRepository.GetByUsernameOrEmailAsync(request.Email, cancellationToken);
        if (existingEmail != null)
        {
            return BadRequest(ApiResponse<object>.Fail("Email is already registered."));
        }

        var (hash, salt) = _passwordHasher.HashPassword(request.Password);

        var newUser = new AdminUser
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = hash,
            PasswordSalt = salt,
            DisplayName = request.DisplayName,
            Role = string.IsNullOrWhiteSpace(request.Role) ? "Admin" : request.Role,
            IsActive = true
        };

        try
        {
            var created = await _userRepository.CreateUserAsync(newUser, cancellationToken);
            _logger.LogInformation("New admin user created: {Username} ({Email})", created.Username, created.Email);

            return StatusCode(StatusCodes.Status201Created, ApiResponse<AdminUserResponseDto>.Ok(new AdminUserResponseDto
            {
                AdminUserId = created.AdminUserId,
                Username = created.Username,
                Email = created.Email,
                DisplayName = created.DisplayName,
                Role = created.Role,
                IsActive = created.IsActive,
                LastLoginDate = created.LastLoginDate,
                CreatedDate = created.CreatedDate
            }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating admin user {Username}", request.Username);
            return BadRequest(ApiResponse<object>.Fail(ex.Message));
        }
    }

    [HttpGet("users")]
    [AdminAuthorize]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<AdminUserResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAllUsers(CancellationToken cancellationToken)
    {
        var users = await _userRepository.GetAllUsersAsync(cancellationToken);
        var dtos = users.Select(u => new AdminUserResponseDto
        {
            AdminUserId = u.AdminUserId,
            Username = u.Username,
            Email = u.Email,
            DisplayName = u.DisplayName,
            Role = u.Role,
            IsActive = u.IsActive,
            LastLoginDate = u.LastLoginDate,
            CreatedDate = u.CreatedDate
        });

        return Ok(ApiResponse<IEnumerable<AdminUserResponseDto>>.Ok(dtos));
    }
}
