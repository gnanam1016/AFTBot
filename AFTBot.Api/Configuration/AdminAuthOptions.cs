namespace AFTBot.Api.Configuration;

/// <summary>
/// Obsolete: User credentials have moved to the [dbo].[AdminUsers] database table.
/// JWT settings are now managed via JwtOptions and appsettings.json.
/// </summary>
public class AdminAuthOptions : JwtOptions
{
}
