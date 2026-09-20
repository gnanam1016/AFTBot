SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- =============================================
-- Stored Procedure: sp_UpdateLeadStatus
-- Description: Updates the status of a lead
-- =============================================

CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateLeadStatus]
    @LeadId     BIGINT,
    @LeadStatus VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [dbo].[Leads]
    SET [LeadStatus] = @LeadStatus,
        [UpdatedDate] = SYSUTCDATETIME()
    WHERE [LeadId] = @LeadId;

    SELECT 
        [LeadId], [VisitorId], [ChatSessionId], [Name], [Mobile], [Email],
        [Purpose], [InterestedProduct], [OrganizationType], [Requirement],
        [AdditionalDetails], [LeadScore], [LeadPriority], [ContactRequested],
        [LeadStatus], [CreatedDate], [UpdatedDate]
    FROM [dbo].[Leads]
    WHERE [LeadId] = @LeadId;
END
GO

