-- =============================================
-- Indexes for AFTBot Database
-- Description: Improves search performance for commonly queried fields
-- =============================================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Visitors Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Visitors_Mobile' AND object_id = OBJECT_ID('dbo.Visitors'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Visitors_Mobile] ON [dbo].[Visitors] ([Mobile] ASC) WHERE [Mobile] IS NOT NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Visitors_Email' AND object_id = OBJECT_ID('dbo.Visitors'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Visitors_Email] ON [dbo].[Visitors] ([Email] ASC) WHERE [Email] IS NOT NULL;
END
GO

-- ChatSessions Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ChatSessions_SessionId' AND object_id = OBJECT_ID('dbo.ChatSessions'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_ChatSessions_SessionId] ON [dbo].[ChatSessions] ([SessionId] ASC);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ChatSessions_Status' AND object_id = OBJECT_ID('dbo.ChatSessions'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_ChatSessions_Status] ON [dbo].[ChatSessions] ([Status] ASC);
END
GO

-- ChatMessages Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ChatMessages_ChatSessionId_CreatedDate' AND object_id = OBJECT_ID('dbo.ChatMessages'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_ChatMessages_ChatSessionId_CreatedDate] 
    ON [dbo].[ChatMessages] ([ChatSessionId] ASC, [CreatedDate] ASC)
    INCLUDE ([SenderType], [Message], [MessageType]);
END
GO

-- Leads Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Leads_LeadStatus' AND object_id = OBJECT_ID('dbo.Leads'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Leads_LeadStatus] ON [dbo].[Leads] ([LeadStatus] ASC);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Leads_Purpose' AND object_id = OBJECT_ID('dbo.Leads'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Leads_Purpose] ON [dbo].[Leads] ([Purpose] ASC);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Leads_CreatedDate' AND object_id = OBJECT_ID('dbo.Leads'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Leads_CreatedDate] ON [dbo].[Leads] ([CreatedDate] DESC);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Leads_Mobile' AND object_id = OBJECT_ID('dbo.Leads'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Leads_Mobile] ON [dbo].[Leads] ([Mobile] ASC) WHERE [Mobile] IS NOT NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Leads_Email' AND object_id = OBJECT_ID('dbo.Leads'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Leads_Email] ON [dbo].[Leads] ([Email] ASC) WHERE [Email] IS NOT NULL;
END
GO
