using Microsoft.Extensions.Options;
using AFTBot.Api.Configuration;
using AFTBot.Api.Interfaces;
using AFTBot.Api.Models;

namespace AFTBot.Api.Services;

public class LeadScoringService : ILeadScoringService
{
    private readonly LeadScoringOptions _options;

    public LeadScoringService(IOptions<LeadScoringOptions> options)
    {
        _options = options.Value;
    }

    public (int Score, string Priority) CalculateScore(Lead lead)
    {
        int score = 0;

        // Mobile provided: +20
        if (!string.IsNullOrWhiteSpace(lead.Mobile) && lead.Mobile.Trim().Length >= 7)
        {
            score += _options.MobileProvidedPoints;
        }

        // Email provided: +10
        if (!string.IsNullOrWhiteSpace(lead.Email) && lead.Email.Contains('@'))
        {
            score += _options.EmailProvidedPoints;
        }

        // Clear requirement: +20
        if (!string.IsNullOrWhiteSpace(lead.Requirement) && lead.Requirement.Trim().Length > 10)
        {
            score += _options.ClearRequirementPoints;
        }

        // Specific product selected: +15
        if (!string.IsNullOrWhiteSpace(lead.InterestedProduct))
        {
            score += _options.SpecificProductSelectedPoints;
        }

        // Timeline provided (checked in AdditionalDetails or Requirement): +15
        if (!string.IsNullOrWhiteSpace(lead.AdditionalDetails) && 
            (lead.AdditionalDetails.Contains("timeline", StringComparison.OrdinalIgnoreCase) ||
             lead.AdditionalDetails.Contains("month", StringComparison.OrdinalIgnoreCase) ||
             lead.AdditionalDetails.Contains("week", StringComparison.OrdinalIgnoreCase) ||
             lead.AdditionalDetails.Contains("immediate", StringComparison.OrdinalIgnoreCase) ||
             lead.AdditionalDetails.Contains("start date", StringComparison.OrdinalIgnoreCase)))
        {
            score += _options.TimelineProvidedPoints;
        }

        // Contact requested: +20
        if (lead.ContactRequested)
        {
            score += _options.ContactRequestedPoints;
        }

        // Maximum 100
        score = Math.Min(100, Math.Max(0, score));

        // Priority classification:
        // 0-39 = Low, 40-69 = Medium, 70-100 = High
        string priority;
        if (score <= _options.LowThresholdMax)
        {
            priority = "Low";
        }
        else if (score <= _options.MediumThresholdMax)
        {
            priority = "Medium";
        }
        else
        {
            priority = "High";
        }

        return (score, priority);
    }
}
