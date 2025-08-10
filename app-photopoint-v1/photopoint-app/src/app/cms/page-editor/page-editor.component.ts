import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WebsiteService } from '../../services/website.service';
import { Page, Website } from '../../models/website.model';

interface DesignBlock {
  id: string;
  type: 'hero' | 'text' | 'image' | 'gallery' | 'spacer' | 'button' | 'columns';
  content: any;
  styles: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    margin?: string;
    fontSize?: string;
    fontWeight?: string;
    textAlign?: string;
    borderRadius?: string;
    [key: string]: any;
  };
}

@Component({
  selector: 'app-page-editor',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="editor-container">
      <div class="editor-header">
        <div class="breadcrumb">
          <a [routerLink]="['/websites']" class="breadcrumb-item">
            <i class="fas fa-globe"></i>
            Websites
          </a>
          <i class="fas fa-chevron-right"></i>
          <a [routerLink]="['/websites', websiteId()]" class="breadcrumb-item">
            {{ website()?.name }}
          </a>
          <i class="fas fa-chevron-right"></i>
          <span class="breadcrumb-current">Edit Page</span>
        </div>
        
        <div class="header-actions">
          <button 
            type="button" 
            class="btn btn-outline"
            (click)="previewPage()"
            [disabled]="!page()"
          >
            <i class="fas fa-eye"></i>
            Preview
          </button>
          <button 
            type="button" 
            class="btn btn-success"
            (click)="savePage()"
            [disabled]="!pageForm.valid || isSaving()"
          >
            <i class="fas fa-save" [class.fa-spin]="isSaving()"></i>
            {{ isSaving() ? 'Saving...' : 'Save Page' }}
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading page...</p>
        </div>
      } @else if (error()) {
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{{ error() }}</p>
          <button class="btn btn-primary" (click)="loadPage()">
            <i class="fas fa-refresh"></i>
            Retry
          </button>
        </div>
      } @else if (page()) {
        <div class="editor-content">
          <form [formGroup]="pageForm" class="page-form">
            <div class="form-row">
              <div class="form-group">
                <label for="title">Page Title *</label>
                <input 
                  type="text" 
                  id="title"
                  formControlName="title"
                  class="form-control"
                  placeholder="Enter page title"
                >
                @if (pageForm.get('title')?.invalid && pageForm.get('title')?.touched) {
                  <div class="field-error">Page title is required</div>
                }
              </div>
              
              <div class="form-group">
                <label for="slug">URL Slug *</label>
                <input 
                  type="text" 
                  id="slug"
                  formControlName="slug"
                  class="form-control"
                  placeholder="page-url-slug"
                >
                <div class="field-hint">
                  URL: {{ website()?.subdomain }}.photopoint.app/<strong>{{ pageForm.get('slug')?.value || 'slug' }}</strong>
                </div>
                @if (pageForm.get('slug')?.invalid && pageForm.get('slug')?.touched) {
                  <div class="field-error">URL slug is required</div>
                }
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="metaTitle">Meta Title</label>
                <input 
                  type="text" 
                  id="metaTitle"
                  formControlName="metaTitle"
                  class="form-control"
                  placeholder="SEO title for search engines"
                >
                <div class="field-hint">Recommended: 50-60 characters</div>
              </div>
              
              <div class="form-group">
                <label for="status">Status</label>
                <select id="status" formControlName="status" class="form-control">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="metaDescription">Meta Description</label>
              <textarea 
                id="metaDescription"
                formControlName="metaDescription"
                class="form-control"
                rows="3"
                placeholder="Brief description for search engines"
              ></textarea>
              <div class="field-hint">Recommended: 150-160 characters</div>
            </div>

            @if (page()?.isHomePage) {
              <div class="home-page-notice">
                <i class="fas fa-home"></i>
                <span>This is your website's home page</span>
              </div>
            }
          </form>
        </div>
      }
    </div>
  `,
  styles: [`
    .editor-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }

    .breadcrumb-item {
      color: var(--primary-color);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .breadcrumb-item:hover {
      text-decoration: underline;
    }

    .breadcrumb-current {
      color: #6b7280;
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .loading-state, .error-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #6b7280;
    }

    .loading-state i, .error-state i {
      font-size: 2rem;
      margin-bottom: 1rem;
      display: block;
    }

    .editor-content {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #374151;
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .field-hint {
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }

    .field-error {
      font-size: 0.875rem;
      color: #dc2626;
      margin-top: 0.25rem;
    }

    .home-page-notice {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: #dbeafe;
      border: 1px solid #93c5fd;
      border-radius: 8px;
      color: #1e40af;
      margin-top: 1.5rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: var(--primary-color);
      color: white;
    }

    .btn-success {
      background: #059669;
      color: white;
    }

    .btn-outline {
      background: transparent;
      color: var(--primary-color);
      border: 2px solid var(--primary-color);
    }

    @media (max-width: 768px) {
      .editor-container {
        padding: 1rem;
      }

      .editor-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .header-actions {
        justify-content: center;
      }
    }
  `]
})
export class PageEditorComponent implements OnInit {
  websiteId = signal<string>('');
  pageId = signal<string>('');
  website = signal<Website | null>(null);
  page = signal<Page | null>(null);
  loading = signal(true);
  error = signal<string>('');
  isSaving = signal(false);

  pageForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private websiteService: WebsiteService,
    private fb: FormBuilder
  ) {
    this.pageForm = this.fb.group({
      title: ['', Validators.required],
      slug: ['', Validators.required],
      metaTitle: [''],
      metaDescription: [''],
      status: ['draft']
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.websiteId.set(params['id']);
      this.pageId.set(params['pageId']);
      this.loadPage();
      this.loadWebsite();
    });

    // Auto-generate slug when title changes
    this.pageForm.get('title')?.valueChanges.subscribe(title => {
      if (title && !this.pageForm.get('slug')?.dirty) {
        const slug = this.generateSlug(title);
        this.pageForm.get('slug')?.setValue(slug);
      }
    });
  }

  async loadWebsite() {
    try {
      const website = await this.websiteService.getWebsite(this.websiteId());
      this.website.set(website);
    } catch (error) {
      console.error('Error loading website:', error);
    }
  }

  async loadPage() {
    try {
      this.loading.set(true);
      this.error.set('');
      
      const page = await this.websiteService.getPage(this.websiteId(), this.pageId());
      this.page.set(page);
      
      // Populate form with page data
      this.pageForm.patchValue({
        title: page.title,
        slug: page.slug,
        metaTitle: page.metaDescription, // Note: backend has metaTitle but model uses metaDescription
        metaDescription: page.metaDescription,
        status: page.isPublished ? 'published' : 'draft'
      });
      
    } catch (error) {
      this.error.set('Failed to load page. Please try again.');
      console.error('Error loading page:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async savePage() {
    if (this.pageForm.invalid) {
      this.pageForm.markAllAsTouched();
      return;
    }

    try {
      this.isSaving.set(true);
      
      const formData = this.pageForm.value;
      await this.websiteService.updatePage(
        this.websiteId(),
        this.pageId(),
        {
          title: formData.title,
          slug: formData.slug,
          metaDescription: formData.metaDescription,
          status: formData.status
        }
      );

      // Update local page data
      const currentPage = this.page();
      if (currentPage) {
        this.page.set({
          ...currentPage,
          ...formData,
          updatedAt: new Date()
        });
      }

      // Show success (you could add a toast notification here)
      console.log('Page saved successfully');
      
    } catch (error) {
      console.error('Error saving page:', error);
      // You could add error handling/notification here
    } finally {
      this.isSaving.set(false);
    }
  }

  previewPage() {
    const website = this.website();
    const page = this.page();
    
    console.log('Preview button clicked');
    console.log('Website:', website);
    console.log('Page:', page);
    
    if (website && page) {
      // Open preview using correct Angular route path (no /cms prefix)
      const previewUrl = `http://localhost:4200/websites/${website.id}/pages/${page.id}/preview`;
      console.log('Opening preview URL:', previewUrl);
      window.open(previewUrl, '_blank');
    } else {
      console.log('Missing website or page data');
    }
  }

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
