import { Component, signal, inject, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MediaFile, MediaFolder, getSecureThumbnailUrl, getSecureMediaUrl } from '../models/media.model';
import { MediaService } from '../services/media.service';
import { NotificationService } from '../services/notification.service';
import { ConfirmationService } from '../services/confirmation.service';
import { ImageModalComponent } from '../components/image-modal/image-modal.component';
import { map, switchMap, forkJoin, of, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

// Remove duplicate interfaces since they're now in the shared model

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageModalComponent],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit, OnDestroy {
  // State management
  folders = signal<MediaFolder[]>([]);
  files = signal<MediaFile[]>([]);
  selectedFolderId = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  
  // UI state
  showCreateFolderModal = signal(false);
  showFolderSettingsModal = signal(false);
  selectedFolder = signal<MediaFolder | null>(null);
  newFolderName = signal('');
  dragOver = signal(false);
  uploading = signal(false);

  // Multi-selection state
  selectedFiles = signal<Set<string>>(new Set());
  selectionMode = signal(false);

  // Copy/Move modal state
  showCopyMoveModal = signal(false);
  copyMoveAction = signal<'copy' | 'move'>('copy');

  // Image modal state
  showImageModal = signal(false);
  modalImages = signal<MediaFile[]>([]);
  modalCurrentIndex = signal(0);

  // Thumbnail image URLs
  thumbnailUrls = signal<Map<string, string>>(new Map());
  
  // Computed property for available destination folders
  availableFolders = computed(() => {
    const current = this.selectedFolderId();
    return this.folders().filter(folder => folder.id !== current);
  });

  private notificationService = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);

  constructor(
    private mediaService: MediaService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadFolders();
  }

  // Folder management
  async loadFolders() {
    this.loading.set(true);
    this.error.set(null);
    
    try {
      const folders = await firstValueFrom(this.mediaService.getFolders());
      this.folders.set(folders || []);
    } catch (error) {
      console.error('Failed to load folders:', error);
      this.error.set('Failed to load media folders');
    } finally {
      this.loading.set(false);
    }
  }

  async createFolder() {
    const name = this.newFolderName().trim();
    if (!name) return;

    try {
      const newFolder = await firstValueFrom(this.mediaService.createFolder(name));
      
      if (newFolder) {
        this.folders.update(folders => [...folders, newFolder]);
        this.newFolderName.set('');
        this.showCreateFolderModal.set(false);
        this.notificationService.success(`Folder "${name}" created successfully`, undefined, 3000);
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
      this.notificationService.error('Failed to create folder. Please try again.');
    }
  }

  async deleteFolder(folderId: string) {
    const folder = this.folders().find(f => f.id === folderId);
    const folderName = folder ? folder.name : 'this folder';
    
    const confirmed = await this.confirmationService.confirm({
      title: 'Delete Folder',
      message: `Are you sure you want to delete "${folderName}" and all its contents? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) {
      return;
    }

    try {
      await firstValueFrom(this.mediaService.deleteFolder(folderId));
      this.folders.update(folders => folders.filter(f => f.id !== folderId));
      
      if (this.selectedFolderId() === folderId) {
        this.selectedFolderId.set(null);
        this.files.set([]);
      }
      
      this.notificationService.success(`Folder "${folderName}" deleted successfully`, undefined, 3000);
    } catch (error) {
      console.error('Failed to delete folder:', error);
      this.notificationService.error(`Failed to delete folder "${folderName}". Please try again.`);
    }
  }

  // File management
  async selectFolder(folderId: string) {
    this.selectedFolderId.set(folderId);
    
    // Set the selected folder object
    const folder = this.folders().find(f => f.id === folderId);
    this.selectedFolder.set(folder || null);
    
    await this.loadFiles(folderId);
  }

  // Helper method to update folder file count
  private updateFolderCount(folderId: string, countChange: number) {
    this.folders.update(folders => 
      folders.map(folder => 
        folder.id === folderId 
          ? { ...folder, fileCount: Math.max(0, folder.fileCount + countChange) }
          : folder
      )
    );

    // Also update selectedFolder if it matches
    const selectedFolder = this.selectedFolder();
    if (selectedFolder && selectedFolder.id === folderId) {
      this.selectedFolder.set({
        ...selectedFolder,
        fileCount: Math.max(0, selectedFolder.fileCount + countChange)
      });
    }
  }

  async loadFiles(folderId: string) {
    this.loading.set(true);
    
    try {
      const files = await firstValueFrom(this.mediaService.getFiles(folderId));
      this.files.set(files || []);
      
      // Load thumbnails for the files
      this.loadThumbnails(files || []);
    } catch (error) {
      console.error('Failed to load files:', error);
      this.error.set('Failed to load files');
    } finally {
      this.loading.set(false);
    }
  }

  private loadThumbnails(files: MediaFile[], clearExisting: boolean = true) {
    if (clearExisting) {
      // Clear existing thumbnails only when explicitly requested
      // Don't revoke blob URLs here since they're managed by MediaService
      // The MediaService handles blob URL lifecycle and caching
      this.thumbnailUrls.set(new Map());
    }

    // Load new thumbnails
    files.forEach(file => {
      // Skip if thumbnail already exists (unless we're clearing)
      if (!clearExisting && this.thumbnailUrls().has(file.id)) {
        return;
      }

      // Skip files without thumbnails - don't load full images
      if (!file.hasThumbnail) {
        console.log(`Skipping file ${file.fileName} - no thumbnail available`);
        return;
      }
      
      // Use MediaService to get thumbnail
      this.mediaService.getImageFromFile(file, 'thumbnail').subscribe({
        next: (blobUrl) => {
          // Store the blob URL in our map
          this.thumbnailUrls.update((map: Map<string, string>) => {
            const newMap = new Map(map);
            newMap.set(file.id, blobUrl);
            return newMap;
          });
        },
        error: (error) => {
          console.error(`Failed to load thumbnail for ${file.fileName}:`, error);
        }
      });
    });
  }

  // Get thumbnail URL for display
  getThumbnailUrl(fileId: string): string {
    return this.thumbnailUrls().get(fileId) || '';
  }

  async deleteFile(fileId: string) {
    const file = this.files().find(f => f.id === fileId);
    const fileName = file ? file.originalName : 'this file';
    
    const confirmed = await this.confirmationService.confirmDelete(fileName, 'file');

    if (!confirmed) {
      return;
    }

    try {
      await firstValueFrom(this.mediaService.deleteFile(fileId));
      
      // Find the file to get its folder ID before removing it
      const fileToDelete = this.files().find(f => f.id === fileId);
      
      this.files.update(files => files.filter(f => f.id !== fileId));
      
      // Update folder count
      if (fileToDelete?.folderId) {
        this.updateFolderCount(fileToDelete.folderId, -1);
      }
      
      this.notificationService.success(`File "${fileName}" deleted successfully`, undefined, 3000);
    } catch (error) {
      console.error('Failed to delete file:', error);
      this.notificationService.error(`Failed to delete file "${fileName}". Please try again.`);
    }
  }

  // Drag and drop file upload
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);

    const files = Array.from(event.dataTransfer?.files || []);
    this.uploadFiles(files);
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.uploadFiles(files);
  }

  async uploadFiles(files: File[]) {
    if (!this.selectedFolderId()) {
      this.error.set('Please select a folder first');
      return;
    }

    if (files.length === 0) return;

    // Filter for images and videos only
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (validFiles.length === 0) {
      this.error.set('Please select image or video files only');
      return;
    }

    this.uploading.set(true);
    const folderId = this.selectedFolderId();

    try {
      const result = await firstValueFrom(this.mediaService.uploadFiles(validFiles, {
        folderId: folderId || undefined
      }));
      
      if (result?.data) {
        this.files.update(files => [...files, ...result.data]);
        // Load thumbnails for the newly uploaded files (don't clear existing ones)
        this.loadThumbnails(result.data, false);
        
        // Update folder count
        if (folderId) {
          this.updateFolderCount(folderId, result.data.length);
        }
      }
    } catch (error) {
      console.error('Failed to upload files:', error);
      this.error.set('Failed to upload files');
    } finally {
      this.uploading.set(false);
    }
  }

  // UI helpers
  getFolderIcon(folder: MediaFolder): string {
    return folder.fileCount > 0 ? 'fas fa-folder' : 'fas fa-folder-open';
  }

  getFileIcon(file: MediaFile): string {
    return file.fileType === 'video' ? 'fas fa-video' : 'fas fa-image';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get secure thumbnail URL that goes through our backend
  getSecureThumbnailUrl(file: MediaFile): string {
    return getSecureThumbnailUrl(file) || '';
  }

  // Get secure original file URL that goes through our backend
  getSecureFileUrl(file: MediaFile): string {
    return getSecureMediaUrl(file, 'original');
  }

  openCreateFolderModal() {
    this.showCreateFolderModal.set(true);
    this.newFolderName.set('');
  }

  closeCreateFolderModal() {
    this.showCreateFolderModal.set(false);
    this.newFolderName.set('');
  }

  async copyFileUrl(file: MediaFile) {
    try {
      await navigator.clipboard.writeText(this.getSecureFileUrl(file));
      // Could add a toast notification here later
      console.log('File URL copied to clipboard');
    } catch (error) {
      console.error('Failed to copy URL to clipboard:', error);
      this.error.set('Failed to copy URL to clipboard');
    }
  }

  // Folder Settings Management
  openFolderSettingsModal(folder: MediaFolder) {
    this.selectedFolder.set(folder);
    this.showFolderSettingsModal.set(true);
  }

  closeFolderSettingsModal() {
    this.showFolderSettingsModal.set(false);
    this.selectedFolder.set(null);
  }

  async updateFolderSettings(settings: {
    allowWebsiteUsage: boolean;
    websiteUsagePermissions: 'private' | 'all_websites' | 'specific_websites';
    description?: string;
  }) {
    const folder = this.selectedFolder();
    if (!folder) return;

    try {
      const response = await firstValueFrom(this.http.put<{success: boolean, data: MediaFolder}>(
        `${environment.apiUrl}/media/folders/${folder.id}/settings`, 
        settings
      ));
      
      if (response?.data) {
        // Update the folder in the list
        this.folders.update(folders => 
          folders.map(f => f.id === folder.id ? response.data : f)
        );
        this.selectedFolder.set(response.data);
      }
    } catch (error) {
      console.error('Failed to update folder settings:', error);
      this.error.set('Failed to update folder settings');
    }
  }

  // Image modal methods
  openImageModal(clickedFile: MediaFile) {
    // Get all image files from current folder
    const imageFiles = this.files().filter(file => file.fileType === 'image');
    
    // Find the index of the clicked file
    const currentIndex = imageFiles.findIndex(file => file.id === clickedFile.id);
    
    this.modalImages.set(imageFiles);
    this.modalCurrentIndex.set(Math.max(0, currentIndex));
    this.showImageModal.set(true);
  }

  closeImageModal() {
    this.showImageModal.set(false);
  }

  onModalIndexChange(newIndex: number) {
    this.modalCurrentIndex.set(newIndex);
  }

  // Multi-selection methods
  toggleSelectionMode() {
    this.selectionMode.update(mode => !mode);
    if (!this.selectionMode()) {
      this.selectedFiles.set(new Set());
    }
  }

  toggleFileSelection(fileId: string, event?: Event) {
    if (event) {
      event.stopPropagation(); // Prevent opening the image modal
    }
    
    this.selectedFiles.update(selected => {
      const newSelected = new Set(selected);
      if (newSelected.has(fileId)) {
        newSelected.delete(fileId);
      } else {
        newSelected.add(fileId);
      }
      return newSelected;
    });
  }

  selectAllFiles() {
    const allFileIds = this.files().map(file => file.id);
    this.selectedFiles.set(new Set(allFileIds));
  }

  clearSelection() {
    this.selectedFiles.set(new Set());
  }

  isFileSelected(fileId: string): boolean {
    return this.selectedFiles().has(fileId);
  }

  get selectedCount(): number {
    return this.selectedFiles().size;
  }

  async deleteSelectedFiles() {
    const selectedIds = Array.from(this.selectedFiles());
    if (selectedIds.length === 0) return;

    const confirmed = await this.confirmationService.confirmBulkDelete(selectedIds.length, 'files');

    if (!confirmed) {
      return;
    }

    try {
      // Delete all selected files
      const deletePromises = selectedIds.map(fileId => 
        firstValueFrom(this.mediaService.deleteFile(fileId))
      );
      
      await Promise.all(deletePromises);

      // Remove deleted files from the list
      this.files.update(files => files.filter(file => !selectedIds.includes(file.id)));
      
      // Update folder count
      const folderId = this.selectedFolderId();
      if (folderId) {
        this.updateFolderCount(folderId, -selectedIds.length);
      }
      
      // Clear selection
      this.clearSelection();
      this.selectionMode.set(false);
      
    } catch (error) {
      console.error('Failed to delete files:', error);
      this.error.set('Failed to delete selected files');
    }
  }

  // Helper method to handle clicks on file cards
  onFileCardClick(file: MediaFile, event: Event) {
    if (this.selectionMode()) {
      this.toggleFileSelection(file.id, event);
    } else if (file.fileType === 'image') {
      this.openImageModal(file);
    }
  }

  // Copy/Move methods
  openCopyMoveModal(action: 'copy' | 'move') {
    this.copyMoveAction.set(action);
    this.showCopyMoveModal.set(true);
  }

  closeCopyMoveModal() {
    this.showCopyMoveModal.set(false);
  }

  async copyOrMoveFiles(targetFolderId: string) {
    const selectedIds = Array.from(this.selectedFiles());
    const action = this.copyMoveAction();
    
    if (selectedIds.length === 0) return;

    try {
      const endpoint = action === 'copy' ? 'copy' : 'move';
      const response = await firstValueFrom(this.http.post<{
        success: boolean, 
        data: MediaFile[], 
        message: string,
        skipped?: Array<{fileId: string, originalName: string, reason: string}>
      }>(
        `${environment.apiUrl}/media/files/${endpoint}`, 
        {
          fileIds: selectedIds,
          targetFolderId: targetFolderId
        }
      ));

      if (response?.success) {
        // Show detailed message including skipped files
        let message = response.message || `Successfully ${action}ed files`;
        
        if (response.skipped && response.skipped.length > 0) {
          // Create a detailed message about skipped files
          const skippedDetails = response.skipped.map(s => `• ${s.originalName}: ${s.reason}`).join('\n');
          
          // Show warning notification with detailed information
          this.notificationService.warning(
            `${message}\n\nSkipped files:\n${skippedDetails}`,
            `${action === 'copy' ? 'Copy' : 'Move'} completed with warnings`,
            8000 // 8 seconds for warning messages
          );
          
          console.warn('Some files were skipped:', response.skipped);
        } else {
          // Show success notification for fully successful operations
          this.notificationService.success(message, undefined, 3000);
        }
        
        if (action === 'move') {
          // Remove moved files from current folder (only successful ones)
          const successfulIds = response.data.map(f => f.id);
          this.files.update(files => files.filter(file => !successfulIds.includes(file.id)));
          
          // Update current folder count
          const currentFolderId = this.selectedFolderId();
          if (currentFolderId) {
            this.updateFolderCount(currentFolderId, -selectedIds.length);
          }
        }
        
        // Update target folder count
        this.updateFolderCount(targetFolderId, selectedIds.length);
        
        // Clear selection
        this.clearSelection();
        this.selectionMode.set(false);
        this.closeCopyMoveModal();
        
        // Refresh the current folder to reflect changes
        const currentFolderId = this.selectedFolderId();
        if (currentFolderId) {
          await this.loadFiles(currentFolderId);
        }
        
        // Refresh folder list to ensure counts are accurate
        await this.loadFolders();
        
        // Show success message
        const actionText = action === 'copy' ? 'copied' : 'moved';
        console.log(`Successfully ${actionText} ${selectedIds.length} files`);
      }
    } catch (error) {
      console.error(`Failed to ${action} files:`, error);
      this.notificationService.error(`Failed to ${action} selected files. Please try again.`);
    }
  }

  ngOnDestroy() {
    // Don't revoke blob URLs here since they're managed by MediaService
    // The MediaService handles blob URL lifecycle and caching properly
    this.thumbnailUrls.set(new Map());
  }
}
