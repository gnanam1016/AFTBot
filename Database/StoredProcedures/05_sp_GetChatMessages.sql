SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- =============================================
-- Stored Procedure: sp_GetChatMessages
-- Description: Retrieves conversation history for a given ChatSessionId
-- =============================================

CREATE OR ALTER PROCEDURE [dbo].[sp_GetChatMessages]
    @ChatSessionId BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        [ChatMessageId],
        [ChatSessionId],
        [SenderType],
        [Message],
        [MessageType],
        [Metadata],
        [CreatedDate]
    FROM [dbo].[ChatMessages]
    WHERE [ChatSessionId] = @ChatSessionId
    ORDER BY [CreatedDate] ASC, [ChatMessageId] ASC;
END
GO

