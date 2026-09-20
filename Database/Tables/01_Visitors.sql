-- =============================================
-- Table: Visitors
-- Description: Stores website visitor tracking information and sessions
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Visitors]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Visitors] (
        [VisitorId]         BIGINT IDENTITY(1,1) NOT NULL,
        [SessionId]         VARCHAR(100) NOT NULL,
        [Name]              NVARCHAR(150) NULL,
        [Mobile]            VARCHAR(30) NULL,
        [Email]             NVARCHAR(200) NULL,
        [IPAddress]         VARCHAR(50) NULL,
        [UserAgent]         NVARCHAR(500) NULL,
        [CreatedDate]       DATETIME2(7) NOT NULL CONSTRAINT [DF_Visitors_CreatedDate] DEFAULT (SYSUTCDATETIME()),
        [LastActivityDate]  DATETIME2(7) NOT NULL CONSTRAINT [DF_Visitors_LastActivityDate] DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT [PK_Visitors] PRIMARY KEY CLUSTERED ([VisitorId] ASC),
        CONSTRAINT [UQ_Visitors_SessionId] UNIQUE NONCLUSTERED ([SessionId] ASC)
    );
END
GO
