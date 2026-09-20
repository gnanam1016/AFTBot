-- =============================================
-- Table: Leads
-- Description: Stores qualified leads collected by AFTBot
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Leads]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Leads] (
        [LeadId]                BIGINT IDENTITY(1,1) NOT NULL,
        [VisitorId]             BIGINT NOT NULL,
        [ChatSessionId]         BIGINT NOT NULL,
        [Name]                  NVARCHAR(150) NOT NULL,
        [Mobile]                VARCHAR(30) NULL,
        [Email]                 NVARCHAR(200) NULL,
        [Purpose]               NVARCHAR(100) NOT NULL,
        [InterestedProduct]     NVARCHAR(200) NULL,
        [OrganizationType]      NVARCHAR(100) NULL,
        [Requirement]           NVARCHAR(MAX) NULL,
        [AdditionalDetails]     NVARCHAR(MAX) NULL,
        [LeadScore]             INT NOT NULL CONSTRAINT [DF_Leads_LeadScore] DEFAULT (0),
        [LeadPriority]          VARCHAR(20) NOT NULL CONSTRAINT [DF_Leads_LeadPriority] DEFAULT ('Low'), -- Low, Medium, High
        [ContactRequested]      BIT NOT NULL CONSTRAINT [DF_Leads_ContactRequested] DEFAULT (0),
        [LeadStatus]            VARCHAR(50) NOT NULL CONSTRAINT [DF_Leads_LeadStatus] DEFAULT ('New'), -- New, Contacted, Qualified, DemoScheduled, Converted, Lost, Closed
        [CreatedDate]           DATETIME2(7) NOT NULL CONSTRAINT [DF_Leads_CreatedDate] DEFAULT (SYSUTCDATETIME()),
        [UpdatedDate]           DATETIME2(7) NOT NULL CONSTRAINT [DF_Leads_UpdatedDate] DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT [PK_Leads] PRIMARY KEY CLUSTERED ([LeadId] ASC),
        CONSTRAINT [FK_Leads_Visitors] FOREIGN KEY ([VisitorId]) REFERENCES [dbo].[Visitors] ([VisitorId]),
        CONSTRAINT [FK_Leads_ChatSessions] FOREIGN KEY ([ChatSessionId]) REFERENCES [dbo].[ChatSessions] ([ChatSessionId])
    );
END
GO

-- Add circular foreign key from ChatSessions to Leads safely
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_ChatSessions_Leads]'))
BEGIN
    ALTER TABLE [dbo].[ChatSessions]
    ADD CONSTRAINT [FK_ChatSessions_Leads] FOREIGN KEY ([LeadId]) REFERENCES [dbo].[Leads] ([LeadId]);
END
GO
