namespace AFTBot.Api.Configuration;

public class DatabaseOptions
{
    public const string SectionName = "ConnectionStrings";
    public string AFTBotDb { get; set; } = string.Empty;
}

public class LeadScoringOptions
{
    public const string SectionName = "LeadScoring";
    public int MobileProvidedPoints { get; set; } = 20;
    public int EmailProvidedPoints { get; set; } = 10;
    public int ClearRequirementPoints { get; set; } = 20;
    public int SpecificProductSelectedPoints { get; set; } = 15;
    public int TimelineProvidedPoints { get; set; } = 15;
    public int ContactRequestedPoints { get; set; } = 20;
    public int LowThresholdMax { get; set; } = 39;
    public int MediumThresholdMax { get; set; } = 69;
}

public class AiOptions
{
    public const string SectionName = "AI";
    public string Provider { get; set; } = "AzureOpenAI";
    public string Endpoint { get; set; } = string.Empty;
    public string DeploymentName { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string SystemPrompt { get; set; } = string.Empty;
}
