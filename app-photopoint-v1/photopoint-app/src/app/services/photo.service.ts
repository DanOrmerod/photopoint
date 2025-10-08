import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Photo, UploadResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl; // Use environment config

  /**
   * Upload a single photo file
   */
  uploadPhoto(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file); // Match backend field name
    
    // Use correct media upload endpoint
    return this.http.post<UploadResponse>(`${this.apiUrl}/media/upload`, formData);
  }

  /**
   * Upload multiple photos
   */
  uploadPhotos(files: File[]): Observable<UploadResponse[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('photos', file);
    });
    
    return this.http.post<UploadResponse[]>(`${this.apiUrl}/photos/upload-multiple`, formData);
  }

  /**
   * Get all photos for the current user
   */
  getPhotos(): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${this.apiUrl}/photos`);
  }

  /**
   * Get a specific photo by ID
   */
  getPhoto(id: string): Observable<Photo> {
    return this.http.get<Photo>(`${this.apiUrl}/photos/${id}`);
  }

  /**
   * Delete a photo
   */
  deletePhoto(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/photos/${id}`);
  }

  /**
   * Update photo metadata
   */
  updatePhoto(id: string, updates: Partial<Photo>): Observable<Photo> {
    return this.http.patch<Photo>(`${this.apiUrl}/photos/${id}`, updates);
  }

  /**
   * Get photos by tags
   */
  getPhotosByTag(tag: string): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${this.apiUrl}/photos/tags/${tag}`);
  }

  /**
   * Search photos
   */
  searchPhotos(query: string): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${this.apiUrl}/photos/search?q=${encodeURIComponent(query)}`);
  }
}
