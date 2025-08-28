import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonBlockComponent } from './button-block.component';

describe('ButtonBlockComponent', () => {
  let component: ButtonBlockComponent;
  let fixture: ComponentFixture<ButtonBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonBlockComponent);
    component = fixture.componentInstance;
    
    // Set required inputs
    component.data = {
      id: 'test-button',
      type: 'button',
      content: {
        text: 'Test Button',
        url: 'https://example.com',
        target: '_blank',
        size: 'medium',
        style: 'primary',
        alignment: 'center',
        backgroundColor: '#3b82f6',
        textColor: '#ffffff'
      }
    };
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display button with correct text and properties', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.block-button') as HTMLAnchorElement;
    
    expect(button).toBeTruthy();
    expect(button.textContent?.trim()).toBe('Test Button');
    expect(button.href).toBe('https://example.com/');
    expect(button.target).toBe('_blank');
  });

  it('should apply correct CSS classes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.block-button');
    
    expect(button?.classList.contains('size-medium')).toBe(true);
    expect(button?.classList.contains('style-primary')).toBe(true);
  });

  it('should enter editing mode', () => {
    component.isEditing = true;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.inline-button-editor')).toBeTruthy();
  });
});
