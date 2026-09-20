-- =============================================
-- View: vw_LeadSummaries
-- Description: Aggregated view of leads with visitor session context
-- =============================================

CREATE OR ALTER VIEW [dbo].[vw_LeadSummaries]
AS
SELECT 
    l.[LeadId],
    l.[VisitorId],
    l.[ChatSessionId],
    l.[Name],
    l.[Mobile],
    l.[Email],
    l.[Purpose],
    l.[InterestedProduct],
    l.[OrganizationType],
    l.[Requirement],
    l.[LeadScore],
    l.[LeadPriority],
    l.[ContactRequested],
    l.[LeadStatus],
    l.[CreatedDate],
    l.[UpdatedDate],
    v.[IPAddress],
    v.[UserAgent],
    cs.[StartedDate] AS [SessionStartedDate],
    (SELECT COUNT(1) FROM [dbo].[ChatMessages] cm WHERE cm.[ChatSessionId] = l.[ChatSessionId]) AS [TotalMessages]
FROM [dbo].[Leads] l
INNER JOIN [dbo].[Visitors] v ON l.[VisitorId] = v.[VisitorId]
INNER JOIN [dbo].[ChatSessions] cs ON l.[ChatSessionId] = cs.[ChatSessionId];
GO
