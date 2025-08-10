import { Component, signal, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { OAuthService } from '../services/oauth.service';
import { WebsiteService } from '../services/website.service';
import { Website } from '../models/website.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      @if (authService.isAuthenticated()) {
        <!-- Authenticated User Dashboard -->
        <!-- Dashboard Header -->
        <div class="dashboard-header">
          <div class="header-content">
            <div>
              <h1>My Websites</h1>
              <p>Manage and create your website instances</p>
            </div>
            <button class="btn-primary" (click)="createNewWebsite()">
              <span class="icon">+</span>
              Create New Website
            </button>
          </div>
        </div>

        <!-- Websites Grid -->
        <div class="websites-section">
          @if (loading()) {
            <!-- Loading State -->
            <div class="loading-state">
              <div class="loading-spinner"></div>
              <p>Loading your websites...</p>
            </div>
          } @else if (error()) {
            <!-- Error State -->
            <div class="error-state">
              <div class="error-icon">⚠️</div>
              <h3>Failed to load websites</h3>
              <p>{{ error() }}</p>
              <button class="btn-secondary" (click)="loadWebsites()">
                Try Again
              </button>
            </div>
          } @else if (websites().length === 0) {
            <!-- Empty State -->
            <div class="empty-state">
              <div class="empty-icon">🌐</div>
              <h3>No websites yet</h3>
              <p>Create your first website to get started with our CMS platform</p>
              <button class="btn-primary" (click)="createNewWebsite()">
                Create Your First Website
              </button>
            </div>
          } @else {
            <!-- Websites Grid -->
            <div class="websites-grid">
              @for (website of websites(); track website.id) {
                <div class="website-card" [class]="'status-' + website.status">
                  <div class="website-header">
                    <h3>{{ website.name }}</h3>
                    <span class="status-badge" [class]="'badge-' + website.status">
                      {{ website.status }}
                    </span>
                  </div>
                  
                  <div class="website-info">
                    <p class="domain">{{ website.customDomain || website.subdomain + '.photopoint.app' }}</p>
                    <div class="meta">
                      <span>{{ website.pageCount || 0 }} pages</span>
                      <span>Modified {{ getRelativeTime(website.updatedAt) }}</span>
                    </div>
                  </div>
                  
                  <div class="website-actions">
                    <button class="btn-secondary" (click)="editWebsite(website.id)">
                      Edit
                    </button>
                    <button class="btn-primary" (click)="openWebsite(website.id)">
                      Open CMS
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Quick Stats -->
        <div class="stats-section">
          <div class="stat-card">
            <div class="stat-number">{{ websites().length }}</div>
            <div class="stat-label">Total Websites</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ getActiveWebsites() }}</div>
            <div class="stat-label">Active</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ getTotalPages() }}</div>
            <div class="stat-label">Total Pages</div>
          </div>
        </div>
      } @else {
        <!-- Unauthenticated User Welcome -->
        <div class="welcome-section">
          <div class="welcome-hero">
            <h1>Welcome to PhotoPoint CMS</h1>
            <p>Create and manage beautiful websites with our powerful multi-tenant CMS platform</p>
            <div class="welcome-actions">
              <button class="btn-primary" (click)="goToLogin()">
                Sign In
              </button>
              <button class="btn-secondary" (click)="goToRegister()">
                Create Account
              </button>
            </div>
          </div>

          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">🌐</div>
              <h3>Multi-Tenant Websites</h3>
              <p>Create and manage multiple websites from one dashboard</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🎨</div>
              <h3>Beautiful Themes</h3>
              <p>Choose from professionally designed themes or customize your own</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📝</div>
              <h3>Easy Content Management</h3>
              <p>Intuitive content editor with drag-and-drop functionality</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🚀</div>
              <h3>Fast & Reliable</h3>
              <p>Built with modern technology for speed and reliability</p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }

    .header-content h1 {
      font-size: 2.5rem;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .header-content p {
      color: #666;
      font-size: 1.1rem;
    }

    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: #f8f9fa;
      color: #333;
      border: 1px solid #e9ecef;
    }

    .btn-secondary:hover {
      background: #e9ecef;
    }

    .websites-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .website-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .website-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .website-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .website-header h3 {
      font-size: 1.25rem;
      color: #333;
      margin: 0;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .badge-active, .badge-published {
      background: #d4edda;
      color: #155724;
    }

    .badge-draft {
      background: #fff3cd;
      color: #856404;
    }

    .badge-inactive {
      background: #f8d7da;
      color: #721c24;
    }

    .website-info {
      margin-bottom: 1.5rem;
    }

    .domain {
      color: #667eea;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .meta {
      font-size: 0.875rem;
      color: #666;
      display: flex;
      gap: 1rem;
    }

    .website-actions {
      display: flex;
      gap: 0.75rem;
    }

    .website-actions button {
      flex: 1;
      padding: 0.5rem;
      font-size: 0.875rem;
    }

    .stats-section {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-top: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      min-width: 120px;
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

    .welcome-section {
      text-align: center;
    }

    .welcome-hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4rem 2rem;
      border-radius: 16px;
      margin-bottom: 3rem;
    }

    .welcome-hero h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      font-weight: 700;
    }

    .welcome-hero p {
      font-size: 1.3rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .welcome-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }

    .feature-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .feature-card h3 {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
      color: #333;
    }

    .feature-card p {
      color: #666;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    /* Loading and Error States */
    .loading-state, .error-state, .empty-state {
      text-align: center;
      padding: 3rem 2rem;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-icon, .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .loading-state p, .error-state p {
      color: #666;
      font-size: 1.1rem;
      margin: 0.5rem 0;
    }

    .error-state h3 {
      color: #d32f2f;
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    @media (max-width: 768px) {
      .stats-section {
        flex-direction: column;
        gap: 1.5rem;
      }

      .welcome-hero h1 {
        font-size: 2rem;
      }

      .welcome-hero p {
        font-size: 1.1rem;
      }

      .welcome-actions {
        flex-direction: column;
        align-items: center;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }

      .header-content {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  websites = signal<Website[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor(
    public authService: AuthService, // Make public for template access
    private oauthService: OAuthService,
    private websiteService: WebsiteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Only load websites if user is authenticated
    if (this.authService.isAuthenticated()) {
      this.loadWebsites();
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  async loadWebsites(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const apiWebsites = await this.websiteService.getWebsites();
      // Convert API response to component interface
      const websites: Website[] = apiWebsites.map((w: any) => ({
        id: w.id,
        name: w.name,
        description: w.description,
        subdomain: w.subdomain,
        customDomain: w.customDomain,
        favicon: w.favicon,
        status: w.status,
        theme: w.theme,
        pageCount: w.pageCount || 0,
        visits: w.visits || 0,
        ownerId: w.ownerId,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt
      }));
      
      this.websites.set(websites);
    } catch (err) {
      console.error('Failed to load websites:', err);
      this.error.set('Failed to load websites. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  createNewWebsite(): void {
    this.router.navigate(['/websites/create']);
  }

  editWebsite(websiteId: string): void {
    this.router.navigate(['/websites', websiteId]);
  }

  openWebsite(websiteId: string): void {
    this.router.navigate(['/websites', websiteId]);
  }

  getActiveWebsites(): number {
    return this.websites().filter(w => w.status === 'published').length;
  }

  getTotalPages(): number {
    return this.websites().reduce((total, website) => total + (website.pageCount || 0), 0);
  }

  getRelativeTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return 'yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  }

  logout(): void {
    this.authService.clearAllTokens();
    this.oauthService.clearOAuthCache();
    this.router.navigate(['/login']);
  }
}
