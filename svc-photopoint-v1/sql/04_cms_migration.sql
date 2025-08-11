-- CMS Platform Database Migration
-- Creates tables for multi-tenant website/CMS functionality

USE [PhotoPoint-v1];

-- Create Websites table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Websites]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Websites] (
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        [UserId] UNIQUEIDENTIFIER NOT NULL,
        [Name] NVARCHAR(255) NOT NULL,
        [Domain] NVARCHAR(255) NOT NULL,
        [Subdomain] NVARCHAR(100) NOT NULL,
        [Status] NVARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, active, inactive, suspended
        [Theme] NVARCHAR(50) NOT NULL DEFAULT 'default',
        [Settings] NVARCHAR(MAX) NULL, -- JSON settings
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [LastPublishedAt] DATETIME2 NULL,
        
        CONSTRAINT [PK_Websites] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_Websites_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE CASCADE,
        CONSTRAINT [UQ_Websites_Domain] UNIQUE NONCLUSTERED ([Domain] ASC),
        CONSTRAINT [UQ_Websites_Subdomain] UNIQUE NONCLUSTERED ([Subdomain] ASC),
        CONSTRAINT [CK_Websites_Status] CHECK ([Status] IN ('draft', 'active', 'inactive', 'suspended'))
    );

    -- Create indexes
    CREATE NONCLUSTERED INDEX [IX_Websites_UserId] ON [dbo].[Websites] ([UserId] ASC);
    CREATE NONCLUSTERED INDEX [IX_Websites_Status] ON [dbo].[Websites] ([Status] ASC);
    CREATE NONCLUSTERED INDEX [IX_Websites_CreatedAt] ON [dbo].[Websites] ([CreatedAt] DESC);
    
    PRINT 'Websites table created successfully.';
END
ELSE
BEGIN
    PRINT 'Websites table already exists.';
END

-- Create Pages table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Pages]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Pages] (
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        [WebsiteId] UNIQUEIDENTIFIER NOT NULL,
        [Title] NVARCHAR(255) NOT NULL,
        [Slug] NVARCHAR(255) NOT NULL,
        [IsHomePage] BIT NOT NULL DEFAULT 0,
        [Content] NVARCHAR(MAX) NULL, -- JSON content blocks
        [MetaTitle] NVARCHAR(255) NULL,
        [MetaDescription] NVARCHAR(500) NULL,
        [Status] NVARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, published, archived
        [ParentId] UNIQUEIDENTIFIER NULL, -- For page hierarchy
        [SortOrder] INT NOT NULL DEFAULT 0,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [PublishedAt] DATETIME2 NULL,
        
        CONSTRAINT [PK_Pages] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_Pages_Websites] FOREIGN KEY ([WebsiteId]) REFERENCES [dbo].[Websites]([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_Pages_Parent] FOREIGN KEY ([ParentId]) REFERENCES [dbo].[Pages]([Id]),
        CONSTRAINT [UQ_Pages_Website_Slug] UNIQUE NONCLUSTERED ([WebsiteId] ASC, [Slug] ASC),
        CONSTRAINT [CK_Pages_Status] CHECK ([Status] IN ('draft', 'published', 'archived'))
    );

    -- Create indexes
    CREATE NONCLUSTERED INDEX [IX_Pages_WebsiteId] ON [dbo].[Pages] ([WebsiteId] ASC);
    CREATE NONCLUSTERED INDEX [IX_Pages_Status] ON [dbo].[Pages] ([Status] ASC);
    CREATE NONCLUSTERED INDEX [IX_Pages_ParentId] ON [dbo].[Pages] ([ParentId] ASC);
    CREATE NONCLUSTERED INDEX [IX_Pages_SortOrder] ON [dbo].[Pages] ([SortOrder] ASC);
    CREATE NONCLUSTERED INDEX [IX_Pages_CreatedAt] ON [dbo].[Pages] ([CreatedAt] DESC);
    
    PRINT 'Pages table created successfully.';
END
ELSE
BEGIN
    PRINT 'Pages table already exists.';
END

-- Create ContentBlocks table for flexible page content
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ContentBlocks]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ContentBlocks] (
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        [PageId] UNIQUEIDENTIFIER NOT NULL,
        [Type] NVARCHAR(50) NOT NULL, -- text, image, gallery, video, custom
        [Content] NVARCHAR(MAX) NOT NULL, -- JSON content data
        [SortOrder] INT NOT NULL DEFAULT 0,
        [Settings] NVARCHAR(MAX) NULL, -- JSON settings for styling/behavior
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT [PK_ContentBlocks] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_ContentBlocks_Pages] FOREIGN KEY ([PageId]) REFERENCES [dbo].[Pages]([Id]) ON DELETE CASCADE
    );

    -- Create indexes
    CREATE NONCLUSTERED INDEX [IX_ContentBlocks_PageId] ON [dbo].[ContentBlocks] ([PageId] ASC);
    CREATE NONCLUSTERED INDEX [IX_ContentBlocks_SortOrder] ON [dbo].[ContentBlocks] ([SortOrder] ASC);
    CREATE NONCLUSTERED INDEX [IX_ContentBlocks_Type] ON [dbo].[ContentBlocks] ([Type] ASC);
    
    PRINT 'ContentBlocks table created successfully.';
