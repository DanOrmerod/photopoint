import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { HomeComponent } from './home.component';
import { AuthService } from '../auth/auth.service';
import { OAuthService } from '../services/oauth.service';
import { WebsiteService } from '../services/website.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockOAuthService: jasmine.SpyObj<OAuthService>;
  let mockWebsiteService: jasmine.SpyObj<WebsiteService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'clearAllTokens']);
    const oauthServiceSpy = jasmine.createSpyObj('OAuthService', ['clearOAuthCache']);
    const websiteServiceSpy = jasmine.createSpyObj('WebsiteService', ['getUserWebsites']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: OAuthService, useValue: oauthServiceSpy },
        { provide: WebsiteService, useValue: websiteServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockOAuthService = TestBed.inject(OAuthService) as jasmine.SpyObj<OAuthService>;
    mockWebsiteService = TestBed.inject(WebsiteService) as jasmine.SpyObj<WebsiteService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.websites()).toEqual([]);
    expect(component.loading()).toBe(true);
    expect(component.error()).toBeNull();
  });

  it('should load websites on init when authenticated', () => {
    mockAuthService.isAuthenticated.and.returnValue(true);
    spyOn(component, 'loadWebsites');

    component.ngOnInit();

    expect(component.loadWebsites).toHaveBeenCalled();
  });

  it('should not load websites when not authenticated', () => {
    mockAuthService.isAuthenticated.and.returnValue(false);
    spyOn(component, 'loadWebsites');

    component.ngOnInit();

    expect(component.loadWebsites).not.toHaveBeenCalled();
  });

  it('should navigate to login when goToLogin is called', () => {
    component.goToLogin();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to register when goToRegister is called', () => {
    component.goToRegister();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/register']);
  });

  it('should navigate to website creation when createNewWebsite is called', () => {
    component.createNewWebsite();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/websites/create']);
  });

  it('should calculate relative time correctly', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const lastWeek = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    expect(component.getRelativeTime(now.toISOString())).toBe('today');
    expect(component.getRelativeTime(yesterday.toISOString())).toBe('yesterday');
    expect(component.getRelativeTime(lastWeek.toISOString())).toBe('1 weeks ago');
  });

  it('should get active websites count', () => {
    component.websites.set([
      { id: '1', name: 'Site 1', status: 'published' } as any,
      { id: '2', name: 'Site 2', status: 'draft' } as any,
      { id: '3', name: 'Site 3', status: 'published' } as any
    ]);

    expect(component.getActiveWebsites()).toBe(2);
  });

  it('should get total pages count', () => {
    component.websites.set([
      { id: '1', name: 'Site 1', pageCount: 5 } as any,
      { id: '2', name: 'Site 2', pageCount: 3 } as any,
      { id: '3', name: 'Site 3', pageCount: 2 } as any
    ]);

    expect(component.getTotalPages()).toBe(10);
  });

  it('should handle edit website navigation', () => {
    component.editWebsite('test-id');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/websites', 'test-id', 'edit']);
  });

  it('should handle open website navigation', () => {
    component.openWebsite('test-id');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/websites', 'test-id']);
  });

  it('should clear tokens and navigate on logout', () => {
    component.logout();
    
    expect(mockAuthService.clearAllTokens).toHaveBeenCalled();
    expect(mockOAuthService.clearOAuthCache).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
