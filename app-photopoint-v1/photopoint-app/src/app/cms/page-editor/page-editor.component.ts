import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WebsiteService } from '../../services/website.service';
import { Website, WebsitePage, Page } from '../../models';

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
  templateUrl: './page-editor.component.html',
  styleUrl: './page-editor.component.scss'
})
export class PageEditorComponent implements OnInit {
  websiteId = signal<string>('');
  pageId = signal<string>('');
  website = signal<Website | null>(null);
  page = signal<WebsitePage | null>(null);
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
        status: page.status === 'published' ? 'published' : 'draft'
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
