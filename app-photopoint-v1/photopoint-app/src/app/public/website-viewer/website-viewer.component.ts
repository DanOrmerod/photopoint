import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { WebsiteService } from '../../services/website.service';

@Component({
  selector: 'app-website-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="website-container">
      @if (loading()) {
        <div class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading website...</p>
        </div>
      } @else if (error()) {
        <div class="error-state">
          <h2>Website Not Found</h2>
          <p>{{ error() }}</p>
          <p>The website you're looking for doesn't exist or isn't published yet.</p>
        </div>
      } @else if (websiteHtml()) {
        <!-- Render the complete website -->
        <div [innerHTML]="websiteHtml()"></div>
      }
    </div>
  `,
  styles: [`
    .website-container {
      width: 100%;
      min-height: 100vh;
      background: white;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 50vh;
      color: #666;
    }

    .loading-state i {
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 50vh;
      text-align: center;
      padding: 2rem;
    }

    .error-state h2 {
      color: #333;
      margin-bottom: 1rem;
    }

    .error-state p {
      color: #666;
      margin-bottom: 0.5rem;
    }

    /* Reset all inherited styles for clean website display */
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class WebsiteViewerComponent implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  websiteHtml = signal<SafeHtml>('');
  
  constructor(
    private route: ActivatedRoute,
    private websiteService: WebsiteService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadWebsiteFromSubdomain();
  }

  private async loadWebsiteFromSubdomain() {
    try {
      this.loading.set(true);
      this.error.set(null);

      // Get subdomain from current hostname
      const hostname = window.location.hostname;
      const subdomain = this.extractSubdomain(hostname);

      if (!subdomain) {
        this.error.set('No subdomain detected');
        return;
      }

      console.log('Loading website for subdomain:', subdomain);

      // Find website by subdomain
      const websites = await this.websiteService.getWebsites();
      const website = websites.find(w => w.subdomain === subdomain && w.status === 'published');

      if (!website) {
        this.error.set(`Website with subdomain "${subdomain}" not found or not published`);
        return;
      }

      console.log('Found website:', website);

      // Get all pages for the website
      const pages = await this.websiteService.getPages(website.id);
      const publishedPages = pages.filter(p => p.isPublished);

      if (publishedPages.length === 0) {
        this.error.set('No published pages found');
        return;
      }

      // Find home page or first page
      const homePage = publishedPages.find(p => p.isHomePage) || 
                     publishedPages.find(p => p.slug === 'home') || 
                     publishedPages[0];

      // Generate complete website HTML
      const html = this.generateWebsiteHtml(website, homePage, publishedPages);
      this.websiteHtml.set(this.sanitizer.bypassSecurityTrustHtml(html));

    } catch (error) {
      console.error('Error loading website:', error);
      this.error.set('Failed to load website');
    } finally {
      this.loading.set(false);
    }
  }

  private extractSubdomain(hostname: string): string | null {
    // First check for query parameter (development mode)
    const routeSubdomain = this.route.snapshot.queryParams['subdomain'];
    if (routeSubdomain) {
      console.log('Using subdomain from query parameter:', routeSubdomain);
      return routeSubdomain;
    }

    // Handle localhost development - check for actual subdomain
    if (hostname.includes('localhost')) {
      const parts = hostname.split('.');
      if (parts.length > 1 && parts[0] !== 'localhost') {
        console.log('Using subdomain from hostname:', parts[0]);
        return parts[0];
      }
      
      console.log('No subdomain detected for localhost');
      return null;
    }

    // Handle production domains
    const parts = hostname.split('.');
    if (parts.length > 2) {
      console.log('Using subdomain from production hostname:', parts[0]);
      return parts[0];
    }
    
    console.log('No subdomain detected');
    return null;
  }

  private generateWebsiteHtml(website: any, currentPage: any, allPages: any[]): string {
    // Parse page content
    let pageContent = '';
    if (currentPage.content) {
      try {
        const contentObj = JSON.parse(currentPage.content);
        if (contentObj.blocks && Array.isArray(contentObj.blocks)) {
          pageContent = contentObj.blocks.map((block: any) => {
            return this.renderBlock(block);
          }).join('\n');
        }
      } catch (error) {
        pageContent = `<div>${currentPage.content}</div>`;
      }
    }

    // Generate navigation
    const navigation = allPages
      .filter(p => p.isPublished)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(page => `
        <a href="/${page.slug}" class="nav-link ${page.slug === currentPage.slug ? 'active' : ''}">${page.title}</a>
      `).join('');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${currentPage.metaTitle || currentPage.title} - ${website.name}</title>
        <meta name="description" content="${currentPage.metaDescription || ''}">
        ${website.favicon ? `<link rel="icon" href="${website.favicon}">` : ''}
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          
          .header {
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            padding: 1rem 0;
            margin-bottom: 2rem;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
          }
          
          .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .nav h1 {
            color: #2c3e50;
            font-size: 1.8rem;
          }
          
          .nav-links {
            display: flex;
            gap: 2rem;
          }
          
          .nav-link {
            color: #666;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s;
          }
          
          .nav-link:hover,
          .nav-link.active {
            color: #007bff;
          }
          
          .content {
            min-height: 60vh;
          }
          
          .block {
            margin-bottom: 3rem;
          }
          
          .hero {
            text-align: center;
            padding: 4rem 2rem;
            border-radius: 8px;
            margin-bottom: 3rem;
          }
          
          .hero h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          
          .hero p {
            font-size: 1.3rem;
            margin-bottom: 2rem;
            opacity: 0.9;
          }
          
          .btn {
            display: inline-block;
            padding: 12px 24px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            transition: background 0.2s;
          }
          
          .btn:hover {
            background: #0056b3;
          }
          
          .stats {
            display: flex;
            flex-wrap: wrap;
            gap: 2rem;
            justify-content: center;
            text-align: center;
            padding: 3rem 0;
          }
          
          .stat-item {
            flex: 1;
            min-width: 150px;
          }
          
          .stat-item h3 {
            font-size: 2.5rem;
            color: #007bff;
            margin-bottom: 0.5rem;
          }
          
          .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            padding: 3rem 0;
          }
          
          .feature {
            text-align: center;
            padding: 2rem;
            border: 1px solid #eee;
            border-radius: 8px;
          }
          
          .gallery {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
          }
          
          .gallery img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 8px;
          }
          
          .footer {
            background: #2c3e50;
            color: white;
            text-align: center;
            padding: 2rem;
            margin-top: 3rem;
          }
          
          @media (max-width: 768px) {
            .nav {
              flex-direction: column;
              gap: 1rem;
            }
            
            .nav-links {
              gap: 1rem;
            }
            
            .hero h1 {
              font-size: 2rem;
            }
            
            .hero p {
              font-size: 1.1rem;
            }
          }
        </style>
      </head>
      <body>
        <header class="header">
          <div class="container">
            <nav class="nav">
              <h1>${website.name}</h1>
              <div class="nav-links">
                ${navigation}
              </div>
            </nav>
          </div>
        </header>
        
        <main class="container">
          <div class="content">
            ${pageContent}
          </div>
        </main>
        
        <footer class="footer">
          <div class="container">
            <p>&copy; ${new Date().getFullYear()} ${website.name}. All rights reserved.</p>
          </div>
        </footer>
      </body>
      </html>
    `;
  }

  private renderBlock(block: any): string {
    const content = block.content || {};
    const styles = block.styles || {};

    switch (block.type) {
      case 'hero':
        return `
          <div class="block hero" style="background: ${styles.backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100)'}; color: ${styles.textColor || 'white'};">
            <h1>${content.headline || 'Welcome'}</h1>
            <p>${content.subheading || ''}</p>
            ${content.buttonText ? `<a href="${content.buttonLink || '#'}" class="btn">${content.buttonText}</a>` : ''}
          </div>
        `;

      case 'stats':
        const statsItems = (content.stats || []).map((stat: any) => `
          <div class="stat-item">
            <h3>${stat.value || '0'}</h3>
            <p><strong>${stat.label || ''}</strong></p>
            <p>${stat.description || ''}</p>
          </div>
        `).join('');
        
        return `
          <div class="block">
            <h2 style="text-align: center; margin-bottom: 2rem;">${content.title || 'Our Stats'}</h2>
            <div class="stats">${statsItems}</div>
          </div>
        `;

      case 'features':
        const featuresItems = (content.features || []).map((feature: any) => `
          <div class="feature">
            ${feature.icon ? `<i class="${feature.icon}" style="font-size: 3rem; color: #007bff; margin-bottom: 1rem;"></i>` : ''}
            <h3>${feature.title || ''}</h3>
            <p>${feature.description || ''}</p>
          </div>
        `).join('');

        return `
          <div class="block">
            <h2 style="text-align: center; margin-bottom: 2rem;">${content.title || 'Features'}</h2>
            <div class="features">${featuresItems}</div>
          </div>
        `;

      case 'gallery':
        const galleryImages = (content.images || []).map((image: any) => `
          <div>
            <img src="${image.url || '/placeholder-image.jpg'}" alt="${image.title || ''}" />
            ${image.title ? `<p style="margin-top: 0.5rem; text-align: center;">${image.title}</p>` : ''}
          </div>
        `).join('');

        return `
          <div class="block">
            <h2 style="text-align: center; margin-bottom: 2rem;">${content.title || 'Gallery'}</h2>
            <div class="gallery">${galleryImages}</div>
          </div>
        `;

      default:
        return `
          <div class="block">
            <div style="padding: 1rem; line-height: 1.8;">
              ${content.title ? `<h2>${content.title}</h2>` : ''}
              ${content.text || content.content || ''}
            </div>
          </div>
        `;
    }
  }
}
