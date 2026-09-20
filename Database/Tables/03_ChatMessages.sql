-- =============================================
-- Table: ChatMessages
-- Description: Stores all conversation history between visitors, bot, and system
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ChatMessages]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ChatMessages] (
        [ChatMessageId]     BIGINT IDENTITY(1,1) NOT NULL,
        [ChatSessionId]     BIGINT NOT NULL,
        [SenderType]        VARCHAR(20) NOT NULL, -- Visitor, Bot, System
        [Message]           NVARCHAR(MAX) NOT NULL,
        [MessageType]       VARCHAR(50) NOT NULL CONSTRAINT [DF_ChatMessages_MessageType] DEFAULT ('Text'), -- Text, QuickReply, Structured
        [Metadata]          NVARCHAR(MAX) NULL, -- JSON formatted metadata (options, extracted entities)
        [CreatedDate]       DATETIME2(7) NOT NULL CONSTRAINT [DF_ChatMessages_CreatedDate] DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT [PK_ChatMessages] PRIMARY KEY CLUSTERED ([ChatMessageId] ASC),
        CONSTRAINT [FK_ChatMessages_ChatSessions] FOREIGN KEY ([ChatSessionId]) REFERENCES [dbo].[ChatSessions] ([ChatSessionId]) ON DELETE CASCADE
    );
END
GO
