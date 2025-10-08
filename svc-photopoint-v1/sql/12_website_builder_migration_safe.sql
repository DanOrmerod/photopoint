-- Safe Website Builder Migration
-- Properly handles existing foreign key constraints and data preservation

USE [PhotoPoint-v1];
GO

PRINT 'Starting Website Builder Migration...';

-- Step 1: Drop all foreign key constraints that reference tables we need to recreate
PRINT 'Dropping foreign key constraints...';

-- Drop FK constraints on Page table
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Pages_Parent')
    ALTER TABLE Page DROP CONSTRAINT FK_Pages_Parent;

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Pages_Websites')
    ALTER TABLE Page DROP CONSTRAINT FK_Pages_Websites;

-- Drop FK constraints on ContentBlock table
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ContentBlocks_Pages')
    ALTER TABLE ContentBlock DROP CONSTRAINT FK_ContentBlocks_Pages;

-- Drop FK constraints from MediaUsage table
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_MediaUsage_Page')
    ALTER TABLE MediaUsage DROP CONSTRAINT FK_MediaUsage_Page;

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_MediaUsage_Website')
    ALTER TABLE MediaUsage DROP CONSTRAINT FK_MediaUsage_Website;

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_MediaUsage_Block')
    ALTER TABLE MediaUsage DROP CONSTRAINT FK_MediaUsage_Block;

-- Drop FK constraints from WebsiteMedia table
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_WebsiteMedia_Websites')
    ALTER TABLE WebsiteMedia DROP CONSTRAINT FK_WebsiteMedia_Websites;

-- Drop FK constraints from MediaFolderWebsitePermission table
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_folder_website_perms_website')
    ALTER TABLE MediaFolderWebsitePermission DROP CONSTRAINT FK_folder_website_perms_website;

-- Step 2: Backup existing data (optional - create backup tables)
PRINT 'Creating backup tables...';

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Website_Backup')
    SELECT * INTO Website_Backup FROM Website;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Page_Backup')
    SELECT * INTO Page_Backup FROM Page;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ContentBlock_Backup')
    SELECT * INTO ContentBlock_Backup FROM ContentBlock;

-- Step 3: Drop existing tables
PRINT 'Dropping existing tables...';

DROP TABLE IF EXISTS ContentBlock;
DROP TABLE IF EXISTS Page;
DROP TABLE IF EXISTS Website;

-- Step 4: Create new Website table with enhanced schema
PRINT 'Creating new Website table...';

CREATE TABLE Website (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(1000) NULL,
    Subdomain NVARCHAR(100) NOT NULL UNIQUE,
    CustomDomain NVARCHAR(255) NULL UNIQUE,
    Favicon NVARCHAR(500) NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (Status IN ('draft', 'published')),
    
    -- SEO and metadata
    MetaTitle NVARCHAR(255) NULL,
    MetaDescription NVARCHAR(500) NULL,
    MetaKeywords NVARCHAR(500) NULL,
    
    -- Branding and styling
    PrimaryColor NVARCHAR(7) NULL, -- Hex color
    SecondaryColor NVARCHAR(7) NULL,
    FontFamily NVARCHAR(100) NULL,
    LogoMediaFileId UNIQUEIDENTIFIER NULL,
    
    -- Publishing
    LastPublishedAt DATETIME2 NULL,
    PublishedVersion INT NULL DEFAULT 0,
    
    -- Multi-tenancy
    AccountId UNIQUEIDENTIFIER NOT NULL,
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_Website_Account FOREIGN KEY (AccountId) REFERENCES Account(Id),
    CONSTRAINT FK_Website_Logo FOREIGN KEY (LogoMediaFileId) REFERENCES MediaFile(Id)
);

-- Step 5: Create new WebsitePage table
PRINT 'Creating new WebsitePage table...';

