import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { OAuthService } from '../services/oauth.service';

@Component({
  selector: 'app-account',
  imports: [RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Account Settings</h1>
        <p>Manage your account settings and security preferences</p>
      </div>
      
      <div class="content-card">
        <h2>Account Management</h2>
        <p>Clear cached authentication tokens and logout.</p>
        
        <div class="button-group">
          <button (click)="clearCache()" class="btn btn-warning">Clear Token Cache</button>
          <button (click)="logout()" class="btn btn-danger">Logout & Clear All</button>
          <a routerLink="/" class="btn btn-primary">Back to Gallery</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .page-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .page-header h1 {
      color: #333;
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .page-header p {
      color: #666;
      font-size: 1.1rem;
    }

    .content-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      text-align: center;
    }

    .content-card h2 {
      color: #333;
      margin-bottom: 1rem;
    }

    .content-card p {
      color: #666;
      margin-bottom: 2rem;
    }

    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      transition: opacity 0.2s ease;
    }

    .btn:hover {
      opacity: 0.9;
    }

    .button-group {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn-warning {
      background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
    }

    .btn-danger {
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
  `]
})
export class AccountComponent {
  constructor(
    private authService: AuthService,
    private oauthService: OAuthService,
    private router: Router
  ) {}

  clearCache(): void {
    // Clear OAuth cache
    this.oauthService.clearOAuthCache();
    
    // Clear auth service cache
    this.authService.clearAllTokens();
    
    alert('All cached tokens have been cleared! You can now try OAuth login again.');
  }

  logout(): void {
    // Clear all tokens and logout
    this.authService.clearAllTokens();
    this.oauthService.clearOAuthCache();
    
    // Redirect to login
    this.router.navigate(['/login']);
    
    alert('Logged out successfully! All tokens cleared.');
  }
}
