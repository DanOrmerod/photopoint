import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { WebsiteEditComponent } from './website-edit.component';

describe('WebsiteEditComponent', () => {
  let component: WebsiteEditComponent;
  let fixture: ComponentFixture<WebsiteEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebsiteEditComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(WebsiteEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display edit website title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Edit Website');
  });

  it('should display coming soon message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p')?.textContent).toContain('Website editing functionality coming soon...');
  });

  it('should have back to websites button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button');
    expect(button).toBeTruthy();
    expect(button?.textContent?.trim()).toContain('Back to Websites');
  });

  it('should have router link to websites', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button[routerLink="/websites"]');
    expect(button).toBeTruthy();
  });
});