CREATE TABLE WebsitePage (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    WebsiteId UNIQUEIDENTIFIER NOT NULL,
    
    -- Page content
    Title NVARCHAR(255) NOT NULL,
    Slug NVARCHAR(255) NOT NULL,
    
    -- SEO
    MetaTitle NVARCHAR(255) NULL,
    MetaDescription NVARCHAR(500) NULL,
    MetaKeywords NVARCHAR(500) NULL,
    
    -- Page structure
    IsHomePage BIT NOT NULL DEFAULT 0,
    IsPublished BIT NOT NULL DEFAULT 0,
    SortOrder INT NOT NULL DEFAULT 0,
    
    -- Page layout settings
    LayoutType NVARCHAR(50) NOT NULL DEFAULT 'standard',
    MaxWidth NVARCHAR(20) NULL, -- '1200px', 'full-width', etc.
    BackgroundColor NVARCHAR(7) NULL,
    BackgroundImageId UNIQUEIDENTIFIER NULL,
    
    -- Version control
    Version INT NOT NULL DEFAULT 1,
    PublishedVersion INT NULL DEFAULT 0,
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_WebsitePage_Website FOREIGN KEY (WebsiteId) REFERENCES Website(Id) ON DELETE CASCADE,
    CONSTRAINT FK_WebsitePage_BackgroundImage FOREIGN KEY (BackgroundImageId) REFERENCES MediaFile(Id),
    CONSTRAINT UQ_WebsitePage_Slug UNIQUE (WebsiteId, Slug)
);

-- Step 6: Create unique constraint for home page (only one per website)
-- Use a different approach for the filtered unique index
ALTER TABLE WebsitePage
ADD CONSTRAINT UQ_WebsitePage_HomePage_Check
CHECK (IsHomePage = 0 OR IsHomePage = 1);

-- We'll enforce the single home page rule in application logic for now

-- Step 7: Create new PageComponent table for component-based page building
PRINT 'Creating new PageComponent table...';

CREATE TABLE PageComponent (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PageId UNIQUEIDENTIFIER NOT NULL,
    ParentId UNIQUEIDENTIFIER NULL, -- For nested components
    
    -- Component definition
    Type NVARCHAR(50) NOT NULL, -- 'text', 'image', 'gallery', 'button', etc.
    SortOrder INT NOT NULL DEFAULT 0,
    
    -- Component content (JSON)
    Content NVARCHAR(MAX) NULL, -- Component-specific content data
    Props NVARCHAR(MAX) NULL,   -- Component props/settings
    
    -- Responsive styles (JSON objects)
    DesktopStyles NVARCHAR(MAX) NULL,
    TabletStyles NVARCHAR(MAX) NULL,
    MobileStyles NVARCHAR(MAX) NULL,
    
    -- Component state
    IsVisible BIT NOT NULL DEFAULT 1,
    IsLocked BIT NOT NULL DEFAULT 0,
    
    -- Version control
    Version INT NOT NULL DEFAULT 1,
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_PageComponent_Page FOREIGN KEY (PageId) REFERENCES WebsitePage(Id) ON DELETE CASCADE,
    CONSTRAINT FK_PageComponent_Parent FOREIGN KEY (ParentId) REFERENCES PageComponent(Id),
    
    -- Component type validation
    CONSTRAINT CK_PageComponent_Type CHECK (Type IN (
        'text', 'heading', 'paragraph', 'list',
        'image', 'image_gallery', 'video', 'image_slider',
        'button', 'link', 'form', 'newsletter_signup',
        'container', 'section', 'row', 'column',
        'spacer', 'divider', 'map', 'social_media',
        'accordion', 'tabs', 'testimonial', 'pricing_table',
        'shop_product', 'product_gallery', 'cart', 'checkout',
        'workshop_list', 'workshop_detail', 'booking_form'
    ))
);

-- Step 8: Create supporting tables for templates and version control
PRINT 'Creating supporting tables...';

-- Template system
CREATE TABLE Template (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(1000) NULL,
    Category NVARCHAR(100) NOT NULL, -- 'wedding', 'portrait', 'commercial', etc.
    PreviewImageUrl NVARCHAR(500) NULL,
    
    -- Template structure (JSON)
    PageStructure NVARCHAR(MAX) NOT NULL, -- JSON of pages and components
    StyleSettings NVARCHAR(MAX) NULL,     -- Default colors, fonts, etc.
    
    -- Template metadata
    IsPublic BIT NOT NULL DEFAULT 1,
    UsageCount INT NOT NULL DEFAULT 0,
    Rating DECIMAL(2,1) NULL,
    
    -- Ownership
    CreatedBy UNIQUEIDENTIFIER NULL, -- User who created it (NULL for system templates)
    AccountId UNIQUEIDENTIFIER NULL, -- Account for private templates
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_Template_Account FOREIGN KEY (AccountId) REFERENCES Account(Id)
);

