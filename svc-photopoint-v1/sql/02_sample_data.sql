-- PhotoPoint Database Sample Data
-- Run this script to insert test data for development and testing

USE [PhotoPoint-v1];

PRINT 'Inserting sample data for PhotoPoint development...';

-- Check if sample data already exists
IF NOT EXISTS (SELECT * FROM [dbo].[Users] WHERE [Email] = 'demo@photopoint.com')
BEGIN
    -- Insert sample users
    DECLARE @DemoUserId UNIQUEIDENTIFIER = NEWID();
    DECLARE @TestUserId UNIQUEIDENTIFIER = NEWID();

    INSERT INTO [dbo].[Users] ([Id], [Email], [PasswordHash], [FirstName], [LastName], [IsActive], [IsEmailVerified])
    VALUES 
        (@DemoUserId, 'demo@photopoint.com', '$2a$10$rOCNvQwjzgVxaaDOJPQnFek5vwQwQ2JzgTtDJGkJdGzQgVwxvzJYm', 'Demo', 'User', 1, 1),
        (@TestUserId, 'test@photopoint.com', '$2a$10$rOCNvQwjzgVxaaDOJPQnFek5vwQwQ2JzgTtDJGkJdGzQgVwxvzJYm', 'Test', 'User', 1, 1);
    
    PRINT 'Sample users created:';
    PRINT '  - demo@photopoint.com (password: demo123)';
    PRINT '  - test@photopoint.com (password: demo123)';

    -- Insert sample albums
    DECLARE @DemoAlbumId UNIQUEIDENTIFIER = NEWID();
    DECLARE @TestAlbumId UNIQUEIDENTIFIER = NEWID();

    INSERT INTO [dbo].[Albums] ([Id], [UserId], [Name], [Description], [IsPublic])
    VALUES 
        (@DemoAlbumId, @DemoUserId, 'My First Album', 'Collection of sample photos', 1),
        (@TestAlbumId, @TestUserId, 'Test Gallery', 'Testing photo uploads', 0);

    PRINT 'Sample albums created.';

    -- Insert sample photos (these would be actual uploaded photos in real usage)
    DECLARE @Photo1Id UNIQUEIDENTIFIER = NEWID();
    DECLARE @Photo2Id UNIQUEIDENTIFIER = NEWID();
    DECLARE @Photo3Id UNIQUEIDENTIFIER = NEWID();

    INSERT INTO [dbo].[Photos] ([Id], [UserId], [FileName], [OriginalName], [MimeType], [Size], [Url], [ThumbnailUrl], [Width], [Height], [Description], [IsPublic], [IsFavorite])
    VALUES 
        (@Photo1Id, @DemoUserId, 'sample-landscape.jpg', 'Beautiful Landscape.jpg', 'image/jpeg', 2048576, '/uploads/sample-landscape.jpg', '/uploads/thumbs/sample-landscape.jpg', 1920, 1080, 'A beautiful landscape photo', 1, 1),
        (@Photo2Id, @DemoUserId, 'sample-portrait.jpg', 'Portrait Photo.jpg', 'image/jpeg', 1536000, '/uploads/sample-portrait.jpg', '/uploads/thumbs/sample-portrait.jpg', 1080, 1920, 'Professional portrait', 1, 0),
        (@Photo3Id, @TestUserId, 'test-image.png', 'Test Image.png', 'image/png', 512000, '/uploads/test-image.png', '/uploads/thumbs/test-image.png', 800, 600, 'Test upload image', 0, 0);

    PRINT 'Sample photos created.';

    -- Add photos to albums
    INSERT INTO [dbo].[AlbumPhotos] ([AlbumId], [PhotoId], [SortOrder])
    VALUES 
        (@DemoAlbumId, @Photo1Id, 1),
        (@DemoAlbumId, @Photo2Id, 2),
        (@TestAlbumId, @Photo3Id, 1);

    PRINT 'Photos added to albums.';

    -- Update album cover photos
    UPDATE [dbo].[Albums] SET [CoverPhotoId] = @Photo1Id WHERE [Id] = @DemoAlbumId;
    UPDATE [dbo].[Albums] SET [CoverPhotoId] = @Photo3Id WHERE [Id] = @TestAlbumId;

    PRINT 'Album cover photos set.';

    PRINT '';
    PRINT 'Sample data insertion completed successfully!';
    PRINT '';
    PRINT 'Test Accounts:';
    PRINT '  Email: demo@photopoint.com | Password: demo123';
    PRINT '  Email: test@photopoint.com | Password: demo123';
    PRINT '';
    PRINT 'Data Summary:';
    SELECT 
        (SELECT COUNT(*) FROM [dbo].[Users]) AS TotalUsers,
        (SELECT COUNT(*) FROM [dbo].[Photos]) AS TotalPhotos,
        (SELECT COUNT(*) FROM [dbo].[Albums]) AS TotalAlbums;
END
ELSE
BEGIN
    PRINT 'Sample data already exists. Skipping insertion.';
    
    PRINT '';
    PRINT 'Existing Data Summary:';
    SELECT 
        (SELECT COUNT(*) FROM [dbo].[Users]) AS TotalUsers,
        (SELECT COUNT(*) FROM [dbo].[Photos]) AS TotalPhotos,
        (SELECT COUNT(*) FROM [dbo].[Albums]) AS TotalAlbums,
        (SELECT COUNT(*) FROM [dbo].[UserSessions]) AS TotalSessions;
END
