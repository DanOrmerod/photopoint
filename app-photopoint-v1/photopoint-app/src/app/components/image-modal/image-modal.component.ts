import { Component, EventEmitter, Input, Output, computed, signal, effect, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaFile } from '../../models/media.model';
import { MediaService } from '../../services/media.service';

@Component({
  selector: 'app-image-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.css']
})
export class ImageModalComponent implements OnDestroy {
  @Input() images = signal<MediaFile[]>([]);
  @Input() currentIndex = signal(0);
  @Input() isVisible = signal(false);
  @Output() close = new EventEmitter<void>();
  @Output() indexChange = new EventEmitter<number>();

  imageError = signal(false);
  private imageUrls = signal<Map<string, string>>(new Map());

  // Computed properties
  currentImage = computed(() => {
    const imgs = this.images();
    const index = this.currentIndex();
    return imgs[index] || null;
  });

  currentImageUrl = computed(() => {
    const image = this.currentImage();
    if (!image) return null;
    
    const urls = this.imageUrls();
    return urls.get(image.id) || null;
  });

  canGoPrevious = computed(() => this.currentIndex() > 0);
  canGoNext = computed(() => this.currentIndex() < this.images().length - 1);

  // Check if image is loading - simplified to avoid observable in computed
  isImageLoading(): boolean {
    const image = this.currentImage();
    if (!image) return false;
    
    const urls = this.imageUrls();
    return !urls.has(image.id) && !this.imageError();
  }

  constructor(
    private mediaService: MediaService
  ) {
    // Load image when current image changes
    effect(() => {
      const image = this.currentImage();
      if (image && this.isVisible()) {
        this.loadCurrentImage();
      }
    });

    // Preload adjacent images
    effect(() => {
      const images = this.images();
      const index = this.currentIndex();
      
      if (this.isVisible()) {
        // Preload next image
        if (index + 1 < images.length) {
          this.preloadImage(images[index + 1]);
        }
        
        // Preload previous image
        if (index - 1 >= 0) {
          this.preloadImage(images[index - 1]);
        }
      }
    });
  }

  // Navigation methods
  previous(): void {
    const current = this.currentIndex();
    if (current > 0) {
      const newIndex = current - 1;
      this.currentIndex.set(newIndex);
      this.indexChange.emit(newIndex);
    }
  }

  next(): void {
    const current = this.currentIndex();
    const maxIndex = this.images().length - 1;
    if (current < maxIndex) {
      const newIndex = current + 1;
      this.currentIndex.set(newIndex);
      this.indexChange.emit(newIndex);
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  // Event handlers
  onImageLoad(): void {
    // Image loaded successfully - no specific action needed
  }

  onImageError(): void {
    this.imageError.set(true);
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.isVisible()) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.closeModal();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.previous();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.next();
        break;
    }
  }

  // Image loading logic
  private loadCurrentImage(): void {
    const image = this.currentImage();
    if (!image) return;

    this.imageError.set(false);

    // Check if we already have a blob URL for this image
    const urls = this.imageUrls();
    if (urls.has(image.id)) {
      return; // Already loaded
    }

    // Use the unified MediaService to get image URL
    this.mediaService.getImageFromFile(image, 'original').subscribe({
      next: (blobUrl: string) => {
        this.imageUrls.update(urls => {
          const newMap = new Map(urls);
          newMap.set(image.id, blobUrl);
          return newMap;
        });
      },
      error: (error: any) => {
        console.error('Failed to load image:', error);
        this.imageError.set(true);
      }
    });
  }

  private preloadImage(image: MediaFile): void {
    const urls = this.imageUrls();
    if (urls.has(image.id)) return; // Already loaded

    // Use the unified MediaService to preload the image
    this.mediaService.getImageFromFile(image, 'original').subscribe({
      next: (blobUrl: string) => {
        this.imageUrls.update(urls => {
          const newMap = new Map(urls);
          newMap.set(image.id, blobUrl);
          return newMap;
        });
      },
      error: (error: any) => {
        console.error('Failed to preload image:', error);
      }
    });
  }

  // Utility methods
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  ngOnDestroy(): void {
    // Clean up blob URLs using the unified MediaService
    const urls = this.imageUrls();
    urls.forEach(url => {
      this.mediaService.revokeBlobUrl(url);
    });
  }
}
