import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Profile Settings</h1>
        <p>Manage your profile information and preferences</p>
      </div>
      
      <div class="content-card">
        <h2>Coming Soon</h2>
        <p>Profile settings functionality will be implemented here.</p>
        <a routerLink="/" class="btn btn-primary">Back to Gallery</a>
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
  `]
})
export class ProfileComponent {
}
