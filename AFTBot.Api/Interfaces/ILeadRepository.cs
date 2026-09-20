using AFTBot.Api.DTOs.Dashboard;
using AFTBot.Api.DTOs.Lead;
using AFTBot.Api.Models;

namespace AFTBot.Api.Interfaces;

public interface ILeadRepository
{
    Task<Lead> CreateOrUpdateLeadAsync(Lead lead, CancellationToken cancellationToken = default);
    Task<LeadResponseDto?> GetLeadByIdAsync(long leadId, CancellationToken cancellationToken = default);
    Task<LeadResponseDto?> GetLeadByChatSessionIdAsync(long chatSessionId, CancellationToken cancellationToken = default);
    Task<PagedResultDto<LeadResponseDto>> GetLeadsAsync(LeadFilterDto filter, CancellationToken cancellationToken = default);
    Task<LeadResponseDto?> UpdateLeadStatusAsync(long leadId, string status, CancellationToken cancellationToken = default);
    Task SaveLeadDetailAsync(long leadId, string fieldName, string fieldValue, CancellationToken cancellationToken = default);
    Task<IEnumerable<LeadDetail>> GetLeadDetailsAsync(long leadId, CancellationToken cancellationToken = default);
}
