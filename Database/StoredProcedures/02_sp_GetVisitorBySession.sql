SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- =============================================
-- Stored Procedure: sp_GetVisitorBySession
-- Description: Retrieves visitor details using SessionId
-- =============================================

CREATE OR ALTER PROCEDURE [dbo].[sp_GetVisitorBySession]
    @SessionId VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        [VisitorId], [SessionId], [Name], [Mobile], [Email], [IPAddress], [UserAgent], [CreatedDate], [LastActivityDate]
    FROM [dbo].[Visitors]
    WHERE [SessionId] = @SessionId;
END
GO

