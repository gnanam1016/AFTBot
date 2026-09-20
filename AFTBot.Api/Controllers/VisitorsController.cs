using Microsoft.AspNetCore.Mvc;
using AFTBot.Api.DTOs.Common;
using AFTBot.Api.DTOs.Visitor;
using AFTBot.Api.Interfaces;

namespace AFTBot.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VisitorsController : ControllerBase
{
    private readonly IVisitorService _visitorService;

    public VisitorsController(IVisitorService visitorService)
    {
        _visitorService = visitorService;
    }

    /// <summary>
    /// Registers or updates visitor metadata.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<VisitorResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateOrUpdateVisitor([FromBody] CreateVisitorRequestDto request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.Fail("Invalid visitor request payload."));
        }

        var visitor = await _visitorService.CreateOrUpdateVisitorAsync(request, cancellationToken);
        return Ok(ApiResponse<VisitorResponseDto>.Ok(visitor));
    }

    /// <summary>
    /// Retrieves visitor details by session ID.
    /// </summary>
    [HttpGet("{sessionId}")]
    [ProducesResponseType(typeof(ApiResponse<VisitorResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetVisitor(string sessionId, CancellationToken cancellationToken)
    {
        var visitor = await _visitorService.GetVisitorBySessionIdAsync(sessionId, cancellationToken);
        if (visitor == null)
        {
            return NotFound(ApiResponse<object>.Fail($"Visitor with session '{sessionId}' not found."));
        }

        return Ok(ApiResponse<VisitorResponseDto>.Ok(visitor));
    }
}
