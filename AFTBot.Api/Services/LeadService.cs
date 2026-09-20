using AFTBot.Api.DTOs.Dashboard;
using AFTBot.Api.DTOs.Lead;
using AFTBot.Api.Interfaces;
using AFTBot.Api.Models;

namespace AFTBot.Api.Services;

public class LeadService : ILeadService
{
    private readonly ILeadRepository _leadRepository;
    private readonly ILeadScoringService _scoringService;

    public LeadService(ILeadRepository leadRepository, ILeadScoringService scoringService)
    {
        _leadRepository = leadRepository;
        _scoringService = scoringService;
    }

    public async Task<LeadResponseDto> CreateLeadAsync(CreateLeadRequestDto request, CancellationToken cancellationToken = default)
    {
        var lead = new Lead
        {
            VisitorId = request.VisitorId,
            ChatSessionId = request.ChatSessionId,
            Name = request.Name,
            Mobile = request.Mobile,
            Email = request.Email,
            Purpose = request.Purpose,
            InterestedProduct = request.InterestedProduct,
            OrganizationType = request.OrganizationType,
            Requirement = request.Requirement,
            AdditionalDetails = request.AdditionalDetails,
            ContactRequested = request.ContactRequested,
            LeadStatus = "New"
        };

        var (score, priority) = _scoringService.CalculateScore(lead);
        lead.LeadScore = score;
        lead.LeadPriority = priority;

        var createdLead = await _leadRepository.CreateOrUpdateLeadAsync(lead, cancellationToken);

        if (request.PurposeSpecificDetails != null && request.PurposeSpecificDetails.Count > 0)
        {
            foreach (var kvp in request.PurposeSpecificDetails)
            {
                await _leadRepository.SaveLeadDetailAsync(createdLead.LeadId, kvp.Key, kvp.Value, cancellationToken);
            }
        }

        var result = await _leadRepository.GetLeadByIdAsync(createdLead.LeadId, cancellationToken);
        return result ?? MapToDto(createdLead);
    }

    public async Task<LeadResponseDto?> GetLeadByIdAsync(long leadId, CancellationToken cancellationToken = default)
    {
        return await _leadRepository.GetLeadByIdAsync(leadId, cancellationToken);
    }

    public async Task<PagedResultDto<LeadResponseDto>> GetLeadsAsync(LeadFilterDto filter, CancellationToken cancellationToken = default)
    {
        return await _leadRepository.GetLeadsAsync(filter, cancellationToken);
    }

    public async Task<LeadResponseDto?> UpdateLeadStatusAsync(long leadId, string status, CancellationToken cancellationToken = default)
    {
        return await _leadRepository.UpdateLeadStatusAsync(leadId, status, cancellationToken);
    }

    public async Task<LeadResponseDto?> UpdateLeadAsync(long leadId, UpdateLeadRequestDto request, CancellationToken cancellationToken = default)
    {
        var existing = await _leadRepository.GetLeadByIdAsync(leadId, cancellationToken);
        if (existing == null) return null;

        var leadToScore = new Lead
        {
            LeadId = leadId,
            Name = request.Name,
            Mobile = request.Mobile,
            Email = request.Email,
            Purpose = request.Purpose,
            InterestedProduct = request.InterestedProduct,
            OrganizationType = request.OrganizationType,
            Requirement = request.Requirement,
            AdditionalDetails = request.AdditionalDetails,
            ContactRequested = request.ContactRequested ?? existing.ContactRequested
        };

        var (score, priority) = _scoringService.CalculateScore(leadToScore);

        var updated = await _leadRepository.CreateOrUpdateLeadAsync(new Lead
        {
            LeadId = leadId,
            VisitorId = existing.VisitorId,
            ChatSessionId = existing.ChatSessionId,
            Name = request.Name,
            Mobile = request.Mobile,
            Email = request.Email,
            Purpose = request.Purpose,
            InterestedProduct = request.InterestedProduct,
            OrganizationType = request.OrganizationType,
            Requirement = request.Requirement,
            AdditionalDetails = request.AdditionalDetails,
            LeadScore = request.LeadScore ?? score,
            LeadPriority = request.LeadPriority ?? priority,
            ContactRequested = request.ContactRequested ?? existing.ContactRequested,
            LeadStatus = request.LeadStatus ?? existing.LeadStatus
        }, cancellationToken);

        return await _leadRepository.GetLeadByIdAsync(updated.LeadId, cancellationToken);
    }

    private static LeadResponseDto MapToDto(Lead lead)
    {
        return new LeadResponseDto
        {
            LeadId = lead.LeadId,
            VisitorId = lead.VisitorId,
            ChatSessionId = lead.ChatSessionId,
            Name = lead.Name,
            Mobile = lead.Mobile,
            Email = lead.Email,
            Purpose = lead.Purpose,
            InterestedProduct = lead.InterestedProduct,
            OrganizationType = lead.OrganizationType,
            Requirement = lead.Requirement,
            AdditionalDetails = lead.AdditionalDetails,
            LeadScore = lead.LeadScore,
            LeadPriority = lead.LeadPriority,
            ContactRequested = lead.ContactRequested,
            LeadStatus = lead.LeadStatus,
            CreatedDate = lead.CreatedDate,
            UpdatedDate = lead.UpdatedDate
        };
    }
}
