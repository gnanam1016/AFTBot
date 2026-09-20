-- =============================================
-- Table: ChatSessions
-- Description: Tracks individual chat sessions initiated by visitors
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ChatSessions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ChatSessions] (
        [ChatSessionId]     BIGINT IDENTITY(1,1) NOT NULL,
        [SessionId]         VARCHAR(100) NOT NULL,
        [VisitorId]         BIGINT NOT NULL,
        [Status]            VARCHAR(50) NOT NULL CONSTRAINT [DF_ChatSessions_Status] DEFAULT ('Active'), -- Active, Completed, Abandoned
        [Purpose]           NVARCHAR(100) NULL,
        [LeadId]            BIGINT NULL,
        [StartedDate]       DATETIME2(7) NOT NULL CONSTRAINT [DF_ChatSessions_StartedDate] DEFAULT (SYSUTCDATETIME()),
        [EndedDate]         DATETIME2(7) NULL,
        CONSTRAINT [PK_ChatSessions] PRIMARY KEY CLUSTERED ([ChatSessionId] ASC),
        CONSTRAINT [FK_ChatSessions_Visitors] FOREIGN KEY ([VisitorId]) REFERENCES [dbo].[Visitors] ([VisitorId]) ON DELETE CASCADE
    );
END
GO
