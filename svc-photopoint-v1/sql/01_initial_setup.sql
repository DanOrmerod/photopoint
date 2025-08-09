-- PhotoPoint Database Initial Setup Script
-- Run this script to create the database and initial tables

-- Create database if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'PhotoPoint-v1')
BEGIN
    CREATE DATABASE [PhotoPoint-v1]
    COLLATE SQL_Latin1_General_CP1_CI_AS;
    PRINT 'Database PhotoPoint-v1 created successfully.';
END
ELSE
BEGIN
    PRINT 'Database PhotoPoint-v1 already exists.';
END

-- Switch to the PhotoPoint database
USE [PhotoPoint-v1];

-- Create Users table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Users] (
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        [Email] NVARCHAR(255) NOT NULL,
        [PasswordHash] NVARCHAR(255) NOT NULL,
        [FirstName] NVARCHAR(100) NULL,
        [LastName] NVARCHAR(100) NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [IsEmailVerified] BIT NOT NULL DEFAULT 0,
        [LastLoginAt] DATETIME2 NULL,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [UQ_Users_Email] UNIQUE NONCLUSTERED ([Email] ASC)
    );

    -- Create index on email for faster lookups
    CREATE NONCLUSTERED INDEX [IX_Users_Email] ON [dbo].[Users] ([Email] ASC);
    CREATE NONCLUSTERED INDEX [IX_Users_CreatedAt] ON [dbo].[Users] ([CreatedAt] DESC);
    
    PRINT 'Users table created successfully.';
END
ELSE
BEGIN
    PRINT 'Users table already exists.';
END

-- Create Photos table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Photos]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Photos] (
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        [UserId] UNIQUEIDENTIFIER NOT NULL,
        [FileName] NVARCHAR(255) NOT NULL,
        [OriginalName] NVARCHAR(255) NOT NULL,
        [MimeType] NVARCHAR(100) NOT NULL,
        [Size] BIGINT NOT NULL,
        [Url] NVARCHAR(500) NOT NULL,
        [ThumbnailUrl] NVARCHAR(500) NULL,
        [Width] INT NULL,
        [Height] INT NULL,
        [Camera] NVARCHAR(255) NULL,
        [Location] NVARCHAR(255) NULL,
        [Tags] NVARCHAR(MAX) NULL, -- JSON array as string
        [Description] NVARCHAR(1000) NULL,
        [IsPublic] BIT NOT NULL DEFAULT 0,
        [IsFavorite] BIT NOT NULL DEFAULT 0,
        [UploadedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT [PK_Photos] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_Photos_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]) ON DELETE CASCADE
    );

    -- Create indexes for better query performance
    CREATE NONCLUSTERED INDEX [IX_Photos_UserId] ON [dbo].[Photos] ([UserId] ASC);
    CREATE NONCLUSTERED INDEX [IX_Photos_CreatedAt] ON [dbo].[Photos] ([CreatedAt] DESC);
    CREATE NONCLUSTERED INDEX [IX_Photos_IsFavorite] ON [dbo].[Photos] ([IsFavorite] ASC) WHERE [IsFavorite] = 1;
    CREATE NONCLUSTERED INDEX [IX_Photos_IsPublic] ON [dbo].[Photos] ([IsPublic] ASC) WHERE [IsPublic] = 1;
    
    PRINT 'Photos table created successfully.';
END
ELSE
BEGIN
    PRINT 'Photos table already exists.';
END

-- Create Albums table (for future photo organization)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Albums]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Albums] (
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        [UserId] UNIQUEIDENTIFIER NOT NULL,
        [Name] NVARCHAR(255) NOT NULL,
        [Description] NVARCHAR(1000) NULL,
        [CoverPhotoId] UNIQUEIDENTIFIER NULL,
        [IsPublic] BIT NOT NULL DEFAULT 0,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT [PK_Albums] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_Albums_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_Albums_CoverPhoto] FOREIGN KEY ([CoverPhotoId]) REFERENCES [dbo].[Photos] ([Id])
    );

    CREATE NONCLUSTERED INDEX [IX_Albums_UserId] ON [dbo].[Albums] ([UserId] ASC);
    CREATE NONCLUSTERED INDEX [IX_Albums_CreatedAt] ON [dbo].[Albums] ([CreatedAt] DESC);
    
    PRINT 'Albums table created successfully.';
