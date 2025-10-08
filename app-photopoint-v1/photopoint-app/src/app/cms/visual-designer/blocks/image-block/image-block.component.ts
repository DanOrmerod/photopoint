import { Component, Input, Output, EventEmitter, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseBlockData, BaseBlockComponent } from '../base-block.interface';
import { PhotoService } from '../../../../services/photo.service';
import { MediaService } from '../../../../services/media.service';
import { MediaFolder, MediaFile, getSecureMediaUrl, getSecureThumbnailUrl } from '../../../../models/media.model';
import { Photo } from '../../../../models';
import { switchMap, of, firstValueFrom } from 'rxjs';

interface TextOverlay {
  text: string;
  fontSize: string;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  position: {
    x: number; // percentage
    y: number; // percentage
  };
  opacity: number;
}

interface ImageContent {
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  alignment?: 'left' | 'center' | 'right';
  caption?: string;
  aspectRatio?: 'original' | '16:9' | '4:3' | '1:1' | 'custom';
  customAspectRatio?: string;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  textOverlays?: TextOverlay[];
  borders?: {
    width: string;
    style: string;
    color: string;
    radius: string;
  };
  shadows?: {
    offsetX: string;
    offsetY: string;
    blur: string;
    color: string;
  };
  overlay?: {
    color: string;
    opacity: number;
  };
  lazyLoading?: boolean;
  folderId?: string;
}

@Component({
  selector: 'app-image-block',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './image-block.component.html',
  styleUrls: ['./image-block.component.scss']
})
export class ImageBlockComponent implements BaseBlockComponent, OnDestroy {
  @Input() data!: BaseBlockData;
  @Input() isEditing = false;
  @Input() isSelected = false;
  @Input() isPreview = false;
  
  @Output() contentChange = new EventEmitter<any>();
  @Output() editingChange = new EventEmitter<boolean>();

  private photoService = inject(PhotoService);
  private mediaService = inject(MediaService);
  
  // Signals for authenticated image URLs
  private selectedMediaFile = signal<MediaFile | null>(null);
  private imageBlobUrl = signal<string | null>(null);
  
  // Computed property for the display image URL
  imageUrl = computed(() => {
    const content = this.getContent();
    const blobUrl = this.imageBlobUrl();
    
    // Use blob URL if available, otherwise fall back to direct src
    return blobUrl || content.src || '';
  });
  
  showMediaLibrary = false;
  showUploadDialog = false;
  showStylingPanel = false;
  showTextOverlayEditor = false;
  availableFolders: MediaFolder[] = [];
  availablePhotos: Photo[] = [];
  selectedTextOverlayIndex = -1;
  selectedFolderId?: string;

  getContent(): ImageContent {
    return this.data.content || {};
  }

  startEditing() {
    if (!this.isPreview) {
      this.editingChange.emit(true);
    }
  }

  finishEditing() {
    this.editingChange.emit(false);
  }

  // Basic content updates
  updateSrc(event: Event) {
    this.updateContent('src', (event.target as HTMLInputElement).value);
  }

  updateAlt(event: Event) {
    this.updateContent('alt', (event.target as HTMLInputElement).value);
  }

  updateWidth(event: Event) {
    this.updateContent('width', (event.target as HTMLInputElement).value);
  }

  updateHeight(event: Event) {
    this.updateContent('height', (event.target as HTMLInputElement).value);
  }

  updateAlignment(event: Event) {
    this.updateContent('alignment', (event.target as HTMLSelectElement).value as 'left' | 'center' | 'right');
  }

  updateCaption(event: Event) {
    this.updateContent('caption', (event.target as HTMLInputElement).value);
  }

  // Advanced features for FR-CMS-018
  updateAspectRatio(event: Event) {
    this.updateContent('aspectRatio', (event.target as HTMLSelectElement).value);
  }

  updateCustomAspectRatio(event: Event) {
    this.updateContent('customAspectRatio', (event.target as HTMLInputElement).value);
  }

  // Border styling
  updateBorderWidth(event: Event) {
    const content = this.getContent();
    const borders = { ...content.borders, width: (event.target as HTMLInputElement).value };
    this.updateContent('borders', borders);
  }

  updateBorderStyle(event: Event) {
    const content = this.getContent();
    const borders = { ...content.borders, style: (event.target as HTMLSelectElement).value };
    this.updateContent('borders', borders);
  }

  updateBorderColor(event: Event) {
    const content = this.getContent();
    const borders = { ...content.borders, color: (event.target as HTMLInputElement).value };
    this.updateContent('borders', borders);
  }

  updateBorderRadius(event: Event) {
    const content = this.getContent();
    const borders = { ...content.borders, radius: (event.target as HTMLInputElement).value };
    this.updateContent('borders', borders);
  }

