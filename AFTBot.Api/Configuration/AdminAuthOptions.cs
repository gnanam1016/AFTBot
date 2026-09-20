namespace AFTBot.Api.Configuration;

public class AdminAuthOptions
{
    public const string SectionName = "AdminAuth";

    public string Username { get; set; } = "admin@apexfalcon.com";
    public string Password { get; set; } = "ApexFalcon@2026!";
    public string DisplayName { get; set; } = "Apex Falcon Admin";
    public string SecretKey { get; set; } = "ApexFalconTechnologiesAFTBotSuperSecretKey2026!SecureKey";
    public string Issuer { get; set; } = "AFTBot.Api";
    public int TokenExpiryHours { get; set; } = 24;
}
