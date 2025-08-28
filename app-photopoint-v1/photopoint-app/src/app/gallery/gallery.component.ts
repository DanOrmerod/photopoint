import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MediaFile, MediaFolder } from '../models/media.model';

// Remove duplicate interfaces since they're now in the shared model

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {
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
    await this.loadFiles(folderId);
  }

  async loadFiles(folderId: string) {
    this.loading.set(true);
    
    try {
      const url = folderId ? `/api/v1/media/files?folderId=${folderId}` : '/api/v1/media/files';
      const response = await this.http.get<{success: boolean, data: MediaFile[]}>(url).toPromise();
      this.files.set(response?.data || []);
    } catch (error) {
      console.error('Failed to load files:', error);
      this.error.set('Failed to load files');
    } finally {
      this.loading.set(false);
    }
  }

  async deleteFile(fileId: string) {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await this.http.delete(`/api/v1/media/files/${fileId}`).toPromise();
      this.files.update(files => files.filter(f => f.id !== fileId));
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
      await navigator.clipboard.writeText(file.blobUrl);
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
}
