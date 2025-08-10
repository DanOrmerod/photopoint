import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { WebsiteService } from '../../services/website.service';

@Component({
  selector: 'app-page-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fullscreen-preview">
      @if (loading()) {
        <div class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading preview...</p>
        </div>
      } @else if (error()) {
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{{ error() }}</p>
          <button class="btn btn-primary" (click)="loadPreview()">
            <i class="fas fa-refresh"></i>
            Retry
          </button>
        </div>
      } @else {
        <!-- Preview control bar -->
        <div class="preview-controls">
          <div class="preview-badge">PREVIEW</div>
          <button class="close-preview" (click)="closePreview()">
            <i class="fas fa-times"></i>
            Close Preview
          </button>
        </div>
        <!-- Clean website preview without any CMS UI -->
        <div class="website-preview" [innerHTML]="previewHtml()"></div>
      }
    </div>
  `,
  styles: [`
    /* Hide any inherited app navigation/layout */
    :host {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10000;
      background: white;
    }

    .fullscreen-preview {
      width: 100vw;
      height: 100vh;
      background: white;
      overflow-y: auto;
      position: relative;
    }

    .loading-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      gap: 20px;
      background: white;
    }

    .loading-state i {
      font-size: 2rem;
      color: #007bff;
    }

    .error-state i {
      font-size: 3rem;
      color: #dc3545;
    }

    .preview-controls {
      position: fixed;
      top: 15px;
      right: 15px;
      display: flex;
      gap: 10px;
      align-items: center;
      z-index: 10001;
      background: rgba(0, 0, 0, 0.8);
      padding: 10px 15px;
      border-radius: 5px;
    }

    .preview-badge {
      background: #ff6b6b;
      color: white;
      padding: 5px 10px;
      border-radius: 3px;
      font-size: 12px;
      font-weight: bold;
    }

    .close-preview {
      background: #6c757d;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .close-preview:hover {
      background: #5a6268;
    }

    .website-preview {
      width: 100%;
      height: 100%;
      background: white;
      /* Reset all inherited styles to show clean website */
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
    }

    /* Ensure no CMS styles bleed through */
    .website-preview * {
      box-sizing: border-box;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background: #0056b3;
    }
  `]
})
export class PagePreviewComponent implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  previewHtml = signal<SafeHtml>('');
  
  websiteId = signal<string | null>(null);
  pageId = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private websiteService: WebsiteService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    // Get route parameters - website ID is in 'id' parameter like page editor
    this.websiteId.set(this.route.snapshot.paramMap.get('id'));
    this.pageId.set(this.route.snapshot.paramMap.get('pageId'));
    
    console.log('Preview component initialized');
    console.log('Website ID:', this.websiteId());
    console.log('Page ID:', this.pageId());
    console.log('Route params:', this.route.snapshot.paramMap.keys);
    console.log('Full route params:', this.route.snapshot.params);
    
    this.loadPreview();
  }

  async loadPreview() {
    const websiteId = this.websiteId();
    const pageId = this.pageId();
    
    console.log('Preview component - websiteId:', websiteId, 'pageId:', pageId);
    console.log('Route params:', this.route.snapshot.paramMap);
    console.log('Route URL:', this.route.snapshot.url);
    
    if (!websiteId || !pageId) {
      console.error('Missing websiteId or pageId');
      this.error.set('Invalid website or page ID');
      return;
    }

    try {
      this.loading.set(true);
      this.error.set(null);

      console.log('Fetching website and page data...');

      // Get website and page data
      const [website, page] = await Promise.all([
        this.websiteService.getWebsite(websiteId),
        this.websiteService.getPage(websiteId, pageId)
      ]);

      console.log('Website:', website);
      console.log('Page:', page);

      if (!website || !page) {
        console.error('Website or page not found', { website, page });
        this.error.set('Website or page not found');
        return;
      }

      // Generate preview HTML
      const html = this.generatePreviewHtml(website, page);
      this.previewHtml.set(this.sanitizer.bypassSecurityTrustHtml(html));

    } catch (error) {
      console.error('Error loading preview:', error);
      this.error.set('Failed to load preview. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  private generatePreviewHtml(website: any, page: any): string {
    let pageContent = '';
    
    // Handle different content formats
    if (page.content) {
      try {
        // Try to parse as JSON first (for block-based content)
        const contentObj = JSON.parse(page.content);
        
        if (Array.isArray(contentObj)) {
          // Handle legacy JSON blocks format
          pageContent = contentObj.map((block: any) => {
            switch (block.type) {
              case 'heading':
                return `<h${block.level || 1}>${block.text || ''}</h${block.level || 1}>`;
              case 'paragraph':
                return `<p>${block.text || ''}</p>`;
              case 'image':
                return `<img src="${block.src || ''}" alt="${block.alt || ''}" style="max-width: 100%; height: auto;" />`;
              default:
                return `<p>${block.text || ''}</p>`;
            }
          }).join('\n');
        } else if (contentObj.blocks && Array.isArray(contentObj.blocks)) {
          // Handle new template-based content structure
          pageContent = contentObj.blocks.map((block: any) => {
            return this.renderTemplateBlock(block);
          }).join('\n');
        } else if (contentObj.blocks) {
          // Handle legacy nested blocks structure
          pageContent = contentObj.blocks.map((block: any) => {
            switch (block.type) {
              case 'hero':
                const title = block.content?.title || website.name;
                const subtitle = block.content?.subtitle || 'Welcome to my website';
                return `
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 80px 20px; text-align: center; margin-bottom: 40px;">
                    <h1 style="font-size: 3em; margin-bottom: 20px; margin-top: 0;">${title}</h1>
                    <p style="font-size: 1.3em; opacity: 0.9; margin-bottom: 0;">${subtitle}</p>
                  </div>
                `;
              case 'text':
                return `<div style="margin-bottom: 30px; line-height: 1.6;">${block.content?.text || ''}</div>`;
              default:
                return `<div style="margin-bottom: 20px;">${block.content?.text || block.text || ''}</div>`;
            }
          }).join('\n');
        } else {
          // Handle single JSON object
          pageContent = `<div style="line-height: 1.6;">${contentObj.content || contentObj.text || ''}</div>`;
        }
      } catch (error) {
        // Not JSON, treat as plain HTML/text
        pageContent = `<div style="line-height: 1.6;">${page.content}</div>`;
      }
    }

    // Create complete HTML structure
    return `
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .header {
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 20px 0;
          margin-bottom: 40px;
        }
        .header h1 {
          margin: 0;
          color: #2c3e50;
          font-size: 2rem;
        }
        .content {
          min-height: 500px;
        }
        h1, h2, h3, h4, h5, h6 {
          color: #2c3e50;
        }
        img {
          max-width: 100%;
          height: auto;
        }
        p {
          margin-bottom: 1rem;
        }
        .block {
          margin-bottom: 40px;
        }
        .hero {
          padding: 80px 20px;
          text-align: center;
          border-radius: 8px;
          margin-bottom: 40px;
        }
        .stats {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          justify-content: space-around;
          text-align: center;
        }
        .stat-item {
          flex: 1;
          min-width: 150px;
          padding: 20px;
        }
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }
        .feature {
          padding: 30px;
          border: 1px solid #eee;
          border-radius: 8px;
        }
        .cta {
          text-align: center;
          padding: 60px 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          background: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
        .gallery {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        .gallery img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 8px;
        }
      </style>
      <div class="header">
        <div class="container">
          <h1>${website.name || 'Website'}</h1>
        </div>
      </div>
      <div class="container">
        <div class="content">
          ${pageContent || '<p>No content available</p>'}
        </div>
      </div>
    `;
  }

  private renderTemplateBlock(block: any): string {
    const styles = block.styles || {};
    const content = block.content || {};

    switch (block.type) {
      case 'hero':
        return `
          <div class="block hero" style="background: ${styles.backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}; color: ${styles.textColor || 'white'};">
            <h1 style="font-size: 3em; margin-bottom: 20px; margin-top: 0;">${content.headline || 'Welcome'}</h1>
            <p style="font-size: 1.3em; opacity: 0.9; margin-bottom: 20px;">${content.subheading || ''}</p>
            ${content.buttonText ? `<a href="${content.buttonLink || '#'}" class="btn">${content.buttonText}</a>` : ''}
          </div>
        `;

      case 'stats':
        const statsItems = (content.stats || []).map((stat: any) => `
          <div class="stat-item">
            <h3 style="font-size: 2.5em; margin: 0; color: #007bff;">${stat.value || '0'}</h3>
            <p style="margin: 10px 0 0 0; font-weight: bold;">${stat.label || ''}</p>
            <p style="margin: 5px 0 0 0; opacity: 0.7;">${stat.description || ''}</p>
          </div>
        `).join('');
        
        return `
          <div class="block" style="background: ${styles.backgroundColor || '#f8f9fa'}; padding: 60px 20px; border-radius: 8px;">
            <h2 style="text-align: center; margin-bottom: 50px;">${content.title || 'Our Stats'}</h2>
            <div class="stats">${statsItems}</div>
          </div>
        `;

      case 'features':
        const featuresItems = (content.features || []).map((feature: any) => `
          <div class="feature">
            ${feature.icon ? `<i class="${feature.icon}" style="font-size: 3em; color: #007bff; margin-bottom: 20px;"></i>` : ''}
            <h3>${feature.title || ''}</h3>
            <p>${feature.description || ''}</p>
          </div>
        `).join('');

        return `
          <div class="block" style="padding: 80px 0;">
            <h2 style="text-align: center; margin-bottom: 50px;">${content.title || 'Features'}</h2>
            <div class="features">${featuresItems}</div>
          </div>
        `;

      case 'cta':
        return `
          <div class="block cta">
            <h2>${content.headline || 'Ready to get started?'}</h2>
            <p style="font-size: 1.2em; margin: 20px 0;">${content.description || ''}</p>
            ${content.buttonText ? `<a href="${content.buttonLink || '#'}" class="btn">${content.buttonText}</a>` : ''}
          </div>
        `;

      case 'gallery':
        const galleryImages = (content.images || []).map((image: any) => `
          <div>
            <img src="${image.url || '/placeholder-image.jpg'}" alt="${image.title || ''}" />
            ${image.title ? `<p style="margin-top: 10px; text-align: center;">${image.title}</p>` : ''}
          </div>
        `).join('');

        return `
          <div class="block">
            <h2 style="text-align: center; margin-bottom: 50px;">${content.title || 'Gallery'}</h2>
            <div class="gallery">${galleryImages}</div>
          </div>
        `;

      case 'text':
      case 'content':
        return `
          <div class="block" style="background: ${styles.backgroundColor || 'transparent'}; padding: ${styles.padding || '20px 0'};">
            ${content.title ? `<h2>${content.title}</h2>` : ''}
            <div style="line-height: 1.8;">${content.text || content.content || ''}</div>
          </div>
        `;

      case 'columns':
        const columnsItems = (content.columns || []).map((column: any) => `
          <div style="flex: 1; min-width: 250px; margin-bottom: 30px;">
            <h3>${column.title || ''}</h3>
            <p style="line-height: 1.6;">${column.description || ''}</p>
          </div>
        `).join('');

        return `
          <div class="block" style="padding: 60px 0;">
            ${content.title ? `<h2 style="text-align: center; margin-bottom: 20px;">${content.title}</h2>` : ''}
            ${content.subtitle ? `<p style="text-align: center; font-size: 1.2em; opacity: 0.8; margin-bottom: 50px;">${content.subtitle}</p>` : ''}
            <div style="display: flex; flex-wrap: wrap; gap: 40px;">${columnsItems}</div>
          </div>
        `;

      default:
        return `
          <div class="block">
            <div style="padding: 20px; border: 1px dashed #ccc; border-radius: 4px; text-align: center; color: #666;">
              <p>Block type "${block.type}" not yet supported in preview</p>
              <small>${JSON.stringify(content).substring(0, 100)}...</small>
            </div>
          </div>
        `;
    }
  }

  closePreview() {
    window.close();
  }
}
