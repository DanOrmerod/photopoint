/**
 * Centralized blob storage path utilities
 * This ensures consistent path generation across all blob storage operations
 */

export class BlobPathUtils {
  static thumbnailSuffix = '_thumbnail.jpg';
  /**
   * Generate the standard blob path for a file
   * Format: {accountId}/Media/{folderName|Root}/{fileId}.{extension}
   */
  static generateFilePath(
    accountId: string, 
    fileId: string, 
    originalName: string, 
    folderName?: string
  ): string {
    const extension = originalName.split('.').pop();
    const folder = folderName || 'Root';
    return `${accountId}/Media/${folder}/${fileId}.${extension}`;
  }

  /**
   * Generate the standard blob path for a file
   * Format: {accountId}/Media/{folderName|Root}/{fileName}
   */
  static getFilePath(
    accountId: string, 
    fileName: string, 
    folderName?: string
  ): string {
    const folder = folderName || 'Root';
    return `${accountId}/Media/${folder}/${fileName}`;
  }

  /**
   * Generate the thumbnail path for a file
   * Format: {accountId}/Media/{folderName|Root}/{fileId}_thumbnail.jpg
   */
  static generateThumbnailPath(
    accountId: string, 
    fileId: string, 
    folderName?: string
  ): string {
    const folder = folderName || 'Root';
    return `${accountId}/Media/${folder}/${fileId}${this.thumbnailSuffix}`;
  }

  /**
   * Generate the thumbnail file name for a file
   * Format: {accountId}/Media/{folderName|Root}/{fileId}_thumbnail.jpg
   */
  static getThumbnailPath(
    accountId: string, 
    fileName: string,
    folderName?: string
  ): string {
    const fileId = this.getFileId(fileName);
    const folder = folderName || 'Root';
    return `${accountId}/Media/${folder}/${fileId}${this.thumbnailSuffix}`;
  }

  /**
   * Generate a blob URL from the blob service client
   */
  static generateBlobUrl(containerName: string, blobPath: string, blobServiceUrl: string): string {
    return `${blobServiceUrl}/${containerName}/${blobPath}`;
  }

  /**
   * Extract file extension from filename
   */
  static getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    // If there's no extension or just one part, return empty string
    if (parts.length <= 1) {
      return '';
    }
    return parts.pop() || '';
  }

  /**
   * Generate the full blob name using only the file ID and extension
   */
  static generateBlobFileName(fileId: string, originalName: string): string {
    const extension = this.getFileExtension(originalName);
    return `${fileId}.${extension}`;
  }

  /**
   * Get the file id from the fileName
   */
  private static getFileId(fileName: string): string {
    const parts = fileName.split('.');
    if (parts.length < 2) {
      return '';
    }
    return parts[0];
  }

  
}
