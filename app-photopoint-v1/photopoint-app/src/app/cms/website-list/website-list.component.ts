import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WebsiteService } from '../../services/website.service';
import { Website } from '../../services/website.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-website-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="website-list-container">
      <div class="header">
        <h1>My Websites</h1>
        <button class="btn btn-primary" routerLink="/websites/create">
          <i class="fas fa-plus"></i>
          Create New Website
        </button>
      </div>

      @if (loading()) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Loading your websites...</p>
        </div>
      } @else if (error()) {
        <div class="error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{{ error() }}</p>
          <button class="btn btn-outline" (click)="loadWebsites()">Try Again</button>
        </div>
      } @else if (websites().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-globe"></i>
          </div>
          <h2>No websites yet</h2>
          <p>Create your first website to get started with the CMS platform.</p>
          <button class="btn btn-primary" routerLink="/websites/create">
            <i class="fas fa-plus"></i>
            Create Your First Website
          </button>
        </div>
      } @else {
        <div class="websites-grid">
          @for (website of websites(); track website.id) {
            <div class="website-card">
              <div class="website-preview">
                @if (website.favicon) {
                  <img [src]="website.favicon" [alt]="website.name + ' favicon'" class="favicon">
                } @else {
                  <div class="default-favicon">
                    <i class="fas fa-globe"></i>
                  </div>
                }
              </div>
              
              <div class="website-info">
                <h3>{{ website.name }}</h3>
                <p class="description">{{ website.description || 'No description provided' }}</p>
                
                <div class="website-stats">
                  <span class="stat">
                    <i class="fas fa-file-alt"></i>
                    {{ website.pageCount || 0 }} pages
                  </span>
                  <span class="stat">
                    <i class="fas fa-eye"></i>
                    {{ website.visits || 0 }} visits
                  </span>
                </div>
                
                <div class="website-meta">
                  <span class="status" [class]="'status-' + website.status">
                    {{ website.status }}
                  </span>
                  <span class="domain">{{ website.customDomain || website.subdomain + '.' + environment.viewerDomain }}</span>
                </div>
              </div>
              
              <div class="website-actions">
                <button class="btn btn-outline btn-sm" [routerLink]="['/websites', website.id]">
                  <i class="fas fa-tachometer-alt"></i>
                  Dashboard
                </button>
                <button class="btn btn-outline btn-sm" [routerLink]="['/websites', website.id, 'edit']">
                  <i class="fas fa-edit"></i>
                  Edit
                </button>
                <button class="btn btn-danger btn-sm" (click)="deleteWebsite(website)">
                  <i class="fas fa-trash"></i>
                  Delete
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Delete Confirmation Modal -->
    @if (showDeleteModal()) {
      <div class="modal-overlay" (click)="cancelDelete()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Delete Website</h3>
            <button class="close-btn" (click)="cancelDelete()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-content">
            <p>Are you sure you want to delete <strong>{{ websiteToDelete()?.name }}</strong>?</p>
            <p class="warning">This action cannot be undone. All pages and content will be permanently deleted.</p>
          </div>
          <div class="modal-actions">
            <button class="btn btn-outline" (click)="cancelDelete()">Cancel</button>
            <button class="btn btn-danger" (click)="confirmDelete()" [disabled]="deleting()">
              @if (deleting()) {
                <div class="spinner-sm"></div>
              } @else {
                <i class="fas fa-trash"></i>
              }
              Delete Website
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './website-list.component.scss'
})
export class WebsiteListComponent implements OnInit {
  environment = environment;
  websites = signal<Website[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  showDeleteModal = signal(false);
  websiteToDelete = signal<Website | null>(null);
  deleting = signal(false);

  constructor(private websiteService: WebsiteService) {}

  ngOnInit() {
    this.loadWebsites();
  }

  async loadWebsites() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const websites = await this.websiteService.getWebsites();
      this.websites.set(websites);
    } catch (error) {
      console.error('Failed to load websites:', error);
      this.error.set('Failed to load websites. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  deleteWebsite(website: Website) {
    this.websiteToDelete.set(website);
    this.showDeleteModal.set(true);
  }

  cancelDelete() {
    this.showDeleteModal.set(false);
    this.websiteToDelete.set(null);
  }

  async confirmDelete() {
    const website = this.websiteToDelete();
    if (!website) return;

    this.deleting.set(true);

    try {
      await this.websiteService.deleteWebsite(website.id);
      
      // Remove from local list
      const updatedWebsites = this.websites().filter(w => w.id !== website.id);
      this.websites.set(updatedWebsites);
      
      this.cancelDelete();
    } catch (error) {
      console.error('Failed to delete website:', error);
      this.error.set('Failed to delete website. Please try again.');
    } finally {
      this.deleting.set(false);
    }
  }
}
