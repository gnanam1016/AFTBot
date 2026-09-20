namespace AFTBot.Api.Configuration;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string SecretKey { get; set; } = "ApexFalconTechnologiesAFTBotSuperSecretKey2026!SecureKey";
    public string Issuer { get; set; } = "AFTBot.Api";
    public int TokenExpiryHours { get; set; } = 24;
}
