using AFTBot.Api.DTOs.Visitor;
using AFTBot.Api.Interfaces;
using AFTBot.Api.Models;

namespace AFTBot.Api.Services;

public class VisitorService : IVisitorService
{
    private readonly IVisitorRepository _visitorRepository;

    public VisitorService(IVisitorRepository visitorRepository)
    {
        _visitorRepository = visitorRepository;
    }

    public async Task<VisitorResponseDto> CreateOrUpdateVisitorAsync(CreateVisitorRequestDto request, CancellationToken cancellationToken = default)
    {
        var visitor = await _visitorRepository.CreateOrUpdateVisitorAsync(
            request.SessionId,
            request.Name,
            request.Mobile,
            request.Email,
            request.IPAddress,
            request.UserAgent,
            cancellationToken
        );

        return MapToDto(visitor);
    }

    public async Task<VisitorResponseDto?> GetVisitorBySessionIdAsync(string sessionId, CancellationToken cancellationToken = default)
    {
        var visitor = await _visitorRepository.GetVisitorBySessionIdAsync(sessionId, cancellationToken);
        return visitor == null ? null : MapToDto(visitor);
    }

    private static VisitorResponseDto MapToDto(Visitor visitor)
    {
        return new VisitorResponseDto
        {
            VisitorId = visitor.VisitorId,
            SessionId = visitor.SessionId,
            Name = visitor.Name,
            Mobile = visitor.Mobile,
            Email = visitor.Email,
            IPAddress = visitor.IPAddress,
            UserAgent = visitor.UserAgent,
            CreatedDate = visitor.CreatedDate,
            LastActivityDate = visitor.LastActivityDate
        };
    }
}
