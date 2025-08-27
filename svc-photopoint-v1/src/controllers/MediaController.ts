import { Request, Response } from 'express';
import { blobStorageService, MediaFolder, MediaFile } from '../services/blobStorageService';
import { MediaRepository } from '../database/repositories/MediaRepository';
import multer from 'multer';

// Type for authenticated requests (used for casting)
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    username?: string;
    fullName?: string;
    profilePicture?: string;
  };
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and videos
    const allowedMimes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/webm'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  }
});

export class MediaController {
  private static mediaRepository = new MediaRepository();

  // Get all folders
  static async getFolders(req: Request, res: Response): Promise<void> {
    try {
      const { parentId } = req.query;
      const userId = (req as AuthenticatedRequest).user.id;

      const folders = await MediaController.mediaRepository.getFolders(userId, parentId as string);
      
      res.json({
        success: true,
        data: folders
      });
    } catch (error) {
      console.error('Failed to get folders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve folders',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create a new folder
  static async createFolder(req: Request, res: Response): Promise<void> {
    try {
      const { name, parentId } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;
      
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Folder name is required'
        });
        return;
      }

      const folder = await MediaController.mediaRepository.createFolder(name.trim(), userId, parentId);
      
      res.status(201).json({
        success: true,
        data: folder
      });
    } catch (error) {
      console.error('Failed to create folder:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create folder',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete a folder
  static async deleteFolder(req: Request, res: Response): Promise<void> {
    try {
      const { folderId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      
      if (!folderId) {
        res.status(400).json({
          success: false,
          message: 'Folder ID is required'
        });
        return;
      }

      await MediaController.mediaRepository.deleteFolder(folderId, userId);
      
      res.json({
        success: true,
        message: 'Folder deleted successfully'
      });
    } catch (error) {
      console.error('Failed to delete folder:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete folder',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update folder settings
  static async updateFolderSettings(req: Request, res: Response): Promise<void> {
    try {
      const { folderId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      const { allowWebsiteUsage, websiteUsagePermissions, description, tags } = req.body;
      
      if (!folderId) {
        res.status(400).json({
          success: false,
          message: 'Folder ID is required'
        });
        return;
      }

      const updatedFolder = await MediaController.mediaRepository.updateFolderSettings(
        folderId, 
        userId, 
        { allowWebsiteUsage, websiteUsagePermissions, description, tags }
      );
      
      res.json({
        success: true,
        data: updatedFolder,
        message: 'Folder settings updated successfully'
      });
    } catch (error) {
      console.error('Failed to update folder settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update folder settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Grant website permission to a folder
  static async grantFolderWebsitePermission(req: Request, res: Response): Promise<void> {
    try {
      const { folderId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      const { websiteId, permissionType = 'read' } = req.body;
      
      if (!folderId || !websiteId) {
        res.status(400).json({
          success: false,
          message: 'Folder ID and Website ID are required'
        });
        return;
      }

      const permission = await MediaController.mediaRepository.grantFolderWebsitePermission(
        folderId,
        websiteId,
        permissionType,
        userId
      );
      
      res.json({
        success: true,
        data: permission,
        message: 'Website permission granted successfully'
      });
    } catch (error) {
      console.error('Failed to grant website permission:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to grant website permission',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Revoke website permission from a folder
  static async revokeFolderWebsitePermission(req: Request, res: Response): Promise<void> {
    try {
      const { folderId, websiteId } = req.params;
      
      if (!folderId || !websiteId) {
        res.status(400).json({
          success: false,
          message: 'Folder ID and Website ID are required'
        });
        return;
      }

      await MediaController.mediaRepository.revokeFolderWebsitePermission(folderId, websiteId);
      
      res.json({
        success: true,
        message: 'Website permission revoked successfully'
      });
    } catch (error) {
      console.error('Failed to revoke website permission:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to revoke website permission',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get folder website permissions
  static async getFolderWebsitePermissions(req: Request, res: Response): Promise<void> {
    try {
      const { folderId } = req.params;
      
      if (!folderId) {
        res.status(400).json({
          success: false,
          message: 'Folder ID is required'
        });
        return;
      }

      const permissions = await MediaController.mediaRepository.getFolderWebsitePermissions(folderId);
      
      res.json({
        success: true,
        data: permissions
      });
    } catch (error) {
      console.error('Failed to get folder permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get folder permissions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get all files in a folder
  static async getFiles(req: Request, res: Response): Promise<void> {
    try {
      const { folderId } = req.query;
      const userId = (req as AuthenticatedRequest).user.id;

      const files = await MediaController.mediaRepository.getFiles(userId, folderId as string);
      
      res.json({
        success: true,
        data: files
      });
    } catch (error) {
      console.error('Failed to get files:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve files',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Upload files
  static uploadFiles = upload.array('files', 10); // Allow up to 10 files

  static async handleFileUpload(req: Request, res: Response): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      const { folderId } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;
      
      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No files provided'
        });
        return;
      }

      // Upload files to blob storage and create database records
      const uploadPromises = files.map(async (file) => {
        // Upload to blob storage
        const blobResult = await blobStorageService.uploadFile(
          file.buffer,
          file.originalname,
          file.mimetype,
          folderId
        );

        // Create database record
        const fileData = {
          folderId: folderId || undefined,
          userId: userId,
          originalName: file.originalname,
          fileName: blobResult.name, // Use the blob service generated filename
          blobPath: blobResult.name, // Use the blob name as path
          blobUrl: blobResult.url,
          fileSize: file.size,
          mimeType: file.mimetype,
          fileType: file.mimetype.startsWith('image/') ? 'image' as const : 'video' as const,
          isPublic: false // Default to private
        };

        return MediaController.mediaRepository.createFile(fileData);
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      
      res.status(201).json({
        success: true,
        data: uploadedFiles,
        message: `${uploadedFiles.length} file(s) uploaded successfully`
      });
    } catch (error) {
      console.error('Failed to upload files:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload files',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete a file
  static async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      
      if (!fileId) {
        res.status(400).json({
          success: false,
          message: 'File ID is required'
        });
        return;
      }

      // First get the file details to get blob path for deletion
      const files = await MediaController.mediaRepository.getFiles(userId);
      const fileToDelete = files.find(f => f.id === fileId);
      
      if (!fileToDelete) {
        res.status(404).json({
          success: false,
          message: 'File not found'
        });
        return;
      }

      // Delete from blob storage using the blob path
      await blobStorageService.deleteFile(fileId, fileToDelete.folderId);
      
      // Delete from database
      await MediaController.mediaRepository.deleteFile(fileId, userId);
      
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      console.error('Failed to delete file:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete file',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Health check for media service
  static async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      // Test database connection - use a test user ID
      const testUserId = '00000000-0000-0000-0000-000000000000';
      await MediaController.mediaRepository.getFolders(testUserId);
      
      // Test blob storage connection
      await blobStorageService.listFolders();
      
      res.json({
        success: true,
        message: 'Media service is healthy (database + blob storage)',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Media service health check failed:', error);
      res.status(500).json({
        success: false,
        message: 'Media service is unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
}
