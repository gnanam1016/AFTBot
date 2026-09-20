SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- =============================================
-- Stored Procedure: sp_GetLeadById
-- Description: Retrieves single lead details along with visitor info
-- =============================================

CREATE OR ALTER PROCEDURE [dbo].[sp_GetLeadById]
    @LeadId BIGINT
AS
BEGIN
    SET NOCOUNT ON;

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
        l.[AdditionalDetails],
        l.[LeadScore],
        l.[LeadPriority],
        l.[ContactRequested],
        l.[LeadStatus],
        l.[CreatedDate],
        l.[UpdatedDate],
        v.[IPAddress],
        v.[UserAgent],
        cs.[StartedDate] AS [SessionStartedDate],
        cs.[Status] AS [SessionStatus]
    FROM [dbo].[Leads] l
    INNER JOIN [dbo].[Visitors] v ON l.[VisitorId] = v.[VisitorId]
    INNER JOIN [dbo].[ChatSessions] cs ON l.[ChatSessionId] = cs.[ChatSessionId]
    WHERE l.[LeadId] = @LeadId;

    -- Also return custom lead details
    SELECT [LeadDetailId], [LeadId], [FieldName], [FieldValue], [CreatedDate]
    FROM [dbo].[LeadDetails]
    WHERE [LeadId] = @LeadId
    ORDER BY [LeadDetailId] ASC;
END
GO

