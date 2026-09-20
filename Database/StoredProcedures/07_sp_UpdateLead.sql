SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- =============================================
-- Stored Procedure: sp_UpdateLead
-- Description: Updates lead details and attributes
-- =============================================

CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateLead]
    @LeadId             BIGINT,
    @Name               NVARCHAR(150),
    @Mobile             VARCHAR(30) = NULL,
    @Email              NVARCHAR(200) = NULL,
    @Purpose            NVARCHAR(100),
    @InterestedProduct  NVARCHAR(200) = NULL,
    @OrganizationType   NVARCHAR(100) = NULL,
    @Requirement        NVARCHAR(MAX) = NULL,
    @AdditionalDetails  NVARCHAR(MAX) = NULL,
    @LeadScore          INT = NULL,
    @LeadPriority       VARCHAR(20) = NULL,
    @ContactRequested   BIT = NULL,
    @LeadStatus         VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [dbo].[Leads]
    SET [Name] = @Name,
        [Mobile] = COALESCE(@Mobile, [Mobile]),
        [Email] = COALESCE(@Email, [Email]),
        [Purpose] = @Purpose,
        [InterestedProduct] = COALESCE(@InterestedProduct, [InterestedProduct]),
        [OrganizationType] = COALESCE(@OrganizationType, [OrganizationType]),
        [Requirement] = COALESCE(@Requirement, [Requirement]),
        [AdditionalDetails] = COALESCE(@AdditionalDetails, [AdditionalDetails]),
        [LeadScore] = COALESCE(@LeadScore, [LeadScore]),
        [LeadPriority] = COALESCE(@LeadPriority, [LeadPriority]),
        [ContactRequested] = COALESCE(@ContactRequested, [ContactRequested]),
        [LeadStatus] = COALESCE(@LeadStatus, [LeadStatus]),
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

