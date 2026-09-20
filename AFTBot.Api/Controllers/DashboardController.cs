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
public class DashboardController : ControllerBase
{
    private readonly IDashboardRepository _dashboardRepository;
    private readonly ILeadService _leadService;

    public DashboardController(IDashboardRepository dashboardRepository, ILeadService leadService)
    {
        _dashboardRepository = dashboardRepository;
        _leadService = leadService;
    }

    /// <summary>
    /// Retrieves aggregate metrics for admin dashboard.
    /// </summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(ApiResponse<DashboardSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken)
    {
        var summary = await _dashboardRepository.GetDashboardSummaryAsync(cancellationToken);
        return Ok(ApiResponse<DashboardSummaryDto>.Ok(summary));
    }

    /// <summary>
    /// Retrieves leads for the dashboard table with filtering.
    /// </summary>
    [HttpGet("leads")]
    [ProducesResponseType(typeof(ApiResponse<PagedResultDto<LeadResponseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDashboardLeads([FromQuery] LeadFilterDto filter, CancellationToken cancellationToken)
    {
        var leads = await _leadService.GetLeadsAsync(filter, cancellationToken);
        return Ok(ApiResponse<PagedResultDto<LeadResponseDto>>.Ok(leads));
    }
}
