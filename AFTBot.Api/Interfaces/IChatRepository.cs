using AFTBot.Api.Models;

namespace AFTBot.Api.Interfaces;

public interface IChatRepository
{
    Task<ChatSession> CreateOrGetChatSessionAsync(string sessionId, long visitorId, string? purpose = null, CancellationToken cancellationToken = default);
    Task<ChatSession?> GetChatSessionBySessionIdAsync(string sessionId, CancellationToken cancellationToken = default);
    Task<ChatMessage> AddChatMessageAsync(long chatSessionId, string senderType, string message, string messageType = "Text", string? metadata = null, CancellationToken cancellationToken = default);
    Task<IEnumerable<ChatMessage>> GetChatMessagesAsync(long chatSessionId, CancellationToken cancellationToken = default);
    Task<IEnumerable<AFTBot.Api.DTOs.Chat.ChatSessionSummaryDto>> GetRecentChatSessionsAsync(int limit = 50, CancellationToken cancellationToken = default);
    Task UpdateChatSessionPurposeAsync(long chatSessionId, string purpose, CancellationToken cancellationToken = default);
}