END
ELSE
BEGIN
    PRINT 'ContentBlocks table already exists.';
END

-- Create WebsiteMedia table for file management
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[WebsiteMedia]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[WebsiteMedia] (
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        [WebsiteId] UNIQUEIDENTIFIER NOT NULL,
        [FileName] NVARCHAR(255) NOT NULL,
        [OriginalName] NVARCHAR(255) NOT NULL,
        [FileSize] BIGINT NOT NULL,
        [MimeType] NVARCHAR(100) NOT NULL,
        [FileUrl] NVARCHAR(500) NOT NULL,
        [Alt] NVARCHAR(255) NULL,
        [Description] NVARCHAR(1000) NULL,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT [PK_WebsiteMedia] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_WebsiteMedia_Websites] FOREIGN KEY ([WebsiteId]) REFERENCES [dbo].[Websites]([Id]) ON DELETE CASCADE
    );

    -- Create indexes
    CREATE NONCLUSTERED INDEX [IX_WebsiteMedia_WebsiteId] ON [dbo].[WebsiteMedia] ([WebsiteId] ASC);
    CREATE NONCLUSTERED INDEX [IX_WebsiteMedia_MimeType] ON [dbo].[WebsiteMedia] ([MimeType] ASC);
    CREATE NONCLUSTERED INDEX [IX_WebsiteMedia_CreatedAt] ON [dbo].[WebsiteMedia] ([CreatedAt] DESC);
    
    PRINT 'WebsiteMedia table created successfully.';
END
ELSE
BEGIN
    PRINT 'WebsiteMedia table already exists.';
END

-- Add sample data
IF NOT EXISTS (SELECT * FROM [dbo].[Websites])
BEGIN
    -- First, let's get a user ID (assuming we have at least one user)
    DECLARE @UserId UNIQUEIDENTIFIER;
    SELECT TOP 1 @UserId = Id FROM [dbo].[Users];
    
    IF @UserId IS NOT NULL
    BEGIN
        -- Insert sample websites
        DECLARE @Website1Id UNIQUEIDENTIFIER = NEWID();
        DECLARE @Website2Id UNIQUEIDENTIFIER = NEWID();
        
        INSERT INTO [dbo].[Websites] ([Id], [UserId], [Name], [Domain], [Subdomain], [Status], [Theme])
        VALUES 
            (@Website1Id, @UserId, 'My Portfolio Site', 'johnsmith.mysite.com', 'johnsmith', 'active', 'portfolio'),
            (@Website2Id, @UserId, 'Photography Blog', 'photos.example.com', 'photos', 'draft', 'blog');
        
        -- Insert sample pages for first website
        DECLARE @HomePage1Id UNIQUEIDENTIFIER = NEWID();
        DECLARE @AboutPageId UNIQUEIDENTIFIER = NEWID();
        
        INSERT INTO [dbo].[Pages] ([Id], [WebsiteId], [Title], [Slug], [Content], [MetaTitle], [Status], [SortOrder], [PublishedAt])
        VALUES 
            (@HomePage1Id, @Website1Id, 'Home', 'home', '{"blocks": [{"type": "hero", "content": {"title": "Welcome to My Portfolio", "subtitle": "Creative professional showcasing amazing work"}}]}', 'John Smith - Portfolio', 'published', 1, GETUTCDATE()),
            (@AboutPageId, @Website1Id, 'About Me', 'about', '{"blocks": [{"type": "text", "content": {"html": "<p>I am a creative professional with over 10 years of experience...</p>"}}]}', 'About John Smith', 'published', 2, GETUTCDATE());
        
        -- Insert sample pages for second website
        DECLARE @HomePage2Id UNIQUEIDENTIFIER = NEWID();
        
        INSERT INTO [dbo].[Pages] ([Id], [WebsiteId], [Title], [Slug], [Content], [MetaTitle], [Status], [SortOrder])
        VALUES 
            (@HomePage2Id, @Website2Id, 'Home', 'home', '{"blocks": [{"type": "gallery", "content": {"title": "Latest Photos", "images": []}}]}', 'Photography Blog', 'draft', 1);
        
        PRINT 'Sample CMS data inserted successfully.';
    END
    ELSE
    BEGIN
        PRINT 'No users found - skipping sample data insertion.';
    END
END
ELSE
BEGIN
    PRINT 'Sample websites already exist.';
END

PRINT 'CMS Platform migration completed successfully.';
