using System.Data;
using Dapper;
using AFTBot.Api.Interfaces;
using AFTBot.Api.Models;

namespace AFTBot.Api.Repositories;

public class VisitorRepository : IVisitorRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public VisitorRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Visitor> CreateOrUpdateVisitorAsync(string sessionId, string? name = null, string? mobile = null, string? email = null, string? ipAddress = null, string? userAgent = null, CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        var parameters = new DynamicParameters();
        parameters.Add("@SessionId", sessionId);
        parameters.Add("@Name", name);
        parameters.Add("@Mobile", mobile);
        parameters.Add("@Email", email);
        parameters.Add("@IPAddress", ipAddress);
        parameters.Add("@UserAgent", userAgent);

        var command = new CommandDefinition(
            "[dbo].[sp_CreateVisitor]",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken
        );

        return await connection.QuerySingleAsync<Visitor>(command);
    }

    public async Task<Visitor?> GetVisitorBySessionIdAsync(string sessionId, CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        var parameters = new DynamicParameters();
        parameters.Add("@SessionId", sessionId);

        var command = new CommandDefinition(
            "[dbo].[sp_GetVisitorBySession]",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken
        );

        return await connection.QueryFirstOrDefaultAsync<Visitor>(command);
    }

    public async Task<Visitor?> GetVisitorByIdAsync(long visitorId, CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT [VisitorId], [SessionId], [Name], [Mobile], [Email], [IPAddress], [UserAgent], [CreatedDate], [LastActivityDate]
            FROM [dbo].[Visitors]
            WHERE [VisitorId] = @VisitorId;";

        var command = new CommandDefinition(
            sql,
            new { VisitorId = visitorId },
            commandType: CommandType.Text,
            cancellationToken: cancellationToken
        );

        return await connection.QueryFirstOrDefaultAsync<Visitor>(command);
    }
}
