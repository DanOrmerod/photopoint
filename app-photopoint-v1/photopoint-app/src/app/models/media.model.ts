/**
 * Shared media interfaces that match the backend API
 * These should be kept in sync with the backend MediaRepository interfaces
 */

export interface MediaFile {
  id: string;
  folderId?: string;
  accountId: string;
  originalName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileType: 'image' | 'video';
  hasThumbnail?: boolean;
  tags?: string[];
  altText?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaFolder {
  id: string;
  name: string;
  parentId?: string;
  accountId: string;
  allowWebsiteUsage: boolean;
  websiteUsagePermissions: 'private' | 'all_websites' | 'specific_websites';
  description?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  fileCount: number;
}

// Utility function to convert MediaFile to Photo for backward compatibility  
export function mediaFileToPhoto(mediaFile: MediaFile): any {
  return {
    id: mediaFile.id,
    filename: mediaFile.fileName,
    originalName: mediaFile.originalName,
    mimeType: mediaFile.mimeType,
    size: mediaFile.fileSize,
    url: '', // No longer available on frontend - use API endpoints for file access
    thumbnailUrl: '', // No longer stored in MediaFile - generated dynamically
    uploadedAt: mediaFile.createdAt,
    userId: mediaFile.accountId, // Map accountId to userId for backward compatibility
    metadata: {
      width: 0, // No longer stored in MediaFile
      height: 0, // No longer stored in MediaFile
      tags: mediaFile.tags
    }
  };
}

// Utility function to convert Photo to MediaFile
export function photoToMediaFile(photo: any): Partial<MediaFile> {
  return {
    id: photo.id,
    fileName: photo.filename,
    originalName: photo.originalName,
    mimeType: photo.mimeType,
    fileSize: photo.size,
    createdAt: photo.uploadedAt,
    accountId: photo.userId, // Map userId to accountId
    tags: photo.metadata?.tags,
    fileType: photo.mimeType.startsWith('image/') ? 'image' : 'video'
  };
}

// Utility functions for secure media serving
export function getSecureMediaUrl(file: MediaFile, type: 'original' | 'thumbnail' = 'original'): string {
  return `/api/v1/media/files/${file.id}/serve?type=${type}`;
}

export function getSecureThumbnailUrl(file: MediaFile): string | null {
  // Only return thumbnail URL if the file actually has a thumbnail
  // Don't fallback to original image to avoid loading full-size images in gallery
  return file.hasThumbnail 
    ? getSecureMediaUrl(file, 'thumbnail')
    : null; // Return null for files without thumbnails
}