END
ELSE
BEGIN
    PRINT 'Albums table already exists.';
END

-- Create AlbumPhotos junction table (many-to-many relationship)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AlbumPhotos]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[AlbumPhotos] (
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        [AlbumId] UNIQUEIDENTIFIER NOT NULL,
        [PhotoId] UNIQUEIDENTIFIER NOT NULL,
        [SortOrder] INT NOT NULL DEFAULT 0,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT [PK_AlbumPhotos] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_AlbumPhotos_Albums] FOREIGN KEY ([AlbumId]) REFERENCES [dbo].[Albums] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_AlbumPhotos_Photos] FOREIGN KEY ([PhotoId]) REFERENCES [dbo].[Photos] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [UQ_AlbumPhotos_AlbumPhoto] UNIQUE ([AlbumId], [PhotoId])
    );

    CREATE NONCLUSTERED INDEX [IX_AlbumPhotos_AlbumId] ON [dbo].[AlbumPhotos] ([AlbumId] ASC);
    CREATE NONCLUSTERED INDEX [IX_AlbumPhotos_PhotoId] ON [dbo].[AlbumPhotos] ([PhotoId] ASC);
    
    PRINT 'AlbumPhotos table created successfully.';
END
ELSE
BEGIN
    PRINT 'AlbumPhotos table already exists.';
END

-- Create UserSessions table (for JWT token management)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserSessions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[UserSessions] (
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        [UserId] UNIQUEIDENTIFIER NOT NULL,
        [TokenHash] NVARCHAR(255) NOT NULL, -- Hash of JWT token for revocation
        [UserAgent] NVARCHAR(500) NULL,
        [IpAddress] NVARCHAR(45) NULL, -- IPv6 compatible
        [ExpiresAt] DATETIME2 NOT NULL,
        [IsRevoked] BIT NOT NULL DEFAULT 0,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT [PK_UserSessions] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_UserSessions_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]) ON DELETE CASCADE
    );

    CREATE NONCLUSTERED INDEX [IX_UserSessions_UserId] ON [dbo].[UserSessions] ([UserId] ASC);
    CREATE NONCLUSTERED INDEX [IX_UserSessions_TokenHash] ON [dbo].[UserSessions] ([TokenHash] ASC);
    CREATE NONCLUSTERED INDEX [IX_UserSessions_ExpiresAt] ON [dbo].[UserSessions] ([ExpiresAt] ASC);
    
    PRINT 'UserSessions table created successfully.';
END
ELSE
BEGIN
    PRINT 'UserSessions table already exists.';
END

-- Create triggers for updating UpdatedAt timestamps
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_Users_UpdatedAt')
BEGIN
    EXEC('
    CREATE TRIGGER [dbo].[TR_Users_UpdatedAt]
    ON [dbo].[Users]
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE [dbo].[Users]
        SET [UpdatedAt] = GETUTCDATE()
        FROM [dbo].[Users] u
        INNER JOIN inserted i ON u.[Id] = i.[Id]
    END
    ');
    PRINT 'Users UpdatedAt trigger created successfully.';
END

IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_Photos_UpdatedAt')
BEGIN
    EXEC('
    CREATE TRIGGER [dbo].[TR_Photos_UpdatedAt]
    ON [dbo].[Photos]
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE [dbo].[Photos]
        SET [UpdatedAt] = GETUTCDATE()
        FROM [dbo].[Photos] p
        INNER JOIN inserted i ON p.[Id] = i.[Id]
    END
    ');
    PRINT 'Photos UpdatedAt trigger created successfully.';
END

IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_Albums_UpdatedAt')
BEGIN
    EXEC('
    CREATE TRIGGER [dbo].[TR_Albums_UpdatedAt]
    ON [dbo].[Albums]
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE [dbo].[Albums]
        SET [UpdatedAt] = GETUTCDATE()
        FROM [dbo].[Albums] a
        INNER JOIN inserted i ON a.[Id] = i.[Id]
    END
    ');
    PRINT 'Albums UpdatedAt trigger created successfully.';
END

PRINT 'PhotoPoint database setup completed successfully!';
PRINT 'Database: PhotoPoint-v1';
PRINT 'Tables created: Users, Photos, Albums, AlbumPhotos, UserSessions';
PRINT 'Indexes and constraints applied for optimal performance.';
