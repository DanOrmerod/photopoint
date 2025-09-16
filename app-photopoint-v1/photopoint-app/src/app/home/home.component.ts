import { Component, signal, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { OAuthService } from '../services/oauth.service';
import { WebsiteService } from '../services/website.service';
import { Website } from '../models/website.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
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
        accountId: w.accountId,
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
    this.router.navigate(['/websites', websiteId, 'edit']);
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
