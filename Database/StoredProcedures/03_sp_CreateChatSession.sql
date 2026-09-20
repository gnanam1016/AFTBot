SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- =============================================
-- Stored Procedure: sp_CreateChatSession
-- Description: Starts or resumes an active chat session for a visitor
-- =============================================

CREATE OR ALTER PROCEDURE [dbo].[sp_CreateChatSession]
    @SessionId  VARCHAR(100),
    @VisitorId  BIGINT,
    @Purpose    NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ChatSessionId BIGINT;

    -- Look for existing active session
    SELECT TOP 1 @ChatSessionId = [ChatSessionId]
    FROM [dbo].[ChatSessions]
    WHERE [SessionId] = @SessionId AND [Status] = 'Active'
    ORDER BY [StartedDate] DESC;

    IF @ChatSessionId IS NULL
    BEGIN
        INSERT INTO [dbo].[ChatSessions] ([SessionId], [VisitorId], [Status], [Purpose], [StartedDate])
        VALUES (@SessionId, @VisitorId, 'Active', @Purpose, SYSUTCDATETIME());

        SET @ChatSessionId = SCOPE_IDENTITY();
    END
    ELSE IF @Purpose IS NOT NULL
    BEGIN
        UPDATE [dbo].[ChatSessions]
        SET [Purpose] = @Purpose
        WHERE [ChatSessionId] = @ChatSessionId;
    END

    -- Update visitor last activity
    UPDATE [dbo].[Visitors]
    SET [LastActivityDate] = SYSUTCDATETIME()
    WHERE [VisitorId] = @VisitorId;

    SELECT 
        [ChatSessionId], [SessionId], [VisitorId], [Status], [Purpose], [LeadId], [StartedDate], [EndedDate]
    FROM [dbo].[ChatSessions]
    WHERE [ChatSessionId] = @ChatSessionId;
END
GO

