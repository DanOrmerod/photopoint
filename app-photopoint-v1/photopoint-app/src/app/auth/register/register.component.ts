import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { OAuthService } from '../../services/oauth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  
  isLoading = signal(false);
  registerError = signal('');
  registerSuccess = signal('');
  oauthProviders = signal({ google: false, facebook: false, apple: false });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private oauthService: OAuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

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

  // Custom validator for password confirmation
  private passwordMatchValidator(control: AbstractControl): { [key: string]: any } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  async onSubmit(): Promise<void> {
    if (this.isLoading() || this.registerForm.invalid) return;

    // Clear previous messages
    this.clearMessages();

    this.isLoading.set(true);

    try {
      const formValue = this.registerForm.value;
      await firstValueFrom(this.authService.register(
        formValue.email, 
        formValue.password, 
        formValue.username
      ));
      
      this.registerSuccess.set('Welcome to PhotoPoint! Your account has been created and you are now signed in.');
      
      // Clear form fields for security
      this.registerForm.reset();
      
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

  private clearMessages(): void {
    this.registerError.set('');
    this.registerSuccess.set('');
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
