import { Request, Response } from 'express';
import { blobStorageService } from '../services/blobStorageService';
import { MediaRepository, MediaFolder, MediaFile } from '../database/repositories/MediaRepository';
import { AuthenticatedRequest } from '../middleware/auth';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { BlobPathUtils } from '../utils/blobPathUtils';
import { logger } from '../utils/logger';
import { blob } from 'stream/consumers';

// Conditionally import sharp
let sharp: any;
try {
  sharp = require('sharp');
} catch (error) {
  logger.warn('Sharp not available - thumbnails will not be generated');
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

  /**
   * Sanitize MediaFile objects for client consumption by removing internal properties
   */
  private static sanitizeMediaFile(file: MediaFile): Omit<MediaFile, 'blobUrl'> {
    const { blobUrl, ...sanitizedFile } = file;
    return sanitizedFile;
  }

  /**
   * Sanitize array of MediaFile objects for client consumption
   */
  private static sanitizeMediaFiles(files: MediaFile[]): Omit<MediaFile, 'blobUrl'>[] {
    return files.map(file => this.sanitizeMediaFile(file));
  }

  // Helper method to get folder name by ID
  private static async getFolderNameById(folderId: string, accountId: string): Promise<string | undefined> {
    try {
      const folder = await this.mediaRepository.getFolderById(folderId, accountId);
      return folder?.name;
    } catch (error) {
      logger.error(`Failed to get folder name for ID ${folderId}:`, error);
      return undefined;
    }
  }

  // Get all folders
  static async getFolders(req: Request, res: Response): Promise<void> {
    try {
      const { parentId } = req.query;
      const accountId = (req as AuthenticatedRequest).user.accountId;

      if (!accountId) {
        res.status(400).json({ error: 'Account ID not found in request' });
        return;
      }

      const folders = await MediaController.mediaRepository.getFolders(accountId, parentId as string);
      
      res.json(folders);
    } catch (error) {
      logger.error('Failed to get folders:', error);
      res.status(500).json({ error: 'Failed to retrieve folders' });
    }
  }

  // Create a new folder
  static async createFolder(req: Request, res: Response): Promise<void> {
    try {
      const { name, parentId } = req.body;
      const accountId = (req as AuthenticatedRequest).user.accountId;
      
      if (!accountId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!name || typeof name !== 'string' || name.trim() === '') {
        res.status(400).json({ error: 'Folder name is required' });
        return;
      }

      const folder = await MediaController.mediaRepository.createFolder(name.trim(), accountId, parentId);

      res.status(201).json({
        data: folder,
        message: 'Folder created successfully'
      });
    } catch (error) {
      logger.error('Failed to create folder:', error);
      res.status(500).json({ error: 'Failed to create folder' });
    }
  }

  // Delete a folder
  static async deleteFolder(req: Request, res: Response): Promise<void> {
    try {
      const { folderId } = req.params;
      const accountId = (req as AuthenticatedRequest).user.accountId;
      
      if (!accountId) {
        res.status(400).json({ error: 'Account ID not found in request' });
        return;
      }
      
      if (!folderId) {
        res.status(400).json({ error: 'Folder ID is required' });
        return;
      }

      await MediaController.mediaRepository.deleteFolder(folderId, accountId);
      
      res.json({ message: 'Folder deleted successfully' });
    } catch (error) {
      logger.error('Failed to delete folder:', error);
      res.status(500).json({ error: 'Failed to delete folder' });
    }
  }

  // Update folder settings
  static async updateFolderSettings(req: Request, res: Response): Promise<void> {
    try {
      const { folderId } = req.params;
      const accountId = (req as AuthenticatedRequest).user.accountId;
      
      if (!accountId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { allowWebsiteUsage, websiteUsagePermissions, description, tags } = req.body;

      if (!folderId) {
        res.status(400).json({ error: 'Folder ID is required' });
        return;
      }

      const updatedFolder = await MediaController.mediaRepository.updateFolderSettings(
        folderId,
        accountId,
        { allowWebsiteUsage, websiteUsagePermissions, description, tags }
      );

      res.json({
        data: updatedFolder,
        message: 'Folder settings updated successfully'
      });
    } catch (error) {
      logger.error('Failed to update folder settings:', error);
      res.status(500).json({ error: 'Failed to update folder settings' });
    }
  }

  // Grant website permission to a folder
  static async grantFolderWebsitePermission(req: Request, res: Response): Promise<void> {
    try {
      const { folderId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id; 
      
      if (!userId) {
        res.status(400).json({ error: 'User not authenticated' });
        return;
      }
      const accountId = (req as AuthenticatedRequest).user.accountId;
      
      if (!accountId) {
        res.status(400).json({ error: 'Account ID not found in request' });
        return;
      }
      const { websiteId, permissionType = 'read' } = req.body;
      
      if (!folderId || !websiteId) {
        res.status(400).json({
          error: 'Folder ID and Website ID are required'
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
        data: permission,
        message: 'Website permission granted successfully'
      
      });
    } catch (error) {
      logger.error('Failed to grant website permission:', error);
      res.status(500).json({
        error: 'Failed to grant website permission',
      });
    }
  }

  // Revoke website permission from a folder
  static async revokeFolderWebsitePermission(req: Request, res: Response): Promise<void> {
    try {
      const { folderId, websiteId } = req.params;
      
      if (!folderId || !websiteId) {
        res.status(400).json({
          error: 'Folder ID and Website ID are required'
        });
        return;
      }

      await MediaController.mediaRepository.revokeFolderWebsitePermission(folderId, websiteId);
      
      res.json({ message: 'Website permission revoked successfully'
       });
    } catch (error) {
      logger.error('Failed to revoke website permission:', error);
      res.status(500).json({
        error: 'Failed to revoke website permission',
      });
    }
  }

  // Get folder website permissions
  static async getFolderWebsitePermissions(req: Request, res: Response): Promise<void> {
    try {
      const { folderId } = req.params;
      
      if (!folderId) {
        res.status(400).json({
          error: 'Folder ID is required'
        });
        return;
      }

      const permissions = await MediaController.mediaRepository.getFolderWebsitePermissions(folderId);
      
      res.json(permissions
      );
    } catch (error) {
      logger.error('Failed to get folder permissions:', error);
      res.status(500).json({
        error: 'Failed to get folder permissions',
      });
    }
  }

  // Get all files in a folder
  static async getFiles(req: Request, res: Response): Promise<void> {
    try {
      const { folderId } = req.query;
      const accountId = (req as AuthenticatedRequest).user.accountId;
      
      if (!accountId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const files = await MediaController.mediaRepository.getFiles(accountId, folderId as string);
      const sanitizedFiles = MediaController.sanitizeMediaFiles(files);

      res.json(sanitizedFiles);
    } catch (error) {
      logger.error('Failed to get files:', error);
      res.status(500).json({ error: 'Failed to retrieve files' });
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
      const accountId = (req as AuthenticatedRequest).user.accountId;
      
      if (!accountId) {
        res.status(400).json({ error: 'Account ID not found in request' });
        return;
      }
      
      // Handle files from upload.any() - always comes as array
      const files: Express.Multer.File[] = Array.isArray(filesArray) ? filesArray : [];
      
      if (!files || files.length === 0) {
        res.status(400).json({
          error: 'No files provided'
        });
        return;
      }

      // Get folder information if folderId is provided
      let folderName: string | undefined;
      if (folderId) {
        const folder = await MediaController.mediaRepository.getFolderById(folderId, accountId);
        if (!folder) {
          res.status(400).json({ error: 'Folder not found' });
          return;
        }
        folderName = folder.name;
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

        console.debug('Processing file upload:', {
          originalname: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          fieldname: file.fieldname
        });

        // Generate unique file ID
        const fileId = uuidv4();

        // Upload to blob storage
        const blobResult = await blobStorageService.uploadFile(
          file.buffer,
          file.originalname,
          file.mimetype,
          accountId,
          fileId,
          folderName
        );

        console.debug('Blob upload result:', {
          id: blobResult.id,
          name: blobResult.name,
          originalName: blobResult.originalName,
          size: blobResult.size,
          url: blobResult.url
        });

        // Generate thumbnail for images
        let hasThumbnail = false;
        
        if (file.mimetype.startsWith('image/') && sharp) {
          try {
            // Generate thumbnail using Sharp
            const thumbnailBuffer = await sharp(file.buffer)
              .rotate() // Automatically rotates based on EXIF metadata
              .resize(300, 300, { 
                fit: 'inside',
                withoutEnlargement: true 
              })
              .jpeg({ quality: 80 })
              .toBuffer();

            // upload the thumbnail to blob storage
            const thumbnailBlobPath = await blobStorageService.uploadThumbnail(
              thumbnailBuffer,
              file.originalname,
              accountId,
              fileId,
              folderName
            );
            if (thumbnailBlobPath) {
              hasThumbnail = true;
              console.debug('Thumbnail uploaded at path:', thumbnailBlobPath);
            }
            else {
              logger.error('Thumbnail upload failed:', fileId);
            } 
          } catch (error) {
            logger.error('Failed to generate thumbnail:', error);
            // Continue without thumbnail if generation fails
          }
        }

        // Create database record with validated properties
        const fileData = {
          folderId: folderId || undefined,
          accountId: accountId,
          originalName: file.originalname || blobResult.originalName,
          fileName: BlobPathUtils.generateBlobFileName(fileId, file.originalname),
          blobUrl: blobResult.url, // store the dynamically computed url for record keeping
          fileSize: file.size || blobResult.size, // Use original file size, fallback to blob size
          mimeType: file.mimetype || blobResult.mimeType,
          fileType: (file.mimetype || blobResult.mimeType).startsWith('image/') ? 'image' as const : 'video' as const,
          hasThumbnail: hasThumbnail, 
          isPublic: false
        };

        logger.debug('Creating database record with:', fileData);

        const savedFile = await MediaController.mediaRepository.createFile(fileData);
                
        logger.debug('Database record created:', {
          id: savedFile.id,
          originalName: savedFile.originalName,
          fileName: savedFile.fileName,
          fileSize: savedFile.fileSize,
          mimeType: savedFile.mimeType,
          blobUrl: savedFile.blobUrl,
          hasThumbnail: savedFile.hasThumbnail
        });
        
        return savedFile;
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const sanitizedFiles = MediaController.sanitizeMediaFiles(uploadedFiles);
      
      res.status(201).json({
        data: sanitizedFiles,
        message: `${uploadedFiles.length} file(s) uploaded successfully`
      });
    } catch (error) {
      logger.error('Failed to upload files:', error);
      res.status(500).json({
        error: 'Failed to upload files',
      });
    }
  }

  // Delete a file
  static async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      const accountId = (req as AuthenticatedRequest).user.accountId;
      
      if (!accountId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!fileId) {
        res.status(400).json({ error: 'File ID is required' });
        return;
      }

      const fileToDelete = await MediaController.mediaRepository.getFileById(fileId, accountId);

      if (!fileToDelete) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      // Get folder name if file is in a folder
      let folderName: string | undefined;
      if (fileToDelete.folderId) {
        const folder = await MediaController.mediaRepository.getFolderById(fileToDelete.folderId, accountId);
        if (folder) {
          folderName = folder.name;
        }
      }

      await blobStorageService.deleteFile(accountId, fileToDelete.fileName, folderName);
      await MediaController.mediaRepository.deleteFile(accountId, fileId);

      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      logger.error('Failed to delete file:', error);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  }

  // FR-CMS-018: Check folder sharing permissions
  static async checkFolderSharingPermission(req: Request, res: Response): Promise<void> {
    try {
      const accountId = (req as AuthenticatedRequest).user.accountId;
      
      if (!accountId) {
        res.status(400).json({ error: 'Account ID not found in request' });
        return;
      }
      const { folderId, websiteId } = req.params;
      
      if (!folderId || !websiteId) {
        res.status(400).json({
          error: 'Folder ID and Website ID are required'
        });
        return;
      }

      // Check if user owns the folder or if it's shared
      const folders = await MediaController.mediaRepository.getFolders(accountId);
      const folder = folders.find(f => f.id === folderId);
      
      if (!folder) {
        res.status(404).json({
          error: 'Folder not found'
        });
        return;
      }

      // For now, assume access is granted if user owns the folder or if it's marked as shared
      // In a real implementation, you'd check specific sharing permissions
      const canAccess = folder.accountId === accountId || folder.allowWebsiteUsage;
      
      res.json({
        canAccess,
        isOwner: folder.accountId === accountId,
        sharedAt: folder.allowWebsiteUsage ? folder.createdAt : null
      });
    } catch (error) {
      logger.error('Failed to check folder sharing permission:', error);
      res.status(500).json({
        error: 'Failed to check folder permissions',
      });
    }
  }

  // FR-CMS-018: Generate responsive image variants
  static async generateResponsiveVariants(req: Request, res: Response): Promise<void> {
    try {
      const accountId = (req as AuthenticatedRequest).user.accountId;
      
      if (!accountId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { photoId } = req.params;
      const { breakpoints = [320, 640, 1024, 1920] } = req.body;

      if (!photoId) {
        res.status(400).json({ error: 'Photo ID is required' });
        return;
      }

      const files = await MediaController.mediaRepository.getFiles(accountId);
      const photo = files.find(f => f.id === photoId);

      if (!photo) {
        res.status(404).json({ error: 'Photo not found' });
        return;
      }

      const variants = await Promise.all(
        breakpoints.map(async (width: number) => {
          return {
            width,
            url: `${photo.blobUrl}?w=${width}`,
            size: Math.round(photo.fileSize * (width / 1920))
          };
        })
      );

      res.json({ variants });
    } catch (error) {
      logger.error('Failed to generate responsive variants:', error);
      res.status(500).json({ error: 'Failed to generate responsive variants' });
    }
  }

  // FR-CMS-018: Get folder permissions and sharing settings
  static async getFolderPermissions(req: Request, res: Response): Promise<void> {
    try {
      const accountId = (req as AuthenticatedRequest).user.accountId;
      
      if (!accountId) {
        res.status(400).json({ error: 'Account ID not found in request' });
        return;
      }
      const { folderId } = req.params;
      
      if (!folderId) {
        res.status(400).json({
          error: 'Folder ID is required'
        });
        return;
      }

      const folders = await MediaController.mediaRepository.getFolders(accountId);
      const folder = folders.find(f => f.id === folderId);
      
      if (!folder) {
        res.status(404).json({
          error: 'Folder not found'
        });
        return;
      }

      res.json({
        isShared: folder.allowWebsiteUsage || false,
        allowedWebsites: [], // This would be implemented based on your sharing model
        owner: {
          id: folder.accountId,
          name: 'User Name' // You'd get this from user repository
        }
      });
    } catch (error) {
      logger.error('Failed to get folder permissions:', error);
      res.status(500).json({
        error: 'Failed to get folder permissions',
      });
    }
  }

  // FR-CMS-018: Enhanced upload with auto-folder creation
  static async uploadWithAutoFolder(req: Request, res: Response): Promise<void> {
    try {
      const accountId = (req as AuthenticatedRequest).user.accountId;
      
      if (!accountId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { autoCreateFolder, folderId, generateThumbnails, optimizeForWeb } = req.body;

      if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      let targetFolderId = folderId;

      // Auto-create folder if specified
      if (autoCreateFolder && !folderId) {
        try {
          const existingFolders = await MediaController.mediaRepository.getFolders(accountId);
          const existingFolder = existingFolders.find(f => f.name === autoCreateFolder);

          if (existingFolder) {
            targetFolderId = existingFolder.id;
          } else {
            const newFolder = await MediaController.mediaRepository.createFolder(autoCreateFolder, accountId);
            targetFolderId = newFolder.id;
          }
        } catch (error) {
          logger.error('Failed to auto-create folder:', error);
        }
      }

      const file = req.file;

      // Get folder name if file is going into a folder
      let folderName: string | undefined;
      if (targetFolderId) {
        const folder = await MediaController.mediaRepository.getFolderById(targetFolderId, accountId);
        if (folder) {
          folderName = folder.name;
        }
      }

      // Generate unique file ID
      const fileId = uuidv4();

      const uploadResult = await blobStorageService.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        accountId,
        fileId,
        folderName
      );

      const mediaFile = await MediaController.mediaRepository.createFile({
        originalName: uploadResult.originalName,
        fileName: BlobPathUtils.generateBlobFileName(fileId, file.originalname),
        blobUrl: uploadResult.url, // Use the blob URL from upload result
        fileSize: uploadResult.size,
        mimeType: uploadResult.mimeType,
        fileType: uploadResult.type,
        folderId: targetFolderId || undefined,
        accountId: accountId,
        isPublic: false
      });

      // TODO: If generateThumbnails is true, generate thumbnails
      // TODO: If optimizeForWeb is true, optimize the image

      res.json({
        photo: mediaFile
      });
    } catch (error) {
      logger.error('Failed to upload with auto folder:', error);
      res.status(500).json({ error: 'Failed to upload file' });
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
      
      res.json({ message: 'Media service is healthy (database + blob storage)',
        timestamp: new Date().toISOString()
       });
    } catch (error) {
      logger.error('Media service health check failed:', error);
      res.status(500).json({
        error: 'Media service is unhealthy',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Serve media files securely through our backend
  static async serveFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      const { type = 'original' } = req.query;
      const accountId = (req as AuthenticatedRequest).user?.accountId;

      if (!accountId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!fileId) {
        res.status(400).json({ error: 'File ID is required' });
        return;
      }

      const file = await MediaController.mediaRepository.getFileById(fileId, accountId);

      if (!file) {
        res.status(404).json({ error: 'File not found or access denied' });
        return;
      }

      // Get folder name if file is in a folder
      let folderName: string | undefined;
      if (file.folderId) {
        const folder = await MediaController.mediaRepository.getFolderById(file.folderId, accountId);
        if (folder) {
          folderName = folder.name;
        }
      }

      // Determine if we're serving a thumbnail or original file
      const isThumbnail = type === 'thumbnail' && file.hasThumbnail;
      let mimeType: string;
      let fileBlobPath: string;

      if (isThumbnail) {
        mimeType = 'image/jpeg';
        fileBlobPath = BlobPathUtils.getThumbnailPath(file.accountId, file.fileName, folderName);
      } else {
        mimeType = file.mimeType;
        fileBlobPath = BlobPathUtils.getFilePath(file.accountId, file.fileName, folderName);
      }

      logger.debug('Serving file:', {
        fileId: file.id,
        originalName: file.originalName,
        fileName: fileBlobPath,
        mimeType: mimeType,
        isThumbnail: isThumbnail,
        folderName: folderName
      });

      const blobData = await blobStorageService.getFileBuffer(fileBlobPath);

      if (!blobData) {
        res.status(404).json({ error: 'File content not found' });
        return;
      }

      res.set({
        'Content-Type': mimeType,
        'Content-Length': blobData.length.toString(),
        'Cache-Control': 'private, max-age=3600',
        'ETag': `"${file.id}-${type}"`,
        'Content-Disposition': type === 'thumbnail' ? 'inline' : `inline; filename="${file.originalName}"`
      });

      res.send(blobData);
    } catch (error) {
      logger.error('Failed to serve file:', error);
      res.status(500).json({ error: 'Failed to serve file' });
    }
  }

  // Copy files to another folder
  static async copyFiles(req: Request, res: Response): Promise<void> {
    try {
      const { fileIds, targetFolderId } = req.body;
      const accountId = (req as AuthenticatedRequest).user.accountId;

      if (!accountId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
        res.status(400).json({ error: 'File IDs are required' });
        return;
      }

      if (!targetFolderId) {
        res.status(400).json({ error: 'Target folder ID is required' });
        return;
      }

      const targetFolder = await MediaController.mediaRepository.getFolderById(targetFolderId, accountId);
      if (!targetFolder) {
        res.status(404).json({ error: 'Target folder not found' });
        return;
      }

      const copiedFiles: MediaFile[] = [];
      const skippedFiles: Array<{fileId: string, originalName: string, reason: string}> = [];

      for (const fileId of fileIds) {
        const originalFile = await MediaController.mediaRepository.getFileById(fileId, accountId);
        if (!originalFile) {
          logger.warn(`File ${fileId} not found, skipping copy operation`);
          skippedFiles.push({
            fileId, 
            originalName: 'Unknown', 
            reason: 'File not found'
          });
          continue;
        }

        try {
          // Check if file with same originalName already exists in target folder
          const fileExists = await MediaController.mediaRepository.checkFileExistsByOriginalName(
            accountId, 
            targetFolderId, 
            originalFile.originalName
          );
          
          if (fileExists) {
            logger.warn(`File '${originalFile.originalName}' already exists in target folder, skipping copy operation`);
            skippedFiles.push({
              fileId, 
              originalName: originalFile.originalName, 
              reason: 'File with same name already exists in target folder'
            });
            continue;
          }

          // Get folder information for the original file
          let originalFolderName: string | undefined;
          if (originalFile.folderId) {
            const originalFolder = await MediaController.mediaRepository.getFolderById(originalFile.folderId, accountId);
            if (originalFolder) {
              originalFolderName = originalFolder.name;
            }
          }

          // Generate the original blob path using centralized utility
          // const originalFileName = BlobPathUtils.generateBlobFileName(originalFile.id, originalFile.originalName);
          // const originalBlobPath = BlobPathUtils.getFilePath(originalFile.accountId, originalFile.fileName, originalFolderName);
          
          // TODO: Update this blob copying operation to work with new structure
          // For now, this operation may not work correctly with the new blob structure
          // const tempFileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          // const originalBlobName = originalBlobPath;
          // const newBlobName = `${targetFolderId}/${tempFileId}`;
          // const newBlobUrl = `${process.env.BLOB_BASE_URL || 'http://localhost:10000/devstoreaccount1/media'}/${newBlobName}`;
          // Generate a new unique filename for the copied file to avoid conflicts
          const fileExtension = originalFile.originalName.split('.').pop() || '';
          const newFileName = `${uuidv4()}.${fileExtension}`;
          
          let newBlobUrl = '';
          let blobCopied = false;
          try {
            newBlobUrl = await blobStorageService.copyFile(accountId, originalFile.fileName, originalFolderName, targetFolder.name, newFileName);
            blobCopied = true;
            logger.info(`Successfully copied blob for file ${fileId}`);
          } catch (blobError) {
            logger.warn(`Blob not found for file ${fileId}, will create database record with new filename`);
            // Even if blob copy fails, we still use the new filename to avoid unique constraint violations
            // The blobUrl will be generated by the repository based on the new filename and folder
          }

          const newFile = await MediaController.mediaRepository.createFile({
            folderId: targetFolderId,
            accountId: accountId,
            originalName: originalFile.originalName,
            fileName: newFileName,
            blobUrl: newBlobUrl,
            fileSize: originalFile.fileSize,
            mimeType: originalFile.mimeType,
            fileType: originalFile.fileType,
            hasThumbnail: originalFile.hasThumbnail,
            tags: originalFile.tags,
            altText: originalFile.altText,
            isPublic: originalFile.isPublic
          });

          copiedFiles.push(newFile);
        } catch (copyError) {
          logger.error(`Failed to copy file ${fileId}:`, copyError);
          skippedFiles.push({
            fileId, 
            originalName: originalFile.originalName, 
            reason: 'Copy operation failed'
          });
        }
      }

      const sanitizedCopiedFiles = MediaController.sanitizeMediaFiles(copiedFiles);
      const response: any = { 
        success: true,
        message: `Successfully copied ${copiedFiles.length} file(s)`, 
        data: sanitizedCopiedFiles 
      };
      
      // Include skipped files information if any
      if (skippedFiles.length > 0) {
        response.skipped = skippedFiles;
        response.message += `, skipped ${skippedFiles.length} file(s)`;
      }
      
      res.json(response);
    } catch (error) {
      logger.error('Failed to copy files:', error);
      res.status(500).json({ success: false, error: 'Failed to copy files' });
    }
  }

  // Move files to another folder
  static async moveFiles(req: Request, res: Response): Promise<void> {
    try {
      const { fileIds, targetFolderId } = req.body;
      const accountId = (req as AuthenticatedRequest).user.accountId;

      if (!accountId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
        res.status(400).json({ error: 'File IDs are required' });
        return;
      }

      if (!targetFolderId) {
        res.status(400).json({ error: 'Target folder ID is required' });
        return;
      }

      // Verify target folder exists and user has access
      const targetFolder = await MediaController.mediaRepository.getFolderById(targetFolderId, accountId);
      if (!targetFolder) {
        res.status(404).json({ error: 'Target folder not found' });
        return;
      }

      const movedFiles: MediaFile[] = [];
      const skippedFiles: Array<{fileId: string, originalName: string, reason: string}> = [];
      let originalFolderName: string | undefined;

      for (const fileId of fileIds) {
        // Get the original file
        const originalFile = await MediaController.mediaRepository.getFileById(fileId, accountId);
        if (!originalFile) {
          logger.warn(`File ${fileId} not found, skipping move operation`);
          skippedFiles.push({
            fileId, 
            originalName: 'Unknown', 
            reason: 'File not found'
          });
          continue;
        }

        try {
          // Check if file with same originalName already exists in target folder
          const fileExists = await MediaController.mediaRepository.checkFileExistsByOriginalName(
            accountId, 
            targetFolderId, 
            originalFile.originalName
          );
          
          if (fileExists) {
            logger.warn(`File '${originalFile.originalName}' already exists in target folder, skipping move operation`);
            skippedFiles.push({
              fileId, 
              originalName: originalFile.originalName, 
              reason: 'File with same name already exists in target folder'
            });
            continue;
          }

          if (!originalFolderName && originalFile.folderId) {
            const originalFolder = await MediaController.mediaRepository.getFolderById(originalFile.folderId, accountId);
            if (originalFolder) {
              originalFolderName = originalFolder.name;
            }
          }
          // Generate blob paths dynamically since they're no longer stored in the database
          // const originalFolderName = originalFile.folderId ? await this.getFolderNameById(originalFile.folderId, accountId) : undefined;
          // const oldBlobName = BlobPathUtils.generateFilePath(originalFile.accountId, originalFile.id, originalFile.originalName, originalFolderName);
          
          const targetFolderName = targetFolder.name;
          // const newBlobName = BlobPathUtils.generateFilePath(originalFile.accountId, originalFile.id, originalFile.originalName, targetFolderName);

          logger.info(`Moving blob from ${originalFile.fileName} to ${targetFolderName} for file ${fileId}`);

          let blobMoved = false;
          try {
            const movedBlobPath = await blobStorageService.moveFile(accountId, originalFile.fileName, originalFolderName, targetFolderName);
            blobMoved = true;
            logger.debug(`Successfully moved blob for file ${fileId}`);
          } catch (blobError) {
            const errorMessage = blobError instanceof Error ? blobError.message : 'Unknown error';
            logger.warn(`Blob not found for file ${fileId}, updating database record only:`, errorMessage);
            // Continue with database update even if blob doesn't exist
          }

          // Move thumbnail if it exists
          if (originalFile.hasThumbnail) {
            await blobStorageService.moveThumbnail(
              originalFile.accountId,
              originalFile.fileName,
              originalFolderName,
              targetFolderName
            ).catch(thumbnailError => {
              const errorMessage = thumbnailError instanceof Error ? thumbnailError.message : 'Unknown error';
              logger.warn(`Failed to move thumbnail for file ${fileId}:`, errorMessage);
            });
          }

          // Update file record in database - just update the folderId
          const updatedFile = await MediaController.mediaRepository.updateFile(fileId, accountId, {
            folderId: targetFolderId
          });

          if (updatedFile) {
            movedFiles.push(updatedFile);
            logger.info(`Successfully updated database record for file ${fileId}`);
          }
        } catch (moveError) {
          logger.error(`Failed to move file ${fileId}:`, moveError);
          skippedFiles.push({
            fileId, 
            originalName: originalFile.originalName, 
            reason: 'Move operation failed'
          });
        }
      }

      const sanitizedMovedFiles = MediaController.sanitizeMediaFiles(movedFiles);
      const response: any = { 
        success: true,
        message: `Successfully moved ${movedFiles.length} file(s)`,
        data: sanitizedMovedFiles
      };
      
      // Include skipped files information if any
      if (skippedFiles.length > 0) {
        response.skipped = skippedFiles;
        response.message += `, skipped ${skippedFiles.length} file(s)`;
      }
      
      res.json(response);

    } catch (error) {
      logger.error('Failed to move files:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to move files',
      });
    }
  }
}
