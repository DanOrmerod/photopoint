import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoService } from '../services/photo.service';
import { firstValueFrom } from 'rxjs';

interface UploadedPhoto {
  file: File;
  preview: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  id: string;
}

@Component({
  selector: 'app-upload',
  imports: [CommonModule],
  template: `
    <div class="upload-container">
      <div class="upload-header">
        <h2>Upload Photos</h2>
        <p>Drag and drop your photos here or click to browse</p>
      </div>

      <!-- Upload Zone -->
      <div 
        class="upload-zone"
        [class.drag-over]="isDragOver()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()">
        
        <div class="upload-content">
          <div class="upload-icon">📷</div>
          <h3>Drop photos here</h3>
          <p>or click to browse</p>
          <div class="supported-formats">
            <span>Supports: JPG, PNG, GIF, WEBP</span>
            <span>Max size: 10MB per file</span>
          </div>
        </div>

        <input 
          #fileInput
          type="file"
          multiple
          accept="image/*"
          (change)="onFileSelect($event)"
          style="display: none">
      </div>

      <!-- Upload Progress -->
      @if (photos().length > 0) {
        <div class="upload-progress">
          <div class="progress-header">
            <h3>Uploading {{ photos().length }} photos</h3>
            <div class="overall-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  [style.width.%]="getOverallProgress()">
                </div>
              </div>
              <span>{{ getOverallProgress() }}%</span>
            </div>
          </div>

          <div class="photo-list">
            @for (photo of photos(); track photo.id) {
              <div class="photo-item" [class]="photo.status">
                <img [src]="photo.preview" [alt]="photo.file.name" class="photo-thumbnail">
                <div class="photo-info">
                  <div class="photo-name">{{ photo.file.name }}</div>
                  <div class="photo-size">{{ formatFileSize(photo.file.size) }}</div>
                  <div class="photo-progress">
                    <div class="progress-bar small">
                      <div 
                        class="progress-fill" 
                        [style.width.%]="photo.progress">
                      </div>
                    </div>
                    <span class="status-text">
                      @switch (photo.status) {
                        @case ('uploading') { Uploading... }
                        @case ('success') { ✓ Complete }
                        @case ('error') { ✗ Error }
                      }
                    </span>
                  </div>
                </div>
                <button 
                  class="remove-btn"
                  (click)="removePhoto(photo.id)"
                  [disabled]="photo.status === 'uploading'">
                  ×
                </button>
              </div>
            }
          </div>
        </div>
      }

      <!-- Upload Actions -->
      @if (photos().length > 0) {
        <div class="upload-actions">
          <button 
            class="btn btn-primary"
            (click)="startUpload()"
            [disabled]="isUploading()">
            @if (isUploading()) {
              Uploading...
            } @else {
              Upload {{ photos().length }} Photos
            }
          </button>
          <button 
            class="btn btn-secondary"
            (click)="clearAll()"
            [disabled]="isUploading()">
            Clear All
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .upload-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .upload-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .upload-header h2 {
      font-size: 2rem;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .upload-header p {
      color: #666;
      font-size: 1.1rem;
    }

    .upload-zone {
      border: 3px dashed #ccc;
      border-radius: 12px;
      padding: 3rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #fafafa;
      margin-bottom: 2rem;
    }

    .upload-zone:hover,
    .upload-zone.drag-over {
      border-color: #667eea;
      background: #f0f2ff;
      transform: translateY(-2px);
    }

    .upload-content .upload-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .upload-content h3 {
      color: #333;
      margin-bottom: 0.5rem;
    }

    .upload-content p {
      color: #666;
      margin-bottom: 1.5rem;
    }

    .supported-formats {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      color: #888;
      font-size: 0.9rem;
    }

    .upload-progress {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .progress-header h3 {
      color: #333;
      margin: 0;
    }

    .overall-progress {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .progress-bar {
      width: 200px;
      height: 8px;
      background: #eee;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-bar.small {
      width: 150px;
      height: 4px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s ease;
    }

    .photo-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .photo-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #ccc;
    }

    .photo-item.uploading {
      border-left-color: #ffc107;
    }

    .photo-item.success {
      border-left-color: #28a745;
    }

    .photo-item.error {
      border-left-color: #dc3545;
    }

    .photo-thumbnail {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 6px;
    }

    .photo-info {
      flex: 1;
    }

    .photo-name {
      font-weight: 500;
      color: #333;
      margin-bottom: 0.25rem;
    }

    .photo-size {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .photo-progress {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .status-text {
      font-size: 0.9rem;
      font-weight: 500;
    }

    .remove-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: #dc3545;
      color: white;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.2rem;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .remove-btn:hover:not(:disabled) {
      background: #c82333;
    }

    .remove-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .upload-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn {
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #5a6268;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    @media (max-width: 768px) {
      .upload-container {
        padding: 1rem;
      }

      .upload-zone {
        padding: 2rem 1rem;
      }

      .progress-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .overall-progress {
        justify-content: space-between;
      }

      .photo-item {
        flex-direction: column;
        text-align: center;
      }

      .upload-actions {
        flex-direction: column;
      }
    }
  `]
})
export class UploadComponent {
  photos = signal<UploadedPhoto[]>([]);
  isDragOver = signal(false);
  isUploading = signal(false);

