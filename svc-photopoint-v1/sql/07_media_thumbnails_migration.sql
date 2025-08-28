-- Media Thumbnails Migration
-- Adds thumbnail support to media_files table

-- Check if columns already exist before adding them
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('media_files') AND name = 'thumbnail_url')
BEGIN
    ALTER TABLE media_files ADD thumbnail_url NVARCHAR(2000) NULL;
    PRINT 'Added thumbnail_url column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('media_files') AND name = 'thumbnail_blob_path')
BEGIN
    ALTER TABLE media_files ADD thumbnail_blob_path NVARCHAR(1000) NULL;
    PRINT 'Added thumbnail_blob_path column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('media_files') AND name = 'has_thumbnail')
BEGIN
    ALTER TABLE media_files ADD has_thumbnail BIT DEFAULT 0;
    PRINT 'Added has_thumbnail column';
END

-- Create index for performance on thumbnail queries (only if it doesn't exist)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_media_files_has_thumbnail')
BEGIN
    CREATE INDEX IX_media_files_has_thumbnail ON media_files(has_thumbnail);
    PRINT 'Created index on has_thumbnail';
END

PRINT 'Thumbnail support migration completed';
