using System.Data;
using Dapper;
using AFTBot.Api.Interfaces;
using AFTBot.Api.Models;

namespace AFTBot.Api.Repositories;

public class ChatRepository : IChatRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public ChatRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<ChatSession> CreateOrGetChatSessionAsync(string sessionId, long visitorId, string? purpose = null, CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        var parameters = new DynamicParameters();
        parameters.Add("@SessionId", sessionId);
        parameters.Add("@VisitorId", visitorId);
        parameters.Add("@Purpose", purpose);

        var command = new CommandDefinition(
            "[dbo].[sp_CreateChatSession]",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken
        );

        return await connection.QuerySingleAsync<ChatSession>(command);
    }

    public async Task<ChatSession?> GetChatSessionBySessionIdAsync(string sessionId, CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT TOP 1 [ChatSessionId], [SessionId], [VisitorId], [Status], [Purpose], [LeadId], [StartedDate], [EndedDate]
            FROM [dbo].[ChatSessions]
            WHERE [SessionId] = @SessionId OR (TRY_CAST(@SessionId AS BIGINT) IS NOT NULL AND [ChatSessionId] = TRY_CAST(@SessionId AS BIGINT))
            ORDER BY [StartedDate] DESC;";

        var command = new CommandDefinition(
            sql,
            new { SessionId = sessionId },
            commandType: CommandType.Text,
            cancellationToken: cancellationToken
        );

        return await connection.QueryFirstOrDefaultAsync<ChatSession>(command);
    }

    public async Task<ChatMessage> AddChatMessageAsync(long chatSessionId, string senderType, string message, string messageType = "Text", string? metadata = null, CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        var parameters = new DynamicParameters();
        parameters.Add("@ChatSessionId", chatSessionId);
        parameters.Add("@SenderType", senderType);
        parameters.Add("@Message", message);
        parameters.Add("@MessageType", messageType);
        parameters.Add("@Metadata", metadata);

        var command = new CommandDefinition(
            "[dbo].[sp_AddChatMessage]",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken
        );

        return await connection.QuerySingleAsync<ChatMessage>(command);
    }

    public async Task<IEnumerable<ChatMessage>> GetChatMessagesAsync(long chatSessionId, CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        var parameters = new DynamicParameters();
        parameters.Add("@ChatSessionId", chatSessionId);

        var command = new CommandDefinition(
            "[dbo].[sp_GetChatMessages]",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken
        );

        return await connection.QueryAsync<ChatMessage>(command);
    }

    public async Task<IEnumerable<AFTBot.Api.DTOs.Chat.ChatSessionSummaryDto>> GetRecentChatSessionsAsync(int limit = 50, CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT TOP (@Limit)
                cs.[ChatSessionId],
                cs.[SessionId],
                cs.[VisitorId],
                v.[Name] AS [VisitorName],
                v.[Mobile] AS [VisitorMobile],
                v.[Email] AS [VisitorEmail],
                cs.[Status],
                cs.[Purpose],
                cs.[LeadId],
                (SELECT COUNT(1) FROM [dbo].[ChatMessages] cm WHERE cm.[ChatSessionId] = cs.[ChatSessionId]) AS [MessageCount],
                cs.[StartedDate],
                v.[LastActivityDate]
            FROM [dbo].[ChatSessions] cs
            INNER JOIN [dbo].[Visitors] v ON cs.[VisitorId] = v.[VisitorId]
            ORDER BY cs.[StartedDate] DESC;";

        var command = new CommandDefinition(
            sql,
            new { Limit = limit },
            commandType: CommandType.Text,
            cancellationToken: cancellationToken
        );

        return await connection.QueryAsync<AFTBot.Api.DTOs.Chat.ChatSessionSummaryDto>(command);
    }

    public async Task UpdateChatSessionPurposeAsync(long chatSessionId, string purpose, CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            UPDATE [dbo].[ChatSessions]
            SET [Purpose] = @Purpose
            WHERE [ChatSessionId] = @ChatSessionId;";

        var command = new CommandDefinition(
            sql,
            new { ChatSessionId = chatSessionId, Purpose = purpose },
            commandType: CommandType.Text,
            cancellationToken: cancellationToken
        );

        await connection.ExecuteAsync(command);
    }
}
