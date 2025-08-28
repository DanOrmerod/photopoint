import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PhotoService, UploadResponse } from '../services/photo.service';

export interface PhotoUpload {
  file: File;
  preview: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  id: string;
  error?: string;
}

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss'
})
export class UploadComponent {
  private readonly photoService = inject(PhotoService);
  private readonly router = inject(Router);

  // Signals for reactive state
  photos = signal<PhotoUpload[]>([]);
  isDragOver = signal(false);
  isUploading = signal(false);

  /**
   * Handle drag over event
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  /**
   * Handle drag leave event
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  /**
   * Handle file drop
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files) {
      this.processFiles(Array.from(files));
    }
  }

  /**
   * Handle file input selection
   */
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(Array.from(input.files));
    }
  }

  /**
   * Process selected files and generate previews
   */
  private processFiles(files: File[]): void {
    const validFiles = files.filter(file => this.isValidImageFile(file));
    
    validFiles.forEach(file => {
      const photoUpload: PhotoUpload = {
        file,
        preview: '',
        progress: 0,
        status: 'uploading',
        id: this.generateId()
      };

      // Generate preview
      this.generatePreview(file).then(preview => {
        photoUpload.preview = preview;
        this.photos.update(photos => [...photos, photoUpload]);
      }).catch(error => {
        console.error('Error generating preview:', error);
        photoUpload.error = 'Failed to generate preview';
        photoUpload.status = 'error';
        this.photos.update(photos => [...photos, photoUpload]);
      });
    });
  }

  /**
   * Check if file is a valid image
   */
  private isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      alert(`Invalid file type: ${file.type}. Please select an image file.`);
      return false;
    }

    if (file.size > maxSize) {
      alert(`File too large: ${this.formatFileSize(file.size)}. Maximum size is 10MB.`);
      return false;
    }

    return true;
  }

  /**
   * Generate preview for image file
   */
  private generatePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      
      reader.onerror = () => reject(new Error('File reading error'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Remove a photo from the list
   */
  removePhoto(id: string): void {
    this.photos.update(photos => photos.filter(photo => photo.id !== id));
  }

  /**
   * Clear all photos
   */
  clearAll(): void {
    this.photos.set([]);
  }

  /**
   * Start the upload process for all photos
   */
  startUpload(): void {
    const photosToUpload = this.photos().filter(photo => photo.status === 'uploading');
    
    if (photosToUpload.length === 0) {
      return;
    }

    this.isUploading.set(true);

    // Upload all photos concurrently
    const uploadPromises = photosToUpload.map(photo => this.uploadSinglePhoto(photo));

    Promise.all(uploadPromises).finally(() => {
      this.isUploading.set(false);
    });
  }

  /**
   * Upload a single photo
   */
  private async uploadSinglePhoto(photo: PhotoUpload): Promise<void> {
    try {
      const response = await this.photoService.uploadPhoto(photo.file).toPromise();
      
      if (response?.success) {
        this.updatePhotoStatus(photo.id, 'success', 100);
      } else {
        this.updatePhotoStatus(photo.id, 'error', 0, response?.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      this.updatePhotoStatus(photo.id, 'error', 0, 'Network error occurred');
    }
  }

  /**
   * Update photo status and progress
   */
  private updatePhotoStatus(id: string, status: PhotoUpload['status'], progress: number, error?: string): void {
    this.photos.update(photos => 
      photos.map(photo => 
        photo.id === id 
          ? { ...photo, status, progress, error }
          : photo
      )
    );
  }

  /**
   * Calculate overall upload progress
   */
  getOverallProgress(): number {
    const allPhotos = this.photos();
    if (allPhotos.length === 0) return 0;

    const totalProgress = allPhotos.reduce((sum, photo) => sum + photo.progress, 0);
    return Math.round(totalProgress / allPhotos.length);
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Generate unique ID for photos
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Trigger file input click
   */
  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput?.click();
  }

  /**
   * Navigate back to previous page
   */
  goBack(): void {
    this.router.navigate(['/']);
  }
}
