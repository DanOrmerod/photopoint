import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { RegisterComponent } from './register.component';
import { AuthService } from '../auth.service';
import { OAuthService } from '../../services/oauth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockOAuthService: jasmine.SpyObj<OAuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create spy objects
    mockAuthService = jasmine.createSpyObj('AuthService', ['register']);
    mockOAuthService = jasmine.createSpyObj('OAuthService', [
      'getOAuthProviders',
      'loginWithGoogle',
      'loginWithFacebook',
      'loginWithApple'
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // Setup default return values
    mockOAuthService.getOAuthProviders.and.returnValue(of({
      providers: { google: true, facebook: true, apple: true }
    }));

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: OAuthService, useValue: mockOAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize OAuth providers on ngOnInit', () => {
    expect(mockOAuthService.getOAuthProviders).toHaveBeenCalled();
    expect(component.oauthProviders().google).toBe(true);
    expect(component.oauthProviders().facebook).toBe(true);
    expect(component.oauthProviders().apple).toBe(true);
  });

  it('should handle OAuth providers loading error', () => {
    const consoleSpy = spyOn(console, 'error');
    mockOAuthService.getOAuthProviders.and.returnValue(throwError(() => new Error('Network error')));
    
    component.ngOnInit();
    
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load OAuth providers:', jasmine.any(Error));
  });

  describe('Form Validation', () => {
    it('should validate email format', () => {
      const emailControl = component.registerForm.get('email');
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();
      
      expect(emailControl?.hasError('email')).toBe(true);
    });

    it('should validate username length', () => {
      const usernameControl = component.registerForm.get('username');
      usernameControl?.setValue('ab');
      usernameControl?.markAsTouched();
      
      expect(usernameControl?.hasError('minlength')).toBe(true);
    });

    it('should validate password length', () => {
      const passwordControl = component.registerForm.get('password');
      passwordControl?.setValue('123');
      passwordControl?.markAsTouched();
      
      expect(passwordControl?.hasError('minlength')).toBe(true);
    });

    it('should validate password confirmation', () => {
      component.registerForm.patchValue({
        password: 'password123',
        confirmPassword: 'different'
      });
      
      expect(component.registerForm.hasError('passwordMismatch')).toBe(true);
    });

    it('should pass validation with valid inputs', () => {
      component.registerForm.patchValue({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123'
      });
      
      expect(component.registerForm.valid).toBe(true);
    });
  });

  describe('Registration', () => {
    beforeEach(() => {
      component.registerForm.patchValue({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123'
      });
    });

    it('should successfully register user', async () => {
      mockAuthService.register.and.returnValue(of({ 
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        user: { id: '1', email: 'test@example.com', username: 'testuser' },
        success: true 
      }));
      
      await component.onSubmit();
      
      expect(mockAuthService.register).toHaveBeenCalledWith('test@example.com', 'password123', 'testuser');
      expect(component.registerSuccess()).toContain('Welcome to PhotoPoint');
      expect(component.isLoading()).toBe(false);
    });

    it('should handle registration error', async () => {
      mockAuthService.register.and.returnValue(throwError(() => ({ 
        error: { message: 'Email already exists' },
        status: 409
      })));
      
      await component.onSubmit();
      
      expect(component.registerError()).toBe('An account with this email or username already exists');
      expect(component.isLoading()).toBe(false);
    });

    it('should not submit if form is invalid', async () => {
      component.registerForm.patchValue({
        email: 'invalid'
      });
      
      await component.onSubmit();
      
      expect(mockAuthService.register).not.toHaveBeenCalled();
      expect(component.isLoading()).toBe(false);
    });

    it('should not submit if already loading', async () => {
      component.isLoading.set(true);
      
      await component.onSubmit();
      
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });
  });

  describe('OAuth Login', () => {
    it('should trigger Google OAuth login', () => {
      component.loginWithGoogle();
      expect(mockOAuthService.loginWithGoogle).toHaveBeenCalled();
    });

    it('should trigger Facebook OAuth login', () => {
      component.loginWithFacebook();
      expect(mockOAuthService.loginWithFacebook).toHaveBeenCalled();
    });

    it('should trigger Apple OAuth login', () => {
      component.loginWithApple();
      expect(mockOAuthService.loginWithApple).toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should navigate to login page', () => {
      component.goToLogin();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Helper Methods', () => {
    it('should clear error messages when starting new submission', async () => {
      // Set some errors
      component.registerError.set('Register error');
      component.registerSuccess.set('Success message');
      
      // Set valid form data and submit
      component.registerForm.patchValue({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123'
      });
      
      mockAuthService.register.and.returnValue(of({ 
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        user: { id: '1', email: 'test@example.com', username: 'testuser' },
        success: true 
      }));
      
      await component.onSubmit();
      
      // Messages should be cleared during submission
      expect(component.registerError()).toBe('');
    });
  });

  describe('Template Integration', () => {
    it('should display form validation errors', () => {
      const emailControl = component.registerForm.get('email');
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();
      
      fixture.detectChanges();
      
      expect(emailControl?.hasError('email')).toBe(true);
    });

    it('should disable submit button when form is invalid', () => {
      component.registerForm.patchValue({
        email: 'invalid'
      });
      
      fixture.detectChanges();
      
      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton?.disabled).toBe(true);
    });

    it('should disable submit button when loading', () => {
      component.isLoading.set(true);
      fixture.detectChanges();
      
      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton?.disabled).toBe(true);
    });

    it('should show loading text when submitting', () => {
      component.isLoading.set(true);
      fixture.detectChanges();
      
      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton?.textContent?.trim()).toBe('Creating Account...');
    });
  });
});
