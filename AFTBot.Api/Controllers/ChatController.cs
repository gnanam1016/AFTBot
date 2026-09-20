using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using AFTBot.Api.DTOs.Chat;
using AFTBot.Api.DTOs.Common;
using AFTBot.Api.Interfaces;
using AFTBot.Api.Middleware;

namespace AFTBot.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IChatService _chatService;
    private readonly ILogger<ChatController> _logger;

    public ChatController(IChatService chatService, ILogger<ChatController> logger)
    {
        _chatService = chatService;
        _logger = logger;
    }

    /// <summary>
    /// Starts or resumes a chat session for a visitor.
    /// </summary>
    [HttpPost("session")]
    [EnableRateLimiting("SessionPolicy")]
    [ProducesResponseType(typeof(ApiResponse<ChatSessionResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> InitializeSession([FromBody] CreateSessionRequestDto request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.Fail("Invalid request data"));
        }

        var session = await _chatService.InitializeOrGetSessionAsync(request, cancellationToken);
        return Ok(ApiResponse<ChatSessionResponseDto>.Ok(session));
    }

    /// <summary>
    /// Processes a new message from the visitor and returns the bot's reply.
    /// </summary>
    [HttpPost("message")]
    [EnableRateLimiting("ChatPolicy")]
    [ProducesResponseType(typeof(ApiResponse<ChatMessageResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageRequestDto request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.Fail("Invalid message payload"));
        }

        var response = await _chatService.ProcessUserMessageAsync(request, cancellationToken);
        return Ok(ApiResponse<ChatMessageResponseDto>.Ok(response));
    }

    /// <summary>
    /// Retrieves an existing session and message history by session ID.
    /// </summary>
    [HttpGet("session/{sessionId}")]
    [ProducesResponseType(typeof(ApiResponse<ChatSessionResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSession(string sessionId, CancellationToken cancellationToken)
    {
        var session = await _chatService.GetSessionDetailsAsync(sessionId, cancellationToken);
        if (session == null)
        {
            return NotFound(ApiResponse<object>.Fail($"Session '{sessionId}' not found."));
        }

        return Ok(ApiResponse<ChatSessionResponseDto>.Ok(session));
    }

    /// <summary>
    /// Retrieves a list of recent chat sessions with summary details.
    /// </summary>
    [HttpGet("sessions")]
    [AdminAuthorize]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<ChatSessionSummaryDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetRecentSessions([FromQuery] int limit = 50, CancellationToken cancellationToken = default)
    {
        var sessions = await _chatService.GetRecentSessionsAsync(limit, cancellationToken);
        return Ok(ApiResponse<IEnumerable<ChatSessionSummaryDto>>.Ok(sessions));
    }
}
