SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- =============================================
-- Stored Procedure: sp_CreateLead
-- Description: Creates a new lead from a chat session
-- =============================================

CREATE OR ALTER PROCEDURE [dbo].[sp_CreateLead]
    @VisitorId          BIGINT,
    @ChatSessionId      BIGINT,
    @Name               NVARCHAR(150),
    @Mobile             VARCHAR(30) = NULL,
    @Email              NVARCHAR(200) = NULL,
    @Purpose            NVARCHAR(100),
    @InterestedProduct  NVARCHAR(200) = NULL,
    @OrganizationType   NVARCHAR(100) = NULL,
    @Requirement        NVARCHAR(MAX) = NULL,
    @AdditionalDetails  NVARCHAR(MAX) = NULL,
    @LeadScore          INT = 0,
    @LeadPriority       VARCHAR(20) = 'Low',
    @ContactRequested   BIT = 0,
    @LeadStatus         VARCHAR(50) = 'New'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @LeadId BIGINT;

    -- Check if lead already exists for this chat session
    SELECT @LeadId = [LeadId]
    FROM [dbo].[Leads]
    WHERE [ChatSessionId] = @ChatSessionId;

    IF @LeadId IS NULL
    BEGIN
        INSERT INTO [dbo].[Leads] (
            [VisitorId], [ChatSessionId], [Name], [Mobile], [Email],
            [Purpose], [InterestedProduct], [OrganizationType], [Requirement],
            [AdditionalDetails], [LeadScore], [LeadPriority], [ContactRequested],
            [LeadStatus], [CreatedDate], [UpdatedDate]
        )
        VALUES (
            @VisitorId, @ChatSessionId, @Name, @Mobile, @Email,
            @Purpose, @InterestedProduct, @OrganizationType, @Requirement,
            @AdditionalDetails, @LeadScore, @LeadPriority, @ContactRequested,
            @LeadStatus, SYSUTCDATETIME(), SYSUTCDATETIME()
        );

        SET @LeadId = SCOPE_IDENTITY();

        -- Link lead to chat session
        UPDATE [dbo].[ChatSessions]
        SET [LeadId] = @LeadId,
            [Purpose] = COALESCE(@Purpose, [Purpose])
        WHERE [ChatSessionId] = @ChatSessionId;
    END
    ELSE
    BEGIN
        -- Update existing lead
        UPDATE [dbo].[Leads]
        SET [Name] = @Name,
            [Mobile] = COALESCE(@Mobile, [Mobile]),
            [Email] = COALESCE(@Email, [Email]),
            [Purpose] = @Purpose,
            [InterestedProduct] = COALESCE(@InterestedProduct, [InterestedProduct]),
            [OrganizationType] = COALESCE(@OrganizationType, [OrganizationType]),
            [Requirement] = COALESCE(@Requirement, [Requirement]),
            [AdditionalDetails] = COALESCE(@AdditionalDetails, [AdditionalDetails]),
            [LeadScore] = @LeadScore,
            [LeadPriority] = @LeadPriority,
            [ContactRequested] = @ContactRequested,
            [UpdatedDate] = SYSUTCDATETIME()
        WHERE [LeadId] = @LeadId;
    END

    -- Also update visitor info if provided
    UPDATE [dbo].[Visitors]
    SET [Name] = COALESCE(@Name, [Name]),
        [Mobile] = COALESCE(@Mobile, [Mobile]),
        [Email] = COALESCE(@Email, [Email]),
        [LastActivityDate] = SYSUTCDATETIME()
    WHERE [VisitorId] = @VisitorId;

    SELECT 
        [LeadId], [VisitorId], [ChatSessionId], [Name], [Mobile], [Email],
        [Purpose], [InterestedProduct], [OrganizationType], [Requirement],
        [AdditionalDetails], [LeadScore], [LeadPriority], [ContactRequested],
        [LeadStatus], [CreatedDate], [UpdatedDate]
    FROM [dbo].[Leads]
    WHERE [LeadId] = @LeadId;
END
GO

