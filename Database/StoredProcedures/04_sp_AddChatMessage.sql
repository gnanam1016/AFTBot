SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- =============================================
-- Stored Procedure: sp_AddChatMessage
-- Description: Adds a new message (Visitor, Bot, System) to a chat session
-- =============================================

CREATE OR ALTER PROCEDURE [dbo].[sp_AddChatMessage]
    @ChatSessionId  BIGINT,
    @SenderType     VARCHAR(20),
    @Message        NVARCHAR(MAX),
    @MessageType    VARCHAR(50) = 'Text',
    @Metadata       NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [dbo].[ChatMessages] (
        [ChatSessionId], [SenderType], [Message], [MessageType], [Metadata], [CreatedDate]
    )
    VALUES (
        @ChatSessionId, @SenderType, @Message, @MessageType, @Metadata, SYSUTCDATETIME()
    );

    DECLARE @NewChatMessageId BIGINT = SCOPE_IDENTITY();

    -- Update visitor activity date
    UPDATE v
    SET v.[LastActivityDate] = SYSUTCDATETIME()
    FROM [dbo].[Visitors] v
    INNER JOIN [dbo].[ChatSessions] cs ON v.[VisitorId] = cs.[VisitorId]
    WHERE cs.[ChatSessionId] = @ChatSessionId;

    SELECT 
        [ChatMessageId], [ChatSessionId], [SenderType], [Message], [MessageType], [Metadata], [CreatedDate]
    FROM [dbo].[ChatMessages]
    WHERE [ChatMessageId] = @NewChatMessageId;
END
GO

