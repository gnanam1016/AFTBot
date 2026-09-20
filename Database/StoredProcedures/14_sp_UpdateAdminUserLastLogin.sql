-- =============================================
-- Stored Procedure: sp_UpdateAdminUserLastLogin
-- Description: Updates the LastLoginDate for an authenticated admin user
-- =============================================

CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateAdminUserLastLogin]
    @AdminUserId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [dbo].[AdminUsers]
    SET 
        [LastLoginDate] = SYSUTCDATETIME(),
        [UpdatedDate] = SYSUTCDATETIME()
    WHERE [AdminUserId] = @AdminUserId;
END
GO
