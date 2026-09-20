SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- =============================================
-- Stored Procedure: sp_GetDashboardSummary
-- Description: Aggregates metrics for the admin dashboard
-- =============================================

CREATE OR ALTER PROCEDURE [dbo].[sp_GetDashboardSummary]
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TodayStart DATETIME2(7) = CAST(CAST(SYSUTCDATETIME() AS DATE) AS DATETIME2(7));

    SELECT 
        COUNT(1) AS [TotalLeads],
        COUNT(CASE WHEN [LeadStatus] = 'New' THEN 1 END) AS [NewLeads],
        COUNT(CASE WHEN [LeadStatus] = 'Contacted' THEN 1 END) AS [ContactedLeads],
        COUNT(CASE WHEN [LeadStatus] = 'Qualified' THEN 1 END) AS [QualifiedLeads],
        COUNT(CASE WHEN [LeadStatus] = 'Converted' THEN 1 END) AS [ConvertedLeads],
        COUNT(CASE WHEN [CreatedDate] >= @TodayStart THEN 1 END) AS [TodayLeads],
        COUNT(CASE WHEN [LeadPriority] = 'High' THEN 1 END) AS [HighPriorityLeads],
        COUNT(CASE WHEN [ContactRequested] = 1 THEN 1 END) AS [ContactRequestedCount]
    FROM [dbo].[Leads];

    -- Purpose breakdown
    SELECT 
        [Purpose],
        COUNT(1) AS [Count]
    FROM [dbo].[Leads]
    GROUP BY [Purpose]
    ORDER BY [Count] DESC;
END
GO

