-- Media Management Migration
-- Creates tables for storing media metadata in database while using blob storage for files

-- Create media_folders table
CREATE TABLE media_folders (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    parent_id UNIQUEIDENTIFIER NULL,
    user_id UNIQUEIDENTIFIER NOT NULL,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE(),
    is_deleted BIT DEFAULT 0,
    
    -- Foreign key constraints
    CONSTRAINT FK_media_folders_parent FOREIGN KEY (parent_id) REFERENCES media_folders(id),
    CONSTRAINT FK_media_folders_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create media_files table
CREATE TABLE media_files (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    folder_id UNIQUEIDENTIFIER NULL,
    user_id UNIQUEIDENTIFIER NOT NULL,
    original_name NVARCHAR(500) NOT NULL,
    file_name NVARCHAR(500) NOT NULL,
    blob_path NVARCHAR(1000) NOT NULL,
    blob_url NVARCHAR(2000) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type NVARCHAR(100) NOT NULL,
    file_type NVARCHAR(20) NOT NULL CHECK (file_type IN ('image', 'video')),
    width INT NULL,
    height INT NULL,
    duration_seconds DECIMAL(10,2) NULL, -- For videos
    tags NVARCHAR(MAX) NULL, -- JSON array of tags
    alt_text NVARCHAR(500) NULL,
    description NVARCHAR(MAX) NULL,
    is_public BIT DEFAULT 0,
    is_deleted BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE(),
    
    -- Foreign key constraints
    CONSTRAINT FK_media_files_folder FOREIGN KEY (folder_id) REFERENCES media_folders(id),
    CONSTRAINT FK_media_files_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create media_usage table to track where files are used
CREATE TABLE media_usage (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    media_file_id UNIQUEIDENTIFIER NOT NULL,
    website_id UNIQUEIDENTIFIER NULL,
    page_id UNIQUEIDENTIFIER NULL,
    block_id UNIQUEIDENTIFIER NULL,
    usage_type NVARCHAR(50) NOT NULL, -- 'website_logo', 'page_content', 'block_image', etc.
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    
    -- Foreign key constraints
    CONSTRAINT FK_media_usage_file FOREIGN KEY (media_file_id) REFERENCES media_files(id),
    CONSTRAINT FK_media_usage_website FOREIGN KEY (website_id) REFERENCES websites(id),
    CONSTRAINT FK_media_usage_page FOREIGN KEY (page_id) REFERENCES pages(id)
);

-- Create indexes for performance
CREATE INDEX IX_media_folders_user_id ON media_folders(user_id);
CREATE INDEX IX_media_folders_parent_id ON media_folders(parent_id);
CREATE INDEX IX_media_folders_name ON media_folders(name);

CREATE INDEX IX_media_files_user_id ON media_files(user_id);
CREATE INDEX IX_media_files_folder_id ON media_files(folder_id);
CREATE INDEX IX_media_files_file_type ON media_files(file_type);
CREATE INDEX IX_media_files_created_at ON media_files(created_at DESC);
CREATE INDEX IX_media_files_is_public ON media_files(is_public);

CREATE INDEX IX_media_usage_file_id ON media_usage(media_file_id);
CREATE INDEX IX_media_usage_website_id ON media_usage(website_id);
CREATE INDEX IX_media_usage_page_id ON media_usage(page_id);

PRINT 'Media management tables created successfully';
PRINT 'Tables created: media_folders, media_files, media_usage';
PRINT 'Indexes created for performance';

-- Create triggers for updated_at timestamps in separate batches
GO

CREATE TRIGGER tr_media_folders_updated_at
ON media_folders
AFTER UPDATE
AS
BEGIN
    UPDATE media_folders 
    SET updated_at = GETUTCDATE()
    FROM media_folders f
    INNER JOIN inserted i ON f.id = i.id;
END;

GO

CREATE TRIGGER tr_media_files_updated_at
ON media_files
AFTER UPDATE
AS
BEGIN
    UPDATE media_files 
    SET updated_at = GETUTCDATE()
    FROM media_files f
    INNER JOIN inserted i ON f.id = i.id;
END;

GO

PRINT 'Triggers created for data integrity';
