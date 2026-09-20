using AFTBot.Api.Models;

namespace AFTBot.Api.Interfaces;

public interface IVisitorRepository
{
    Task<Visitor> CreateOrUpdateVisitorAsync(string sessionId, string? name = null, string? mobile = null, string? email = null, string? ipAddress = null, string? userAgent = null, CancellationToken cancellationToken = default);
    Task<Visitor?> GetVisitorBySessionIdAsync(string sessionId, CancellationToken cancellationToken = default);
    Task<Visitor?> GetVisitorByIdAsync(long visitorId, CancellationToken cancellationToken = default);
}
