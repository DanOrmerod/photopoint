import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { OAuthService } from '../../services/oauth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Join PhotoPoint</h2>
          <p>Create your account to get started</p>
        </div>

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="email"
              required
              email
              class="form-control"
              [class.error]="emailError()"
              placeholder="Enter your email">
            @if (emailError()) {
              <div class="error-message">{{ emailError() }}</div>
            }
          </div>

          <div class="form-group">
            <label for="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              [(ngModel)]="username"
              required
              minlength="3"
              maxlength="20"
              class="form-control"
              [class.error]="usernameError()"
              placeholder="Choose a username">
            @if (usernameError()) {
              <div class="error-message">{{ usernameError() }}</div>
            }
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="password"
              required
              minlength="6"
              class="form-control"
              [class.error]="passwordError()"
              placeholder="Enter your password">
            @if (passwordError()) {
              <div class="error-message">{{ passwordError() }}</div>
            }
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              [(ngModel)]="confirmPassword"
              required
              class="form-control"
              [class.error]="confirmPasswordError()"
              placeholder="Confirm your password">
            @if (confirmPasswordError()) {
              <div class="error-message">{{ confirmPasswordError() }}</div>
            }
          </div>

          @if (registerError()) {
            <div class="alert alert-error">
              {{ registerError() }}
            </div>
          }

          @if (registerSuccess()) {
            <div class="alert alert-success">
              {{ registerSuccess() }}
            </div>
          }

          <button 
            type="submit"
            class="btn btn-primary btn-full"
            [disabled]="isLoading() || !registerForm.valid">
            @if (isLoading()) {
              Creating Account...
            } @else {
              Create Account
            }
          </button>
        </form>

        <div class="oauth-section">
          <div class="divider">
            <span>or sign up with</span>
          </div>

          <div class="oauth-buttons">
            <button 
              type="button" 
              class="btn btn-oauth btn-google"
              (click)="loginWithGoogle()"
              [disabled]="!oauthProviders().google">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button 
              type="button" 
              class="btn btn-oauth btn-facebook"
              (click)="loginWithFacebook()"
              [disabled]="!oauthProviders().facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877f2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>

            <button 
              type="button" 
              class="btn btn-oauth btn-apple"
              (click)="loginWithApple()"
              [disabled]="!oauthProviders().apple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#000">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Continue with Apple
            </button>
          </div>
        </div>

        <div class="auth-footer">
          <p>Already have an account? <a (click)="goToLogin()" class="link">Sign in</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .auth-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      padding: 3rem;
      width: 100%;
      max-width: 400px;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-header h2 {
      color: #333;
      margin-bottom: 0.5rem;
      font-size: 1.8rem;
    }

    .auth-header p {
      color: #666;
      font-size: 1rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s ease;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-control.error {
      border-color: #dc3545;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .alert {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .alert-error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .alert-success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .btn-full {
      width: 100%;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .auth-footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e1e5e9;
    }

    .auth-footer p {
      color: #666;
      margin: 0;
    }

    .link {
      color: #667eea;
      cursor: pointer;
      text-decoration: none;
      font-weight: 500;
    }

    .link:hover {
      text-decoration: underline;
    }

    /* OAuth Styles */
    .oauth-section {
      margin: 2.5rem 0;
    }

    .divider {
      text-align: center;
      margin: 2rem 0;
      position: relative;
      padding: 1rem 0;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e1e5e9;
      z-index: 0;
    }

    .divider span {
      background: white;
      padding: 0 1.5rem;
      color: #666;
      font-size: 0.9rem;
      position: relative;
      z-index: 1;
    }

    .oauth-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .btn-oauth {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border: 2px solid #e1e5e9;
      background: white;
      color: #333;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .btn-oauth:hover:not(:disabled) {
      border-color: #ccc;
      background: #f8f9fa;
      transform: translateY(-1px);
    }

    .btn-oauth:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      color: #999;
    }

    .btn-oauth svg {
      flex-shrink: 0;
    }

    .btn-google:hover:not(:disabled) {
      border-color: #4285f4;
    }

    .btn-facebook:hover:not(:disabled) {
      border-color: #1877f2;
    }

    .btn-apple:hover:not(:disabled) {
      border-color: #000;
    }

    @media (max-width: 480px) {
      .auth-container {
        padding: 1rem;
      }

      .auth-card {
        padding: 2rem;
      }

      .oauth-buttons {
        gap: 0.5rem;
      }

      .btn-oauth {
        font-size: 0.9rem;
        padding: 0.65rem 1rem;
      }
    }
  `]
})
export class RegisterComponent implements OnInit {
  email = '';
  username = '';
  password = '';
  confirmPassword = '';
  
  isLoading = signal(false);
  registerError = signal('');
  registerSuccess = signal('');
  emailError = signal('');
  usernameError = signal('');
  passwordError = signal('');
  confirmPasswordError = signal('');
  oauthProviders = signal({ google: false, facebook: false, apple: false });

  constructor(
    private authService: AuthService,
    private oauthService: OAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load OAuth provider availability
    this.oauthService.getOAuthProviders().subscribe({
      next: (response) => {
        this.oauthProviders.set(response.providers);
      },
      error: (error) => {
        console.error('Failed to load OAuth providers:', error);
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.isLoading()) return;

    // Clear previous messages
    this.clearMessages();

    // Validate form
    if (!this.validateForm()) return;

    this.isLoading.set(true);

    try {
      await firstValueFrom(this.authService.register(this.email, this.password, this.username));
      
      this.registerSuccess.set('Welcome to PhotoPoint! Your account has been created and you are now signed in.');
      
      // Clear form fields for security
      this.email = '';
      this.username = '';
      this.password = '';
      this.confirmPassword = '';
      
      // Auto-redirect to main app after successful registration and login
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 2000);
      
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      if (error.status === 409) {
        this.registerError.set('An account with this email or username already exists');
      } else {
        this.registerError.set('Registration failed. Please try again.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  private validateForm(): boolean {
    let isValid = true;

    // Email validation
    if (!this.email) {
      this.emailError.set('Email is required');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.emailError.set('Please enter a valid email address');
      isValid = false;
    }

    // Username validation
    if (!this.username) {
      this.usernameError.set('Username is required');
      isValid = false;
    } else if (this.username.length < 3) {
      this.usernameError.set('Username must be at least 3 characters');
      isValid = false;
    } else if (this.username.length > 20) {
      this.usernameError.set('Username must be less than 20 characters');
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(this.username)) {
      this.usernameError.set('Username can only contain letters, numbers, and underscores');
      isValid = false;
    }

    // Password validation
    if (!this.password) {
      this.passwordError.set('Password is required');
      isValid = false;
    } else if (this.password.length < 6) {
      this.passwordError.set('Password must be at least 6 characters');
      isValid = false;
    }

    // Confirm password validation
    if (!this.confirmPassword) {
      this.confirmPasswordError.set('Please confirm your password');
      isValid = false;
    } else if (this.password !== this.confirmPassword) {
      this.confirmPasswordError.set('Passwords do not match');
      isValid = false;
    }

    return isValid;
  }

  private clearMessages(): void {
    this.registerError.set('');
    this.registerSuccess.set('');
    this.emailError.set('');
    this.usernameError.set('');
    this.passwordError.set('');
    this.confirmPasswordError.set('');
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  // OAuth Methods
  loginWithGoogle(): void {
    this.oauthService.loginWithGoogle();
  }

  loginWithFacebook(): void {
    this.oauthService.loginWithFacebook();
  }

  loginWithApple(): void {
    this.oauthService.loginWithApple();
  }
}