  // Shadow styling
  updateShadowOffsetX(event: Event) {
    const content = this.getContent();
    const shadows = { ...content.shadows, offsetX: (event.target as HTMLInputElement).value };
    this.updateContent('shadows', shadows);
  }

  updateShadowOffsetY(event: Event) {
    const content = this.getContent();
    const shadows = { ...content.shadows, offsetY: (event.target as HTMLInputElement).value };
    this.updateContent('shadows', shadows);
  }

  updateShadowBlur(event: Event) {
    const content = this.getContent();
    const shadows = { ...content.shadows, blur: (event.target as HTMLInputElement).value };
    this.updateContent('shadows', shadows);
  }

  updateShadowColor(event: Event) {
    const content = this.getContent();
    const shadows = { ...content.shadows, color: (event.target as HTMLInputElement).value };
    this.updateContent('shadows', shadows);
  }

  // Overlay styling
  updateOverlayColor(event: Event) {
    const content = this.getContent();
    const overlay = { ...content.overlay, color: (event.target as HTMLInputElement).value };
    this.updateContent('overlay', overlay);
  }

  updateOverlayOpacity(event: Event) {
    const content = this.getContent();
    const overlay = { ...content.overlay, opacity: parseFloat((event.target as HTMLInputElement).value) };
    this.updateContent('overlay', overlay);
  }

  // Text overlay management
  addTextOverlay() {
    const content = this.getContent();
    const overlays = content.textOverlays || [];
    const newOverlay: TextOverlay = {
      text: 'New Text',
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      position: { x: 50, y: 50 },
      opacity: 1
    };
    this.updateContent('textOverlays', [...overlays, newOverlay]);
  }

  updateTextOverlay(index: number, field: keyof TextOverlay, value: any) {
    const content = this.getContent();
    const overlays = [...(content.textOverlays || [])];
    if (overlays[index]) {
      overlays[index] = { ...overlays[index], [field]: value };
      this.updateContent('textOverlays', overlays);
    }
  }

  updateTextOverlayText(index: number, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.updateTextOverlay(index, 'text', value);
  }

  updateTextOverlayFontSize(index: number, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.updateTextOverlay(index, 'fontSize', value);
  }

  updateTextOverlayFontFamily(index: number, event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.updateTextOverlay(index, 'fontFamily', value);
  }

  updateTextOverlayColor(index: number, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.updateTextOverlay(index, 'color', value);
  }

  updateTextOverlayBackgroundColor(index: number, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.updateTextOverlay(index, 'backgroundColor', value);
  }

  updateTextOverlayPositionX(index: number, event: Event) {
    const content = this.getContent();
    const overlays = [...(content.textOverlays || [])];
    if (overlays[index]) {
      const x = parseFloat((event.target as HTMLInputElement).value);
      overlays[index] = { ...overlays[index], position: { ...overlays[index].position, x } };
      this.updateContent('textOverlays', overlays);
    }
  }

  updateTextOverlayPositionY(index: number, event: Event) {
    const content = this.getContent();
    const overlays = [...(content.textOverlays || [])];
    if (overlays[index]) {
      const y = parseFloat((event.target as HTMLInputElement).value);
      overlays[index] = { ...overlays[index], position: { ...overlays[index].position, y } };
      this.updateContent('textOverlays', overlays);
    }
  }

  removeTextOverlay(index: number) {
    const content = this.getContent();
    const overlays = [...(content.textOverlays || [])];
    overlays.splice(index, 1);
    this.updateContent('textOverlays', overlays);
  }

  // Media library integration
  async openMediaLibrary() {
    this.showMediaLibrary = true;
    try {
      // Load available folders for the current website
      this.availableFolders = await firstValueFrom(this.mediaService.getFolders()) || [];
      
      // Load photos from selected folder or all photos
      const filter = this.selectedFolderId ? { folderId: this.selectedFolderId } : { includeShared: true };
      const mediaFiles = await firstValueFrom(this.mediaService.getFiles(this.selectedFolderId, filter)) || [];
      this.availablePhotos = mediaFiles.map(file => ({
        id: file.id,
        filename: file.fileName,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.fileSize,
        url: getSecureMediaUrl(file) || '',
        thumbnailUrl: getSecureThumbnailUrl(file) || '',
        uploadedAt: file.createdAt,
        userId: file.accountId
      }));
    } catch (error) {
      console.error('Error loading media library:', error);
    }
  }

