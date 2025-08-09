import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { OAuthService } from '../services/oauth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  template: `
    <div class="home-container">
      <div class="welcome-section">
        <h2>Welcome to PhotoPoint</h2>
        <p>Your personal photo management solution</p>
      </div>
      
      <div class="quick-actions">
        <div class="action-card">
          <h3>📷 Upload Photos</h3>
          <p>Add new photos to your collection</p>
          <button class="action-btn">Upload Now</button>
        </div>
        
        <div class="action-card">
          <h3>🖼️ Browse Gallery</h3>
          <p>View and organize your photos</p>
          <button class="action-btn">Open Gallery</button>
        </div>
        
        <div class="action-card">
          <h3>⭐ Favorites</h3>
          <p>Quick access to your favorite photos</p>
          <button class="action-btn">View Favorites</button>
        </div>
      </div>
      
      <div class="stats-section">
        <div class="stat-item">
          <div class="stat-number">0</div>
          <div class="stat-label">Total Photos</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">0</div>
          <div class="stat-label">Favorites</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">0</div>
          <div class="stat-label">Albums</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
    }

    .welcome-section {
      text-align: center;
      margin-bottom: 3rem;
    }

    .welcome-section h2 {
      font-size: 2.5rem;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .welcome-section p {
      font-size: 1.2rem;
      color: #666;
      margin: 0;
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .action-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .action-card h3 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      color: #333;
    }

    .action-card p {
      color: #666;
      margin-bottom: 1.5rem;
    }

    .action-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.2s ease;
    }

    .action-btn:hover {
      opacity: 0.9;
    }

    .stats-section {
      display: flex;
      justify-content: center;
      gap: 3rem;
      background: #f8f9fa;
      padding: 2rem;
      border-radius: 12px;
    }

    .stat-item {
      text-align: center;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: #666;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    @media (max-width: 768px) {
      .stats-section {
        flex-direction: column;
        gap: 1.5rem;
      }

      .welcome-section h2 {
        font-size: 2rem;
      }

      .quick-actions {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent {
  constructor(
    private authService: AuthService,
    private oauthService: OAuthService,
    private router: Router
  ) {}

  logout(): void {
    // Clear all tokens
    this.authService.clearAllTokens();
    this.oauthService.clearOAuthCache();
    
    // Redirect to login
    this.router.navigate(['/login']);
    
    console.log('Logged out from home component');
  }
}
