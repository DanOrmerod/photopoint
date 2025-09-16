import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { MediaFile, MediaFolder, getSecureMediaUrl } from '../models/media.model';
import { environment } from '../../environments/environment';

export interface MediaFilter {
  folderId?: string;
  websiteId?: string;
  includeShared?: boolean;
  fileType?: 'image' | 'video' | 'all';
  sortBy?: 'name' | 'date' | 'size';
  sortOrder?: 'asc' | 'desc';
}

interface ImageCacheEntry {
  blobUrl: string;
  loading$?: Observable<string>;
}

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  
  // Image caching and loading state management
  private imageCache = new Map<string, ImageCacheEntry>();
  private loadingStates = new Map<string, BehaviorSubject<boolean>>();

  // ========================================
  // FOLDER OPERATIONS
  // ========================================

  /**
   * Get available folders for media organization
   */
  getFolders(websiteId?: string): Observable<MediaFolder[]> {
    const params: Record<string, string> = {};
    if (websiteId) {
      params['websiteId'] = websiteId;
    }
    return this.http.get<MediaFolder[]>(`${this.apiUrl}/media/folders`, { params });
  }

  /**
   * Create a new folder for organizing media
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
   * Delete a folder
   */
  deleteFolder(folderId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/media/folders/${folderId}`);
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

  // ========================================
  // FILE OPERATIONS
  // ========================================

  /**
   * Get files from a specific folder or all files
   */
  getFiles(folderId?: string, filter: MediaFilter = {}): Observable<MediaFile[]> {
    const params: Record<string, string> = {};
    if (folderId) params['folderId'] = folderId;
    if (filter.websiteId) params['websiteId'] = filter.websiteId;
    if (filter.includeShared !== undefined) params['includeShared'] = filter.includeShared.toString();
    if (filter.fileType) params['fileType'] = filter.fileType;
    if (filter.sortBy) params['sortBy'] = filter.sortBy;
    if (filter.sortOrder) params['sortOrder'] = filter.sortOrder;
    
    return this.http.get<MediaFile[]>(`${this.apiUrl}/media/files`, { params });
  }

  /**
   * Upload files with automatic organization
   */
  uploadFiles(files: File[], options: {
    websiteName?: string;
    folderId?: string;
    generateThumbnails?: boolean;
    optimizeForWeb?: boolean;
  } = {}): Observable<{
    data: MediaFile[];
    message: string;
  }> {
    const formData = new FormData();
    
    // Add all files to FormData
    files.forEach(file => {
      formData.append('files', file);
    });
    
    // Auto-create folder if websiteName provided but no folderId
    if (options.websiteName && !options.folderId) {
      formData.append('autoCreateFolder', `${options.websiteName}-Images`);
    } else if (options.folderId) {
      formData.append('folderId', options.folderId);
    }

    // Optimization options
    if (options.generateThumbnails !== false) {
      formData.append('generateThumbnails', 'true');
    }
    
    if (options.optimizeForWeb) {
      formData.append('optimizeForWeb', 'true');
    }

    return this.http.post<{
      data: MediaFile[];
      message: string;
    }>(`${this.apiUrl}/media/upload`, formData);
  }

  /**
   * Delete a file
   */
  deleteFile(fileId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/media/files/${fileId}`);
  }

  /**
   * Search media with advanced filters
   */
  searchMedia(query: string, filter: MediaFilter = {}): Observable<MediaFile[]> {
    const params: Record<string, string> = { q: query };
    if (filter.folderId) params['folderId'] = filter.folderId;
    if (filter.websiteId) params['websiteId'] = filter.websiteId;
    if (filter.includeShared !== undefined) params['includeShared'] = filter.includeShared.toString();
    if (filter.fileType) params['fileType'] = filter.fileType;
    if (filter.sortBy) params['sortBy'] = filter.sortBy;
    if (filter.sortOrder) params['sortOrder'] = filter.sortOrder;
    
    return this.http.get<MediaFile[]>(`${this.apiUrl}/media/search`, { params });
  }

  // ========================================
  // IMAGE SERVING
  // ========================================

  /**
   * Get image URL for secure image serving
   * This method combines the functionality from ImageService
   */
  getImageUrl(fileId: string, type: 'original' | 'thumbnail' = 'original'): Observable<string> {
    const secureUrl = `/api/v1/media/files/${fileId}/serve?type=${type}`;
    return this.getImageUrlFromUrl(secureUrl);
  }

  /**
   * Get image from MediaFile object
   */
  getImageFromFile(file: MediaFile, type: 'original' | 'thumbnail' = 'original'): Observable<string> {
    const secureUrl = getSecureMediaUrl(file, type);
    return this.getImageUrlFromUrl(secureUrl);
  }

  /**
   * Internal method to fetch image from URL with caching
   */
  private getImageUrlFromUrl(secureUrl: string): Observable<string> {
    // Check cache first
    const cached = this.imageCache.get(secureUrl);
    if (cached?.blobUrl) {
      return of(cached.blobUrl);
    }

    // Check if already loading
    if (cached?.loading$) {
      return cached.loading$;
    }

    // Set loading state
    this.setLoadingState(secureUrl, true);

    // Create new observable for this request
    const loading$ = this.http.get(secureUrl, { 
      responseType: 'blob'
    }).pipe(
      map(blob => {
        // Create a blob URL for the image
        const blobUrl = URL.createObjectURL(blob);
        
        // Cache the blob URL
        this.imageCache.set(secureUrl, { blobUrl });
        
        // Clear loading state
        this.setLoadingState(secureUrl, false);
        
        return blobUrl;
      }),
      catchError(error => {
        console.error('Failed to load image:', error);
        this.setLoadingState(secureUrl, false);
        
        // Return a placeholder image
        return of('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmNWY5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY0NzQ4YiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg==');
      }),
      shareReplay(1)
    );

    // Cache the loading observable
    this.imageCache.set(secureUrl, { blobUrl: '', loading$ });

    return loading$;
  }

  /**
   * Get loading state for a specific image URL
   */
  getLoadingState(secureUrl: string): Observable<boolean> {
    if (!this.loadingStates.has(secureUrl)) {
      this.loadingStates.set(secureUrl, new BehaviorSubject<boolean>(false));
    }
    return this.loadingStates.get(secureUrl)!.asObservable();
  }

  /**
   * Set loading state for an image
   */
  private setLoadingState(secureUrl: string, loading: boolean): void {
    const subject = this.loadingStates.get(secureUrl);
    if (subject) {
      subject.next(loading);
    }
  }

  // ========================================
  // CACHE MANAGEMENT
  // ========================================

  /**
   * Clean up blob URLs to prevent memory leaks
   */
  revokeBlobUrl(url: string): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Clear the entire image cache
   */
  clearImageCache(): void {
    this.imageCache.forEach(entry => {
      if (entry.blobUrl && entry.blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(entry.blobUrl);
      }
    });
    this.imageCache.clear();
    
    // Clear loading states
    this.loadingStates.forEach(subject => subject.complete());
    this.loadingStates.clear();
  }

  // ========================================
  // RESPONSIVE IMAGE GENERATION
  // ========================================

  /**
   * Generate responsive image variants for a photo
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
}
