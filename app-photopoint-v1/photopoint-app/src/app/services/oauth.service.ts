import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OAuthProviders {
  google: boolean;
  facebook: boolean;
  apple: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OAuthService {
  private apiUrl = 'http://localhost:3001/api/v1/auth';

  constructor(private http: HttpClient) {}

  // Get available OAuth providers
  getOAuthProviders(): Observable<{ providers: OAuthProviders }> {
    return this.http.get<{ providers: OAuthProviders }>(`${this.apiUrl}/oauth/status`);
  }

  // Initiate Google OAuth
  loginWithGoogle(): void {
    window.location.href = `${this.apiUrl}/google`;
  }

  // Initiate Facebook OAuth
  loginWithFacebook(): void {
    window.location.href = `${this.apiUrl}/facebook`;
  }

  // Initiate Apple OAuth (when implemented)
  loginWithApple(): void {
    window.location.href = `${this.apiUrl}/apple`;
  }

  // Handle OAuth callback
  handleOAuthCallback(token: string, provider: string): void {
    // Store the token using the same keys as AuthService
    localStorage.setItem('photopoint_token', token);
    localStorage.setItem('authProvider', provider);
  }

  // Clear any cached OAuth tokens
  clearOAuthCache(): void {
    localStorage.removeItem('photopoint_token');
    localStorage.removeItem('photopoint_user');
    localStorage.removeItem('photopoint_email');
    localStorage.removeItem('authToken');
    localStorage.removeItem('authProvider');
  }
}
