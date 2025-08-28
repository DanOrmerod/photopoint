import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ContentBlockEditorComponent } from './content-block-editor.component';

describe('ContentBlockEditorComponent', () => {
  let component: ContentBlockEditorComponent;
  let fixture: ComponentFixture<ContentBlockEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentBlockEditorComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ContentBlockEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render content block editor title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Content Block Editor');
  });

  it('should display coming soon message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p')?.textContent).toContain('Content block editing functionality coming soon');
  });

  it('should have back to websites button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button[routerLink="/websites"]');
    expect(button).toBeTruthy();
    expect(button?.textContent?.trim()).toContain('Back to Websites');
  });
});
