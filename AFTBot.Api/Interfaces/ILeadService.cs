using AFTBot.Api.DTOs.Dashboard;
using AFTBot.Api.DTOs.Lead;

namespace AFTBot.Api.Interfaces;

public interface ILeadService
{
    Task<LeadResponseDto> CreateLeadAsync(CreateLeadRequestDto request, CancellationToken cancellationToken = default);
    Task<LeadResponseDto?> GetLeadByIdAsync(long leadId, CancellationToken cancellationToken = default);
    Task<PagedResultDto<LeadResponseDto>> GetLeadsAsync(LeadFilterDto filter, CancellationToken cancellationToken = default);
    Task<LeadResponseDto?> UpdateLeadStatusAsync(long leadId, string status, CancellationToken cancellationToken = default);
    Task<LeadResponseDto?> UpdateLeadAsync(long leadId, UpdateLeadRequestDto request, CancellationToken cancellationToken = default);
}
