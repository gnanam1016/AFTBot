-- =============================================
-- Stored Procedure: sp_GetAdminUserByUsernameOrEmail
-- Description: Retrieves an active admin user by username or email for authentication
-- =============================================

CREATE OR ALTER PROCEDURE [dbo].[sp_GetAdminUserByUsernameOrEmail]
    @UsernameOrEmail NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1
        [AdminUserId],
        [Username],
        [Email],
        [PasswordHash],
        [PasswordSalt],
        [DisplayName],
        [Role],
        [IsActive],
        [LastLoginDate],
        [CreatedDate],
        [UpdatedDate]
    FROM [dbo].[AdminUsers]
    WHERE ([Username] = @UsernameOrEmail OR [Email] = @UsernameOrEmail)
      AND [IsActive] = 1;
END
GO
