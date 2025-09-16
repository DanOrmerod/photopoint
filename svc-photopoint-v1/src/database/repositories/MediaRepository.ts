import { Request } from 'mssql';
import { getDbConnection } from '../connection';
import { BlobPathUtils } from '../../utils/blobPathUtils';
import { logger } from '../../utils/logger';

export interface MediaFolder {
  id: string;
  name: string;
  parentId?: string;
  accountId: string;
  allowWebsiteUsage: boolean;
  websiteUsagePermissions: 'private' | 'all_websites' | 'specific_websites';
  description?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  fileCount: number;
}

export interface MediaFolderWebsitePermission {
  id: string;
  folderId: string;
  websiteId: string;
  permissionType: 'read' | 'read_write';
  grantedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaFile {
  id: string;
  folderId?: string;
  accountId: string;
  originalName: string;
  fileName: string;
  blobUrl: string;
  fileSize: number;
  mimeType: string;
  fileType: 'image' | 'video';
  hasThumbnail?: boolean;
  tags?: string[];
  altText?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class MediaRepository {
  // Folder operations
  async createFolder(
    name: string, 
    accountId: string, 
    parentId?: string,
    settings?: {
      allowWebsiteUsage?: boolean;
      websiteUsagePermissions?: 'private' | 'all_websites' | 'specific_websites';
      description?: string;
      tags?: string[];
    }
  ): Promise<MediaFolder> {
    const pool = await getDbConnection();
    const request = new Request(pool);
    
    const result = await request
      .input('name', name)
      .input('accountId', accountId)
      .input('parentId', parentId || null)
      .input('allowWebsiteUsage', settings?.allowWebsiteUsage || false)
      .input('websiteUsagePermissions', settings?.websiteUsagePermissions || 'private')
      .input('description', settings?.description || null)
      .input('tags', settings?.tags ? JSON.stringify(settings.tags) : null)
      .query(`
        INSERT INTO MediaFolder (Name, AccountId, ParentId, AllowWebsiteUsage, WebsiteUsagePermissions, Description, Tags, CreatedAt, UpdatedAt)
        OUTPUT inserted.Id, inserted.Name, inserted.ParentId, inserted.AccountId, 
               inserted.AllowWebsiteUsage, inserted.WebsiteUsagePermissions, 
               inserted.Description, inserted.Tags, inserted.CreatedAt, inserted.UpdatedAt
        VALUES (@name, @accountId, @parentId, @allowWebsiteUsage, @websiteUsagePermissions, @description, @tags, GETUTCDATE(), GETUTCDATE())
      `);

    const folder = result.recordset[0];
    return {
      id: folder.id,
      name: folder.name,
      parentId: folder.ParentId,
      accountId: folder.AccountId,
      allowWebsiteUsage: folder.AllowWebsiteUsage,
      websiteUsagePermissions: folder.WebsiteUsagePermissions,
      description: folder.Description,
      tags: folder.Tags ? JSON.parse(folder.Tags) : undefined,
      createdAt: folder.CreatedAt,
      updatedAt: folder.UpdatedAt,
      fileCount: 0
    };
  }

  async getFolders(accountId: string, parentId?: string, websiteId?: string): Promise<MediaFolder[]> {
    const pool = await getDbConnection();
    const request = new Request(pool);

    const result = await request
      .input('accountId', accountId)
      .input('parentId', parentId || null)
      .input('websiteId', websiteId || null)
      .query(`
        SELECT 
          f.Id,
          f.Name,
          f.ParentId,
          f.AccountId,
          f.AllowWebsiteUsage,
          f.WebsiteUsagePermissions,
          f.Description,
          f.Tags,
          f.CreatedAt,
          f.UpdatedAt,
          COUNT(mf.Id) as file_count
        FROM MediaFolder f
        LEFT JOIN MediaFile mf ON f.Id = mf.FolderId AND mf.IsDeleted = 0
        LEFT JOIN MediaFolderWebsitePermission p ON f.Id = p.FolderId
        WHERE f.AccountId = @accountId 
          AND f.IsDeleted = 0
          AND ((@parentId IS NULL AND f.ParentId IS NULL) OR f.ParentId = @parentId)
          AND (
            f.WebsiteUsagePermissions = 'all_websites' OR
            (f.WebsiteUsagePermissions = 'specific_websites' AND p.WebsiteId = @websiteId) OR
            (f.WebsiteUsagePermissions = 'private' AND @websiteId IS NULL)
          )
        GROUP BY f.Id, f.Name, f.ParentId, f.AccountId, f.AllowWebsiteUsage, f.WebsiteUsagePermissions, f.Description, f.Tags, f.CreatedAt, f.UpdatedAt
        ORDER BY f.Name
      `);

    return result.recordset.map(row => ({
      id: row.Id,
      name: row.Name,
      parentId: row.ParentId,
      accountId: row.AccountId,
      allowWebsiteUsage: row.AllowWebsiteUsage,
      websiteUsagePermissions: row.WebsiteUsagePermissions,
      description: row.Description,
      tags: row.Tags ? JSON.parse(row.Tags) : undefined,
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt,
      fileCount: row.file_count
    }));
  }

  async deleteFolder(folderId: string, accountId: string): Promise<void> {
    const pool = await getDbConnection();
    const request = new Request(pool);
    
    await request
      .input('folderId', folderId)
      .input('accountId', accountId)
      .query(`
        BEGIN TRANSACTION;
        
        UPDATE MediaFile 
        SET FolderId = NULL, UpdatedAt = GETUTCDATE()
        WHERE FolderId = @folderId AND AccountId = @accountId;
        
        UPDATE MediaFolder 
        SET IsDeleted = 1, UpdatedAt = GETUTCDATE()
        WHERE Id = @folderId AND AccountId = @accountId;
        
        COMMIT TRANSACTION;
      `);
  }

  async updateFolderSettings(
    folderId: string,
    accountId: string,
    settings: {
      allowWebsiteUsage?: boolean;
      websiteUsagePermissions?: 'private' | 'all_websites' | 'specific_websites';
      description?: string;
      tags?: string[];
    }
  ): Promise<MediaFolder> {
    const pool = await getDbConnection();
    const request = new Request(pool);
    
    const result = await request
      .input('folderId', folderId)
      .input('accountId', accountId)
      .input('allowWebsiteUsage', settings.allowWebsiteUsage)
      .input('websiteUsagePermissions', settings.websiteUsagePermissions)
      .input('description', settings.description || null)
      .input('tags', settings.tags ? JSON.stringify(settings.tags) : null)
      .query(`
        UPDATE MediaFolder 
        SET 
          AllowWebsiteUsage = COALESCE(@allowWebsiteUsage, AllowWebsiteUsage),
          WebsiteUsagePermissions = COALESCE(@websiteUsagePermissions, WebsiteUsagePermissions),
          Description = COALESCE(@description, Description),
          Tags = COALESCE(@tags, Tags),
          UpdatedAt = GETUTCDATE()
        WHERE Id = @folderId AND AccountId = @accountId;
        
        SELECT Id, Name, ParentId, AccountId, AllowWebsiteUsage, WebsiteUsagePermissions,
               Description, Tags, CreatedAt, UpdatedAt
        FROM MediaFolder 
        WHERE Id = @folderId AND AccountId = @accountId;
      `);

    if (result.recordset.length === 0) {
      throw new Error('Folder not found or access denied');
    }

    const folder = result.recordset[0];
    return {
      id: folder.Id,
      name: folder.Name,
      parentId: folder.ParentId,
      accountId: folder.AccountId,
      allowWebsiteUsage: folder.AllowWebsiteUsage,
      websiteUsagePermissions: folder.WebsiteUsagePermissions,
      description: folder.Description,
      tags: folder.Tags ? JSON.parse(folder.Tags) : undefined,
      createdAt: folder.CreatedAt,
      updatedAt: folder.UpdatedAt,
      fileCount: 0 // Will be populated separately if needed
    };
  }

  async grantFolderWebsitePermission(
    folderId: string,
    websiteId: string,
    permissionType: 'read' | 'read_write',
    grantedBy: string
  ): Promise<MediaFolderWebsitePermission> {
    const pool = await getDbConnection();
    const request = new Request(pool);
    
    const result = await request
      .input('folderId', folderId)
      .input('websiteId', websiteId)
      .input('permissionType', permissionType)
      .input('grantedBy', grantedBy)
      .query(`
        MERGE MediaFolderWebsitePermission AS target
        USING (SELECT @folderId as FolderId, @websiteId as WebsiteId) AS source
        ON target.FolderId = source.FolderId AND target.WebsiteId = source.WebsiteId
        WHEN MATCHED THEN
          UPDATE SET PermissionType = @permissionType, GrantedBy = @grantedBy, UpdatedAt = GETUTCDATE()
        WHEN NOT MATCHED THEN
          INSERT (FolderId, WebsiteId, PermissionType, GrantedBy, CreatedAt, UpdatedAt)
          VALUES (@folderId, @websiteId, @permissionType, @grantedBy, GETUTCDATE(), GETUTCDATE())
        OUTPUT inserted.Id, inserted.FolderId, inserted.WebsiteId, 
               inserted.PermissionType, inserted.GrantedBy, inserted.CreatedAt, inserted.UpdatedAt;
      `);

    const permission = result.recordset[0];
    return {
      id: permission.Id,
      folderId: permission.FolderId,
      websiteId: permission.WebsiteId,
      permissionType: permission.PermissionType,
      grantedBy: permission.GrantedBy,
      createdAt: permission.CreatedAt,
      updatedAt: permission.UpdatedAt
    };
  }

  async revokeFolderWebsitePermission(folderId: string, websiteId: string): Promise<void> {
    const pool = await getDbConnection();
    const request = new Request(pool);
    
    await request
      .input('folderId', folderId)
      .input('websiteId', websiteId)
      .query(`
        DELETE FROM MediaFolderWebsitePermission
        WHERE FolderId = @folderId AND WebsiteId = @websiteId
      `);
  }

  async getFolderWebsitePermissions(folderId: string): Promise<MediaFolderWebsitePermission[]> {
    const pool = await getDbConnection();
    const request = new Request(pool);
    
    const result = await request
      .input('folderId', folderId)
      .query(`
        SELECT p.Id, p.FolderId, p.WebsiteId, p.PermissionType, p.GrantedBy, p.CreatedAt,
               w.Name as website_name, w.Domain as website_domain
        FROM MediaFolderWebsitePermission p
        INNER JOIN Website w ON p.WebsiteId = w.Id
        WHERE p.FolderId = @folderId
        ORDER BY w.Name
      `);

    return result.recordset.map(row => ({
      id: row.Id,
      folderId: row.FolderId,
      websiteId: row.WebsiteId,
      permissionType: row.PermissionType,
      grantedBy: row.GrantedBy,
      createdAt: row.CreatedAt,
      websiteName: row.website_name,
      websiteDomain: row.website_domain,
      updatedAt: row.UpdatedAt,
    }));
  }

  async getFile(accountId: string, fileId: string): Promise<MediaFile | null> {
    const pool = await getDbConnection();
    const request = new Request(pool);
    
    const result = await request
      .input('fileId', fileId)
      .input('accountId', accountId)
      .query(`
        SELECT 
          Id, FolderId, AccountId, OriginalName, FileName, BlobUrl,
          FileSize, MimeType, FileType, HasThumbnail,
          Tags, AltText, IsPublic, CreatedAt, UpdatedAt
        FROM MediaFile
        WHERE Id = @fileId AND AccountId = @accountId AND IsDeleted = 0
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    const row = result.recordset[0];
    return {
      id: row.id,
      folderId: row.FolderId,
      accountId: row.AccountId,
      originalName: row.OriginalName,
      fileName: row.FileName,
      blobUrl: row.BlobUrl,
      fileSize: row.FileSize,
      mimeType: row.MimeType,
      fileType: row.FileType,
      hasThumbnail: row.HasThumbnail,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
      altText: row.AltText,
      isPublic: row.IsPublic,
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt
    };
  } 

  async getFiles(accountId: string, folderId?: string): Promise<MediaFile[]> {
    const pool = await getDbConnection();
    const request = new Request(pool);
    
    const result = await request
      .input('accountId', accountId)
      .input('folderId', folderId || null)
      .query(`
        SELECT 
          id, FolderId, AccountId, OriginalName, FileName, BlobUrl,
          FileSize, MimeType, FileType, HasThumbnail,
          tags, AltText, IsPublic, CreatedAt, UpdatedAt
        FROM MediaFile
        WHERE AccountId = @accountId 
          AND IsDeleted = 0
          AND ((@folderId IS NULL AND FolderId IS NULL) OR FolderId = @folderId)
        ORDER BY CreatedAt DESC
      `);

    return result.recordset.map(row => ({
      id: row.id,
      folderId: row.FolderId,
      accountId: row.AccountId,
      originalName: row.OriginalName,
      fileName: row.FileName,
      blobUrl: row.BlobUrl,
      fileSize: row.FileSize,
      mimeType: row.MimeType,
      fileType: row.FileType,
      hasThumbnail: row.HasThumbnail,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
      altText: row.AltText,
      isPublic: row.IsPublic,
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt
    }));
  }

  async createFile(fileData: Omit<MediaFile, 'id' | 'createdAt' | 'updatedAt'>): Promise<MediaFile> {
    const pool = await getDbConnection();
    const request = new Request(pool);
    
    const result = await request
      .input('folderId', fileData.folderId || null)
      .input('accountId', fileData.accountId)
      .input('originalName', fileData.originalName)
      .input('fileName', fileData.fileName)
      .input('blobUrl', fileData.blobUrl)
      .input('fileSize', fileData.fileSize)
      .input('mimeType', fileData.mimeType)
      .input('fileType', fileData.fileType)
      .input('hasThumbnail', fileData.hasThumbnail || false)
      .input('tags', fileData.tags ? JSON.stringify(fileData.tags) : null)
      .input('altText', fileData.altText || null)
      .input('isPublic', fileData.isPublic)
      .query(`
        INSERT INTO MediaFile (
          FolderId, AccountId, OriginalName, FileName, BlobUrl,
          FileSize, MimeType, FileType, HasThumbnail,
          tags, AltText, IsPublic
        )
        OUTPUT inserted.id, inserted.FolderId, inserted.AccountId, inserted.OriginalName,
               inserted.FileName, inserted.BlobUrl, inserted.FileSize,
               inserted.MimeType, inserted.FileType, inserted.HasThumbnail, 
               inserted.tags, inserted.AltText, inserted.IsPublic, 
               inserted.CreatedAt, inserted.UpdatedAt
        VALUES (
          @folderId, @accountId, @originalName, @fileName, @blobUrl,
          @fileSize, @mimeType, @fileType, @hasThumbnail,
          @tags, @altText, @isPublic
        )
      `);

    const file = result.recordset[0];
    return {
      id: file.id,
      folderId: file.FolderId,
      accountId: file.AccountId,
      originalName: file.OriginalName,
      fileName: file.FileName,
      blobUrl: file.BlobUrl,
      fileSize: file.FileSize,
      mimeType: file.MimeType,
      fileType: file.FileType,
      hasThumbnail: file.HasThumbnail,
      tags: file.tags ? JSON.parse(file.tags) : undefined,
      altText: file.AltText,
      isPublic: file.IsPublic,
      createdAt: file.CreatedAt,
      updatedAt: file.UpdatedAt
    };
  }

  async deleteFile(accountId: string, fileId: string): Promise<void> {
    const pool = await getDbConnection();
    const request = new Request(pool);
    
    await request
      .input('fileId', fileId)
      .input('accountId', accountId)
      .query(`
        UPDATE MediaFile 
        SET IsDeleted = 1, UpdatedAt = GETUTCDATE()
        WHERE id = @fileId AND AccountId = @accountId
      `);
  }

  async getFileById(fileId: string, accountId: string): Promise<MediaFile | null> {
    const pool = await getDbConnection();
    const request = new Request(pool);
    
    const result = await request
      .input('fileId', fileId)
      .input('accountId', accountId)
      .query(`
        SELECT 
          id, FolderId, AccountId, OriginalName, FileName, BlobUrl,
          FileSize, MimeType, FileType, HasThumbnail,
          tags, AltText, IsPublic, CreatedAt, UpdatedAt
        FROM MediaFile
        WHERE id = @fileId AND AccountId = @accountId AND IsDeleted = 0
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    const row = result.recordset[0];
    return {
      id: row.id,
      folderId: row.FolderId,
      accountId: row.AccountId,
      originalName: row.OriginalName,
      fileName: row.FileName,
      blobUrl: row.BlobUrl,
      fileSize: row.FileSize,
      mimeType: row.MimeType,
      fileType: row.FileType,
      hasThumbnail: row.HasThumbnail,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
      altText: row.AltText,
      isPublic: row.IsPublic,
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt
    };
  }

  async getFolderById(folderId: string, accountId: string): Promise<MediaFolder | null> {
    const pool = await getDbConnection();
    const request = new Request(pool);
    
    const result = await request
      .input('folderId', folderId)
      .input('accountId', accountId)
      .query(`
        SELECT 
          f.id,
          f.name,
          f.ParentId,
          f.AccountId,
          f.AllowWebsiteUsage,
          f.WebsiteUsagePermissions,
          f.Description,
          f.Tags,
          f.CreatedAt,
          f.UpdatedAt,
          COUNT(mf.id) as file_count
        FROM MediaFolder f
        LEFT JOIN MediaFile mf ON f.id = mf.FolderId AND mf.IsDeleted = 0
        WHERE f.id = @folderId 
          AND f.AccountId = @accountId 
          AND f.IsDeleted = 0
        GROUP BY f.id, f.name, f.ParentId, f.AccountId, f.AllowWebsiteUsage, f.WebsiteUsagePermissions, f.Description, f.Tags, f.CreatedAt, f.UpdatedAt
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    const row = result.recordset[0];
    return {
      id: row.id,
      name: row.name,
      parentId: row.ParentId,
      accountId: row.AccountId,
      allowWebsiteUsage: row.AllowWebsiteUsage,
      websiteUsagePermissions: row.WebsiteUsagePermissions,
      description: row.Description,
      tags: row.Tags ? JSON.parse(row.Tags) : undefined,
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt,
      fileCount: row.file_count
    };
  }

  async updateFile(fileId: string, accountId: string, updates: Partial<Pick<MediaFile, 'folderId' | 'hasThumbnail'>>): Promise<MediaFile | null> {
    const pool = await getDbConnection();
    const request = new Request(pool);
    
    const setParts: string[] = [];
    const params: Record<string, any> = {}; // Don't include fileId in params

    if (updates.folderId !== undefined) {
      setParts.push('FolderId = @folderId');
      params.folderId = updates.folderId;
    }

    if (updates.hasThumbnail !== undefined) {
      setParts.push('HasThumbnail = @hasThumbnail');
      params.hasThumbnail = updates.hasThumbnail;
    }

    if (setParts.length === 0) {
      // No updates to make
      return await this.getFileById(fileId, accountId);
    }

    setParts.push('UpdatedAt = GETUTCDATE()');

    // Add fileId first, then other params
    request.input('fileId', fileId);
    request.input('accountId', accountId);
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }

    await request.query(`
      UPDATE MediaFile 
      SET ${setParts.join(', ')}
      WHERE id = @fileId AND AccountId = @accountId AND IsDeleted = 0
    `);

    // Return the updated file - create a new request to avoid parameter duplication
    const selectRequest = new Request(pool);
    const result = await selectRequest
      .input('fileId', fileId)
      .input('accountId', accountId)
      .query(`
        SELECT * FROM MediaFile 
        WHERE id = @fileId AND AccountId = @accountId AND IsDeleted = 0
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    const row = result.recordset[0];
    return {
      id: row.id,
      folderId: row.FolderId,
      accountId: row.AccountId,
      originalName: row.OriginalName,
      fileName: row.FileName,
      blobUrl: row.BlobUrl,
      fileSize: row.FileSize,
      mimeType: row.MimeType,
      fileType: row.FileType,
      hasThumbnail: row.HasThumbnail,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
      altText: row.AltText,
      isPublic: row.IsPublic,
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt
    };
  }

  /**
   * Compute blob URLs dynamically for a media file
   */
  async computeBlobUrls(file: MediaFile): Promise<{ blobUrl: string; thumbnailUrl?: string }> {
    try {
      // Get folder name if file is in a folder
      let folderName: string | undefined;
      if (file.folderId) {
        const folder = await this.getFolderById(file.folderId, file.accountId);
        if (folder) {
          folderName = folder.name;
        }
      }

      // Generate blob paths using centralized utility
      const filePath = BlobPathUtils.generateFilePath(file.accountId, file.id, file.originalName, folderName);
      
      // Construct blob URL (you'll need to configure this based on your blob service)
      const blobServiceUrl = process.env.AZURE_STORAGE_BLOB_URL || 'https://your-storage-account.blob.core.windows.net';
      const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'photopoint-media';
      const blobUrl = BlobPathUtils.generateBlobUrl(containerName, filePath, blobServiceUrl);

      let thumbnailUrl: string | undefined;
      if (file.hasThumbnail) {
        const thumbnailPath = BlobPathUtils.generateThumbnailPath(file.accountId, file.id, folderName);
        thumbnailUrl = BlobPathUtils.generateBlobUrl(containerName, thumbnailPath, blobServiceUrl);
      }

      return { blobUrl, thumbnailUrl };
    } catch (error) {
      logger.error('Failed to compute blob URLs:', error);
      // Return fallback URLs
      return { 
        blobUrl: file.blobUrl || '', 
        thumbnailUrl: undefined
      };
    }
  }

  /**
   * Check if a file with the same originalName already exists in the target folder
   */
  async checkFileExistsByOriginalName(accountId: string, folderId: string | null, originalName: string): Promise<boolean> {
    const pool = await getDbConnection();
    const request = new Request(pool);
    
    let query: string;
    if (folderId === null) {
      // Check root folder (folderId IS NULL)
      query = `
        SELECT COUNT(*) as FileCount
        FROM MediaFile 
        WHERE AccountId = @accountId 
          AND FolderId IS NULL 
          AND OriginalName = @originalName 
          AND IsDeleted = 0
      `;
      request.input('accountId', accountId);
    } else {
      // Check specific folder
      query = `
        SELECT COUNT(*) as FileCount
        FROM MediaFile 
        WHERE AccountId = @accountId 
          AND FolderId = @folderId 
          AND OriginalName = @originalName 
          AND IsDeleted = 0
      `;
      request.input('accountId', accountId);
      request.input('folderId', folderId);
    }
    
    request.input('originalName', originalName);
    const result = await request.query(query);
    
    return result.recordset[0].FileCount > 0;
  }

  /**
   * Get a file with computed blob URLs
   */
  async getFileWithComputedUrls(fileId: string, accountId: string): Promise<MediaFile | null> {
    const file = await this.getFileById(fileId, accountId);
    if (!file) return null;

    const { blobUrl, thumbnailUrl } = await this.computeBlobUrls(file);
    
    return {
      ...file,
      blobUrl
    };
  }
}
