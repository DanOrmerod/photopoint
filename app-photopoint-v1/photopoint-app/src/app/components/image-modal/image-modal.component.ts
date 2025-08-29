import { Component, EventEmitter, Input, Output, computed, signal, effect, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaFile, getSecureMediaUrl } from '../../models/media.model';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-image-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" [class.visible]="isVisible()" (click)="onOverlayClick($event)">
      <div class="modal-content">
        <!-- Close button -->
        <button class="close-btn" (click)="closeModal()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Navigation buttons -->
        <button 
          class="nav-btn prev-btn" 
          [class.visible]="canGoPrevious()"
          (click)="previous()"
          [disabled]="!canGoPrevious()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <button 
          class="nav-btn next-btn" 
          [class.visible]="canGoNext()"
          (click)="next()"
          [disabled]="!canGoNext()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Image container -->
        <div class="image-container">
          @if (currentImageUrl()) {
            <img 
              [src]="currentImageUrl()" 
              [alt]="currentImage()!.originalName"
              class="modal-image"
              [class.loading]="!imageLoaded()"
              (load)="onImageLoad()"
              (error)="onImageError()">
          }
          
          @if (!imageLoaded() && currentImage()) {
            <div class="loading-spinner">
              <div class="spinner"></div>
            </div>
          }

          @if (imageError()) {
            <div class="error-message">
              Failed to load image
            </div>
          }
        </div>

        <!-- Image info -->
        <div class="image-info">
          @if (currentImage()) {
            <div class="image-details">
              <h3>{{ currentImage()!.originalName }}</h3>
              <p class="image-meta">
                {{ currentIndex() + 1 }} of {{ images().length }}
                @if (currentImage()!.fileSize) {
                  • {{ formatFileSize(currentImage()!.fileSize) }}
                }
              </p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }

    .modal-overlay.visible {
      opacity: 1;
      visibility: visible;
    }

    .modal-content {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      box-sizing: border-box;
    }

    .close-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 50%;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      transition: background-color 0.2s ease;
      z-index: 10;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 50%;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      transition: all 0.2s ease;
      opacity: 0;
      visibility: hidden;
      z-index: 10;
    }

    .nav-btn.visible {
      opacity: 1;
      visibility: visible;
    }

    .nav-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-50%) scale(1.1);
    }

    .nav-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .prev-btn {
      left: 2rem;
    }

    .next-btn {
      right: 2rem;
    }

    .image-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      max-width: 100%;
      max-height: calc(100vh - 200px);
    }

    .modal-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 8px;
      transition: opacity 0.3s ease;
    }

    .modal-image.loading {
      opacity: 0;
    }

    .loading-spinner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-message {
      color: rgba(255, 255, 255, 0.7);
      text-align: center;
      font-size: 1.1rem;
    }

    .image-info {
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.7);
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      text-align: center;
      max-width: 90%;
    }

    .image-details h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .image-meta {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.8;
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .modal-content {
        padding: 1rem;
      }

      .close-btn {
        top: 0.5rem;
        right: 0.5rem;
        width: 40px;
        height: 40px;
      }

      .nav-btn {
        width: 48px;
        height: 48px;
      }

      .prev-btn {
        left: 1rem;
      }

      .next-btn {
        right: 1rem;
      }

      .image-container {
        max-height: calc(100vh - 150px);
      }

      .image-info {
        bottom: 1rem;
        padding: 0.75rem 1rem;
      }

      .image-details h3 {
        font-size: 1rem;
      }

      .image-meta {
        font-size: 0.8rem;
      }
    }
  `]
})
export class ImageModalComponent implements OnDestroy {
  @Input() images = signal<MediaFile[]>([]);
  @Input() currentIndex = signal(0);
  @Input() isVisible = signal(false);
  @Output() close = new EventEmitter<void>();
  @Output() indexChange = new EventEmitter<number>();

  imageLoaded = signal(false);
  imageError = signal(false);
  private imageUrls = signal<Map<string, string>>(new Map());

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

  constructor(private imageService: ImageService) {
    // Load image when current image changes
    effect(() => {
      const image = this.currentImage();
      if (image) {
        this.loadCurrentImage();
      }
    });

    // Preload adjacent images
    effect(() => {
      const images = this.images();
      const index = this.currentIndex();
      
      // Preload next image
      if (index + 1 < images.length) {
        this.preloadImage(images[index + 1]);
      }
      
      // Preload previous image
      if (index - 1 >= 0) {
        this.preloadImage(images[index - 1]);
      }
    });
  }

  private async loadCurrentImage() {
    const image = this.currentImage();
    if (!image) return;

    this.imageLoaded.set(false);
    this.imageError.set(false);

    try {
      const secureUrl = getSecureMediaUrl(image);
      // Use the secure URL directly instead of creating blob URLs
      this.imageUrls.update(urls => new Map(urls).set(image.id, secureUrl));
    } catch (error) {
      console.error('Failed to load image:', error);
      this.imageError.set(true);
    }
  }

  private async preloadImage(image: MediaFile) {
    const urls = this.imageUrls();
    if (urls.has(image.id)) return; // Already loaded

    try {
      const secureUrl = getSecureMediaUrl(image);
      // Use the secure URL directly instead of creating blob URLs
      this.imageUrls.update(urls => new Map(urls).set(image.id, secureUrl));
    } catch (error) {
      console.error('Failed to preload image:', error);
    }
  }

  onImageLoad() {
    this.imageLoaded.set(true);
    this.imageError.set(false);
  }

  onImageError() {
    this.imageError.set(true);
    this.imageLoaded.set(false);
  }

  closeModal() {
    this.close.emit();
  }

  previous() {
    if (this.canGoPrevious()) {
      const newIndex = this.currentIndex() - 1;
      this.currentIndex.set(newIndex);
      this.indexChange.emit(newIndex);
    }
  }

  next() {
    if (this.canGoNext()) {
      const newIndex = this.currentIndex() + 1;
      this.currentIndex.set(newIndex);
      this.indexChange.emit(newIndex);
    }
  }

  onOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.isVisible()) return;

    switch (event.key) {
      case 'Escape':
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

  ngOnDestroy() {
    // No cleanup needed since we're using secure URLs directly
  }
}
