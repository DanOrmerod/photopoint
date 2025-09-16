import { getDbConnection } from '../database/connection';
import { Request } from 'mssql';
import { blobStorageService } from './blobStorageService';
import { logger } from '../utils/logger';
import { BlobPathUtils } from '../utils/blobPathUtils';

export class CleanupService {
  
  /**
   * Permanently delete files that have been soft-deleted for more than the specified number of days
   * @param daysOld Number of days a file must be soft-deleted before permanent deletion
   * @param batchSize Number of files to process in each batch
   */
  async cleanupDeletedFiles(daysOld: number = 30, batchSize: number = 100): Promise<void> {
    try {
      logger.info(`Starting cleanup of files deleted more than ${daysOld} days ago`);
      
      let totalCleaned = 0;
      let hasMore = true;
      
      while (hasMore) {
        const batch = await this.getDeletedFilesBatch(daysOld, batchSize);
        
        if (batch.length === 0) {
          hasMore = false;
          break;
        }
        
        for (const file of batch) {
          try {
            await this.permanentlyDeleteFile(file);
            totalCleaned++;
          } catch (error) {
            logger.error(`Failed to permanently delete file ${file.id}:`, error);
          }
        }
        
        // If we got fewer files than the batch size, we're done
        if (batch.length < batchSize) {
          hasMore = false;
        }
      }
      
      logger.info(`Cleanup completed. Permanently deleted ${totalCleaned} files.`);
    } catch (error) {
      logger.error('Failed to run cleanup job:', error);
      throw error;
    }
  }
  
  private async getDeletedFilesBatch(daysOld: number, batchSize: number) {
    const pool = await getDbConnection();
    const request = new Request(pool);
    
    const result = await request
      .input('daysOld', daysOld)
      .input('batchSize', batchSize)
      .query(`
        SELECT TOP (@batchSize)
          id, AccountId, FileName, BlobUrl,
          FolderId, HasThumbnail, UpdatedAt
        FROM MediaFile 
        WHERE IsDeleted = 1 
          AND UpdatedAt <= DATEADD(DAY, -@daysOld, GETUTCDATE())
        ORDER BY UpdatedAt ASC
      `);
    
    return result.recordset.map(record => ({
      id: record.id,
      accountId: record.AccountId,
      fileName: record.FileName,
      blobUrl: record.BlobUrl,
      folderId: record.FolderId,
      hasThumbnail: record.HasThumbnail,
      updatedAt: record.UpdatedAt
    }));
  }
  
  private async permanentlyDeleteFile(file: any): Promise<void> {
    try {
      // Get folder name for blob deletion
      let folderName: string | undefined;
      if (file.folderId) {
        const pool = await getDbConnection();
        const request = new Request(pool);
        const folderResult = await request
          .input('folderId', file.folderId)
          .input('accountId', file.accountId)
          .query('SELECT Name FROM MediaFolder WHERE id = @folderId AND AccountId = @accountId');
        
        if (folderResult.recordset.length > 0) {
          folderName = folderResult.recordset[0].Name;
        }
      }
      
      // Delete from blob storage (gracefully handle if already deleted)
      try {
        await blobStorageService.deleteFile(file.accountId, file.fileName, folderName);
        logger.debug(`Deleted blob for file ${file.id}`);
      } catch (blobError: any) {
        if (blobError.code === 'BlobNotFound') {
          logger.debug(`Blob already deleted for file ${file.id}`);
        } else {
          logger.warn(`Failed to delete blob for file ${file.id}:`, blobError);
        }
      }
      
      // Permanently delete from database
      const pool = await getDbConnection();
      const request = new Request(pool);
      await request
        .input('fileId', file.id)
        .input('accountId', file.accountId)
        .query('DELETE FROM MediaFile WHERE id = @fileId AND AccountId = @accountId');
      
      logger.debug(`Permanently deleted file ${file.id} from database`);
      
    } catch (error) {
      logger.error(`Failed to permanently delete file ${file.id}:`, error);
      throw error;
    }
  }
  
  /**
   * Get statistics about deleted files
   */
  async getDeletedFilesStats(): Promise<{
    totalDeleted: number,
    eligibleForCleanup: number,
    oldestDeletionDate: Date | null,
    estimatedStorageSize: number
  }> {
    const pool = await getDbConnection();
    const request = new Request(pool);
    
    const result = await request
      .input('daysOld', 30) // Default 30 days
      .query(`
        SELECT 
          COUNT(*) as TotalDeleted,
          SUM(CASE WHEN UpdatedAt <= DATEADD(DAY, -@daysOld, GETUTCDATE()) THEN 1 ELSE 0 END) as EligibleForCleanup,
          MIN(UpdatedAt) as OldestDeletionDate,
          SUM(FileSize) as EstimatedStorageSize
        FROM MediaFile 
        WHERE IsDeleted = 1
      `);
    
    const stats = result.recordset[0];
    return {
      totalDeleted: stats.TotalDeleted || 0,
      eligibleForCleanup: stats.EligibleForCleanup || 0,
      oldestDeletionDate: stats.OldestDeletionDate,
      estimatedStorageSize: stats.EstimatedStorageSize || 0
    };
  }
}

export const cleanupService = new CleanupService();
