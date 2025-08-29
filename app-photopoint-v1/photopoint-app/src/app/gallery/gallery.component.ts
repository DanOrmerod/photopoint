import { Component, signal, inject, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MediaFile, MediaFolder, getSecureThumbnailUrl, getSecureMediaUrl } from '../models/media.model';
import { ImageModalComponent } from '../components/image-modal/image-modal.component';
import { map, switchMap, forkJoin, of } from 'rxjs';

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

  // Authenticated image URLs
  authenticatedThumbnails = signal<Map<string, string>>(new Map());
  
  // Computed property for available destination folders
  availableFolders = computed(() => {
    const current = this.selectedFolderId();
    return this.folders().filter(folder => folder.id !== current);
  });

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadFolders();
  }

  // Folder management
  async loadFolders() {
    this.loading.set(true);
    this.error.set(null);
    
    try {
      const response = await this.http.get<{success: boolean, data: MediaFolder[]}>('/api/v1/media/folders').toPromise();
      this.folders.set(response?.data || []);
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
      const response = await this.http.post<{success: boolean, data: MediaFolder}>('/api/v1/media/folders', { 
        name
      }).toPromise();
      
      if (response?.data) {
        this.folders.update(folders => [...folders, response.data]);
        this.newFolderName.set('');
        this.showCreateFolderModal.set(false);
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
      this.error.set('Failed to create folder');
    }
  }

  async deleteFolder(folderId: string) {
    if (!confirm('Are you sure you want to delete this folder and all its contents?')) {
      return;
    }

    try {
      await this.http.delete(`/api/v1/media/folders/${folderId}`).toPromise();
      this.folders.update(folders => folders.filter(f => f.id !== folderId));
      
      if (this.selectedFolderId() === folderId) {
        this.selectedFolderId.set(null);
        this.files.set([]);
      }
    } catch (error) {
      console.error('Failed to delete folder:', error);
      this.error.set('Failed to delete folder');
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
      const url = folderId ? `/api/v1/media/files?folderId=${folderId}` : '/api/v1/media/files';
      const response = await this.http.get<{success: boolean, data: MediaFile[]}>(url).toPromise();
      const files = response?.data || [];
      this.files.set(files);
      
      // Load authenticated thumbnails for the files
      this.loadAuthenticatedThumbnails(files);
    } catch (error) {
      console.error('Failed to load files:', error);
      this.error.set('Failed to load files');
    } finally {
      this.loading.set(false);
    }
  }

  private loadAuthenticatedThumbnails(files: MediaFile[], clearExisting: boolean = true) {
    if (clearExisting) {
      // Clear existing thumbnails only when explicitly requested
      this.authenticatedThumbnails.set(new Map());
    }

    // Load new thumbnails
    files.forEach(file => {
      // Skip if thumbnail already exists (unless we're clearing)
      if (!clearExisting && this.authenticatedThumbnails().has(file.id)) {
        return;
      }

      const secureUrl = getSecureThumbnailUrl(file);
      
      // Skip files without thumbnails - don't load full images
      if (!secureUrl) {
        console.log(`Skipping file ${file.fileName} - no thumbnail available`);
        return;
      }
      
      // Use the secure URL directly instead of creating blob URLs
      this.authenticatedThumbnails.update(map => {
        const newMap = new Map(map);
        newMap.set(file.id, secureUrl);
        return newMap;
      });
    });
  }

  // Get authenticated thumbnail URL for display
  getThumbnailUrl(fileId: string): string {
    return this.authenticatedThumbnails().get(fileId) || '';
  }

  async deleteFile(fileId: string) {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await this.http.delete(`/api/v1/media/files/${fileId}`).toPromise();
      
      // Find the file to get its folder ID before removing it
      const fileToDelete = this.files().find(f => f.id === fileId);
      
      this.files.update(files => files.filter(f => f.id !== fileId));
      
      // Update folder count
      if (fileToDelete?.folderId) {
        this.updateFolderCount(fileToDelete.folderId, -1);
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      this.error.set('Failed to delete file');
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
      const formData = new FormData();
      
      // Add all files to FormData
      validFiles.forEach(file => {
        formData.append('files', file);
      });
      
      if (folderId) {
        formData.append('folderId', folderId);
      }

      const response = await this.http.post<{success: boolean, data: MediaFile[]}>('/api/v1/media/upload', formData).toPromise();
      if (response?.data) {
        this.files.update(files => [...files, ...response.data]);
        // Load authenticated thumbnails for the newly uploaded files (don't clear existing ones)
        this.loadAuthenticatedThumbnails(response.data, false);
        
        // Update folder count
        if (folderId) {
          this.updateFolderCount(folderId, response.data.length);
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
      const response = await this.http.put<{success: boolean, data: MediaFolder}>(
        `/api/v1/media/folders/${folder.id}/settings`, 
        settings
      ).toPromise();
      
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

    if (!confirm(`Are you sure you want to delete ${selectedIds.length} file(s)?`)) {
      return;
    }

    try {
      // Delete all selected files
      const deletePromises = selectedIds.map(fileId => 
        this.http.delete(`/api/v1/media/files/${fileId}`).toPromise()
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
      const response = await this.http.post<{success: boolean, data: MediaFile[]}>(
        `/api/v1/media/files/${endpoint}`, 
        {
          fileIds: selectedIds,
          targetFolderId: targetFolderId
        }
      ).toPromise();

      if (response?.success) {
        if (action === 'move') {
          // Remove moved files from current folder
          this.files.update(files => files.filter(file => !selectedIds.includes(file.id)));
          
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
        
        // Show success message
        const actionText = action === 'copy' ? 'copied' : 'moved';
        console.log(`Successfully ${actionText} ${selectedIds.length} files`);
      }
    } catch (error) {
      console.error(`Failed to ${action} files:`, error);
      this.error.set(`Failed to ${action} selected files`);
    }
  }

  ngOnDestroy() {
    // No blob URL cleanup needed since we're using secure URLs directly
    this.authenticatedThumbnails.set(new Map());
  }
}
