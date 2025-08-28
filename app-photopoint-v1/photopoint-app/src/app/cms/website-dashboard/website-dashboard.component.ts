import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { WebsiteService } from '../../services/website.service';
import { TemplateService, Template } from '../../services/template.service';
import { TemplateSelectorComponent } from '../template-selector/template-selector.component';
import { Website, Page } from '../../services/website.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-website-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TemplateSelectorComponent],
  templateUrl: './website-dashboard.component.html',
  styleUrl: './website-dashboard.component.scss'
})
export class WebsiteDashboardComponent implements OnInit {
  environment = environment;
  website = signal<Website | null>(null);
  pages = signal<Page[]>([]);
  loading = signal(false);
  pagesLoading = signal(false);
  publishingLoading = signal(false);
  error = signal<string | null>(null);
  websiteId: string = '';
  
  // Template management
  showTemplateSelector = signal(false);
  currentTemplate = signal<Template | null>(null);

  constructor(
    private websiteService: WebsiteService,
    private templateService: TemplateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.websiteId = params['id'];
      this.loadWebsite();
      this.loadPages();
    });
  }

  async loadWebsite() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const website = await this.websiteService.getWebsite(this.websiteId);
      this.website.set(website);
      
      // Load current template if available
      if (website.theme) {
        // Try to find template by theme (assuming template was applied)
        const templates = this.templateService.getTemplates();
        const template = templates.find(t => t.theme.id === website.theme);
        if (template) {
          this.currentTemplate.set(template);
        }
      }
    } catch (error) {
      console.error('Failed to load website:', error);
      this.error.set('Failed to load website. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  async loadPages() {
    this.pagesLoading.set(true);
    try {
      const pages = await this.websiteService.getPages(this.websiteId);
      this.pages.set(pages);
    } catch (error) {
      console.error('Failed to load pages:', error);
    } finally {
      this.pagesLoading.set(false);
    }
  }

  getWebsiteUrl(): string {
    const website = this.website();
    if (!website) return '';
    return `${environment.websiteProtocol}://${website.subdomain}.${environment.viewerDomain}`;
  }

  getWebsiteDomain(): string {
    const website = this.website();
    if (!website) return '';
    return `${website.subdomain}.${environment.viewerDomain}`;
  }

  getTimeSinceCreation(): number {
    const website = this.website();
    if (!website) return 0;
    const created = new Date(website.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  async publishWebsite() {
    const website = this.website();
    if (!website) return;

    try {
      this.publishingLoading.set(true);
      this.error.set(null);
      
      if (website.status === 'published') {
        // Update published version
        console.log('Updating published website...');
        await this.websiteService.publishWebsite(website.id);
        console.log('Website updated successfully!');
      } else {
        // First time publish
        console.log('Publishing website for the first time...');
        await this.websiteService.publishWebsite(website.id);
        console.log('Website published successfully!');
      }
      
      // Refresh website data to show updated status
      await this.loadWebsite();
      
    } catch (error) {
      console.error('Failed to publish website:', error);
      this.error.set('Failed to publish website. Please try again.');
    } finally {
      this.publishingLoading.set(false);
    }
  }

  previewWebsite() {
    const homePage = this.getHomePage();
    if (!homePage) {
      console.error('No home page found for preview');
      return;
    }

    // Open preview in a new tab
    const previewUrl = `/websites/${this.websiteId}/pages/${homePage.id}/preview`;
    window.open(previewUrl, '_blank');
  }

  getHomePage(): Page | null {
    const pages = this.pages();
    return pages.find(page => page.isHomePage) || pages.find(page => page.slug === 'home') || pages[0] || null;
  }

  viewPublishedSite() {
    const website = this.website();
    if (!website) return;

    // Generate URL for the viewer app
    // For local dev, use http://localhost:4300/{subdomain}
    let viewerUrl = '';
    if (environment.viewerDomain.startsWith('localhost')) {
      viewerUrl = `${environment.websiteProtocol}://${environment.viewerDomain}/${website.subdomain}`;
    } else {
      viewerUrl = `${environment.websiteProtocol}://${website.subdomain}.${environment.viewerDomain}`;
    }
    window.open(viewerUrl, '_blank');
  }

  async createNewPage() {
    try {
      const newPage = await this.websiteService.createPage(this.websiteId, {
        title: 'New Page',
        slug: 'new-page-' + Date.now(),
        content: '<h1>New Page</h1><p>Add your content here...</p>'
      });
      this.router.navigate(['/websites', this.websiteId, 'pages', newPage.id, 'edit']);
    } catch (error) {
      console.error('Failed to create page:', error);
    }
  }

  editPage(pageId: string) {
    this.router.navigate(['/websites', this.websiteId, 'pages', pageId, 'edit']);
  }

  designPage(pageId: string) {
    console.log('Design button clicked for page:', pageId);
    console.log('Website ID:', this.websiteId);
    console.log('Navigating to:', ['/websites', this.websiteId, 'pages', pageId, 'design']);
    this.router.navigate(['/websites', this.websiteId, 'pages', pageId, 'design']);
  }

  async deletePage(pageId: string) {
    if (confirm('Are you sure you want to delete this page?')) {
      try {
        await this.websiteService.deletePage(this.websiteId, pageId);
        this.loadPages(); // Refresh pages list
      } catch (error) {
        console.error('Failed to delete page:', error);
      }
    }
  }

  // Template management methods
  changeTemplate() {
    this.showTemplateSelector.set(true);
  }

  onTemplateSelected(template: Template) {
    this.currentTemplate.set(template);
    
    // Apply template to website
    this.applyTemplateToWebsite(template);
    
    this.showTemplateSelector.set(false);
  }

  closeTemplateSelector() {
    this.showTemplateSelector.set(false);
  }

  getCategoryDisplayName(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
  }

  getTemplatePreview(template: Template): string {
    return this.templateService.generateTemplatePreview(template);
  }

  private async applyTemplateToWebsite(template: Template) {
    try {
      // Apply the template structure to the website
      await this.templateService.applyTemplate(this.websiteId, template);
      
      // Update website with new theme
      await this.updateWebsiteTheme(template.theme.id);
      
      // Refresh pages to show new template structure
      this.loadPages();
      
      console.log('Template applied successfully:', template.name);
    } catch (error) {
      console.error('Failed to apply template:', error);
      this.error.set('Failed to apply template. Please try again.');
    }
  }

  private async updateWebsiteTheme(themeId: string) {
    try {
      await this.websiteService.updateWebsite(this.websiteId, { theme: themeId });
      // Refresh website data
      await this.loadWebsite();
    } catch (error) {
      console.error('Failed to update website theme:', error);
    }
  }
}
