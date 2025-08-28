import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MediaFile, MediaFolder, photoToMediaFile } from '../models/media.model';
import { Photo } from './photo.service';

export interface MediaLibraryFilter {
  folderId?: string;
  websiteId?: string;
  includeShared?: boolean;
  fileType?: 'image' | 'video' | 'all';
  sortBy?: 'name' | 'date' | 'size';
  sortOrder?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class MediaLibraryService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1';

  /**
   * Get available folders for media organization
   * Implementation of FR-CMS-018: Media library folder selection
   */
  getFolders(websiteId?: string): Observable<MediaFolder[]> {
    const params: Record<string, string> = {};
    if (websiteId) {
      params['websiteId'] = websiteId;
    }
    return this.http.get<MediaFolder[]>(`${this.apiUrl}/media/folders`, { params });
  }

  /**
   * Get photos from media library with filtering options
   * Implementation of FR-CMS-018: Seamless integration with media library
   */
  getPhotos(filter: MediaLibraryFilter = {}): Observable<Photo[]> {
    const params: Record<string, string> = {};
    if (filter.folderId) params['folderId'] = filter.folderId;
    if (filter.websiteId) params['websiteId'] = filter.websiteId;
    if (filter.includeShared !== undefined) params['includeShared'] = filter.includeShared.toString();
    if (filter.fileType) params['fileType'] = filter.fileType;
    if (filter.sortBy) params['sortBy'] = filter.sortBy;
    if (filter.sortOrder) params['sortOrder'] = filter.sortOrder;
    
    return this.http.get<Photo[]>(`${this.apiUrl}/media/photos`, { params });
  }

  /**
   * Create a new folder for organizing images
   * Implementation of FR-CMS-018: Auto-creation of folders named "[WebsiteName]-Images"
   */
  createFolder(name: string, websiteId?: string, isShared: boolean = false): Observable<MediaFolder> {
    const folderData = {
      name,
      websiteId,
      isShared
    };
    return this.http.post<MediaFolder>(`${this.apiUrl}/media/folders`, folderData);
  }

  /**
   * Upload image with automatic organization
   * Implementation of FR-CMS-018: Direct image upload capability
   */
  uploadImage(file: File, options: {
    websiteName?: string;
    folderId?: string;
    generateThumbnails?: boolean;
    optimizeForWeb?: boolean;
  } = {}): Observable<{
    success: boolean;
    photo?: Photo;
    error?: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Auto-create folder if websiteName provided but no folderId
    if (options.websiteName && !options.folderId) {
      formData.append('autoCreateFolder', `${options.websiteName}-Images`);
    } else if (options.folderId) {
      formData.append('folderId', options.folderId);
    }

    // Optimization options for responsive design
    if (options.generateThumbnails !== false) {
      formData.append('generateThumbnails', 'true');
    }
    
    if (options.optimizeForWeb !== false) {
      formData.append('optimizeForWeb', 'true');
    }

    return this.http.post<{
      success: boolean;
      photo?: Photo;
      error?: string;
    }>(`${this.apiUrl}/media/upload`, formData);
  }

  /**
   * Check if a folder sharing setting allows website access
   * Implementation of FR-CMS-018: Only available if user has chosen to allow folder sharing
   */
  checkFolderSharingPermission(folderId: string, websiteId: string): Observable<{
    canAccess: boolean;
    isOwner: boolean;
    sharedAt?: Date;
  }> {
    return this.http.get<{
      canAccess: boolean;
      isOwner: boolean;
      sharedAt?: Date;
    }>(`${this.apiUrl}/media/folders/${folderId}/sharing/${websiteId}`);
  }

  /**
   * Generate responsive image variants for optimization
   * Implementation of FR-CMS-018: Responsive image optimization
   */
  generateResponsiveVariants(photoId: string, breakpoints: number[] = [320, 640, 1024, 1920]): Observable<{
    variants: Array<{
      width: number;
      url: string;
      size: number;
    }>;
  }> {
    return this.http.post<{
      variants: Array<{
        width: number;
        url: string;
        size: number;
      }>;
    }>(`${this.apiUrl}/media/photos/${photoId}/variants`, { breakpoints });
  }

  /**
   * Search media library with advanced filters
   * Implementation of FR-CMS-018: Organized image browsing
   */
  searchMedia(query: string, filter: MediaLibraryFilter = {}): Observable<Photo[]> {
    const params: Record<string, string> = { q: query };
    if (filter.folderId) params['folderId'] = filter.folderId;
    if (filter.websiteId) params['websiteId'] = filter.websiteId;
    if (filter.includeShared !== undefined) params['includeShared'] = filter.includeShared.toString();
    if (filter.fileType) params['fileType'] = filter.fileType;
    if (filter.sortBy) params['sortBy'] = filter.sortBy;
    if (filter.sortOrder) params['sortOrder'] = filter.sortOrder;
    
    return this.http.get<Photo[]>(`${this.apiUrl}/media/search`, { params });
  }

  /**
   * Get folder permissions and sharing settings
   */
  getFolderPermissions(folderId: string): Observable<{
    isShared: boolean;
    allowedWebsites: string[];
    owner: {
      id: string;
      name: string;
    };
  }> {
    return this.http.get<{
      isShared: boolean;
      allowedWebsites: string[];
      owner: {
        id: string;
        name: string;
      };
    }>(`${this.apiUrl}/media/folders/${folderId}/permissions`);
  }
}
