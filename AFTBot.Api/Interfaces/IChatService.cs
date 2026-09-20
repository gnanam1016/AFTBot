using AFTBot.Api.DTOs.Chat;

namespace AFTBot.Api.Interfaces;

public interface IChatService
{
    Task<ChatSessionResponseDto> InitializeOrGetSessionAsync(CreateSessionRequestDto request, CancellationToken cancellationToken = default);
    Task<ChatMessageResponseDto> ProcessUserMessageAsync(SendMessageRequestDto request, CancellationToken cancellationToken = default);
    Task<ChatSessionResponseDto?> GetSessionDetailsAsync(string sessionId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ChatSessionSummaryDto>> GetRecentSessionsAsync(int limit = 50, CancellationToken cancellationToken = default);
}