  constructor(private photoService: PhotoService) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    
    const files = event.dataTransfer?.files;
    if (files) {
      this.processFiles(Array.from(files));
    }
  }

  onFileSelect(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      this.processFiles(Array.from(target.files));
    }
  }

  private processFiles(files: File[]): void {
    const validFiles = files.filter(file => {
      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not a valid image file.`);
        return false;
      }
      
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Maximum file size is 10MB.`);
        return false;
      }
      
      return true;
    });

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photo: UploadedPhoto = {
          file,
          preview: e.target?.result as string,
          progress: 0,
          status: 'uploading',
          id: this.generateId()
        };
        
        this.photos.update(photos => [...photos, photo]);
      };
      reader.readAsDataURL(file);
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getOverallProgress(): number {
    const photos = this.photos();
    if (photos.length === 0) return 0;
    
    const totalProgress = photos.reduce((sum, photo) => sum + photo.progress, 0);
    return Math.round(totalProgress / photos.length);
  }

  removePhoto(id: string): void {
    this.photos.update(photos => photos.filter(photo => photo.id !== id));
  }

  clearAll(): void {
    this.photos.set([]);
  }

  startUpload(): void {
    this.isUploading.set(true);
    
    // Upload each photo using the PhotoService
    this.photos().forEach(photo => {
      this.uploadPhoto(photo);
    });
  }

  private async uploadPhoto(photo: UploadedPhoto): Promise<void> {
    try {
      // Update status to uploading
      this.photos.update(photos =>
        photos.map(p =>
          p.id === photo.id
            ? { ...p, status: 'uploading' as const, progress: 0 }
            : p
        )
      );

      // Call the photo service to upload (pass the file directly)
      const response = await firstValueFrom(this.photoService.uploadPhoto(photo.file));
      
      // Update progress to 100% and mark as success
      this.photos.update(photos =>
        photos.map(p =>
          p.id === photo.id
            ? { ...p, progress: 100, status: 'success' as const }
            : p
        )
      );

      // Check if all uploads are complete
      const allPhotos = this.photos();
      const allComplete = allPhotos.every(p => p.status === 'success' || p.status === 'error');
      if (allComplete) {
        this.isUploading.set(false);
        const successCount = allPhotos.filter(p => p.status === 'success').length;
        alert(`${successCount} of ${allPhotos.length} photos uploaded successfully!`);
        
        // Clear successful uploads after a delay
        setTimeout(() => {
          this.photos.update(photos => photos.filter(p => p.status === 'error'));
        }, 2000);
      }
      
    } catch (error) {
      console.error('Upload failed:', error);
      
      // Update status to error
      this.photos.update(photos =>
        photos.map(p =>
          p.id === photo.id
            ? { ...p, status: 'error' as const, progress: 0 }
            : p
        )
      );

      // Check if all uploads are complete (including errors)
      const allPhotos = this.photos();
      const allComplete = allPhotos.every(p => p.status === 'success' || p.status === 'error');
      if (allComplete) {
        this.isUploading.set(false);
      }
    }
  }
}
