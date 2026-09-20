using AFTBot.Api.DTOs.Visitor;

namespace AFTBot.Api.Interfaces;

public interface IVisitorService
{
    Task<VisitorResponseDto> CreateOrUpdateVisitorAsync(CreateVisitorRequestDto request, CancellationToken cancellationToken = default);
    Task<VisitorResponseDto?> GetVisitorBySessionIdAsync(string sessionId, CancellationToken cancellationToken = default);
}
