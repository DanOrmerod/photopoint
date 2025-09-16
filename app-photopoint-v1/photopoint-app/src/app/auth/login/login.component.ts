import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { OAuthService } from '../../services/oauth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private oauthService: OAuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Clear error message when form values change
    this.loginForm.valueChanges.subscribe(() => {
      this.errorMessage.set('');
    });
  }

  ngOnInit(): void {
    // Component initialization if needed
  }

  async onSubmit(): Promise<void> {
    if (this.isLoading() || this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const { email, password } = this.loginForm.value;
      const response = await firstValueFrom(this.authService.login(email, password));
      
      // Login was successful, redirect
      const returnUrl = localStorage.getItem('returnUrl');
      if (returnUrl) {
        localStorage.removeItem('returnUrl');
        this.router.navigateByUrl(returnUrl);
      } else {
        this.router.navigate(['/dashboard']);
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      
      if (error.status === 401) {
        this.errorMessage.set('Invalid email or password');
      } else if (error.error?.message) {
        this.errorMessage.set(error.error.message);
      } else {
        this.errorMessage.set('An error occurred during login');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
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
