import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AccountComponent } from './account.component';
import { AuthService } from '../auth/auth.service';
import { OAuthService } from '../services/oauth.service';

describe('AccountComponent', () => {
  let component: AccountComponent;
  let fixture: ComponentFixture<AccountComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockOAuthService: jasmine.SpyObj<OAuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['clearAllTokens']);
    const oauthServiceSpy = jasmine.createSpyObj('OAuthService', ['clearOAuthCache']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AccountComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: OAuthService, useValue: oauthServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockOAuthService = TestBed.inject(OAuthService) as jasmine.SpyObj<OAuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display account settings title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Account Settings');
  });

  it('should display account management section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Account Management');
  });

  it('should have clear cache button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.btn-warning');
    expect(button?.textContent?.trim()).toBe('Clear Token Cache');
  });

  it('should have logout button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.btn-danger');
    expect(button?.textContent?.trim()).toBe('Logout & Clear All');
  });

  it('should have back to gallery link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector('a[routerLink="/"]');
    expect(link?.textContent?.trim()).toBe('Back to Gallery');
  });

  it('should clear cache when clear cache button is clicked', () => {
    spyOn(window, 'alert');
    
    component.clearCache();
    
    expect(mockOAuthService.clearOAuthCache).toHaveBeenCalled();
    expect(mockAuthService.clearAllTokens).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('All cached tokens have been cleared! You can now try OAuth login again.');
  });

  it('should logout and navigate when logout button is clicked', () => {
    spyOn(window, 'alert');
    
    component.logout();
    
    expect(mockAuthService.clearAllTokens).toHaveBeenCalled();
    expect(mockOAuthService.clearOAuthCache).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    expect(window.alert).toHaveBeenCalledWith('Logged out successfully! All tokens cleared.');
  });
});
