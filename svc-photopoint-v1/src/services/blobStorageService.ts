import { BlobServiceClient, ContainerClient, BlockBlobClient } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';

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
        console.log(`Container '${this.containerName}' created successfully`);
      }
    } catch (error) {
      console.error('Failed to initialize blob storage:', error);
      throw error;
    }
  }

  async uploadFile(
    buffer: Buffer, 
    originalName: string, 
    mimeType: string, 
    folderId?: string
  ): Promise<MediaFile> {
    try {
      const fileId = uuidv4();
      const fileExtension = originalName.split('.').pop();
      const fileName = `${fileId}.${fileExtension}`;
      
      // Create blob path with folder structure
      const blobPath = folderId ? `folders/${folderId}/${fileName}` : fileName;
      
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
          folderId: folderId || '',
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
        folderId: folderId,
        createdAt: new Date(),
        mimeType: mimeType
      };
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  }

  async deleteFile(fileId: string, folderId?: string): Promise<void> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      
      // List blobs to find the file by metadata
      const blobs = containerClient.listBlobsFlat({
        prefix: folderId ? `folders/${folderId}/` : ''
      });

      for await (const blob of blobs) {
        const blobClient = containerClient.getBlobClient(blob.name);
        const properties = await blobClient.getProperties();
        
        if (properties.metadata?.fileId === fileId) {
          await blobClient.delete();
          console.log(`File ${fileId} deleted successfully`);
          return;
        }
      }
      
      throw new Error(`File with ID ${fileId} not found`);
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw error;
    }
  }

  async getFileBuffer(blobPath: string, folderId?: string): Promise<Buffer | null> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      
      // Construct the full blob path
      const fullPath = folderId && !blobPath.startsWith('folders/') 
        ? `folders/${folderId}/${blobPath}` 
        : blobPath;
      
      const blobClient = containerClient.getBlobClient(fullPath);
      
      // Check if blob exists
      const exists = await blobClient.exists();
      if (!exists) {
        console.log(`Blob not found: ${fullPath}`);
        return null;
      }
      
      // Download the blob as a buffer
      const downloadResponse = await blobClient.downloadToBuffer();
      return downloadResponse;
    } catch (error) {
      console.error('Failed to get file buffer:', error);
      return null;
    }
  }

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
      console.error('Failed to list files:', error);
      throw error;
    }
  }

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
      console.error('Failed to create folder:', error);
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
      console.error('Failed to list folders:', error);
      throw error;
    }
  }

  async deleteFolder(folderId: string): Promise<void> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      
      // Delete all files in the folder
      const files = await this.listFiles(folderId);
      for (const file of files) {
        await this.deleteFile(file.id, folderId);
      }
      
      // Delete the folder marker
      const folderMarkerBlob = containerClient.getBlobClient(`folders/${folderId}/.folder`);
      await folderMarkerBlob.delete();
      
      console.log(`Folder ${folderId} deleted successfully`);
    } catch (error) {
      console.error('Failed to delete folder:', error);
      throw error;
    }
  }

  private async getFileCountInFolder(folderId: string): Promise<number> {
    try {
      const files = await this.listFiles(folderId);
      return files.length;
    } catch (error) {
      console.error('Failed to get file count:', error);
      return 0;
    }
  }

  async copyBlob(sourceBlobName: string, destinationBlobName: string): Promise<void> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      
      const sourceBlobClient = containerClient.getBlobClient(sourceBlobName);
      const destinationBlobClient = containerClient.getBlobClient(destinationBlobName);
      
      // Copy the blob
      const copyOperation = await destinationBlobClient.syncCopyFromURL(sourceBlobClient.url);
      
      if (copyOperation.copyStatus !== 'success') {
        throw new Error(`Failed to copy blob: ${copyOperation.copyStatus}`);
      }
      
      console.log(`Successfully copied blob from ${sourceBlobName} to ${destinationBlobName}`);
    } catch (error) {
      console.error('Failed to copy blob:', error);
      throw error;
    }
  }

  async moveBlob(sourceBlobName: string, destinationBlobName: string): Promise<void> {
    try {
      // First copy the blob
      await this.copyBlob(sourceBlobName, destinationBlobName);
      
      // Then delete the source blob
      await this.deleteFile(sourceBlobName);
      
      console.log(`Successfully moved blob from ${sourceBlobName} to ${destinationBlobName}`);
    } catch (error) {
      console.error('Failed to move blob:', error);
      throw error;
    }
  }
}

export const blobStorageService = new BlobStorageService();
