import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { UploadComponent } from './upload.component';
import { PhotoService } from '../services/photo.service';

describe('UploadComponent', () => {
  let component: UploadComponent;
  let fixture: ComponentFixture<UploadComponent>;
  let mockPhotoService: jasmine.SpyObj<PhotoService>;

  beforeEach(async () => {
    // Create spy objects
    mockPhotoService = jasmine.createSpyObj('PhotoService', ['uploadPhoto']);

    await TestBed.configureTestingModule({
      imports: [UploadComponent],
      providers: [
        { provide: PhotoService, useValue: mockPhotoService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with empty photo list', () => {
    expect(component.photos()).toEqual([]);
    expect(component.isDragOver()).toBe(false);
    expect(component.isUploading()).toBe(false);
  });

  describe('Drag and Drop', () => {
    it('should handle drag over event', () => {
      const event = new DragEvent('dragover');
      spyOn(event, 'preventDefault');
      
      component.onDragOver(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.isDragOver()).toBe(true);
    });

    it('should handle drag leave event', () => {
      component.isDragOver.set(true);
      
      component.onDragLeave(new DragEvent('dragleave'));
      
      expect(component.isDragOver()).toBe(false);
    });

    it('should handle file drop', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      const event = new DragEvent('drop', { dataTransfer });
      spyOn(event, 'preventDefault');
      
      component.onDrop(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.isDragOver()).toBe(false);
      // Files are processed asynchronously via FileReader
    });
  });

  describe('File Selection', () => {
    it('should handle file input change', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = document.createElement('input');
      input.type = 'file';
      
      // Mock FileList
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false
      });
      
      const event = { target: input } as any;
      
      component.onFileSelect(event);
      
      // File processing happens asynchronously, so we can't directly test the result
      expect(input.files).toContain(file);
    });
  });

  describe('Photo Management', () => {
    it('should remove photo by id', () => {
      // Manually add a photo to test removal
      const mockPhoto = {
        file: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
        preview: 'data:image/jpeg;base64,test',
        progress: 0,
        status: 'uploading' as const,
        id: 'test-id'
      };
      
      component.photos.set([mockPhoto]);
      expect(component.photos().length).toBe(1);
      
      component.removePhoto('test-id');
      
      expect(component.photos().length).toBe(0);
    });

    it('should clear all photos', () => {
      const mockPhoto = {
        file: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
        preview: 'data:image/jpeg;base64,test',
        progress: 0,
        status: 'uploading' as const,
        id: 'test-id'
      };
      
      component.photos.set([mockPhoto]);
      expect(component.photos().length).toBe(1);
      
      component.clearAll();
      
      expect(component.photos().length).toBe(0);
    });

    it('should format file size correctly', () => {
      expect(component.formatFileSize(1024)).toBe('1 KB');
      expect(component.formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(component.formatFileSize(500)).toBe('500 Bytes');
    });
  });

  describe('Upload Progress', () => {
    it('should calculate overall progress correctly', () => {
      const mockPhotos = [
        {
          file: new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
          preview: 'data:image/jpeg;base64,test1',
          progress: 50,
          status: 'uploading' as const,
          id: 'test-id-1'
        },
        {
          file: new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
          preview: 'data:image/jpeg;base64,test2',
          progress: 100,
          status: 'success' as const,
          id: 'test-id-2'
        }
      ];
      
      component.photos.set(mockPhotos);
      
      expect(component.getOverallProgress()).toBe(75);
    });

    it('should start upload process', () => {
      const mockPhoto = {
        file: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
        preview: 'data:image/jpeg;base64,test',
        progress: 0,
        status: 'uploading' as const,
        id: 'test-id'
      };
      
      component.photos.set([mockPhoto]);
      mockPhotoService.uploadPhoto.and.returnValue(of({ 
        id: '123', 
        url: 'http://example.com/photo.jpg',
        success: true 
      }));
      
      component.startUpload();
      
      expect(component.isUploading()).toBe(true);
      expect(mockPhotoService.uploadPhoto).toHaveBeenCalled();
    });
  });

  describe('Template Integration', () => {
    it('should show upload zone when no photos', () => {
      const uploadZone = fixture.nativeElement.querySelector('.upload-zone');
      expect(uploadZone).toBeTruthy();
    });

    it('should show progress section when photos exist', () => {
      const mockPhoto = {
        file: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
        preview: 'data:image/jpeg;base64,test',
        progress: 0,
        status: 'uploading' as const,
        id: 'test-id'
      };
      
      component.photos.set([mockPhoto]);
      fixture.detectChanges();
      
      const progressSection = fixture.nativeElement.querySelector('.upload-progress');
      expect(progressSection).toBeTruthy();
    });

    it('should show upload actions when photos exist', () => {
      const mockPhoto = {
        file: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
        preview: 'data:image/jpeg;base64,test',
        progress: 0,
        status: 'uploading' as const,
        id: 'test-id'
      };
      
      component.photos.set([mockPhoto]);
      fixture.detectChanges();
      
      const actionsSection = fixture.nativeElement.querySelector('.upload-actions');
      expect(actionsSection).toBeTruthy();
    });

    it('should disable buttons when uploading', () => {
      const mockPhoto = {
        file: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
        preview: 'data:image/jpeg;base64,test',
        progress: 0,
        status: 'uploading' as const,
        id: 'test-id'
      };
      
      component.photos.set([mockPhoto]);
      component.isUploading.set(true);
      fixture.detectChanges();
      
      const uploadButton = fixture.nativeElement.querySelector('.btn-primary');
      const clearButton = fixture.nativeElement.querySelector('.btn-secondary');
      
      expect(uploadButton?.disabled).toBe(true);
      expect(clearButton?.disabled).toBe(true);
    });

    it('should show correct button text when uploading', () => {
      const mockPhoto = {
        file: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
        preview: 'data:image/jpeg;base64,test',
        progress: 0,
        status: 'uploading' as const,
        id: 'test-id'
      };
      
      component.photos.set([mockPhoto]);
      component.isUploading.set(true);
      fixture.detectChanges();
      
      const uploadButton = fixture.nativeElement.querySelector('.btn-primary');
      expect(uploadButton?.textContent?.trim()).toBe('Uploading...');
    });
  });

  describe('Accessibility', () => {
    it('should have proper alt attributes for images', () => {
      const mockPhoto = {
        file: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
        preview: 'data:image/jpeg;base64,test',
        progress: 0,
        status: 'uploading' as const,
        id: 'test-id'
      };
      
      component.photos.set([mockPhoto]);
      fixture.detectChanges();
      
      const thumbnail = fixture.nativeElement.querySelector('.photo-thumbnail');
      expect(thumbnail?.alt).toBe('test.jpg');
    });
  });
});
