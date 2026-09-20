-- =============================================
-- Table: AdminUsers
-- Description: Stores administrative users with PBKDF2 hashed credentials for the AFTBot Admin Portal
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AdminUsers]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[AdminUsers] (
        [AdminUserId]       INT IDENTITY(1,1) NOT NULL,
        [Username]          NVARCHAR(100) NOT NULL,
        [Email]             NVARCHAR(255) NOT NULL,
        [PasswordHash]      NVARCHAR(256) NOT NULL,
        [PasswordSalt]      NVARCHAR(128) NOT NULL,
        [DisplayName]       NVARCHAR(150) NOT NULL,
        [Role]              NVARCHAR(50) NOT NULL CONSTRAINT [DF_AdminUsers_Role] DEFAULT ('Admin'),
        [IsActive]          BIT NOT NULL CONSTRAINT [DF_AdminUsers_IsActive] DEFAULT (1),
        [LastLoginDate]     DATETIME2 NULL,
        [CreatedDate]       DATETIME2 NOT NULL CONSTRAINT [DF_AdminUsers_CreatedDate] DEFAULT (SYSUTCDATETIME()),
        [UpdatedDate]       DATETIME2 NOT NULL CONSTRAINT [DF_AdminUsers_UpdatedDate] DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT [PK_AdminUsers] PRIMARY KEY CLUSTERED ([AdminUserId] ASC),
        CONSTRAINT [UQ_AdminUsers_Username] UNIQUE NONCLUSTERED ([Username] ASC),
        CONSTRAINT [UQ_AdminUsers_Email] UNIQUE NONCLUSTERED ([Email] ASC)
    );

    CREATE NONCLUSTERED INDEX [IX_AdminUsers_Username_IsActive] 
        ON [dbo].[AdminUsers] ([Username], [IsActive])
        INCLUDE ([Email], [PasswordHash], [PasswordSalt], [DisplayName], [Role]);

    CREATE NONCLUSTERED INDEX [IX_AdminUsers_Email_IsActive] 
        ON [dbo].[AdminUsers] ([Email], [IsActive])
        INCLUDE ([Username], [PasswordHash], [PasswordSalt], [DisplayName], [Role]);

    PRINT 'Table [dbo].[AdminUsers] created successfully.';
END
ELSE
BEGIN
    PRINT 'Table [dbo].[AdminUsers] already exists.';
END
GO
