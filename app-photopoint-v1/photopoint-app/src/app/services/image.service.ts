import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private http = inject(HttpClient);
  private imageCache = new Map<string, string>(); // Cache blob URLs

  /**
   * Fetch an image with authentication and return a blob URL
   */
  getAuthenticatedImageUrl(secureUrl: string): Observable<string> {
    // Check cache first
    if (this.imageCache.has(secureUrl)) {
      return of(this.imageCache.get(secureUrl)!);
    }

    return this.http.get(secureUrl, { 
      responseType: 'blob',
      // Headers will be automatically added by the HTTP interceptor
    }).pipe(
      map(blob => {
        // Create a blob URL for the image
        const blobUrl = URL.createObjectURL(blob);
        
        // Cache the blob URL
        this.imageCache.set(secureUrl, blobUrl);
        
        return blobUrl;
      }),
      catchError(error => {
        console.error('Failed to load authenticated image:', error);
        // Return a placeholder or empty image
        return of('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmNWY5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY0NzQ4YiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg==');
      })
    );
  }

  /**
   * Clean up blob URLs to prevent memory leaks
   */
  revokeBlobUrl(url: string): void {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Clear the entire cache
   */
  clearCache(): void {
    this.imageCache.forEach(blobUrl => {
      if (blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    });
    this.imageCache.clear();
  }
}
