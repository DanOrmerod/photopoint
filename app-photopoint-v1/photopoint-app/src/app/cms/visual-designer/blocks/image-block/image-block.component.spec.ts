import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ImageBlockComponent } from './image-block.component';
import { MediaService } from '../../../../services/media.service';
import { PhotoService } from '../../../../services/photo.service';

describe('ImageBlockComponent', () => {
  let component: ImageBlockComponent;
  let fixture: ComponentFixture<ImageBlockComponent>;

  const mockMediaService = {
    uploadFile: jasmine.createSpy('uploadFile').and.returnValue(Promise.resolve()),
    generateResponsiveVariants: jasmine.createSpy('generateResponsiveVariants').and.returnValue(Promise.resolve())
  };

  const mockPhotoService = {
    getPhotos: jasmine.createSpy('getPhotos').and.returnValue(Promise.resolve([]))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageBlockComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MediaService, useValue: mockMediaService },
        { provide: PhotoService, useValue: mockPhotoService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageBlockComponent);
    component = fixture.componentInstance;
    
    // Set required inputs
    component.data = {
      id: 'test-image',
      type: 'image',
      content: {
        src: 'https://example.com/image.jpg',
        alt: 'Test Image',
        width: '100%',
        height: 'auto',
        alignment: 'center',
        caption: 'Test Caption'
      }
    };
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display image when src is provided', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const img = compiled.querySelector('.block-image') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.src).toBe('https://example.com/image.jpg');
    expect(img.alt).toBe('Test Image');
  });

  it('should enter editing mode', () => {
    component.isEditing = true;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.enhanced-image-editor')).toBeTruthy();
  });
});
