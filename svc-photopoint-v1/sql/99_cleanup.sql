-- PhotoPoint Database Cleanup Script
-- Use this script to drop all tables and reset the database
-- WARNING: This will delete ALL data!

USE [PhotoPoint-v1];

PRINT 'Starting database cleanup...';
PRINT 'WARNING: This will delete ALL PhotoPoint data!';

-- Disable foreign key constraints temporarily
EXEC sp_msforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all";

-- Drop tables in reverse dependency order
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AlbumPhotos]') AND type in (N'U'))
BEGIN
    DROP TABLE [dbo].[AlbumPhotos];
    PRINT 'Dropped table: AlbumPhotos';
END

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Albums]') AND type in (N'U'))
BEGIN
    DROP TABLE [dbo].[Albums];
    PRINT 'Dropped table: Albums';
END

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserSessions]') AND type in (N'U'))
BEGIN
    DROP TABLE [dbo].[UserSessions];
    PRINT 'Dropped table: UserSessions';
END

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Photos]') AND type in (N'U'))
BEGIN
    DROP TABLE [dbo].[Photos];
    PRINT 'Dropped table: Photos';
END

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    DROP TABLE [dbo].[Users];
    PRINT 'Dropped table: Users';
END

-- Re-enable foreign key constraints
EXEC sp_msforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all";

PRINT 'Database cleanup completed.';
PRINT 'All PhotoPoint tables have been dropped.';
PRINT 'Run 01_initial_setup.sql to recreate the schema.';
