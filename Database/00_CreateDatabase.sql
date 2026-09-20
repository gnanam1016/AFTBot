-- =============================================
-- Database: AFTBotDb Creation Script
-- =============================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'AFTBotDb')
BEGIN
    CREATE DATABASE [AFTBotDb];
END
GO

USE [AFTBotDb];
GO
