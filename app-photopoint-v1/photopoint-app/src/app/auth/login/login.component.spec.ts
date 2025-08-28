import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { OAuthService } from 'angular-oauth2-oidc';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockOAuthService: jasmine.SpyObj<OAuthService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'loginWithProvider']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const oauthServiceSpy = jasmine.createSpyObj('OAuthService', ['initCodeFlow']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: OAuthService, useValue: oauthServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockOAuthService = TestBed.inject(OAuthService) as jasmine.SpyObj<OAuthService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize login form with empty values', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should mark form as invalid when required fields are empty', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should mark form as valid when required fields are filled', () => {
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });
    expect(component.loginForm.valid).toBeTruthy();
  });

  it('should call authService.login on form submission', async () => {
    mockAuthService.login.and.returnValue(Promise.resolve({ success: true }));
    
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    await component.onSubmit();

    expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('should navigate to dashboard on successful login', async () => {
    mockAuthService.login.and.returnValue(Promise.resolve({ success: true }));
    
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    await component.onSubmit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should set error message on login failure', async () => {
    mockAuthService.login.and.returnValue(Promise.resolve({ 
      success: false, 
      error: 'Invalid credentials' 
    }));
    
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    await component.onSubmit();

    expect(component.errorMessage()).toBe('Invalid credentials');
  });

  it('should handle login error exceptions', async () => {
    mockAuthService.login.and.returnValue(Promise.reject(new Error('Network error')));
    
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    await component.onSubmit();

    expect(component.errorMessage()).toBe('An error occurred during login');
  });

  it('should not submit form when already loading', async () => {
    component.isLoading.set(true);
    spyOn(component, 'onSubmit').and.callThrough();

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));

    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('should call Google OAuth on Google login', () => {
    component.loginWithGoogle();
    expect(mockOAuthService.initCodeFlow).toHaveBeenCalled();
  });

  it('should call authService.loginWithProvider for Facebook login', async () => {
    mockAuthService.loginWithProvider.and.returnValue(Promise.resolve({ success: true }));
    
    await component.loginWithFacebook();
    
    expect(mockAuthService.loginWithProvider).toHaveBeenCalledWith('facebook');
  });

  it('should call authService.loginWithProvider for Apple login', async () => {
    mockAuthService.loginWithProvider.and.returnValue(Promise.resolve({ success: true }));
    
    await component.loginWithApple();
    
    expect(mockAuthService.loginWithProvider).toHaveBeenCalledWith('apple');
  });

  it('should handle OAuth provider login errors', async () => {
    mockAuthService.loginWithProvider.and.returnValue(Promise.resolve({
      success: false,
      error: 'OAuth error'
    }));
    
    await component.loginWithFacebook();
    
    expect(component.errorMessage()).toBe('OAuth error');
  });

  it('should disable submit button when form is invalid', () => {
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBeTruthy();
  });

  it('should enable submit button when form is valid', () => {
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBeFalsy();
  });

  it('should show loading state during login', async () => {
    mockAuthService.login.and.returnValue(new Promise(resolve => 
      setTimeout(() => resolve({ success: true }), 100)
    ));
    
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    const submitPromise = component.onSubmit();
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton.textContent?.trim()).toBe('Signing in...');
    expect(component.isLoading()).toBeTruthy();

    await submitPromise;
  });

  it('should clear error message when form values change', () => {
    component.errorMessage.set('Previous error');
    
    component.loginForm.get('email')?.setValue('test@example.com');
    
    expect(component.errorMessage()).toBe('');
  });

  it('should validate email format', () => {
    const emailControl = component.loginForm.get('email');
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTruthy();
    
    emailControl?.setValue('valid@example.com');
    expect(emailControl?.hasError('email')).toBeFalsy();
  });

  it('should require minimum password length', () => {
    const passwordControl = component.loginForm.get('password');
    
    passwordControl?.setValue('123');
    expect(passwordControl?.hasError('minlength')).toBeTruthy();
    
    passwordControl?.setValue('123456');
    expect(passwordControl?.hasError('minlength')).toBeFalsy();
  });
});
