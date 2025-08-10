import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-website-edit',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="edit-container">
      <h1>Edit Website</h1>
      <p>Website editing functionality coming soon...</p>
      <button class="btn btn-outline" routerLink="/websites">
        <i class="fas fa-arrow-left"></i>
        Back to Websites
      </button>
    </div>
  `,
  styles: [`
    .edit-container {
      padding: 2rem;
      text-align: center;
    }
    .btn {
      padding: 0.75rem 1.5rem;
      border: 2px solid var(--primary-color);
      background: transparent;
      color: var(--primary-color);
      border-radius: 8px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
    }
  `]
})
export class WebsiteEditComponent {}
