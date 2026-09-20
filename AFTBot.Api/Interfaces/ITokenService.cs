namespace AFTBot.Api.Interfaces;

public interface ITokenService
{
    string GenerateToken(string username, string displayName, string role = "Admin");
    bool ValidateToken(string token, out string? username, out string? displayName);
}
