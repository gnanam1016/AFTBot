using Microsoft.AspNetCore.Mvc;
using AFTBot.Api.DTOs.Common;
using AFTBot.Api.DTOs.Dashboard;
using AFTBot.Api.DTOs.Lead;
using AFTBot.Api.Interfaces;
using AFTBot.Api.Middleware;

namespace AFTBot.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[AdminAuthorize]
public class LeadsController : ControllerBase
{
    private readonly ILeadService _leadService;

    public LeadsController(ILeadService leadService)
    {
        _leadService = leadService;
    }

    /// <summary>
    /// Creates a new lead manually or from a chat session.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<LeadResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateLead([FromBody] CreateLeadRequestDto request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.Fail("Invalid lead data."));
        }

        var lead = await _leadService.CreateLeadAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetLeadById), new { id = lead.LeadId }, ApiResponse<LeadResponseDto>.Ok(lead));
    }

    /// <summary>
    /// Retrieves leads with filtering and pagination.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResultDto<LeadResponseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLeads([FromQuery] LeadFilterDto filter, CancellationToken cancellationToken)
    {
        var leads = await _leadService.GetLeadsAsync(filter, cancellationToken);
        return Ok(ApiResponse<PagedResultDto<LeadResponseDto>>.Ok(leads));
    }

    /// <summary>
    /// Retrieves a single lead by ID with details and session info.
    /// </summary>
    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(ApiResponse<LeadResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLeadById(long id, CancellationToken cancellationToken)
    {
        var lead = await _leadService.GetLeadByIdAsync(id, cancellationToken);
        if (lead == null)
        {
            return NotFound(ApiResponse<object>.Fail($"Lead with ID {id} not found."));
        }

        return Ok(ApiResponse<LeadResponseDto>.Ok(lead));
    }

    /// <summary>
    /// Updates full lead information.
    /// </summary>
    [HttpPut("{id:long}")]
    [ProducesResponseType(typeof(ApiResponse<LeadResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateLead(long id, [FromBody] UpdateLeadRequestDto request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.Fail("Invalid lead update payload."));
        }

        var updated = await _leadService.UpdateLeadAsync(id, request, cancellationToken);
        if (updated == null)
        {
            return NotFound(ApiResponse<object>.Fail($"Lead with ID {id} not found."));
        }

        return Ok(ApiResponse<LeadResponseDto>.Ok(updated));
    }

    /// <summary>
    /// Updates only the status of a lead (e.g. Contacted, Qualified, Converted).
    /// </summary>
    [HttpPut("{id:long}/status")]
    [ProducesResponseType(typeof(ApiResponse<LeadResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateLeadStatus(long id, [FromBody] UpdateLeadStatusRequestDto request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.Fail("Invalid status update payload."));
        }

        var updated = await _leadService.UpdateLeadStatusAsync(id, request.LeadStatus, cancellationToken);
        if (updated == null)
        {
            return NotFound(ApiResponse<object>.Fail($"Lead with ID {id} not found."));
        }

        return Ok(ApiResponse<LeadResponseDto>.Ok(updated));
    }
}
