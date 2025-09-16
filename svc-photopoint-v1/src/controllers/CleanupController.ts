import { Request, Response } from 'express';
import { cleanupService } from '../services/cleanupService';
import { AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export class CleanupController {
  
  /**
   * Manual cleanup endpoint (admin only)
   */
  static async cleanupDeletedFiles(req: Request, res: Response): Promise<void> {
    try {
      const { daysOld = 30, batchSize = 100 } = req.body;
      
      // Validate admin permissions (you might want to add admin role check)
      const accountId = (req as AuthenticatedRequest).user.accountId;
      if (!accountId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      
      logger.info(`Manual cleanup initiated by account ${accountId}`);
      
      await cleanupService.cleanupDeletedFiles(daysOld, batchSize);
      
      res.json({ 
        message: 'Cleanup completed successfully',
        daysOld,
        batchSize
      });
      
    } catch (error) {
      logger.error('Manual cleanup failed:', error);
      res.status(500).json({ error: 'Cleanup failed' });
    }
  }
  
  /**
   * Get cleanup statistics
   */
  static async getCleanupStats(req: Request, res: Response): Promise<void> {
    try {
      const accountId = (req as AuthenticatedRequest).user.accountId;
      if (!accountId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      
      const stats = await cleanupService.getDeletedFilesStats();
      
      res.json({
        success: true,
        data: {
          totalDeletedFiles: stats.totalDeleted,
          filesEligibleForCleanup: stats.eligibleForCleanup,
          oldestDeletionDate: stats.oldestDeletionDate,
          estimatedStorageSize: stats.estimatedStorageSize,
          estimatedStorageSizeMB: Math.round((stats.estimatedStorageSize || 0) / (1024 * 1024) * 100) / 100
        }
      });
      
    } catch (error) {
      logger.error('Failed to get cleanup stats:', error);
      res.status(500).json({ error: 'Failed to get cleanup statistics' });
    }
  }
}
