import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AuthResponse {
  token: string;
  user?: {
    email: string;
    username?: string;
    fullName?: string;
    profilePicture?: string;
  };
}

export interface User {
  email: string;
  username?: string;
  fullName?: string;
  profilePicture?: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3001/api/v1/auth';
  
  // Current user state
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Signal for reactive components
  public isAuthenticated = signal(false);

  constructor() {
    // Check for existing token on service initialization
    this.checkStoredToken();
  }

  private checkStoredToken(): void {
    const token = localStorage.getItem('photopoint_token');
    const userJson = localStorage.getItem('photopoint_user');
    const legacyEmail = localStorage.getItem('photopoint_email'); // For backward compatibility
    
    if (token && (userJson || legacyEmail)) {
      let userData: Partial<User>;
      
      if (userJson) {
        try {
          userData = JSON.parse(userJson);
        } catch {
          userData = { email: legacyEmail || 'User' };
        }
      } else {
        userData = { email: legacyEmail || 'User' };
      }
      
      const user: User = { 
        email: userData.email || 'User',
        username: userData.username,
        fullName: userData.fullName,
        profilePicture: userData.profilePicture,
        token 
      };
      
      this.currentUserSubject.next(user);
      this.isAuthenticated.set(true);
    }
  }

  register(email: string, password: string, username: string): Observable<AuthResponse & { success: boolean }> {
    return this.http.post<AuthResponse & { success: boolean }>(`${this.apiUrl}/register`, {
      email,
      password,
      username
    }).pipe(
      tap(response => {
        // If registration includes token (for automatic login), store it
        if (response.token) {
          // Store token and user info
          localStorage.setItem('photopoint_token', response.token);
          localStorage.setItem('photopoint_user', JSON.stringify(response.user || { email, username }));
          
          // Update state for immediate login
          const user: User = {
            email: response.user?.email || email,
            username: response.user?.username || username,
            fullName: response.user?.fullName,
            profilePicture: response.user?.profilePicture,
            token: response.token
          };
          this.currentUserSubject.next(user);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        // Store token and user info
        localStorage.setItem('photopoint_token', response.token);
        localStorage.setItem('photopoint_user', JSON.stringify(response.user || { email }));
        
        // Update state
        const user: User = {
          email: response.user?.email || email,
          username: response.user?.username,
          fullName: response.user?.fullName,
          profilePicture: response.user?.profilePicture,
          token: response.token
        };
        this.currentUserSubject.next(user);
        this.isAuthenticated.set(true);
      })
    );
  }

  logout(): void {
    // Clear storage
    localStorage.removeItem('photopoint_token');
    localStorage.removeItem('photopoint_user');
    localStorage.removeItem('photopoint_email'); // Clear legacy storage
    localStorage.removeItem('authToken'); // Clear OAuth service token
    localStorage.removeItem('authProvider'); // Clear OAuth provider
    
    // Clear state
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
  }

  // Clear all possible cached tokens
  clearAllTokens(): void {
    localStorage.removeItem('photopoint_token');
    localStorage.removeItem('photopoint_user');
    localStorage.removeItem('photopoint_email');
    localStorage.removeItem('authToken');
    localStorage.removeItem('authProvider');
    
    // Clear state
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem('photopoint_token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Method for OAuth login - sets token and user state
  setOAuthToken(token: string, email?: string): void {
    localStorage.setItem('photopoint_token', token);
    
    // Try to decode the JWT token to extract user information
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const user: User = {
        email: payload.email || email || 'OAuth User',
        username: payload.username,
        fullName: payload.fullName,
        profilePicture: payload.profilePicture,
        token: token
      };
      
      // Store user data in localStorage
      localStorage.setItem('photopoint_user', JSON.stringify({
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        profilePicture: user.profilePicture
      }));
      
      this.currentUserSubject.next(user);
      this.isAuthenticated.set(true);
      
    } catch (error) {
      // Fallback to basic user info
      const user: User = { 
        email: email || 'OAuth User', 
        token: token 
      };
      
      localStorage.setItem('photopoint_user', JSON.stringify({
        email: user.email
      }));
      
      this.currentUserSubject.next(user);
      this.isAuthenticated.set(true);
    }
    
    // Keep legacy email storage for backward compatibility
    if (email) {
      localStorage.setItem('photopoint_email', email);
    }
  }
}
