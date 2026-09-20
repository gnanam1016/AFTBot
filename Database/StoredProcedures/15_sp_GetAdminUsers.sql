-- =============================================
-- Stored Procedure: sp_GetAdminUsers
-- Description: Retrieves all administrative users
-- =============================================

CREATE OR ALTER PROCEDURE [dbo].[sp_GetAdminUsers]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        [AdminUserId],
        [Username],
        [Email],
        [DisplayName],
        [Role],
        [IsActive],
        [LastLoginDate],
        [CreatedDate]
    FROM [dbo].[AdminUsers]
    ORDER BY [AdminUserId] ASC;
END
GO