  async onFolderSelected(folderId: string) {
    this.selectedFolderId = folderId;
    try {
      // Check if folder sharing allows access
      const permission = await firstValueFrom(this.mediaService.getFolderPermissions(folderId));
      
      if (permission?.isShared) {
        const mediaFiles = await firstValueFrom(this.mediaService.getFiles(folderId)) || [];
        this.availablePhotos = mediaFiles.map(file => ({
          id: file.id,
          filename: file.fileName,
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.fileSize,
          url: getSecureMediaUrl(file) || '',
          thumbnailUrl: getSecureThumbnailUrl(file) || '',
          uploadedAt: file.createdAt,
          userId: file.accountId
        }));
      } else {
        console.warn('Access denied to selected folder');
        this.availablePhotos = [];
      }
    } catch (error) {
      console.error('Error accessing folder:', error);
      this.availablePhotos = [];
    }
  }

  onFolderChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.onFolderSelected(select.value);
  }

  selectImageFromLibrary(photo: Photo) {
    // Convert Photo to MediaFile to handle property differences
    const mediaFile: MediaFile = {
      id: photo.id,
      originalName: photo.originalName,
      fileName: photo.filename,
      fileSize: photo.size,
      mimeType: photo.mimeType,
      fileType: 'image',
      folderId: '',
      accountId: photo.userId,
      hasThumbnail: true,
      isPublic: false,
      createdAt: photo.uploadedAt,
      updatedAt: photo.uploadedAt
    };
    
    // Load the image
    this.loadImage(mediaFile);
    
    // Store the secure URL in the content for reference, but don't use it directly for display
    const secureUrl = getSecureMediaUrl(mediaFile as MediaFile, 'original');
    this.updateContent('src', secureUrl);
    this.updateContent('alt', mediaFile.originalName);
    this.updateContent('lazyLoading', true); // Enable lazy loading for performance
    this.showMediaLibrary = false;
  }

  // Direct upload functionality
  async uploadImage(file: File, websiteName?: string) {
    try {
      const response = await firstValueFrom(this.mediaService.uploadFiles([file], {
        websiteName,
        generateThumbnails: true,
        optimizeForWeb: true
      }));
      
      if (response?.data && response.data.length > 0) {
        // Convert MediaFile to Photo for consistency
        const mediaFile = response.data[0];
        const photo: Photo = {
          id: mediaFile.id,
          filename: mediaFile.fileName,
          originalName: mediaFile.originalName,
          mimeType: mediaFile.mimeType,
          size: mediaFile.fileSize,
          url: getSecureMediaUrl(mediaFile) || '',
          thumbnailUrl: getSecureThumbnailUrl(mediaFile) || '',
          uploadedAt: mediaFile.createdAt,
          userId: mediaFile.accountId
        };
        this.selectImageFromLibrary(photo);
        
        // Generate responsive variants for better performance
        await firstValueFrom(this.mediaService.generateResponsiveVariants(mediaFile.id));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      // Get website name from context (this would come from parent component)
      const websiteName = 'CurrentWebsite'; // TODO: Get from website context
      this.uploadImage(input.files[0], websiteName);
    }
  }

  // Responsive preview methods
  getImageStyles() {
    const content = this.getContent();
    const styles: any = {
      width: content.width || 'auto',
      height: content.height || 'auto'
    };

    // Apply borders
    if (content.borders) {
      const b = content.borders;
      styles.border = `${b.width || '0'} ${b.style || 'solid'} ${b.color || 'transparent'}`;
      styles.borderRadius = b.radius || '0';
    }

    // Apply shadows
    if (content.shadows) {
      const s = content.shadows;
      styles.boxShadow = `${s.offsetX || '0'} ${s.offsetY || '0'} ${s.blur || '0'} ${s.color || 'transparent'}`;
    }

    // Apply aspect ratio
    if (content.aspectRatio && content.aspectRatio !== 'original') {
      styles.aspectRatio = content.aspectRatio === 'custom' ? content.customAspectRatio : content.aspectRatio;
      styles.objectFit = 'cover';
    }

    return styles;
  }

  getOverlayStyles() {
    const content = this.getContent();
    if (!content.overlay) return {};

    return {
      backgroundColor: content.overlay.color || 'transparent',
      opacity: content.overlay.opacity || 0
    };
  }

  // Load image when media file is selected
  private loadImage(mediaFile: MediaFile) {
    this.selectedMediaFile.set(mediaFile);
    
    // Get secure URL for the main image
    const secureUrl = getSecureMediaUrl(mediaFile);
    
    // Use the secure URL directly instead of creating blob URLs
    this.imageBlobUrl.set(secureUrl);
  }

  ngOnDestroy() {
    // No need to clean up blob URLs since we're using secure URLs directly
  }

  private updateContent(field: keyof ImageContent, value: any) {
    const content = { ...this.getContent(), [field]: value };
    this.contentChange.emit(content);
  }
}
