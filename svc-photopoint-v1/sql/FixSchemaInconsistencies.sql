-- Script to fix schema inconsistencies in CreateDatabase.sql

-- 1. Rename inconsistent primary key constraints
EXEC sp_rename 'PK__MediaFolder', 'PK_MediaFolder', 'OBJECT';
GO

-- 2. Rename inconsistent foreign key constraints
EXEC sp_rename 'FK_MediaFolder_Account', 'FK_MediaFolder_Account', 'OBJECT';
GO

-- 3. Rename inconsistent check constraints
EXEC sp_rename 'CK__media_fol__permi__489AC854', 'CK_MediaFolderWebsitePermission_PermissionType', 'OBJECT';
GO

-- 4. Add default value for UpdatedAt in MediaFolderWebsitePermission table
ALTER TABLE [dbo].[MediaFolderWebsitePermission]  
ADD CONSTRAINT [DF_MediaFolderWebsitePermission_UpdatedAt] DEFAULT (getutcdate()) FOR [UpdatedAt];
GO

-- 5. Make CreatedAt and UpdatedAt columns non-nullable in MediaFolder and MediaFolderWebsitePermission tables
ALTER TABLE [dbo].[MediaFolder]  
ALTER COLUMN [CreatedAt] [datetime2](7) NOT NULL;
ALTER TABLE [dbo].[MediaFolder]  
ALTER COLUMN [UpdatedAt] [datetime2](7) NOT NULL;
GO

ALTER TABLE [dbo].[MediaFolderWebsitePermission]  
ALTER COLUMN [CreatedAt] [datetime2](7) NOT NULL;
ALTER TABLE [dbo].[MediaFolderWebsitePermission]  
ALTER COLUMN [UpdatedAt] [datetime2](7) NOT NULL;
GO

-- 6. Consider using composite primary key for UserAccount table (optional, based on requirements)
ALTER TABLE [dbo].[UserAccount] DROP CONSTRAINT [PK_UserAccount];
ALTER TABLE [dbo].[UserAccount] ADD CONSTRAINT [PK_UserAccount] PRIMARY KEY ([UserId], [AccountId]);
GO
