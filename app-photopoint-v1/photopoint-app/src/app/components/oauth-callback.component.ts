import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OAuthService } from '../services/oauth.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [],
  template: `
    <div class="oauth-callback">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <h2>{{ message }}</h2>
        <p>{{ subMessage }}</p>
      </div>
    </div>
  `,
  styles: [`
    .oauth-callback {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .loading-container {
      text-align: center;
      background: white;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      max-width: 400px;
    }

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    h2 {
      color: #333;
      margin-bottom: 0.5rem;
      font-size: 1.5rem;
    }

    p {
      color: #666;
      margin: 0;
    }

    .error {
      color: #e74c3c;
    }

    .success {
      color: #27ae60;
    }
  `]
})
export class OAuthCallbackComponent implements OnInit {
  message = 'Processing authentication...';
  subMessage = 'Please wait while we complete your login.';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private oauthService: OAuthService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const provider = params['provider'];
      const error = params['error'];

      if (error) {
        this.handleError(error);
      } else if (token && provider) {
        this.handleSuccess(token, provider);
      } else {
        this.handleError('Invalid callback parameters');
      }
    });
  }

  private handleSuccess(token: string, provider: string): void {
    this.message = 'Authentication successful!';
    this.subMessage = `You have been logged in with ${this.capitalizeFirst(provider)}.`;

    // Store the token using the OAuth service
    this.oauthService.handleOAuthCallback(token, provider);

    // Also update the auth service
    this.authService.setOAuthToken(token);

    // Redirect to main app after a brief delay
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 2000);
  }

  private handleError(error: string): void {
    this.message = 'Authentication failed';
    this.subMessage = this.getErrorMessage(error);

    // Redirect to login after a brief delay
    setTimeout(() => {
      this.router.navigate(['/login'], { queryParams: { error: error } });
    }, 3000);
  }

  private getErrorMessage(error: string): string {
    switch (error) {
      case 'auth_failed':
        return 'Authentication was cancelled or failed. Please try again.';
      case 'server_error':
        return 'A server error occurred. Please try again later.';
      default:
        return 'An unexpected error occurred during authentication.';
    }
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
