using AFTBot.Api.DTOs.Ai;

namespace AFTBot.Api.Interfaces;

public interface IAiChatService
{
    Task<AiChatResponse> GenerateResponseAsync(ChatContext context, CancellationToken cancellationToken = default);
}
