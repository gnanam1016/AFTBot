using System.Data;
using Dapper;
using AFTBot.Api.Interfaces;
using AFTBot.Api.Models;

namespace AFTBot.Api.Repositories;

public class AdminUserRepository : IAdminUserRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public AdminUserRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<AdminUser?> GetByUsernameOrEmailAsync(string usernameOrEmail, CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        var parameters = new DynamicParameters();
        parameters.Add("@UsernameOrEmail", usernameOrEmail.Trim());

        var command = new CommandDefinition(
            "[dbo].[sp_GetAdminUserByUsernameOrEmail]",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken
        );

        return await connection.QuerySingleOrDefaultAsync<AdminUser>(command);
    }

    public async Task<AdminUser> CreateUserAsync(AdminUser user, CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        var parameters = new DynamicParameters();
        parameters.Add("@Username", user.Username.Trim());
        parameters.Add("@Email", user.Email.Trim().ToLowerInvariant());
        parameters.Add("@PasswordHash", user.PasswordHash);
        parameters.Add("@PasswordSalt", user.PasswordSalt);
        parameters.Add("@DisplayName", user.DisplayName.Trim());
        parameters.Add("@Role", string.IsNullOrWhiteSpace(user.Role) ? "Admin" : user.Role.Trim());

        var command = new CommandDefinition(
            "[dbo].[sp_CreateAdminUser]",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken
        );

        return await connection.QuerySingleAsync<AdminUser>(command);
    }

    public async Task UpdateLastLoginAsync(int adminUserId, CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        var parameters = new DynamicParameters();
        parameters.Add("@AdminUserId", adminUserId);

        var command = new CommandDefinition(
            "[dbo].[sp_UpdateAdminUserLastLogin]",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken
        );

        await connection.ExecuteAsync(command);
    }

    public async Task<IEnumerable<AdminUser>> GetAllUsersAsync(CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        var command = new CommandDefinition(
            "[dbo].[sp_GetAdminUsers]",
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken
        );

        return await connection.QueryAsync<AdminUser>(command);
    }
}
