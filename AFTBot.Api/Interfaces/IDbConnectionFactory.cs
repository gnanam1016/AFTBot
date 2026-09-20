using System.Data;

namespace AFTBot.Api.Interfaces;

public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}
