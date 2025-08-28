import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { OAuthService } from '../services/oauth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
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
