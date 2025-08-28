import { Request } from 'mssql';
import { getDbConnection } from '../connection';

export interface MediaFolder {
  id: string;
  name: string;
  parentId?: string;
  userId: string;
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
}

export interface MediaFile {
  id: string;
  folderId?: string;
  userId: string;
  originalName: string;
  fileName: string;
  blobPath: string;
  blobUrl: string;
  fileSize: number;
  mimeType: string;
  fileType: 'image' | 'video';
  width?: number;
  height?: number;
  durationSeconds?: number;
  thumbnailUrl?: string;
  thumbnailBlobPath?: string;
  hasThumbnail?: boolean;
  tags?: string[];
  altText?: string;
  description?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class MediaRepository {
  // Folder operations
  async createFolder(
    name: string, 
    userId: string, 
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
      .input('userId', userId)
      .input('parentId', parentId || null)
      .input('allowWebsiteUsage', settings?.allowWebsiteUsage || false)
      .input('websiteUsagePermissions', settings?.websiteUsagePermissions || 'private')
      .input('description', settings?.description || null)
      .input('tags', settings?.tags ? JSON.stringify(settings.tags) : null)
      .query(`
        INSERT INTO media_folders (name, user_id, parent_id, allow_website_usage, website_usage_permissions, description, tags)
        OUTPUT inserted.id, inserted.name, inserted.parent_id, inserted.user_id, 
               inserted.allow_website_usage, inserted.website_usage_permissions, 
               inserted.description, inserted.tags, inserted.created_at, inserted.updated_at
        VALUES (@name, @userId, @parentId, @allowWebsiteUsage, @websiteUsagePermissions, @description, @tags)
      `);

    const folder = result.recordset[0];
    return {
      id: folder.id,
      name: folder.name,
      parentId: folder.parent_id,
      userId: folder.user_id,
      allowWebsiteUsage: folder.allow_website_usage,
      websiteUsagePermissions: folder.website_usage_permissions,
      description: folder.description,
      tags: folder.tags ? JSON.parse(folder.tags) : undefined,
      createdAt: folder.created_at,
      updatedAt: folder.updated_at,
      fileCount: 0
    };
  }

  async getFolders(userId: string, parentId?: string): Promise<MediaFolder[]> {
    const pool = await getDbConnection();
    const request = new Request(pool);
    
    const result = await request
      .input('userId', userId)
      .input('parentId', parentId || null)
      .query(`
        SELECT 
          f.id,
          f.name,
          f.parent_id,
          f.user_id,
          f.allow_website_usage,
          f.website_usage_permissions,
          f.description,
          f.tags,
          f.created_at,
          f.updated_at,
          COUNT(mf.id) as file_count
        FROM media_folders f
        LEFT JOIN media_files mf ON f.id = mf.folder_id AND mf.is_deleted = 0
        WHERE f.user_id = @userId 
          AND f.is_deleted = 0
          AND ((@parentId IS NULL AND f.parent_id IS NULL) OR f.parent_id = @parentId)
        GROUP BY f.id, f.name, f.parent_id, f.user_id, f.allow_website_usage, f.website_usage_permissions, f.description, f.tags, f.created_at, f.updated_at
        ORDER BY f.name
      `);

    return result.recordset.map(row => ({
      id: row.id,
      name: row.name,
      parentId: row.parent_id,
      userId: row.user_id,
      allowWebsiteUsage: row.allow_website_usage,
      websiteUsagePermissions: row.website_usage_permissions,
      description: row.description,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      fileCount: row.file_count
    }));
  }

  async deleteFolder(folderId: string, userId: string): Promise<void> {
    const pool = await getDbConnection();
    const request = new Request(pool);
    
    await request
      .input('folderId', folderId)
      .input('userId', userId)
      .query(`
        BEGIN TRANSACTION;
        
        UPDATE media_files 
        SET folder_id = NULL, updated_at = GETUTCDATE()
        WHERE folder_id = @folderId AND user_id = @userId;
        
        UPDATE media_folders 
        SET is_deleted = 1, updated_at = GETUTCDATE()
        WHERE id = @folderId AND user_id = @userId;
        
        COMMIT TRANSACTION;
      `);
  }

  async updateFolderSettings(
    folderId: string,
    userId: string,
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
      .input('userId', userId)
      .input('allowWebsiteUsage', settings.allowWebsiteUsage)
      .input('websiteUsagePermissions', settings.websiteUsagePermissions)
      .input('description', settings.description || null)
      .input('tags', settings.tags ? JSON.stringify(settings.tags) : null)
      .query(`
        UPDATE media_folders 
        SET 
          allow_website_usage = COALESCE(@allowWebsiteUsage, allow_website_usage),
          website_usage_permissions = COALESCE(@websiteUsagePermissions, website_usage_permissions),
          description = COALESCE(@description, description),
          tags = COALESCE(@tags, tags),
          updated_at = GETUTCDATE()
        WHERE id = @folderId AND user_id = @userId;
        
        SELECT id, name, parent_id, user_id, allow_website_usage, website_usage_permissions,
               description, tags, created_at, updated_at
        FROM media_folders 
        WHERE id = @folderId AND user_id = @userId;
      `);

    if (result.recordset.length === 0) {
      throw new Error('Folder not found or access denied');
    }

    const folder = result.recordset[0];
    return {
      id: folder.id,
      name: folder.name,
      parentId: folder.parent_id,
      userId: folder.user_id,
      allowWebsiteUsage: folder.allow_website_usage,
      websiteUsagePermissions: folder.website_usage_permissions,
      description: folder.description,
      tags: folder.tags ? JSON.parse(folder.tags) : undefined,
      createdAt: folder.created_at,
      updatedAt: folder.updated_at,
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
        MERGE media_folder_website_permissions AS target
        USING (SELECT @folderId as folder_id, @websiteId as website_id) AS source
        ON target.folder_id = source.folder_id AND target.website_id = source.website_id
        WHEN MATCHED THEN
          UPDATE SET permission_type = @permissionType, granted_by = @grantedBy
        WHEN NOT MATCHED THEN
          INSERT (folder_id, website_id, permission_type, granted_by)
          VALUES (@folderId, @websiteId, @permissionType, @grantedBy)
        OUTPUT inserted.id, inserted.folder_id, inserted.website_id, 
               inserted.permission_type, inserted.granted_by, inserted.created_at;
      `);

    const permission = result.recordset[0];
    return {
      id: permission.id,
      folderId: permission.folder_id,
      websiteId: permission.website_id,
      permissionType: permission.permission_type,
      grantedBy: permission.granted_by,
      createdAt: permission.created_at
    };
  }

  async revokeFolderWebsitePermission(folderId: string, websiteId: string): Promise<void> {
    const pool = await getDbConnection();
    const request = new Request(pool);
    
    await request
      .input('folderId', folderId)
      .input('websiteId', websiteId)
      .query(`
        DELETE FROM media_folder_website_permissions
        WHERE folder_id = @folderId AND website_id = @websiteId
      `);
  }

  async getFolderWebsitePermissions(folderId: string): Promise<MediaFolderWebsitePermission[]> {
    const pool = await getDbConnection();
    const request = new Request(pool);
    
    const result = await request
      .input('folderId', folderId)
      .query(`
        SELECT p.id, p.folder_id, p.website_id, p.permission_type, p.granted_by, p.created_at,
               w.name as website_name, w.domain as website_domain
        FROM media_folder_website_permissions p
        INNER JOIN websites w ON p.website_id = w.id
        WHERE p.folder_id = @folderId
        ORDER BY w.name
      `);

    return result.recordset.map(row => ({
      id: row.id,
      folderId: row.folder_id,
      websiteId: row.website_id,
      permissionType: row.permission_type,
      grantedBy: row.granted_by,
      createdAt: row.created_at,
      websiteName: row.website_name,
      websiteDomain: row.website_domain
    }));
  }

  async getFile(userId: string, fileId: string): Promise<MediaFile | null> {
    const pool = await getDbConnection();
    const request = new Request(pool);
    
    const result = await request
      .input('fileId', fileId)
      .input('userId', userId)
      .query(`
        SELECT 
          id, folder_id, user_id, original_name, file_name, blob_path, blob_url,
          file_size, mime_type, file_type, width, height, duration_seconds,
          tags, alt_text, description, is_public, created_at, updated_at
        FROM media_files
        WHERE id = @fileId AND user_id = @userId AND is_deleted = 0
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    const row = result.recordset[0];
    return {
      id: row.id,
      folderId: row.folder_id,
      userId: row.user_id,
      originalName: row.original_name,
      fileName: row.file_name,
      blobPath: row.blob_path,
      blobUrl: row.blob_url,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      fileType: row.file_type,
      width: row.width,
      height: row.height,
      durationSeconds: row.duration_seconds,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
      altText: row.alt_text,
      description: row.description,
      isPublic: row.is_public,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  } 

  async getFiles(userId: string, folderId?: string): Promise<MediaFile[]> {
    const pool = await getDbConnection();
    const request = new Request(pool);
    
    const result = await request
      .input('userId', userId)
      .input('folderId', folderId || null)
      .query(`
        SELECT 
          id, folder_id, user_id, original_name, file_name, blob_path, blob_url,
          file_size, mime_type, file_type, width, height, duration_seconds,
          thumbnail_url, thumbnail_blob_path, has_thumbnail,
          tags, alt_text, description, is_public, created_at, updated_at
        FROM media_files
        WHERE user_id = @userId 
          AND is_deleted = 0
          AND ((@folderId IS NULL AND folder_id IS NULL) OR folder_id = @folderId)
        ORDER BY created_at DESC
      `);

    return result.recordset.map(row => ({
      id: row.id,
      folderId: row.folder_id,
      userId: row.user_id,
      originalName: row.original_name,
      fileName: row.file_name,
      blobPath: row.blob_path,
      blobUrl: row.blob_url,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      fileType: row.file_type,
      width: row.width,
      height: row.height,
      durationSeconds: row.duration_seconds,
      thumbnailUrl: row.thumbnail_url,
      thumbnailBlobPath: row.thumbnail_blob_path,
      hasThumbnail: row.has_thumbnail,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
      altText: row.alt_text,
      description: row.description,
      isPublic: row.is_public,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async createFile(fileData: Omit<MediaFile, 'id' | 'createdAt' | 'updatedAt'>): Promise<MediaFile> {
    const pool = await getDbConnection();
    const request = new Request(pool);
    
    const result = await request
      .input('folderId', fileData.folderId || null)
      .input('userId', fileData.userId)
      .input('originalName', fileData.originalName)
      .input('fileName', fileData.fileName)
      .input('blobPath', fileData.blobPath)
      .input('blobUrl', fileData.blobUrl)
      .input('fileSize', fileData.fileSize)
      .input('mimeType', fileData.mimeType)
      .input('fileType', fileData.fileType)
      .input('width', fileData.width || null)
      .input('height', fileData.height || null)
      .input('durationSeconds', fileData.durationSeconds || null)
      .input('thumbnailUrl', fileData.thumbnailUrl || null)
      .input('thumbnailBlobPath', fileData.thumbnailBlobPath || null)
      .input('hasThumbnail', fileData.hasThumbnail || false)
      .input('tags', fileData.tags ? JSON.stringify(fileData.tags) : null)
      .input('altText', fileData.altText || null)
      .input('description', fileData.description || null)
      .input('isPublic', fileData.isPublic)
      .query(`
        INSERT INTO media_files (
          folder_id, user_id, original_name, file_name, blob_path, blob_url,
          file_size, mime_type, file_type, width, height, duration_seconds,
          thumbnail_url, thumbnail_blob_path, has_thumbnail,
          tags, alt_text, description, is_public
        )
        OUTPUT inserted.id, inserted.folder_id, inserted.user_id, inserted.original_name,
               inserted.file_name, inserted.blob_path, inserted.blob_url, inserted.file_size,
               inserted.mime_type, inserted.file_type, inserted.width, inserted.height,
               inserted.duration_seconds, inserted.thumbnail_url, inserted.thumbnail_blob_path,
               inserted.has_thumbnail, inserted.tags, inserted.alt_text, inserted.description,
               inserted.is_public, inserted.created_at, inserted.updated_at
        VALUES (
          @folderId, @userId, @originalName, @fileName, @blobPath, @blobUrl,
          @fileSize, @mimeType, @fileType, @width, @height, @durationSeconds,
          @thumbnailUrl, @thumbnailBlobPath, @hasThumbnail,
          @tags, @altText, @description, @isPublic
        )
      `);

    const file = result.recordset[0];
    return {
      id: file.id,
      folderId: file.folder_id,
      userId: file.user_id,
      originalName: file.original_name,
      fileName: file.file_name,
      blobPath: file.blob_path,
      blobUrl: file.blob_url,
      fileSize: file.file_size,
      mimeType: file.mime_type,
      fileType: file.file_type,
      width: file.width,
      height: file.height,
      durationSeconds: file.duration_seconds,
      thumbnailUrl: file.thumbnail_url,
      thumbnailBlobPath: file.thumbnail_blob_path,
      hasThumbnail: file.has_thumbnail,
      tags: file.tags ? JSON.parse(file.tags) : undefined,
      altText: file.alt_text,
      description: file.description,
      isPublic: file.is_public,
      createdAt: file.created_at,
      updatedAt: file.updated_at
    };
  }

  async deleteFile(userId: string, fileId: string): Promise<void> {
    const pool = await getDbConnection();
    const request = new Request(pool);
    
    await request
      .input('fileId', fileId)
      .input('userId', userId)
      .query(`
        UPDATE media_files 
        SET is_deleted = 1, updated_at = GETUTCDATE()
        WHERE id = @fileId AND user_id = @userId
      `);
  }

  async getFileById(fileId: string, userId: string): Promise<MediaFile | null> {
    const pool = await getDbConnection();
    const request = new Request(pool);
    
    const result = await request
      .input('fileId', fileId)
      .input('userId', userId)
      .query(`
        SELECT 
          id, folder_id, user_id, original_name, file_name, blob_path, blob_url,
          file_size, mime_type, file_type, width, height, duration_seconds,
          tags, alt_text, description, is_public, created_at, updated_at
        FROM media_files
        WHERE id = @fileId AND user_id = @userId AND is_deleted = 0
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    const row = result.recordset[0];
    return {
      id: row.id,
      folderId: row.folder_id,
      userId: row.user_id,
      originalName: row.original_name,
      fileName: row.file_name,
      blobPath: row.blob_path,
      blobUrl: row.blob_url,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      fileType: row.file_type,
      width: row.width,
      height: row.height,
      durationSeconds: row.duration_seconds,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
      altText: row.alt_text,
      description: row.description,
      isPublic: row.is_public,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
