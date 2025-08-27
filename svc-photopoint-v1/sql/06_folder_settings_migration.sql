-- Media Folder Settings Migration
-- Adds settings and permissions management for media folders

-- Add settings columns to media_folders table
ALTER TABLE media_folders ADD 
    allow_website_usage BIT DEFAULT 0,
    website_usage_permissions NVARCHAR(20) DEFAULT 'private' CHECK (website_usage_permissions IN ('private', 'all_websites', 'specific_websites')),
    description NVARCHAR(MAX) NULL,
    tags NVARCHAR(MAX) NULL; -- JSON array of tags for organization

GO

-- Create media_folder_website_permissions table for specific website access
CREATE TABLE media_folder_website_permissions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    folder_id UNIQUEIDENTIFIER NOT NULL,
    website_id UNIQUEIDENTIFIER NOT NULL,
    permission_type NVARCHAR(20) NOT NULL DEFAULT 'read' CHECK (permission_type IN ('read', 'read_write')),
    granted_by UNIQUEIDENTIFIER NOT NULL, -- User who granted the permission
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    
    -- Foreign key constraints
    CONSTRAINT FK_folder_website_perms_folder FOREIGN KEY (folder_id) REFERENCES media_folders(id) ON DELETE CASCADE,
    CONSTRAINT FK_folder_website_perms_website FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE,
    CONSTRAINT FK_folder_website_perms_granted_by FOREIGN KEY (granted_by) REFERENCES users(id),
    
    -- Ensure unique combination of folder and website
    CONSTRAINT UQ_folder_website_permission UNIQUE (folder_id, website_id)
);

GO

-- Create indexes for performance
CREATE INDEX IX_folder_website_perms_folder_id ON media_folder_website_permissions(folder_id);
CREATE INDEX IX_folder_website_perms_website_id ON media_folder_website_permissions(website_id);
CREATE INDEX IX_media_folders_website_usage ON media_folders(allow_website_usage, website_usage_permissions);

GO

-- Update existing folders to have default settings
UPDATE media_folders 
SET 
    allow_website_usage = 0,
    website_usage_permissions = 'private',
    description = 'Media folder for ' + name
WHERE allow_website_usage IS NULL;

PRINT 'Media folder settings and permissions tables created successfully';
PRINT 'Tables created/updated: media_folders (new columns), media_folder_website_permissions';
PRINT 'All existing folders set to private by default';
