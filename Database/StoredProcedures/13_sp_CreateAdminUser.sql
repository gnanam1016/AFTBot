-- =============================================
-- Stored Procedure: sp_CreateAdminUser
-- Description: Creates a new admin user with unique username and email validation
-- =============================================

CREATE OR ALTER PROCEDURE [dbo].[sp_CreateAdminUser]
    @Username       NVARCHAR(100),
    @Email          NVARCHAR(255),
    @PasswordHash   NVARCHAR(256),
    @PasswordSalt   NVARCHAR(128),
    @DisplayName    NVARCHAR(150),
    @Role           NVARCHAR(50) = 'Admin'
AS
BEGIN
    SET NOCOUNT ON;

    -- Validate uniqueness
    IF EXISTS (SELECT 1 FROM [dbo].[AdminUsers] WHERE [Username] = @Username)
    BEGIN
        RAISERROR('Username already exists.', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM [dbo].[AdminUsers] WHERE [Email] = @Email)
    BEGIN
        RAISERROR('Email already exists.', 16, 1);
        RETURN;
    END

    INSERT INTO [dbo].[AdminUsers] (
        [Username],
        [Email],
        [PasswordHash],
        [PasswordSalt],
        [DisplayName],
        [Role],
        [IsActive],
        [CreatedDate],
        [UpdatedDate]
    )
    OUTPUT 
        inserted.[AdminUserId],
        inserted.[Username],
        inserted.[Email],
        inserted.[PasswordHash],
        inserted.[PasswordSalt],
        inserted.[DisplayName],
        inserted.[Role],
        inserted.[IsActive],
        inserted.[LastLoginDate],
        inserted.[CreatedDate],
        inserted.[UpdatedDate]
    VALUES (
        @Username,
        @Email,
        @PasswordHash,
        @PasswordSalt,
        @DisplayName,
        ISNULL(@Role, 'Admin'),
        1,
        SYSUTCDATETIME(),
        SYSUTCDATETIME()
    );
END
GO
