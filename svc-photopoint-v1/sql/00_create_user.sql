-- PhotoPoint User and Permissions Setup Script
-- Run this script as a SQL Server administrator to create the application user

USE [master];

-- Create SQL Server login if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'PhotoPointAPI')
BEGIN
    CREATE LOGIN [PhotoPointAPI] 
    WITH PASSWORD = N'Ph@toPointP0wer', 
    DEFAULT_DATABASE = [PhotoPoint-v1],
    DEFAULT_LANGUAGE = [us_english],
    CHECK_EXPIRATION = OFF,
    CHECK_POLICY = ON;
    
    PRINT 'SQL Server login [PhotoPointAPI] created successfully.';
END
ELSE
BEGIN
    PRINT 'SQL Server login [PhotoPointAPI] already exists.';
END

-- Switch to PhotoPoint database (create it first if it doesn't exist)
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'PhotoPoint-v1')
BEGIN
    CREATE DATABASE [PhotoPoint-v1]
    COLLATE SQL_Latin1_General_CP1_CI_AS;
    PRINT 'Database [PhotoPoint-v1] created successfully.';
END

USE [PhotoPoint-v1];

-- Create database user if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'PhotoPointAPI')
BEGIN
    CREATE USER [PhotoPointAPI] FOR LOGIN [PhotoPointAPI];
    PRINT 'Database user [PhotoPointAPI] created successfully.';
END
ELSE
BEGIN
    PRINT 'Database user [PhotoPointAPI] already exists.';
END

-- Grant necessary permissions
-- Data access permissions
ALTER ROLE [db_datareader] ADD MEMBER [PhotoPointAPI];
ALTER ROLE [db_datawriter] ADD MEMBER [PhotoPointAPI];

-- Schema modification permissions (needed for creating tables, indexes)
ALTER ROLE [db_ddladmin] ADD MEMBER [PhotoPointAPI];

-- Grant specific permissions
GRANT CREATE TABLE TO [PhotoPointAPI];
GRANT CREATE PROCEDURE TO [PhotoPointAPI];
GRANT CREATE FUNCTION TO [PhotoPointAPI];
GRANT CREATE VIEW TO [PhotoPointAPI];
GRANT ALTER ON SCHEMA::[dbo] TO [PhotoPointAPI];

-- Grant execute permissions for stored procedures (if we add them later)
GRANT EXECUTE TO [PhotoPointAPI];

PRINT 'Permissions granted to [PhotoPointAPI]:';
PRINT '  - db_datareader (read data)';
PRINT '  - db_datawriter (insert/update/delete data)';
PRINT '  - db_ddladmin (create/alter tables)';
PRINT '  - CREATE TABLE, PROCEDURE, FUNCTION, VIEW';
PRINT '  - ALTER on dbo schema';
PRINT '  - EXECUTE on stored procedures';

-- Verify user permissions
SELECT 
    dp.principal_id,
    dp.name AS principal_name,
    dp.type_desc AS principal_type_desc,
    r.role_principal_id,
    r.name AS role_name
FROM sys.database_role_members rm
JOIN sys.database_principals dp ON rm.member_principal_id = dp.principal_id
JOIN sys.database_principals r ON rm.role_principal_id = r.principal_id
WHERE dp.name = 'PhotoPointAPI';

PRINT '';
PRINT 'User setup completed successfully!';
PRINT 'Login: PhotoPointAPI';
PRINT 'Default Database: PhotoPoint-v1';
PRINT '';
PRINT 'Your .env file is already configured with these credentials:';
PRINT 'DB_USERNAME=PhotoPointAPI';
PRINT 'DB_PASSWORD=Ph@toPointP0wer';
