-- Simple OAuth migration - Add columns only
USE [PhotoPoint-v1];

-- Add OAuth provider columns
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'Username')
BEGIN
    ALTER TABLE [dbo].[Users] ADD [Username] NVARCHAR(100) NULL;
    PRINT 'Added Username column to Users table.';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'FullName')
BEGIN
    ALTER TABLE [dbo].[Users] ADD [FullName] NVARCHAR(200) NULL;
    PRINT 'Added FullName column to Users table.';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'ProfilePicture')
BEGIN
    ALTER TABLE [dbo].[Users] ADD [ProfilePicture] NVARCHAR(500) NULL;
    PRINT 'Added ProfilePicture column to Users table.';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'GoogleId')
BEGIN
    ALTER TABLE [dbo].[Users] ADD [GoogleId] NVARCHAR(100) NULL;
    PRINT 'Added GoogleId column to Users table.';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'FacebookId')
BEGIN
    ALTER TABLE [dbo].[Users] ADD [FacebookId] NVARCHAR(100) NULL;
    PRINT 'Added FacebookId column to Users table.';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'AppleId')
BEGIN
    ALTER TABLE [dbo].[Users] ADD [AppleId] NVARCHAR(100) NULL;
    PRINT 'Added AppleId column to Users table.';
END

-- Make PasswordHash nullable for OAuth users
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'PasswordHash' AND IS_NULLABLE = 'NO')
BEGIN
    ALTER TABLE [dbo].[Users] ALTER COLUMN [PasswordHash] NVARCHAR(255) NULL;
    PRINT 'Made PasswordHash column nullable for OAuth users.';
END

PRINT '';
PRINT '✅ Basic OAuth columns added successfully!';
PRINT 'You can now create unique constraints and indexes manually if needed.';
