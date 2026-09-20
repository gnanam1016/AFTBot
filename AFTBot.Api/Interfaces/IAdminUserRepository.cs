using AFTBot.Api.Models;

namespace AFTBot.Api.Interfaces;

public interface IAdminUserRepository
{
    Task<AdminUser?> GetByUsernameOrEmailAsync(string usernameOrEmail, CancellationToken cancellationToken = default);
    Task<AdminUser> CreateUserAsync(AdminUser user, CancellationToken cancellationToken = default);
    Task UpdateLastLoginAsync(int adminUserId, CancellationToken cancellationToken = default);
    Task<IEnumerable<AdminUser>> GetAllUsersAsync(CancellationToken cancellationToken = default);
}
