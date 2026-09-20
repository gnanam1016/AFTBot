using System.Data;
using Dapper;
using AFTBot.Api.DTOs.Dashboard;
using AFTBot.Api.DTOs.Lead;
using AFTBot.Api.Interfaces;
using AFTBot.Api.Models;

namespace AFTBot.Api.Repositories;

public class LeadRepository : ILeadRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public LeadRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Lead> CreateOrUpdateLeadAsync(Lead lead, CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        var parameters = new DynamicParameters();
        parameters.Add("@VisitorId", lead.VisitorId);
        parameters.Add("@ChatSessionId", lead.ChatSessionId);
        parameters.Add("@Name", lead.Name);
        parameters.Add("@Mobile", lead.Mobile);
        parameters.Add("@Email", lead.Email);
        parameters.Add("@Purpose", lead.Purpose);
        parameters.Add("@InterestedProduct", lead.InterestedProduct);
        parameters.Add("@OrganizationType", lead.OrganizationType);
        parameters.Add("@Requirement", lead.Requirement);
        parameters.Add("@AdditionalDetails", lead.AdditionalDetails);
        parameters.Add("@LeadScore", lead.LeadScore);
        parameters.Add("@LeadPriority", lead.LeadPriority);
        parameters.Add("@ContactRequested", lead.ContactRequested);
        parameters.Add("@LeadStatus", lead.LeadStatus);

        var command = new CommandDefinition(
            "[dbo].[sp_CreateLead]",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken
        );

        return await connection.QuerySingleAsync<Lead>(command);
    }

    public async Task<LeadResponseDto?> GetLeadByIdAsync(long leadId, CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        var parameters = new DynamicParameters();
        parameters.Add("@LeadId", leadId);

        var command = new CommandDefinition(
            "[dbo].[sp_GetLeadById]",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken
        );

        using var multi = await connection.QueryMultipleAsync(command);
        var lead = await multi.ReadFirstOrDefaultAsync<LeadResponseDto>();
        if (lead != null)
        {
            var details = await multi.ReadAsync<LeadDetailDto>();
            lead.Details = details.AsList();
        }

        return lead;
    }

    public async Task<LeadResponseDto?> GetLeadByChatSessionIdAsync(long chatSessionId, CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT TOP 1 [LeadId]
            FROM [dbo].[Leads]
            WHERE [ChatSessionId] = @ChatSessionId;";

        var command = new CommandDefinition(
            sql,
            new { ChatSessionId = chatSessionId },
            commandType: CommandType.Text,
            cancellationToken: cancellationToken
        );

        var leadId = await connection.QueryFirstOrDefaultAsync<long?>(command);
        if (leadId.HasValue)
        {
            return await GetLeadByIdAsync(leadId.Value, cancellationToken);
        }

        return null;
    }

    public async Task<PagedResultDto<LeadResponseDto>> GetLeadsAsync(LeadFilterDto filter, CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        var parameters = new DynamicParameters();
        parameters.Add("@Purpose", filter.Purpose);
        parameters.Add("@Status", filter.Status);
        parameters.Add("@Priority", filter.Priority);
        parameters.Add("@Product", filter.Product);
        parameters.Add("@StartDate", filter.StartDate);
        parameters.Add("@EndDate", filter.EndDate);
        parameters.Add("@SearchTerm", filter.SearchTerm);
        parameters.Add("@PageNumber", filter.PageNumber);
        parameters.Add("@PageSize", filter.PageSize);

        var command = new CommandDefinition(
            "[dbo].[sp_GetLeads]",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken
        );

        using var multi = await connection.QueryMultipleAsync(command);
        var totalCount = await multi.ReadFirstAsync<int>();
        var items = await multi.ReadAsync<LeadResponseDto>();

        return new PagedResultDto<LeadResponseDto>
        {
            TotalCount = totalCount,
            PageNumber = filter.PageNumber,
            PageSize = filter.PageSize,
            Items = items.AsList()
        };
    }

    public async Task<LeadResponseDto?> UpdateLeadStatusAsync(long leadId, string status, CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        var parameters = new DynamicParameters();
        parameters.Add("@LeadId", leadId);
        parameters.Add("@LeadStatus", status);

        var command = new CommandDefinition(
            "[dbo].[sp_UpdateLeadStatus]",
            parameters,
            commandType: CommandType.StoredProcedure,
            cancellationToken: cancellationToken
        );

        var lead = await connection.QueryFirstOrDefaultAsync<LeadResponseDto>(command);
        if (lead != null)
        {
            var details = await GetLeadDetailsAsync(leadId, cancellationToken);
            lead.Details = details.Select(d => new LeadDetailDto
            {
                LeadDetailId = d.LeadDetailId,
                LeadId = d.LeadId,
                FieldName = d.FieldName,
                FieldValue = d.FieldValue,
                CreatedDate = d.CreatedDate
            }).ToList();
        }

        return lead;
    }

    public async Task SaveLeadDetailAsync(long leadId, string fieldName, string fieldValue, CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            IF EXISTS (SELECT 1 FROM [dbo].[LeadDetails] WHERE [LeadId] = @LeadId AND [FieldName] = @FieldName)
            BEGIN
                UPDATE [dbo].[LeadDetails]
                SET [FieldValue] = @FieldValue, [CreatedDate] = SYSUTCDATETIME()
                WHERE [LeadId] = @LeadId AND [FieldName] = @FieldName;
            END
            ELSE
            BEGIN
                INSERT INTO [dbo].[LeadDetails] ([LeadId], [FieldName], [FieldValue], [CreatedDate])
                VALUES (@LeadId, @FieldName, @FieldValue, SYSUTCDATETIME());
            END";

        var command = new CommandDefinition(
            sql,
            new { LeadId = leadId, FieldName = fieldName, FieldValue = fieldValue },
            commandType: CommandType.Text,
            cancellationToken: cancellationToken
        );

        await connection.ExecuteAsync(command);
    }

    public async Task<IEnumerable<LeadDetail>> GetLeadDetailsAsync(long leadId, CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            SELECT [LeadDetailId], [LeadId], [FieldName], [FieldValue], [CreatedDate]
            FROM [dbo].[LeadDetails]
            WHERE [LeadId] = @LeadId
            ORDER BY [LeadDetailId] ASC;";

        var command = new CommandDefinition(
            sql,
            new { LeadId = leadId },
            commandType: CommandType.Text,
            cancellationToken: cancellationToken
        );

        return await connection.QueryAsync<LeadDetail>(command);
    }
}
