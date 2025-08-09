-- Add OAuth columns to Users table for social login support

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

-- Add unique constraints for OAuth IDs (only if columns exist and have data)
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'GoogleId')
  AND NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE CONSTRAINT_NAME = 'UQ_Users_GoogleId')
BEGIN
    ALTER TABLE [dbo].[Users] ADD CONSTRAINT [UQ_Users_GoogleId] UNIQUE ([GoogleId]);
    PRINT 'Added unique constraint for GoogleId.';
END

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'FacebookId')
  AND NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE CONSTRAINT_NAME = 'UQ_Users_FacebookId')
BEGIN
    ALTER TABLE [dbo].[Users] ADD CONSTRAINT [UQ_Users_FacebookId] UNIQUE ([FacebookId]);
    PRINT 'Added unique constraint for FacebookId.';
END

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'AppleId')
  AND NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE CONSTRAINT_NAME = 'UQ_Users_AppleId')
BEGIN
    ALTER TABLE [dbo].[Users] ADD CONSTRAINT [UQ_Users_AppleId] UNIQUE ([AppleId]);
    PRINT 'Added unique constraint for AppleId.';
END

-- Create indexes for OAuth lookups
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'GoogleId')
  AND NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_GoogleId')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Users_GoogleId] ON [dbo].[Users] ([GoogleId] ASC)
    WHERE [GoogleId] IS NOT NULL;
    PRINT 'Created index for GoogleId lookups.';
END

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'FacebookId')
  AND NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_FacebookId')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Users_FacebookId] ON [dbo].[Users] ([FacebookId] ASC)
    WHERE [FacebookId] IS NOT NULL;
    PRINT 'Created index for FacebookId lookups.';
END

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'AppleId')
  AND NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_AppleId')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Users_AppleId] ON [dbo].[Users] ([AppleId] ASC)
    WHERE [AppleId] IS NOT NULL;
    PRINT 'Created index for AppleId lookups.';
END

PRINT '';
PRINT '✅ OAuth columns migration completed successfully!';
PRINT '';
PRINT 'Users table now supports:';
PRINT '- Username field for display names';
PRINT '- FullName field for complete names';
PRINT '- ProfilePicture field for avatar URLs';
PRINT '- GoogleId, FacebookId, AppleId for OAuth providers';
PRINT '- PasswordHash is now nullable for OAuth-only users';
