using AFTBot.Api.Models;

namespace AFTBot.Api.Interfaces;

public interface ILeadScoringService
{
    (int Score, string Priority) CalculateScore(Lead lead);
}
