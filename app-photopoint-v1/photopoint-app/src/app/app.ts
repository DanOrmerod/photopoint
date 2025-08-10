import { Component, signal, HostListener, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/auth.service';
import { OAuthService } from './services/oauth.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('PhotoPoint');
  public isProfileMenuOpen = signal(false);
  public imageLoadFailed = signal(false);

  constructor(
    public authService: AuthService,
    private oauthService: OAuthService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Clear any theme styles that might affect the CMS interface
    this.themeService.clearDocumentTheme();
  }

  logout(): void {
    this.authService.clearAllTokens();
    this.oauthService.clearOAuthCache();
    this.isProfileMenuOpen.set(false);
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen.update(current => !current);
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen.set(false);
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    return words.slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  }

  onImageError(event: Event): void {
    // Set flag to show fallback avatar
    this.imageLoadFailed.set(true);
  }

  onImageLoad(event: Event): void {
    // Reset flag since image loaded successfully
    this.imageLoadFailed.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    
    // Don't close if clicking inside the profile dropdown
    if (target.closest('.profile-dropdown')) {
      return;
    }
    
    // Close profile menu when clicking outside
    if (this.isProfileMenuOpen()) {
      this.isProfileMenuOpen.set(false);
    }
  }
}
