import { Request, Response } from 'express';
import { blobStorageService } from '../services/blobStorageService';
import { MediaRepository, MediaFolder, MediaFile } from '../database/repositories/MediaRepository';
import { AuthenticatedRequest } from '../middleware/auth';
import multer from 'multer';

// Conditionally import sharp
let sharp: any;
try {
  sharp = require('sharp');
} catch (error) {
  console.warn('Sharp not available - thumbnails will not be generated');
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

  // Upload files - flexible field names
  static uploadFiles = upload.array('files', 10); // Allow up to 10 files
  static uploadSingleFile = upload.single('file'); // Allow single file upload
  static uploadAnyField = upload.any(); // Allow any field names

  static async handleFileUpload(req: Request, res: Response): Promise<void> {
    try {
      const filesArray = req.files as Express.Multer.File[];
      const { folderId } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;
      
      // Handle files from upload.any() - always comes as array
      const files: Express.Multer.File[] = Array.isArray(filesArray) ? filesArray : [];
      
      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No files provided'
        });
        return;
      }

      // Upload files to blob storage and create database records
      const uploadPromises = files.map(async (file) => {
        // Validate file properties
        if (!file || !file.originalname || !file.buffer || !file.size) {
          throw new Error(`Invalid file properties: ${JSON.stringify({
            hasFile: !!file,
            originalname: file?.originalname,
            hasBuffer: !!file?.buffer,
            size: file?.size,
            mimetype: file?.mimetype
          })}`);
        }

        console.log('Processing file upload:', {
          originalname: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          fieldname: file.fieldname
        });

        // Upload to blob storage
        const blobResult = await blobStorageService.uploadFile(
          file.buffer,
          file.originalname,
          file.mimetype,
          folderId
        );

        console.log('Blob upload result:', {
          id: blobResult.id,
          name: blobResult.name,
          originalName: blobResult.originalName,
          size: blobResult.size,
          url: blobResult.url
        });

        // Generate thumbnail for images
        let thumbnailUrl = blobResult.url;
        if (file.mimetype.startsWith('image/') && sharp) {
          try {
            // Generate thumbnail using Sharp
            const thumbnailBuffer = await sharp(file.buffer)
              .resize(300, 300, { 
                fit: 'inside',
                withoutEnlargement: true 
              })
              .jpeg({ quality: 80 })
              .toBuffer();

            // Upload thumbnail
            const thumbnailName = `thumb_${blobResult.name}`;
            const thumbnailResult = await blobStorageService.uploadFile(
              thumbnailBuffer,
              thumbnailName,
              'image/jpeg',
              folderId
            );
            thumbnailUrl = thumbnailResult.url;
          } catch (error) {
            console.error('Failed to generate thumbnail:', error);
            // Continue without thumbnail if generation fails
          }
        }

        // Create database record with validated properties
        const fileData = {
          folderId: folderId || undefined,
          userId: userId,
          originalName: file.originalname || blobResult.originalName,
          fileName: blobResult.name,
          blobPath: blobResult.name,
          blobUrl: blobResult.url,
          fileSize: file.size || blobResult.size, // Use original file size, fallback to blob size
          mimeType: file.mimetype || blobResult.mimeType,
          fileType: (file.mimetype || blobResult.mimeType).startsWith('image/') ? 'image' as const : 'video' as const,
          thumbnailUrl: thumbnailUrl !== blobResult.url ? thumbnailUrl : undefined,
          thumbnailBlobPath: thumbnailUrl !== blobResult.url ? `thumb_${blobResult.name}` : undefined,
          hasThumbnail: thumbnailUrl !== blobResult.url,
          isPublic: false
        };

        console.log('Creating database record with:', fileData);

        const savedFile = await MediaController.mediaRepository.createFile(fileData);
        
        console.log('Database record created:', {
          id: savedFile.id,
          originalName: savedFile.originalName,
          fileName: savedFile.fileName,
          fileSize: savedFile.fileSize,
          mimeType: savedFile.mimeType,
          blobUrl: savedFile.blobUrl,
          thumbnailUrl: savedFile.thumbnailUrl,
          hasThumbnail: savedFile.hasThumbnail
        });
        
        // Return the complete file record with thumbnail information from database
        return {
          ...savedFile,
          // Ensure critical properties are not undefined
          originalName: savedFile.originalName || file.originalname || 'Unknown',
          fileName: savedFile.fileName || blobResult.name || 'Unknown',
          fileSize: savedFile.fileSize || file.size || blobResult.size || 0
        };
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
      const fileToDelete = await MediaController.mediaRepository.getFile(userId, fileId);
      
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

  // FR-CMS-018: Check folder sharing permissions
  static async checkFolderSharingPermission(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { folderId, websiteId } = req.params;
      
      if (!folderId || !websiteId) {
        res.status(400).json({
          success: false,
          message: 'Folder ID and Website ID are required'
        });
        return;
      }

      // Check if user owns the folder or if it's shared
      const folders = await MediaController.mediaRepository.getFolders(userId);
      const folder = folders.find(f => f.id === folderId);
      
      if (!folder) {
        res.status(404).json({
          success: false,
          message: 'Folder not found'
        });
        return;
      }

      // For now, assume access is granted if user owns the folder or if it's marked as shared
      // In a real implementation, you'd check specific sharing permissions
      const canAccess = folder.userId === userId || folder.allowWebsiteUsage;
      
      res.json({
        success: true,
        data: {
          canAccess,
          isOwner: folder.userId === userId,
          sharedAt: folder.allowWebsiteUsage ? folder.createdAt : null
        }
      });
    } catch (error) {
      console.error('Failed to check folder sharing permission:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check folder permissions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // FR-CMS-018: Generate responsive image variants
  static async generateResponsiveVariants(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { photoId } = req.params;
      const { breakpoints = [320, 640, 1024, 1920] } = req.body;
      
      if (!photoId) {
        res.status(400).json({
          success: false,
          message: 'Photo ID is required'
        });
        return;
      }

      // Get the original photo details
      const files = await MediaController.mediaRepository.getFiles(userId);
      const photo = files.find(f => f.id === photoId);
      
      if (!photo) {
        res.status(404).json({
          success: false,
          message: 'Photo not found'
        });
        return;
      }

      // Generate responsive variants (this would use image processing library like Sharp)
      const variants = await Promise.all(
        breakpoints.map(async (width: number) => {
          // In a real implementation, you'd resize the image and upload the variant
          // For now, we'll return mock data
          return {
            width,
            url: `${photo.blobUrl}?w=${width}`,
            size: Math.round(photo.fileSize * (width / 1920)) // Estimated size
          };
        })
      );

      res.json({
        success: true,
        data: {
          variants
        }
      });
    } catch (error) {
      console.error('Failed to generate responsive variants:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate responsive variants',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // FR-CMS-018: Get folder permissions and sharing settings
  static async getFolderPermissions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { folderId } = req.params;
      
      if (!folderId) {
        res.status(400).json({
          success: false,
          message: 'Folder ID is required'
        });
        return;
      }

      const folders = await MediaController.mediaRepository.getFolders(userId);
      const folder = folders.find(f => f.id === folderId);
      
      if (!folder) {
        res.status(404).json({
          success: false,
          message: 'Folder not found'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          isShared: folder.allowWebsiteUsage || false,
          allowedWebsites: [], // This would be implemented based on your sharing model
          owner: {
            id: folder.userId,
            name: 'User Name' // You'd get this from user repository
          }
        }
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

  // FR-CMS-018: Enhanced upload with auto-folder creation
  static async uploadWithAutoFolder(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { autoCreateFolder, folderId, generateThumbnails, optimizeForWeb } = req.body;
      
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file provided'
        });
        return;
      }

      let targetFolderId = folderId;

      // Auto-create folder if specified
      if (autoCreateFolder && !folderId) {
        try {
          // Check if folder already exists
          const existingFolders = await MediaController.mediaRepository.getFolders(userId);
          const existingFolder = existingFolders.find(f => f.name === autoCreateFolder);
          
          if (existingFolder) {
            targetFolderId = existingFolder.id;
          } else {
            // Create new folder
            const newFolder = await MediaController.mediaRepository.createFolder(autoCreateFolder, userId);
            targetFolderId = newFolder.id;
          }
        } catch (error) {
          console.error('Failed to auto-create folder:', error);
          // Continue with upload to default location
        }
      }

      // Upload the file
      const file = req.file;
      
      // Upload to blob storage
      const uploadResult = await blobStorageService.uploadFile(
        file.buffer, 
        file.originalname, 
        file.mimetype, 
        targetFolderId || undefined
      );

      // Save file metadata to database
      const mediaFile = await MediaController.mediaRepository.createFile({
        originalName: uploadResult.originalName,
        fileName: uploadResult.name,
        blobPath: uploadResult.url, // Using url as blobPath for now
        blobUrl: uploadResult.url,
        fileSize: uploadResult.size,
        mimeType: uploadResult.mimeType,
        fileType: uploadResult.type,
        folderId: targetFolderId || undefined,
        userId: userId,
        isPublic: false
      });

      // TODO: If generateThumbnails is true, generate thumbnails
      // TODO: If optimizeForWeb is true, optimize the image

      res.json({
        success: true,
        data: {
          photo: mediaFile
        }
      });
    } catch (error) {
      console.error('Failed to upload with auto folder:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload file',
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

  // Serve media files securely through our backend
  static async serveFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      const { type = 'original' } = req.query; // 'original' or 'thumbnail'
      const userId = (req as AuthenticatedRequest).user.id;
      
      if (!fileId) {
        res.status(400).json({
          success: false,
          message: 'File ID is required'
        });
        return;
      }

      // Get the file record to verify ownership and get blob path
      const file = await MediaController.mediaRepository.getFile(userId, fileId);
      
      if (!file) {
        res.status(404).json({
          success: false,
          message: 'File not found or access denied'
        });
        return;
      }

      // Determine which file to serve
      let blobPath: string;
      let mimeType: string;
      
      if (type === 'thumbnail' && file.hasThumbnail && file.thumbnailBlobPath) {
        blobPath = file.thumbnailBlobPath;
        mimeType = 'image/jpeg'; // Thumbnails are always JPEG
      } else {
        blobPath = file.blobPath;
        mimeType = file.mimeType;
      }

      // Get the file from blob storage
      const blobData = await blobStorageService.getFileBuffer(blobPath, file.folderId);
      
      if (!blobData) {
        res.status(404).json({
          success: false,
          message: 'File content not found'
        });
        return;
      }

      // Set appropriate headers
      res.set({
        'Content-Type': mimeType,
        'Content-Length': blobData.length.toString(),
        'Cache-Control': 'private, max-age=3600', // Cache for 1 hour, but private
        'ETag': `"${file.id}-${type}"`,
        'Content-Disposition': type === 'thumbnail' ? 'inline' : `inline; filename="${file.originalName}"`
      });

      // Send the file data
      res.send(blobData);
    } catch (error) {
      console.error('Failed to serve file:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to serve file',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
