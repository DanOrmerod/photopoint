import { BlobServiceClient, ContainerClient, BlockBlobClient } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import { BlobPathUtils } from '../utils/blobPathUtils';
import { logger } from '../utils/logger';

export interface MediaFolder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: Date;
  fileCount: number;
}

export interface MediaFile {
  id: string;
  name: string;
  originalName: string;
  url: string;
  type: 'image' | 'video';
  size: number;
  folderId?: string;
  createdAt: Date;
  mimeType: string;
}

export class BlobStorageService {
  private blobServiceClient: BlobServiceClient;
  private containerName = 'media';

  constructor() {
    // Azurite connection string for local development
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || 
      'UseDevelopmentStorage=true';
    
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  }

  async initialize(): Promise<void> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      
      // Create container if it doesn't exist
      const exists = await containerClient.exists();
      if (!exists) {
        await containerClient.create({
          access: 'blob' // Allow public read access to blobs
        });
        logger.debug(`Container '${this.containerName}' created successfully`);
      }
    } catch (error) {
      logger.error('Failed to initialize blob storage:', error);
      throw error;
    }
  }

  async uploadFile(
    buffer: Buffer, 
    originalName: string, 
    mimeType: string, 
    accountId: string,
    fileId: string,
    folderName?: string
  ): Promise<{
    id: string;
    name: string;
    originalName: string;
    url: string;
    type: 'image' | 'video';
    size: number;
    mimeType: string;
  }> {
    try {
      const fileName = BlobPathUtils.generateBlobFileName(fileId, originalName);
      
      // Create new blob path structure: [AccountID]/Media/[FolderName]/[FileId].[extension]
      const blobPath = this.generateBlobPath(accountId, folderName, fileId, originalName);
      
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

      // Upload file with metadata
      await blockBlobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: {
          blobContentType: mimeType
        },
        metadata: {
          originalName: originalName,
          fileId: fileId,
          accountId: accountId,
          folderName: folderName || 'Root',
          uploadedAt: new Date().toISOString()
        }
      });

      // Generate the file URL
      const fileUrl = blockBlobClient.url;

      return {
        id: fileId,
        name: fileName,
        originalName: originalName,
        url: fileUrl,
        type: mimeType.startsWith('image/') ? 'image' : 'video',
        size: buffer.length,
        mimeType: mimeType
      };
    } catch (error) {
      logger.error('Failed to upload file:', error);
      throw error;
    }
  }

  /**
   * Upload thumbnail using the new path structure: [AccountID]/Media/[FolderName]/[FileId]_thumbnail.[extension]
   */
  async uploadThumbnail(
    buffer: Buffer,
    originalFileName: string,
    accountId: string,
    fileId: string,
    folderName?: string
  ): Promise<string> {
    try {
      // Create thumbnail blob path
      const thumbnailFilePath = this.generateThumbnailPath(accountId, folderName, fileId);
      
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(thumbnailFilePath);

      // Upload thumbnail with metadata
      await blockBlobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: {
          blobContentType: 'image/jpeg'
        },
        metadata: {
          originalFileName: originalFileName,
          fileId: fileId,
          accountId: accountId,
          folderName: folderName || 'Root',
          uploadedAt: new Date().toISOString(),
          isThumbnail: 'true'
        }
      });

      return thumbnailFilePath; // Return the blob path, not the URL
    } catch (error) {
      logger.error('Failed to upload thumbnail:', error);
      throw error;
    }
  }

  /**
   * Generate blob path for a file using the structure
   */
  generateBlobPath(accountId: string, folderName: string | undefined, fileId: string, originFileName: string): string {
    return BlobPathUtils.generateFilePath(accountId, fileId, originFileName, folderName);
  }

  /**
   * Get blob path for an exsitng file using the structure
   * @param accountId 
   * @param folderName 
   * @param fileId 
   * @param fileName 
   * @returns 
   */
  getBlobPath(accountId: string, folderName: string | undefined, fileName: string): string {
    return BlobPathUtils.getFilePath(accountId, fileName, folderName);
  }

  /**
   * Generate thumbnail blob path using the structure
   */
  generateThumbnailPath(accountId: string, folderName: string | undefined, fileId: string): string {
    return BlobPathUtils.generateThumbnailPath(accountId, fileId, folderName);
  }
   
  /**
   * Get the exisitng thumbnail blob path using the structure
   */
  getThumbnailPath(accountId: string, fileName: string, folderName: string | undefined): string {
    return BlobPathUtils.getThumbnailPath(accountId, fileName, folderName);
  }

  /**
   * Get file URL from blob path
   */
  getBlobUrl(blobPath: string): string {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
    return blockBlobClient.url;
  }

  async deleteFile(accountId: string, fileName: string, folderName?: string): Promise<void> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      
      // Generate blob paths for both file and thumbnail
      const fileBlobPath = this.getBlobPath(accountId, folderName, fileName);
      const thumbnailBlobPath = this.getThumbnailPath(accountId, fileName, folderName);
      
      // Delete the main file
      const fileBlobClient = containerClient.getBlobClient(fileBlobPath);
      try {
        const fileExists = await fileBlobClient.exists();
        if (fileExists) {
          await fileBlobClient.delete();
          logger.debug(`File ${fileName} deleted successfully`);
        } else {
          logger.debug(`File ${fileName} not found - may have been already deleted`);
        }
      } catch (error) {
        logger.warn(`Failed to delete main file ${fileName}:`, error);
      }
      
      // Delete the thumbnail if it exists - don't treat 404 as error
      const thumbnailBlobClient = containerClient.getBlobClient(thumbnailBlobPath);
      try {
        const thumbnailExists = await thumbnailBlobClient.exists();
        if (thumbnailExists) {
          await thumbnailBlobClient.delete();
          logger.debug(`Thumbnail for file ${fileName} deleted successfully`);
        } else {
          logger.debug(`Thumbnail for file ${fileName} not found - may not have been generated`);
        }
      } catch (error) {
        logger.debug(`Thumbnail for file ${fileName} not found or already deleted:`, error);
      }
    } catch (error) {
      logger.error('Failed to delete file:', error);
      throw error;
    }
  }

  async getFileBuffer(fileNamePath: string): Promise<Buffer | null> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      
      const blobClient = containerClient.getBlobClient(fileNamePath);
      
      // Check if blob exists
      const exists = await blobClient.exists();
      if (!exists) {
        logger.debug(`Blob not found: ${fileNamePath}`);
        return null;
      }
      
      // Download the blob as a buffer
      const downloadResponse = await blobClient.downloadToBuffer();
      return downloadResponse;
    } catch (error) {
      logger.error('Failed to get file buffer:', error);
      return null;
    }
  }

  // DEPRECATED: This method needs to be removed or updated for new structure
  /*
  async listFiles(folderId?: string): Promise<MediaFile[]> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const files: MediaFile[] = [];
      
      const prefix = folderId ? `folders/${folderId}/` : '';
      const blobs = containerClient.listBlobsFlat({ prefix });

      for await (const blob of blobs) {
        const blobClient = containerClient.getBlobClient(blob.name);
        const properties = await blobClient.getProperties();
        
        if (properties.metadata) {
          const file: MediaFile = {
            id: properties.metadata.fileId || '',
            name: blob.name.split('/').pop() || '',
            originalName: properties.metadata.originalName || '',
            url: blobClient.url,
            type: properties.contentType?.startsWith('image/') ? 'image' : 'video',
            size: properties.contentLength || 0,
            folderId: properties.metadata.folderId || undefined,
            createdAt: new Date(properties.metadata.uploadedAt || blob.properties.createdOn || ''),
            mimeType: properties.contentType || ''
          };
          files.push(file);
        }
      }

      return files;
    } catch (error) {
      logger.error('Failed to list files:', error);
      throw error;
    }
  }
  */

  async createFolder(name: string, parentId?: string): Promise<MediaFolder> {
    try {
      const folderId = uuidv4();
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      
      // Create a marker blob to represent the folder
      const folderPath = parentId ? `folders/${parentId}/${folderId}/` : `folders/${folderId}/`;
      const markerBlobClient = containerClient.getBlockBlobClient(`${folderPath}.folder`);
      
      await markerBlobClient.upload('', 0, {
        metadata: {
          folderId: folderId,
          folderName: name,
          parentId: parentId || '',
          createdAt: new Date().toISOString()
        }
      });

      return {
        id: folderId,
        name: name,
        parentId: parentId,
        createdAt: new Date(),
        fileCount: 0
      };
    } catch (error) {
      logger.error('Failed to create folder:', error);
      throw error;
    }
  }

  async listFolders(parentId?: string): Promise<MediaFolder[]> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const folders: MediaFolder[] = [];
      
      const prefix = parentId ? `folders/${parentId}/` : 'folders/';
      const blobs = containerClient.listBlobsFlat({ prefix });

      for await (const blob of blobs) {
        if (blob.name.endsWith('.folder')) {
          const blobClient = containerClient.getBlobClient(blob.name);
          const properties = await blobClient.getProperties();
          
          if (properties.metadata) {
            // Count files in this folder
            const fileCount = await this.getFileCountInFolder(properties.metadata.folderId);
            
            const folder: MediaFolder = {
              id: properties.metadata.folderId || '',
              name: properties.metadata.folderName || '',
              parentId: properties.metadata.parentId || undefined,
              createdAt: new Date(properties.metadata.createdAt || blob.properties.createdOn || ''),
              fileCount: fileCount
            };
            folders.push(folder);
          }
        }
      }

      return folders;
    } catch (error) {
      logger.error('Failed to list folders:', error);
      throw error;
    }
  }

  // TODO: Update this method to work with new blob structure 
  async deleteFolder(accountId: string, folderName: string): Promise<void> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      
      // Delete all files in the folder by listing the folder prefix
      const folderPrefix = `${accountId}/Media/${folderName}/`;
      const blobs = containerClient.listBlobsFlat({ prefix: folderPrefix });
      
      for await (const blob of blobs) {
        const blobClient = containerClient.getBlobClient(blob.name);
        await blobClient.delete();
      }
      
      logger.debug(`Folder ${folderName} deleted successfully`);
    } catch (error) {
      logger.error('Failed to delete folder:', error);
      throw error;
    }
  }

  // DEPRECATED: These methods need to be updated for new structure
  private async listFiles(folderId: string): Promise<any[]> {
    // Temporarily return empty array to fix compilation
    return [];
  }

  private async getFileCountInFolder(folderId: string): Promise<number> {
    try {
      const files = await this.listFiles(folderId);
      return files.length;
    } catch (error) {
      logger.error('Failed to get file count:', error);
      return 0;
    }
  }

  async copyFile(accountId: string, originalFileName: string, originalFolderName: string | undefined, newFolderName: string, newFileName?: string): Promise<string> {
      const finalFileName = newFileName || originalFileName;
      const originalBlobPath = BlobPathUtils.getFilePath(accountId, originalFileName, originalFolderName);
      const destinationBlobPath = BlobPathUtils.getFilePath(accountId, finalFileName, newFolderName);

      // Try to copy the main file blob
      try {
        await this.copyBlob(originalBlobPath, destinationBlobPath);
        logger.debug(`Successfully copied main file blob from ${originalBlobPath} to ${destinationBlobPath}`);
      } catch (error: any) {
        if (error.code === 'BlobNotFound') {
          logger.warn(`Source blob not found for ${originalFileName}, skipping blob copy`);
          // Continue execution - the database record will still be created without blob copying
        } else {
          logger.error(`Failed to copy main file blob for ${originalFileName}:`, error);
          throw error; // Re-throw non-BlobNotFound errors
        }
      }

      // Try to copy the thumbnail blob (don't fail if thumbnail doesn't exist)
      const originalThumbnailPath = BlobPathUtils.getThumbnailPath(accountId, originalFileName, originalFolderName);
      const destinationThumbnailPath = BlobPathUtils.getThumbnailPath(accountId, finalFileName, newFolderName);

      try {
        await this.copyBlob(originalThumbnailPath, destinationThumbnailPath);
        logger.debug(`Successfully copied thumbnail from ${originalThumbnailPath} to ${destinationThumbnailPath}`);
      } catch (error: any) {
        if (error.code === 'BlobNotFound') {
          logger.debug(`Thumbnail not found for ${originalFileName}, skipping thumbnail copy`);
        } else {
          logger.warn(`Failed to copy thumbnail for ${originalFileName}:`, error);
        }
      }

      return destinationBlobPath;
  }


  private async copyBlob(sourceBlobName: string, destinationBlobName: string): Promise<void> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      
      const sourceBlobClient = containerClient.getBlobClient(sourceBlobName);
      const destinationBlobClient = containerClient.getBlobClient(destinationBlobName);
      
      // Copy the blob
      const copyOperation = await destinationBlobClient.syncCopyFromURL(sourceBlobClient.url);
      
      if (copyOperation.copyStatus !== 'success') {
        throw new Error(`Failed to copy blob: ${copyOperation.copyStatus}`);
      }
      
      logger.debug(`Successfully copied blob from ${sourceBlobName} to ${destinationBlobName}`);
    } catch (error: any) {
      logger.error('Failed to copy blob:', error);
      
      // Re-throw BlobNotFound errors so they can be handled by the caller
      if (error.code === 'BlobNotFound') {
        throw error;
      }
      
      // For other errors, also re-throw
      throw error;
    }
  }

  async moveFile(accountId: string, originalFileName: string, originalFolderName: string | undefined, newFolderName: string): Promise<string> {
    const originalBlobPath = BlobPathUtils.getFilePath(accountId, originalFileName, originalFolderName);
    const destinationBlobPath = BlobPathUtils.getFilePath(accountId, originalFileName, newFolderName);
    
    // Try to move the main file blob
    try {
      await this.moveBlob(originalBlobPath, destinationBlobPath);
      logger.debug(`Successfully moved main file blob from ${originalBlobPath} to ${destinationBlobPath}`);
    } catch (error: any) {
      if (error.code === 'BlobNotFound') {
        logger.warn(`Source blob not found for ${originalFileName}, skipping blob move`);
        // Continue execution - the database record will still be updated without blob moving
      } else {
        logger.error(`Failed to move main file blob for ${originalFileName}:`, error);
        throw error; // Re-throw non-BlobNotFound errors
      }
    }
    
    // Try to move the thumbnail blob
    try {
      await this.moveThumbnail(accountId, originalFileName, originalFolderName, newFolderName);
    } catch (error: any) {
      if (error.code === 'BlobNotFound') {
        logger.debug(`Thumbnail not found for ${originalFileName}, skipping thumbnail move`);
      } else {
        logger.warn(`Failed to move thumbnail for ${originalFileName}:`, error);
      }
    }
    
    return destinationBlobPath;
  }

  async moveThumbnail(accountId: string, originalFileName: string, originalFolderName: string | undefined, newFolderName: string): Promise<void> {
    const originalThumbnailPath = BlobPathUtils.getThumbnailPath(accountId, originalFileName, originalFolderName);
    const destinationThumbnailPath = BlobPathUtils.getThumbnailPath(accountId, originalFileName, newFolderName);
    await this.moveBlob(originalThumbnailPath, destinationThumbnailPath);
  }
  

  private async moveBlob(sourceBlobName: string, destinationBlobName: string): Promise<void> {
    try {
      // First copy the blob
      await this.copyBlob(sourceBlobName, destinationBlobName);
      
      // Then delete the source blob directly
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const sourceBlobClient = containerClient.getBlobClient(sourceBlobName);
      await sourceBlobClient.delete();
      
      logger.debug(`Successfully moved blob from ${sourceBlobName} to ${destinationBlobName}`);
    } catch (error) {
      logger.error('Failed to move blob:', error);
      throw error;
    }
  }
}

export const blobStorageService = new BlobStorageService();
