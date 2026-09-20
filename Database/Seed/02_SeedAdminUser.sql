-- =============================================
-- Seed Data: Default Admin User
-- Credentials:
--   Username: admin / admin@apexfalcon.com
--   Password: ApexFalcon@2026!
-- =============================================

IF NOT EXISTS (SELECT 1 FROM [dbo].[AdminUsers] WHERE [Username] = 'admin' OR [Email] = 'admin@apexfalcon.com')
BEGIN
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
    VALUES (
        'admin',
        'admin@apexfalcon.com',
        'iNLus3O5tTmYLMSM+d9v5ayrxwy25sG5C/e/2VZ2o9Q=',
        '+a5rvc5xPn135QFcxD342Q==',
        'Apex Falcon Admin',
        'Admin',
        1,
        SYSUTCDATETIME(),
        SYSUTCDATETIME()
    );

    PRINT 'Default admin user seeded successfully.';
END
ELSE
BEGIN
    PRINT 'Admin user already exists in [dbo].[AdminUsers].';
END
GO