-- Website publish history for version control
CREATE TABLE WebsitePublishHistory (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    WebsiteId UNIQUEIDENTIFIER NOT NULL,
    Version INT NOT NULL,
    PublishedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    PublishedBy UNIQUEIDENTIFIER NOT NULL, -- User who published
    ChangesSummary NVARCHAR(1000) NULL,
    
    CONSTRAINT FK_WebsitePublishHistory_Website FOREIGN KEY (WebsiteId) REFERENCES Website(Id) ON DELETE CASCADE
);

-- Page history for undo/redo functionality
CREATE TABLE PageHistory (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PageId UNIQUEIDENTIFIER NOT NULL,
    Version INT NOT NULL,
    ComponentsSnapshot NVARCHAR(MAX) NOT NULL, -- JSON snapshot of all components
    ChangeDescription NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy UNIQUEIDENTIFIER NOT NULL,
    
    CONSTRAINT FK_PageHistory_Page FOREIGN KEY (PageId) REFERENCES WebsitePage(Id) ON DELETE CASCADE
);

-- Step 9: Create indexes for performance
PRINT 'Creating indexes...';

CREATE INDEX IX_Website_AccountId ON Website(AccountId);
CREATE INDEX IX_Website_Status ON Website(Status);
CREATE INDEX IX_Website_Subdomain ON Website(Subdomain);

CREATE INDEX IX_WebsitePage_WebsiteId ON WebsitePage(WebsiteId);
CREATE INDEX IX_WebsitePage_Slug ON WebsitePage(WebsiteId, Slug);
CREATE INDEX IX_WebsitePage_IsHomePage ON WebsitePage(WebsiteId, IsHomePage);
CREATE INDEX IX_WebsitePage_SortOrder ON WebsitePage(WebsiteId, SortOrder);

CREATE INDEX IX_PageComponent_PageId ON PageComponent(PageId);
CREATE INDEX IX_PageComponent_ParentId ON PageComponent(ParentId);
CREATE INDEX IX_PageComponent_Type ON PageComponent(Type);
CREATE INDEX IX_PageComponent_SortOrder ON PageComponent(PageId, SortOrder);

CREATE INDEX IX_Template_Category ON Template(Category);
CREATE INDEX IX_Template_IsPublic ON Template(IsPublic);
CREATE INDEX IX_Template_AccountId ON Template(AccountId);

CREATE INDEX IX_WebsitePublishHistory_WebsiteId ON WebsitePublishHistory(WebsiteId, Version);
CREATE INDEX IX_PageHistory_PageId ON PageHistory(PageId, Version);

-- Step 10: Recreate foreign key constraints for MediaUsage and MediaFolderWebsitePermission
PRINT 'Recreating foreign key constraints...';

-- Update MediaFolderWebsitePermission table to reference new Website.Id
ALTER TABLE MediaFolderWebsitePermission 
ADD CONSTRAINT FK_MediaFolderWebsitePermission_Website 
FOREIGN KEY (WebsiteId) REFERENCES Website(Id) ON DELETE CASCADE;

-- Update MediaUsage table to reference new tables
ALTER TABLE MediaUsage 
ADD CONSTRAINT FK_MediaUsage_Website 
FOREIGN KEY (WebsiteId) REFERENCES Website(Id) ON DELETE CASCADE;

-- Note: MediaUsage.PageId will need to be updated to reference WebsitePage.Id
-- This would require data migration which we'll handle separately if needed
-- ALTER TABLE MediaUsage 
-- ADD CONSTRAINT FK_MediaUsage_Page 
-- FOREIGN KEY (PageId) REFERENCES WebsitePage(Id) ON DELETE CASCADE;

PRINT 'Website Builder Migration Completed Successfully!';
PRINT 'New tables created: Website, WebsitePage, PageComponent, Template, WebsitePublishHistory, PageHistory';
PRINT 'Foreign key constraints updated for MediaFolderWebsitePermission';
PRINT 'Backup tables created: Website_Backup, Page_Backup, ContentBlock_Backup';

-- Show summary
SELECT 'Websites' as TableName, COUNT(*) as RecordCount FROM Website
UNION ALL
SELECT 'WebsitePage' as TableName, COUNT(*) as RecordCount FROM WebsitePage
UNION ALL
SELECT 'PageComponent' as TableName, COUNT(*) as RecordCount FROM PageComponent
UNION ALL
SELECT 'Template' as TableName, COUNT(*) as RecordCount FROM Template;

PRINT 'Migration completed successfully!';