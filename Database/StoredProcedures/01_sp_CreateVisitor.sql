SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- =============================================
-- Stored Procedure: sp_CreateVisitor
-- Description: Inserts or updates visitor details based on SessionId
-- =============================================

CREATE OR ALTER PROCEDURE [dbo].[sp_CreateVisitor]
    @SessionId      VARCHAR(100),
    @Name           NVARCHAR(150) = NULL,
    @Mobile         VARCHAR(30) = NULL,
    @Email          NVARCHAR(200) = NULL,
    @IPAddress      VARCHAR(50) = NULL,
    @UserAgent      NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @VisitorId BIGINT;

    SELECT @VisitorId = [VisitorId]
    FROM [dbo].[Visitors]
    WHERE [SessionId] = @SessionId;

    IF @VisitorId IS NULL
    BEGIN
        INSERT INTO [dbo].[Visitors] (
            [SessionId], [Name], [Mobile], [Email], [IPAddress], [UserAgent], [CreatedDate], [LastActivityDate]
        )
        VALUES (
            @SessionId, @Name, @Mobile, @Email, @IPAddress, @UserAgent, SYSUTCDATETIME(), SYSUTCDATETIME()
        );

        SET @VisitorId = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        UPDATE [dbo].[Visitors]
        SET [Name] = COALESCE(@Name, [Name]),
            [Mobile] = COALESCE(@Mobile, [Mobile]),
            [Email] = COALESCE(@Email, [Email]),
            [IPAddress] = COALESCE(@IPAddress, [IPAddress]),
            [UserAgent] = COALESCE(@UserAgent, [UserAgent]),
            [LastActivityDate] = SYSUTCDATETIME()
        WHERE [VisitorId] = @VisitorId;
    END

    SELECT 
        [VisitorId], [SessionId], [Name], [Mobile], [Email], [IPAddress], [UserAgent], [CreatedDate], [LastActivityDate]
    FROM [dbo].[Visitors]
    WHERE [VisitorId] = @VisitorId;
END
GO

