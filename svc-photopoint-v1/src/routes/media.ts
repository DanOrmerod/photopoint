import { Router } from 'express';
import { MediaController } from '../controllers/MediaController';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Health check (no auth required)
router.get('/health', MediaController.healthCheck);

// Protected routes - require authentication
router.use(authenticateToken);

// Folder routes
router.get('/folders', MediaController.getFolders);
router.post('/folders', MediaController.createFolder);
router.delete('/folders/:folderId', MediaController.deleteFolder);

// Folder settings routes
router.put('/folders/:folderId/settings', MediaController.updateFolderSettings);
router.post('/folders/:folderId/permissions/websites', MediaController.grantFolderWebsitePermission);
router.delete('/folders/:folderId/permissions/websites/:websiteId', MediaController.revokeFolderWebsitePermission);
router.get('/folders/:folderId/permissions', MediaController.getFolderWebsitePermissions);

// File routes
router.get('/files', MediaController.getFiles);
router.get('/photos', MediaController.getFiles); // Alias for photos
router.get('/files/:fileId/serve', MediaController.serveFile); // Secure file serving
router.post('/upload', MediaController.uploadAnyField, MediaController.handleFileUpload);
router.post('/upload-multiple', MediaController.uploadFiles, MediaController.handleFileUpload);
router.delete('/files/:fileId', MediaController.deleteFile);

// File operations
router.post('/files/copy', MediaController.copyFiles);
router.post('/files/move', MediaController.moveFiles);

export default router;
