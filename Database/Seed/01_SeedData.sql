-- =============================================
-- Seed Data: Sample demonstration leads and visitors
-- =============================================

USE [AFTBotDb];
GO

-- Only seed if empty
IF NOT EXISTS (SELECT 1 FROM [dbo].[Visitors])
BEGIN
    -- Seed Visitor 1
    DECLARE @VisitorId1 BIGINT, @SessionId1 VARCHAR(100) = 'demo-session-visitor-001';
    INSERT INTO [dbo].[Visitors] ([SessionId], [Name], [Mobile], [Email], [IPAddress], [UserAgent])
    VALUES (@SessionId1, N'John Doe', '+1-555-0199', N'john.doe@example.com', '127.0.0.1', 'Mozilla/5.0 Chrome/120.0');
    SET @VisitorId1 = SCOPE_IDENTITY();

    -- ChatSession 1
    DECLARE @ChatSessionId1 BIGINT;
    INSERT INTO [dbo].[ChatSessions] ([SessionId], [VisitorId], [Status], [Purpose])
    VALUES (@SessionId1, @VisitorId1, 'Completed', N'Software Development');
    SET @ChatSessionId1 = SCOPE_IDENTITY();

    -- Messages 1
    INSERT INTO [dbo].[ChatMessages] ([ChatSessionId], [SenderType], [Message], [MessageType])
    VALUES 
    (@ChatSessionId1, 'Bot', N'Hi! Welcome to Apex Falcon Technologies 👋 I''m AFTBot, your virtual assistant. May I know your name?', 'Text'),
    (@ChatSessionId1, 'Visitor', N'John Doe', 'Text'),
    (@ChatSessionId1, 'Bot', N'Nice to meet you, John! What is your mobile number and email address?', 'Text'),
    (@ChatSessionId1, 'Visitor', N'+1-555-0199, john.doe@example.com', 'Text'),
    (@ChatSessionId1, 'Bot', N'What brings you to Apex Falcon Technologies today?', 'QuickReply'),
    (@ChatSessionId1, 'Visitor', N'Software Development', 'Text'),
    (@ChatSessionId1, 'Bot', N'Great! What kind of software project are you planning, and what is your expected timeline?', 'Text'),
    (@ChatSessionId1, 'Visitor', N'We need a custom enterprise CRM and inventory management web app within 3 months.', 'Text'),
    (@ChatSessionId1, 'Bot', N'Would you like our team to contact you regarding your requirement?', 'QuickReply'),
    (@ChatSessionId1, 'Visitor', N'Yes, contact me', 'Text');

    -- Lead 1
    DECLARE @LeadId1 BIGINT;
    INSERT INTO [dbo].[Leads] (
        [VisitorId], [ChatSessionId], [Name], [Mobile], [Email],
        [Purpose], [InterestedProduct], [OrganizationType], [Requirement],
        [AdditionalDetails], [LeadScore], [LeadPriority], [ContactRequested], [LeadStatus]
    )
    VALUES (
        @VisitorId1, @ChatSessionId1, N'John Doe', '+1-555-0199', N'john.doe@example.com',
        N'Software Development', N'Custom CRM & Inventory', N'Enterprise', N'Custom enterprise CRM and inventory management within 3 months.',
        N'Timeline: 3 months', 95, 'High', 1, 'New'
    );
    SET @LeadId1 = SCOPE_IDENTITY();

    UPDATE [dbo].[ChatSessions] SET [LeadId] = @LeadId1 WHERE [ChatSessionId] = @ChatSessionId1;

    -- Seed Visitor 2 (Internship lead)
    DECLARE @VisitorId2 BIGINT, @SessionId2 VARCHAR(100) = 'demo-session-visitor-002';
    INSERT INTO [dbo].[Visitors] ([SessionId], [Name], [Mobile], [Email], [IPAddress], [UserAgent])
    VALUES (@SessionId2, N'Sarah Connor', '+1-555-0244', N'sarah.c@techuni.edu', '127.0.0.1', 'Mozilla/5.0 Safari/605.1');
    SET @VisitorId2 = SCOPE_IDENTITY();

    DECLARE @ChatSessionId2 BIGINT;
    INSERT INTO [dbo].[ChatSessions] ([SessionId], [VisitorId], [Status], [Purpose])
    VALUES (@SessionId2, @VisitorId2, 'Completed', N'Internship');
    SET @ChatSessionId2 = SCOPE_IDENTITY();

    INSERT INTO [dbo].[Leads] (
        [VisitorId], [ChatSessionId], [Name], [Mobile], [Email],
        [Purpose], [InterestedProduct], [OrganizationType], [Requirement],
        [AdditionalDetails], [LeadScore], [LeadPriority], [ContactRequested], [LeadStatus]
    )
    VALUES (
        @VisitorId2, @ChatSessionId2, N'Sarah Connor', '+1-555-0244', N'sarah.c@techuni.edu',
        N'Internship', N'AI / Machine Learning', N'University Student', N'Final year CS student seeking 6-month AI/ML internship starting next month.',
        N'College: Tech University, Duration: 6 months', 85, 'High', 1, 'Contacted'
    );

    UPDATE [dbo].[ChatSessions] SET [LeadId] = SCOPE_IDENTITY() WHERE [ChatSessionId] = @ChatSessionId2;
END
GO
