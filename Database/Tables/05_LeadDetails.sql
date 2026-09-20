-- =============================================
-- Table: LeadDetails
-- Description: Flexible purpose-specific attributes for leads
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LeadDetails]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[LeadDetails] (
        [LeadDetailId]      BIGINT IDENTITY(1,1) NOT NULL,
        [LeadId]            BIGINT NOT NULL,
        [FieldName]         NVARCHAR(100) NOT NULL,
        [FieldValue]        NVARCHAR(MAX) NOT NULL,
        [CreatedDate]       DATETIME2(7) NOT NULL CONSTRAINT [DF_LeadDetails_CreatedDate] DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT [PK_LeadDetails] PRIMARY KEY CLUSTERED ([LeadDetailId] ASC),
        CONSTRAINT [FK_LeadDetails_Leads] FOREIGN KEY ([LeadId]) REFERENCES [dbo].[Leads] ([LeadId]) ON DELETE CASCADE
    );
END
GO
