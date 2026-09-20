using AFTBot.Api.Configuration;
using AFTBot.Api.Interfaces;
using AFTBot.Api.Repositories;
using AFTBot.Api.Services;

namespace AFTBot.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddAFTBotServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Options
        services.Configure<DatabaseOptions>(configuration.GetSection(DatabaseOptions.SectionName));
        services.Configure<LeadScoringOptions>(configuration.GetSection(LeadScoringOptions.SectionName));
        services.Configure<AiOptions>(configuration.GetSection(AiOptions.SectionName));
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.Configure<AdminAuthOptions>(configuration.GetSection(JwtOptions.SectionName));

        // Security & Token Services
        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<ITokenService, TokenService>();

        // Repositories & Connection Factory
        services.AddSingleton<IDbConnectionFactory, SqlConnectionFactory>();
        services.AddScoped<IAdminUserRepository, AdminUserRepository>();
        services.AddScoped<IChatRepository, ChatRepository>();
        services.AddScoped<IVisitorRepository, VisitorRepository>();
        services.AddScoped<ILeadRepository, LeadRepository>();
        services.AddScoped<IDashboardRepository, DashboardRepository>();

        // Services
        services.AddScoped<IQualificationFlowService, QualificationFlowService>();
        services.AddScoped<IAiResponseValidator, AiResponseValidator>();
        services.AddScoped<IChatService, ChatService>();
        services.AddScoped<IVisitorService, VisitorService>();
        services.AddScoped<ILeadService, LeadService>();
        services.AddScoped<ILeadScoringService, LeadScoringService>();
        services.AddScoped<IAiChatService, AiChatService>();

        return services;
    }
}
