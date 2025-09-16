import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';

import { ImageModalComponent } from './image-modal.component';
import { MediaService } from '../../services/media.service';
import { MediaFile } from '../../models/media.model';

describe('ImageModalComponent', () => {
  let component: ImageModalComponent;
  let fixture: ComponentFixture<ImageModalComponent>;
  let mockMediaService: jasmine.SpyObj<MediaService>;

  const mockMediaFile: MediaFile = {
    id: 'test-id',
    originalName: 'test-image.jpg',
    fileName: 'test-image.jpg',
    fileSize: 1024,
    mimeType: 'image/jpeg',
    fileType: 'image',
    folderId: 'folder-1',
    accountId: 'account-1',
    hasThumbnail: true,
    isPublic: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    const mediaServiceSpy = jasmine.createSpyObj('MediaService', [
      'getImageFromFile',
      'getLoadingState',
      'revokeBlobUrl'
    ]);

    await TestBed.configureTestingModule({
      imports: [ImageModalComponent],
      providers: [
        { provide: MediaService, useValue: mediaServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageModalComponent);
    component = fixture.componentInstance;
    mockMediaService = TestBed.inject(MediaService) as jasmine.SpyObj<MediaService>;

    // Setup default mocks
    mockMediaService.getImageFromFile.and.returnValue(of('blob:test-url'));
    mockMediaService.getLoadingState.and.returnValue(of(false));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty state', () => {
    expect(component.images()).toEqual([]);
    expect(component.currentIndex()).toBe(0);
    expect(component.isVisible()).toBe(false);
    expect(component.imageError()).toBe(false);
  });

  it('should compute current image correctly', () => {
    component.images.set([mockMediaFile]);
    component.currentIndex.set(0);
    
    expect(component.currentImage()).toEqual(mockMediaFile);
  });

  it('should return null for current image when no images', () => {
    component.images.set([]);
    component.currentIndex.set(0);
    
    expect(component.currentImage()).toBeNull();
  });

  it('should compute navigation states correctly', () => {
    const images = [mockMediaFile, { ...mockMediaFile, id: 'test-2' }];
    component.images.set(images);
    
    // At first image
    component.currentIndex.set(0);
    expect(component.canGoPrevious()).toBe(false);
    expect(component.canGoNext()).toBe(true);
    
    // At last image
    component.currentIndex.set(1);
    expect(component.canGoPrevious()).toBe(true);
    expect(component.canGoNext()).toBe(false);
  });

  it('should navigate to previous image', () => {
    const images = [mockMediaFile, { ...mockMediaFile, id: 'test-2' }];
    component.images.set(images);
    component.currentIndex.set(1);
    
    spyOn(component.indexChange, 'emit');
    
    component.previous();
    
    expect(component.currentIndex()).toBe(0);
    expect(component.indexChange.emit).toHaveBeenCalledWith(0);
  });

  it('should navigate to next image', () => {
    const images = [mockMediaFile, { ...mockMediaFile, id: 'test-2' }];
    component.images.set(images);
    component.currentIndex.set(0);
    
    spyOn(component.indexChange, 'emit');
    
    component.next();
    
    expect(component.currentIndex()).toBe(1);
    expect(component.indexChange.emit).toHaveBeenCalledWith(1);
  });

  it('should not navigate beyond bounds', () => {
    component.images.set([mockMediaFile]);
    component.currentIndex.set(0);
    
    spyOn(component.indexChange, 'emit');
    
    // Try to go previous when at first
    component.previous();
    expect(component.currentIndex()).toBe(0);
    expect(component.indexChange.emit).not.toHaveBeenCalled();
    
    // Try to go next when at last
    component.next();
    expect(component.currentIndex()).toBe(0);
    expect(component.indexChange.emit).not.toHaveBeenCalled();
  });

  it('should close modal', () => {
    spyOn(component.close, 'emit');
    
    component.closeModal();
    
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should handle overlay click to close', () => {
    const event = new MouseEvent('click');
    Object.defineProperty(event, 'target', { value: event.currentTarget });
    
    spyOn(component, 'closeModal');
    
    component.onOverlayClick(event);
    
    expect(component.closeModal).toHaveBeenCalled();
  });

  it('should not close on content click', () => {
    const event = new MouseEvent('click');
    const target = document.createElement('div');
    const currentTarget = document.createElement('div');
    Object.defineProperty(event, 'target', { value: target });
    Object.defineProperty(event, 'currentTarget', { value: currentTarget });
    
    spyOn(component, 'closeModal');
    
    component.onOverlayClick(event);
    
    expect(component.closeModal).not.toHaveBeenCalled();
  });

  it('should format file size correctly', () => {
    expect(component.formatFileSize(0)).toBe('0 Bytes');
    expect(component.formatFileSize(1024)).toBe('1 KB');
    expect(component.formatFileSize(1048576)).toBe('1 MB');
    expect(component.formatFileSize(1073741824)).toBe('1 GB');
  });

  it('should handle keyboard navigation', () => {
    const images = [mockMediaFile, { ...mockMediaFile, id: 'test-2' }];
    component.images.set(images);
    component.currentIndex.set(0);
    component.isVisible.set(true);
    
    spyOn(component, 'previous');
    spyOn(component, 'next');
    spyOn(component, 'closeModal');
    
    // Test Escape key
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    spyOn(escapeEvent, 'preventDefault');
    component.onKeydown(escapeEvent);
    expect(escapeEvent.preventDefault).toHaveBeenCalled();
    expect(component.closeModal).toHaveBeenCalled();
    
    // Test Left arrow
    const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    spyOn(leftEvent, 'preventDefault');
    component.onKeydown(leftEvent);
    expect(leftEvent.preventDefault).toHaveBeenCalled();
    expect(component.previous).toHaveBeenCalled();
    
    // Test Right arrow
    const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    spyOn(rightEvent, 'preventDefault');
    component.onKeydown(rightEvent);
    expect(rightEvent.preventDefault).toHaveBeenCalled();
    expect(component.next).toHaveBeenCalled();
  });

  it('should load current image on change', () => {
    component.images.set([mockMediaFile]);
    component.currentIndex.set(0);
    component.isVisible.set(true); // Make modal visible to trigger effect
    
    // Trigger the effect
    fixture.detectChanges();
    
    expect(mockMediaService.getImageFromFile).toHaveBeenCalled();
  });

  it('should handle image loading error', () => {
    mockMediaService.getImageFromFile.and.returnValue(
      throwError(() => new Error('Failed to load'))
    );
    
    component.images.set([mockMediaFile]);
    component.currentIndex.set(0);
    component.isVisible.set(true); // Make modal visible to trigger effect
    
    fixture.detectChanges();
    
    expect(component.imageError()).toBe(true);
  });

  it('should cleanup blob URLs on destroy', () => {
    // Set up a current image URL first by updating the imageUrls map
    component.images.set([mockMediaFile]);
    component.currentIndex.set(0);
    
    // Manually trigger loading to set up a URL in the map
    // This simulates what would happen in real usage
    const testUrl = 'blob:test-url';
    (component as any).imageUrls.update((urls: Map<string, string>) => {
      urls.set(mockMediaFile.id, testUrl);
      return new Map(urls);
    });
    
    component.ngOnDestroy();
    
    expect(mockMediaService.revokeBlobUrl).toHaveBeenCalledWith(testUrl);
  });
});
