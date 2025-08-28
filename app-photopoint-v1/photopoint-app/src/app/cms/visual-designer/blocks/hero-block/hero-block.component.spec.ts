import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroBlockComponent } from './hero-block.component';

describe('HeroBlockComponent', () => {
  let component: HeroBlockComponent;
  let fixture: ComponentFixture<HeroBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeroBlockComponent);
    component = fixture.componentInstance;
    
    // Set required inputs
    component.data = {
      id: 'test-hero',
      type: 'hero',
      content: {
        title: 'Test Hero Title',
        subtitle: 'Test Hero Subtitle',
        buttonText: 'Test Button',
        buttonUrl: 'https://example.com',
        backgroundImage: ''
      }
    };
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display hero content', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hero-title')?.textContent).toContain('Test Hero Title');
    expect(compiled.querySelector('.hero-subtitle')?.textContent).toContain('Test Hero Subtitle');
    expect(compiled.querySelector('.hero-button')?.textContent).toContain('Test Button');
  });

  it('should enter editing mode', () => {
    component.isEditing = true;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.inline-hero-editor')).toBeTruthy();
  });
});
