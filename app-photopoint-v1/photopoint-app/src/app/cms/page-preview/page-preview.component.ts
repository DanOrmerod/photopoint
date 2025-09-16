import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { WebsiteService } from '../../services/website.service';

interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  images: string[];
  category?: string;
  description?: string;
  features?: string[];
  variants?: ProductVariant[];
}

interface ProductVariant {
  name: string;
  options: string[];
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

@Component({
  selector: 'app-page-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-preview.component.html',
  styleUrl: './page-preview.component.scss'
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
    
    this.loadPreview();
  }

  async loadPreview() {
    const websiteId = this.websiteId();
    const pageId = this.pageId();
    
    if (!websiteId || !pageId) {
      this.error.set('Invalid website or page ID');
      return;
    }

    try {
      this.loading.set(true);
      this.error.set(null);

      // Get website and page data
      const [website, page] = await Promise.all([
        this.websiteService.getWebsite(websiteId),
        this.websiteService.getPage(websiteId, pageId)
      ]);

      if (!website || !page) {
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
                const title = block.content?.title || '';
                const subtitle = block.content?.subtitle || '';
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
          <div style="flex: 1; min-width: 250px; margin-bottom: 30px; text-align: center;">
            ${column.icon ? `<div style="font-size: 3em; color: #007bff; margin-bottom: 20px;"><i class="${column.icon}"></i></div>` : ''}
            <h3 style="margin: 20px 0 15px 0;">${column.title || ''}</h3>
            <p style="line-height: 1.6; color: #666;">${column.description || ''}</p>
          </div>
        `).join('');

        return `
          <div class="block" style="padding: 60px 0; background: ${styles.backgroundColor || 'transparent'};">
            ${content.title ? `<h2 style="text-align: center; margin-bottom: 20px;">${content.title}</h2>` : ''}
            ${content.subtitle ? `<p style="text-align: center; font-size: 1.2em; opacity: 0.8; margin-bottom: 50px;">${content.subtitle}</p>` : ''}
            <div style="display: flex; flex-wrap: wrap; gap: 40px; justify-content: center;">${columnsItems}</div>
          </div>
        `;

      case 'divider':
        return `
          <div class="block" style="padding: ${styles.padding || '20px 0'}; background: ${styles.backgroundColor || 'transparent'};">
            <hr style="
              border: none; 
              height: ${content.height || '1px'}; 
              background-color: ${content.color || '#e2e8f0'}; 
              width: ${content.width || '100%'}; 
              margin: 0 auto;
              border-style: ${content.style || 'solid'};
            ">
          </div>
        `;

      case 'button':
        const buttonStyle = content.style === 'secondary' ? 
          'background: transparent; color: #007bff; border: 2px solid #007bff;' :
          'background: #007bff; color: white; border: none;';
        return `
          <div class="block" style="padding: ${styles.padding || '20px 0'}; text-align: ${styles.textAlign || 'left'}; background: ${styles.backgroundColor || 'transparent'};">
            <a href="${content.href || '#'}" style="
              display: inline-block;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              transition: all 0.2s;
              ${buttonStyle}
            ">
              ${content.text || 'Click me'}
            </a>
          </div>
        `;

      case 'spacer':
        return `<div style="height: ${content.height || '40px'};"></div>`;

      case 'image':
        return `
          <div class="block" style="padding: ${styles.padding || '20px 0'}; text-align: ${styles.textAlign || 'center'}; background: ${styles.backgroundColor || 'transparent'};">
            ${content.src ? 
              `<img src="${content.src}" alt="${content.alt || ''}" style="max-width: 100%; height: auto; border-radius: ${styles.borderRadius || '0px'};">` :
              `<div style="padding: 40px; border: 2px dashed #ccc; border-radius: 8px; text-align: center; color: #666;">
                <p>No image selected</p>
              </div>`
            }
            ${content.caption ? `<p style="margin-top: 10px; font-style: italic; color: #666;">${content.caption}</p>` : ''}
          </div>
        `;

      case 'form':
        const formFields = (content.fields || []).map((field: any) => {
          if (field.type === 'textarea') {
            return `
              <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">${field.label}${field.required ? '*' : ''}</label>
                <textarea style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: inherit;" rows="4" placeholder="${field.label}"></textarea>
              </div>
            `;
          } else {
            return `
              <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">${field.label}${field.required ? '*' : ''}</label>
                <input type="${field.type}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: inherit;" placeholder="${field.label}">
              </div>
            `;
          }
        }).join('');

        return `
          <div class="block" style="padding: ${styles.padding || '40px 20px'}; background: ${styles.backgroundColor || 'transparent'};">
            <form>
              <h3 style="margin-bottom: 30px;">${content.title || 'Contact Form'}</h3>
              ${formFields}
              <button type="button" style="
                background: #007bff;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 4px;
                font-weight: 600;
                cursor: pointer;
              ">
                ${content.submitText || 'Submit'}
              </button>
            </form>
          </div>
        `;

      case 'contact':
        return `
          <div class="block" style="padding: ${styles.padding || '40px 20px'}; background: ${styles.backgroundColor || 'transparent'};">
            ${content.title ? `<h2 style="text-align: center; margin-bottom: 20px;">${content.title}</h2>` : ''}
            ${content.subtitle ? `<p style="text-align: center; font-size: 1.2em; opacity: 0.8; margin-bottom: 40px;">${content.subtitle}</p>` : ''}
            <div style="display: flex; justify-content: center; gap: 40px; flex-wrap: wrap;">
              ${content.phone ? `
                <div style="text-align: center; margin-bottom: 20px;">
                  <div style="font-size: 2em; color: #3b82f6; margin-bottom: 10px;"><i class="fas fa-phone"></i></div>
                  <h4 style="margin: 0 0 5px 0;">Phone</h4>
                  <p style="margin: 0; color: #666;">${content.phone}</p>
                </div>
              ` : ''}
              ${content.email ? `
                <div style="text-align: center; margin-bottom: 20px;">
                  <div style="font-size: 2em; color: #3b82f6; margin-bottom: 10px;"><i class="fas fa-envelope"></i></div>
                  <h4 style="margin: 0 0 5px 0;">Email</h4>
                  <p style="margin: 0; color: #666;">${content.email}</p>
                </div>
              ` : ''}
              ${content.address ? `
                <div style="text-align: center; margin-bottom: 20px;">
                  <div style="font-size: 2em; color: #3b82f6; margin-bottom: 10px;"><i class="fas fa-map-marker-alt"></i></div>
                  <h4 style="margin: 0 0 5px 0;">Address</h4>
                  <p style="margin: 0; color: #666;">${content.address}</p>
                </div>
              ` : ''}
            </div>
          </div>
        `;

      case 'product-catalog':
        const displayMode = content.displayMode || 'grid';
        const productsPerRow = content.productsPerRow || 3;
        const sampleProducts = content.products || [
          {
            id: '1',
            name: 'Premium Product',
            price: 29.99,
            salePrice: 24.99,
            images: ['/assets/sample-product.jpg'],
            category: 'featured'
          },
          {
            id: '2',
            name: 'Best Seller',
            price: 39.99,
            images: ['/assets/sample-product2.jpg'],
            category: 'popular'
          },
          {
            id: '3',
            name: 'New Arrival',
            price: 19.99,
            images: ['/assets/sample-product3.jpg'],
            category: 'new'
          }
        ];

        const productCards = sampleProducts.map((product: Product) => `
          <div style="
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            text-align: center;
            transition: transform 0.2s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          ">
            <img src="${product.images[0] || '/placeholder-product.jpg'}" 
                 alt="${product.name}" 
                 style="width: 100%; height: 200px; object-fit: cover; border-radius: 6px; margin-bottom: 12px;">
            <h4 style="margin: 0 0 8px 0; font-size: 16px;">${product.name}</h4>
            <div style="margin: 8px 0;">
              ${product.salePrice ? 
                `<span style="color: #dc2626; font-weight: bold;">$${product.salePrice}</span>
                 <span style="text-decoration: line-through; color: #6b7280; margin-left: 8px;">$${product.price}</span>` :
                `<span style="font-weight: bold;">$${product.price}</span>`
              }
            </div>
            <button style="
              background: #007bff;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              font-size: 14px;
              cursor: pointer;
              width: 100%;
            ">Add to Cart</button>
          </div>
        `).join('');

        return `
          <div class="block" style="padding: 40px 20px;">
            <h2 style="text-align: center; margin-bottom: 40px;">${content.title || 'Our Products'}</h2>
            <div style="
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 24px;
              max-width: 1200px;
              margin: 0 auto;
            ">
              ${productCards}
            </div>
          </div>
        `;

      case 'product-detail':
        const product = content.product || {
          name: 'Premium Product',
          price: 29.99,
          salePrice: 24.99,
          images: ['/placeholder-product.jpg'],
          description: 'This is a sample product description with detailed information about features and benefits.',
          features: ['High Quality', 'Fast Shipping', '30-Day Return'],
          variants: [
            { name: 'Color', options: ['Red', 'Blue', 'Green'] },
            { name: 'Size', options: ['Small', 'Medium', 'Large'] }
          ]
        };

        const variantSelectors = product.variants ? product.variants.map((variant: ProductVariant) => `
          <div style="margin: 16px 0;">
            <label style="display: block; font-weight: bold; margin-bottom: 8px;">${variant.name}:</label>
            <select style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
              ${variant.options.map((option: string) => `<option value="${option}">${option}</option>`).join('')}
            </select>
          </div>
        `).join('') : '';

        return `
          <div class="block" style="padding: 40px 20px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; max-width: 1200px; margin: 0 auto;">
              <div>
                <img src="${product.images[0] || '/placeholder-product.jpg'}" 
                     alt="${product.name}" 
                     style="width: 100%; height: 400px; object-fit: cover; border-radius: 8px;">
              </div>
              <div>
                <h1 style="margin: 0 0 16px 0;">${product.name}</h1>
                <div style="margin: 16px 0; font-size: 24px;">
                  ${product.salePrice ? 
                    `<span style="color: #dc2626; font-weight: bold;">$${product.salePrice}</span>
                     <span style="text-decoration: line-through; color: #6b7280; margin-left: 12px;">$${product.price}</span>` :
                    `<span style="font-weight: bold;">$${product.price}</span>`
                  }
                </div>
                <p style="line-height: 1.6; color: #4b5563; margin: 20px 0;">${product.description}</p>
                ${variantSelectors}
                <div style="margin: 24px 0;">
                  <label style="display: block; font-weight: bold; margin-bottom: 8px;">Quantity:</label>
                  <input type="number" value="1" min="1" style="width: 80px; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
                </div>
                <button style="
                  background: #007bff;
                  color: white;
                  border: none;
                  padding: 16px 32px;
                  border-radius: 6px;
                  font-size: 16px;
                  font-weight: bold;
                  cursor: pointer;
                  width: 100%;
                  margin: 20px 0;
                ">Add to Cart</button>
              </div>
            </div>
          </div>
        `;

      case 'shopping-cart':
        const cartItems = content.items || [
          { id: '1', name: 'Sample Product 1', price: 29.99, quantity: 2, image: '/placeholder-product.jpg' },
          { id: '2', name: 'Sample Product 2', price: 19.99, quantity: 1, image: '/placeholder-product2.jpg' }
        ];
        const subtotal = cartItems.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
        const shipping = 9.99;
        const total = subtotal + shipping;

        const cartRows = cartItems.map((item: CartItem) => `
          <tr>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
              <div style="display: flex; align-items: center; gap: 16px;">
                <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
                <div>
                  <h4 style="margin: 0; font-size: 16px;">${item.name}</h4>
                  <p style="margin: 4px 0 0 0; color: #6b7280;">$${item.price.toFixed(2)}</p>
                </div>
              </div>
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; text-align: center;">
              <input type="number" value="${item.quantity}" min="1" style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px; text-align: center;">
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">
              $${(item.price * item.quantity).toFixed(2)}
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; text-align: center;">
              <button style="color: #dc2626; border: none; background: none; cursor: pointer;">Remove</button>
            </td>
          </tr>
        `).join('');

        return `
          <div class="block" style="padding: 40px 20px;">
            <h2 style="margin-bottom: 40px;">Shopping Cart</h2>
            <div style="max-width: 1000px; margin: 0 auto;">
              <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <thead>
                  <tr style="background: #f9fafb;">
                    <th style="padding: 16px; text-align: left; border-bottom: 2px solid #e5e7eb;">Product</th>
                    <th style="padding: 16px; text-align: center; border-bottom: 2px solid #e5e7eb;">Quantity</th>
                    <th style="padding: 16px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
                    <th style="padding: 16px; border-bottom: 2px solid #e5e7eb;"></th>
                  </tr>
                </thead>
                <tbody>
                  ${cartRows}
                </tbody>
              </table>
              <div style="margin-top: 32px; max-width: 400px; margin-left: auto;">
                <div style="background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <h3 style="margin: 0 0 16px 0;">Order Summary</h3>
                  <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                    <span>Subtotal:</span>
                    <span>$${subtotal.toFixed(2)}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                    <span>Shipping:</span>
                    <span>$${shipping.toFixed(2)}</span>
                  </div>
                  <hr style="margin: 16px 0; border: none; border-top: 1px solid #e5e7eb;">
                  <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px;">
                    <span>Total:</span>
                    <span>$${total.toFixed(2)}</span>
                  </div>
                  <button style="
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 16px;
                    border-radius: 6px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    width: 100%;
                    margin-top: 20px;
                  ">Proceed to Checkout</button>
                </div>
              </div>
            </div>
          </div>
        `;

      case 'checkout':
        return `
          <div class="block" style="padding: 40px 20px;">
            <h2 style="text-align: center; margin-bottom: 40px;">Checkout</h2>
            <div style="max-width: 800px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
              <div>
                <h3>Shipping Information</h3>
                <form style="background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                    <input type="text" placeholder="First Name" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 4px;">
                    <input type="text" placeholder="Last Name" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 4px;">
                  </div>
                  <input type="email" placeholder="Email" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 4px; margin-bottom: 16px;">
                  <input type="text" placeholder="Address" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 4px; margin-bottom: 16px;">
                  <div style="display: grid; grid-template-columns: 1fr 1fr 100px; gap: 16px; margin-bottom: 16px;">
                    <input type="text" placeholder="City" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 4px;">
                    <select style="padding: 12px; border: 1px solid #d1d5db; border-radius: 4px;">
                      <option>State</option>
                    </select>
                    <input type="text" placeholder="ZIP" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 4px;">
                  </div>
                </form>

                <h3 style="margin-top: 32px;">Payment Information</h3>
                <form style="background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <input type="text" placeholder="Card Number" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 4px; margin-bottom: 16px;">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <input type="text" placeholder="MM/YY" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 4px;">
                    <input type="text" placeholder="CVC" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 4px;">
                  </div>
                </form>
              </div>
              
              <div>
                <h3>Order Summary</h3>
                <div style="background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                      <span>Sample Product × 2</span>
                      <span>$59.98</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span>Another Product × 1</span>
                      <span>$19.99</span>
                    </div>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                    <span>Subtotal:</span>
                    <span>$79.97</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                    <span>Shipping:</span>
                    <span>$9.99</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                    <span>Tax:</span>
                    <span>$7.20</span>
                  </div>
                  <hr style="margin: 16px 0; border: none; border-top: 1px solid #e5e7eb;">
                  <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px;">
                    <span>Total:</span>
                    <span>$97.16</span>
                  </div>
                  <button style="
                    background: #10b981;
                    color: white;
                    border: none;
                    padding: 16px;
                    border-radius: 6px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    width: 100%;
                    margin-top: 24px;
                  ">Place Order</button>
                </div>
              </div>
            </div>
          </div>
        `;

      case 'product-search':
        return `
          <div class="block" style="padding: 40px 20px;">
            <div style="max-width: 1200px; margin: 0 auto;">
              <h2 style="text-align: center; margin-bottom: 40px;">Search Products</h2>
              
              <div style="display: flex; gap: 32px;">
                <div style="width: 250px; background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); height: fit-content;">
                  <h3 style="margin: 0 0 20px 0;">Filters</h3>
                  
                  <div style="margin-bottom: 24px;">
                    <h4 style="margin: 0 0 12px 0;">Category</h4>
                    <label style="display: block; margin: 8px 0;"><input type="checkbox" style="margin-right: 8px;"> Electronics</label>
                    <label style="display: block; margin: 8px 0;"><input type="checkbox" style="margin-right: 8px;"> Clothing</label>
                    <label style="display: block; margin: 8px 0;"><input type="checkbox" style="margin-right: 8px;"> Home & Garden</label>
                  </div>
                  
                  <div style="margin-bottom: 24px;">
                    <h4 style="margin: 0 0 12px 0;">Price Range</h4>
                    <div style="display: flex; gap: 8px; align-items: center;">
                      <input type="number" placeholder="Min" style="width: 80px; padding: 6px; border: 1px solid #d1d5db; border-radius: 4px;">
                      <span>-</span>
                      <input type="number" placeholder="Max" style="width: 80px; padding: 6px; border: 1px solid #d1d5db; border-radius: 4px;">
                    </div>
                  </div>
                  
                  <button style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; width: 100%;">
                    Apply Filters
                  </button>
                </div>
                
                <div style="flex: 1;">
                  <div style="display: flex; gap: 16px; margin-bottom: 24px; align-items: center;">
                    <input type="text" placeholder="Search products..." style="flex: 1; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px;">
                    <select style="padding: 12px; border: 1px solid #d1d5db; border-radius: 6px;">
                      <option>Sort by</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Name: A-Z</option>
                      <option>Newest First</option>
                    </select>
                  </div>
                  
                  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px;">
                    ${Array.from({length: 6}).map((_, i) => `
                      <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center;">
                        <img src="/placeholder-product${i+1}.jpg" alt="Product ${i+1}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 6px; margin-bottom: 12px;">
                        <h4 style="margin: 0 0 8px 0; font-size: 14px;">Search Result ${i+1}</h4>
                        <p style="margin: 8px 0; font-weight: bold;">$${(Math.random() * 50 + 10).toFixed(2)}</p>
                        <button style="background: #007bff; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; width: 100%;">
                          Add to Cart
                        </button>
                      </div>
                    `).join('')}
                  </div>
                  
                  <div style="text-align: center; margin-top: 32px;">
                    <button style="background: #6b7280; color: white; border: none; padding: 10px 20px; border-radius: 4px; margin: 0 4px;">Previous</button>
                    <span style="margin: 0 16px; color: #6b7280;">Page 1 of 3</span>
                    <button style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; margin: 0 4px;">Next</button>
                  </div>
                </div>
              </div>
            </div>
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
