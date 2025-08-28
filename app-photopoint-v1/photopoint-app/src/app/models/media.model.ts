/**
 * Shared media interfaces that match the backend API
 * These should be kept in sync with the backend MediaRepository interfaces
 */

export interface MediaFile {
  id: string;
  folderId?: string;
  userId: string;
  originalName: string;
  fileName: string;
  blobPath: string;
  blobUrl: string;
  fileSize: number;
  mimeType: string;
  fileType: 'image' | 'video';
  width?: number;
  height?: number;
  durationSeconds?: number;
  thumbnailUrl?: string;
  thumbnailBlobPath?: string;
  hasThumbnail?: boolean;
  tags?: string[];
  altText?: string;
  description?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaFolder {
  id: string;
  name: string;
  parentId?: string;
  userId: string;
  allowWebsiteUsage: boolean;
  websiteUsagePermissions: 'private' | 'all_websites' | 'specific_websites';
  description?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  fileCount: number;
}

// Legacy Photo interface for backward compatibility - maps to MediaFile
export interface Photo {
  id: string;
  filename: string; // Maps to fileName
  originalName: string;
  mimeType: string;
  size: number; // Maps to fileSize
  url: string; // Maps to blobUrl
  thumbnailUrl?: string;
  uploadedAt: Date; // Maps to createdAt
  userId: string;
  metadata?: {
    width?: number;
    height?: number;
    camera?: string;
    location?: string;
    tags?: string[];
  };
}

// Utility function to convert MediaFile to Photo for backward compatibility
export function mediaFileToPhoto(mediaFile: MediaFile): Photo {
  return {
    id: mediaFile.id,
    filename: mediaFile.fileName,
    originalName: mediaFile.originalName,
    mimeType: mediaFile.mimeType,
    size: mediaFile.fileSize,
    url: mediaFile.blobUrl,
    thumbnailUrl: mediaFile.thumbnailUrl,
    uploadedAt: mediaFile.createdAt,
    userId: mediaFile.userId,
    metadata: {
      width: mediaFile.width,
      height: mediaFile.height,
      tags: mediaFile.tags
    }
  };
}

// Utility function to convert Photo to MediaFile
export function photoToMediaFile(photo: Photo): Partial<MediaFile> {
  return {
    id: photo.id,
    fileName: photo.filename,
    originalName: photo.originalName,
    mimeType: photo.mimeType,
    fileSize: photo.size,
    blobUrl: photo.url,
    thumbnailUrl: photo.thumbnailUrl,
    createdAt: photo.uploadedAt,
    userId: photo.userId,
    width: photo.metadata?.width,
    height: photo.metadata?.height,
    tags: photo.metadata?.tags,
    fileType: photo.mimeType.startsWith('image/') ? 'image' : 'video'
  };
}
