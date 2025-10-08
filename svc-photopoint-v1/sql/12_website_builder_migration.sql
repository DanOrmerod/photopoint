-- Migration: Replace existing Website/Page/ContentBlock tables with new component-based system
-- Based on requirements in 02_Website_Requirements.md

-- Step 1: Backup existing data if needed (optional)
-- SELECT * INTO Website_Backup FROM Website;
-- SELECT * INTO Page_Backup FROM Page;
-- SELECT * INTO ContentBlock_Backup FROM ContentBlock;

-- Step 2: Drop existing tables and recreate with new schema
-- Drop foreign key constraints first
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ContentBlock_Pages')
    ALTER TABLE ContentBlock DROP CONSTRAINT FK_ContentBlock_Page;

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Page_Website')
    ALTER TABLE Page DROP CONSTRAINT FK_Page_Website;

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Website_Account')
    ALTER TABLE Website DROP CONSTRAINT FK_Website_Account;

-- Drop existing tables
DROP TABLE IF EXISTS ContentBlock;
DROP TABLE IF EXISTS Page;
DROP TABLE IF EXISTS Website;

-- Step 3: Create new Website table
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

-- Step 4: Create new WebsitePage table
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
    CONSTRAINT UQ_WebsitePage_Slug UNIQUE (WebsiteId, Slug),
    CONSTRAINT UQ_WebsitePage_HomePage UNIQUE (WebsiteId, IsHomePage) -- Only one home page per website
);

-- Step 5: Create new PageComponent table for component-based page building
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

-- Step 6: Create supporting tables

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

-- Step 7: Create indexes for performance
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

-- Step 8: Update MediaFolderWebsitePermission table to reference new Website.Id
-- This table links MediaFolders to Websites for permission control
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_MediaFolderWebsitePermission_Website')
    ALTER TABLE MediaFolderWebsitePermission DROP CONSTRAINT FK_MediaFolderWebsitePermission_Website;

-- Recreate the foreign key constraint
ALTER TABLE MediaFolderWebsitePermission 
ADD CONSTRAINT FK_MediaFolderWebsitePermission_Website 
FOREIGN KEY (WebsiteId) REFERENCES Website(Id) ON DELETE CASCADE;

-- Step 9: Update MediaUsage table to reference new tables
-- This table tracks which media files are used in which websites/pages
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_MediaUsage_Website')
    ALTER TABLE MediaUsage DROP CONSTRAINT FK_MediaUsage_Website;

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_MediaUsage_Page')
    ALTER TABLE MediaUsage DROP CONSTRAINT FK_MediaUsage_Page;

-- Add new foreign key constraints
ALTER TABLE MediaUsage 
ADD CONSTRAINT FK_MediaUsage_Website 
FOREIGN KEY (WebsiteId) REFERENCES Website(Id) ON DELETE CASCADE;

ALTER TABLE MediaUsage 
ADD CONSTRAINT FK_MediaUsage_Page 
FOREIGN KEY (PageId) REFERENCES WebsitePage(Id) ON DELETE CASCADE;

PRINT 'Website Builder Migration Completed Successfully';
PRINT 'New tables created: Website, WebsitePage, PageComponent, Template, WebsitePublishHistory, PageHistory';
PRINT 'Foreign key constraints updated for MediaFolderWebsitePermission and MediaUsage';