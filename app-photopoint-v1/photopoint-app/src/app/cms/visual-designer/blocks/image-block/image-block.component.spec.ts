import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageBlockComponent } from './image-block.component';

describe('ImageBlockComponent', () => {
  let component: ImageBlockComponent;
  let fixture: ComponentFixture<ImageBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageBlockComponent]
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

  it('should display placeholder when no src is provided', () => {
    component.data.content = {};
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.image-placeholder')).toBeTruthy();
  });

  it('should enter editing mode', () => {
    component.isEditing = true;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.inline-image-editor')).toBeTruthy();
  });
});
