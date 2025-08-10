import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-content-block-editor',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="block-editor-container">
      <h1>Content Block Editor</h1>
      <p>Content block editing functionality coming soon...</p>
      <button class="btn btn-outline" routerLink="/websites">
        <i class="fas fa-arrow-left"></i>
        Back to Websites
      </button>
    </div>
  `,
  styles: [`
    .block-editor-container {
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
export class ContentBlockEditorComponent {}
