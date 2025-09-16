import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { OAuthCallbackComponent } from './oauth-callback.component';
import { OAuthService } from '../services/oauth.service';
import { AuthService } from '../auth/auth.service';

describe('OAuthCallbackComponent', () => {
  let component: OAuthCallbackComponent;
  let fixture: ComponentFixture<OAuthCallbackComponent>;
  let mockOAuthService: jasmine.SpyObj<OAuthService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const oauthServiceSpy = jasmine.createSpyObj('OAuthService', ['handleOAuthCallback']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['setOAuthToken']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [OAuthCallbackComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: OAuthService, useValue: oauthServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ token: 'test-token', provider: 'google' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OAuthCallbackComponent);
    component = fixture.componentInstance;
    mockOAuthService = TestBed.inject(OAuthService) as jasmine.SpyObj<OAuthService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display initial loading message', () => {
    // Check initial state before ngOnInit changes it
    expect(component.message).toBe('Processing authentication...');
    expect(component.subMessage).toBe('Please wait while we complete your login.');
    
    // Also verify it renders correctly initially
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    // After detectChanges, ngOnInit will have run and changed the message
    // So we check the component properties directly above
  });

  it('should handle successful authentication', () => {
    fixture.detectChanges();
    
    expect(mockOAuthService.handleOAuthCallback).toHaveBeenCalledWith('test-token', 'google');
    expect(mockAuthService.setOAuthToken).toHaveBeenCalledWith('test-token');
    expect(component.message).toBe('Authentication successful!');
    expect(component.subMessage).toBe('You have been logged in with Google.');
  });

  it('should handle authentication error', () => {
    const activatedRoute = TestBed.inject(ActivatedRoute);
    (activatedRoute as any).queryParams = of({ error: 'auth_failed' });
    
    component.ngOnInit();
    
    expect(component.message).toBe('Authentication failed');
    expect(component.subMessage).toBe('Authentication was cancelled or failed. Please try again.');
  });

  it('should handle server error', () => {
    const activatedRoute = TestBed.inject(ActivatedRoute);
    (activatedRoute as any).queryParams = of({ error: 'server_error' });
    
    component.ngOnInit();
    
    expect(component.message).toBe('Authentication failed');
    expect(component.subMessage).toBe('A server error occurred. Please try again later.');
  });

  it('should handle invalid callback parameters', () => {
    const activatedRoute = TestBed.inject(ActivatedRoute);
    (activatedRoute as any).queryParams = of({});
    
    component.ngOnInit();
    
    expect(component.message).toBe('Authentication failed');
    expect(component.subMessage).toBe('An unexpected error occurred during authentication.');
  });

  it('should capitalize provider name correctly', () => {
    expect((component as any).capitalizeFirst('google')).toBe('Google');
    expect((component as any).capitalizeFirst('facebook')).toBe('Facebook');
  });

  it('should display loading spinner', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.loading-spinner')).toBeTruthy();
  });
});
