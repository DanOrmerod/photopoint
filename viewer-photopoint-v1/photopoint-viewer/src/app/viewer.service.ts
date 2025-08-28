import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CssFrameworkService } from './css-framework.service';

export interface ViewerPageData {
  html: string;
  css: string;
  components: string[];
  theme?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ViewerService {
  private baseUrl = 'http://localhost:3001/api/v1';

  constructor(
    private http: HttpClient,
    private cssFramework: CssFrameworkService
  ) {}

  /**
   * Get optimized website data for viewer
   */
  getWebsiteForViewer(domain: string): Observable<ViewerPageData> {
    return new Observable(observer => {
      // First get the website data from the API
      this.http.get(`${this.baseUrl}/public/websites/${domain}`)
        .subscribe({
          next: (data: any) => {
            // Extract components used in the website
            const usedComponents = this.extractUsedComponents(data);
            
            // Generate optimized CSS
            const optimizedCSS = this.cssFramework.generateViewerCSS(
              usedComponents, 
              data.theme
            );
            
            // Generate clean HTML
            const cleanHTML = this.generateCleanHTML(data);
            
            observer.next({
              html: cleanHTML,
              css: optimizedCSS,
              components: usedComponents,
              theme: data.theme
            });
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  /**
   * Extract component types used in the website
   */
  private extractUsedComponents(data: any): string[] {
    const usedComponents = new Set<string>();
    
    if (data.pages) {
      data.pages.forEach((page: any) => {
        if (page.content) {
          try {
            const content = JSON.parse(page.content);
            if (content.blocks) {
              content.blocks.forEach((block: any) => {
                usedComponents.add(block.type);
              });
            }
          } catch (e) {
            // Handle plain text content
            usedComponents.add('text');
          }
        }
      });
    }
    
    return Array.from(usedComponents);
  }

  /**
   * Generate clean, semantic HTML for the viewer
   */
  private generateCleanHTML(data: any): string {
    if (!data.pages || data.pages.length === 0) {
      return '<div class="pp-container">No content available</div>';
    }

    let html = '';
    
    data.pages.forEach((page: any) => {
      if (page.content) {
        try {
          const content = JSON.parse(page.content);
          if (content.blocks) {
            content.blocks.forEach((block: any) => {
              html += this.renderBlockForViewer(block);
            });
          }
        } catch (e) {
          // Handle plain text content
          html += `<div class="pp-container"><div class="pp-text-content">${page.content}</div></div>`;
        }
      }
    });
    
    return html;
  }

  /**
   * Render individual block for viewer - matches designer rendering
   */
  private renderBlockForViewer(block: any): string {
    const styles = this.generateInlineStyles(block.styles || {});
    const content = block.content || {};

    switch (block.type) {
      case 'hero':
        const heroStyle = content.backgroundImage ? 
          `${styles} background-image: url(${content.backgroundImage}); background-size: cover; background-position: center; color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);` : 
          styles;
        return `
          <div style="${heroStyle}">
            <h1 style="font-size: 3em; margin-bottom: 20px; font-weight: 700;">${content.headline || content.title || 'Hero Title'}</h1>
            <p style="font-size: 1.3em; margin-bottom: 30px; max-width: 600px;">${content.subheading || content.subtitle || 'Hero subtitle'}</p>
            ${content.buttonText ? `<button style="background: #3b82f6; color: white; padding: 16px 32px; border: none; border-radius: 8px; font-size: 18px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39); transition: all 0.2s;">${content.buttonText}</button>` : ''}
          </div>
        `;
        
      case 'text':
        return `<div style="${styles}"><div style="line-height: 1.6;">${content.text || 'Add your text here...'}</div></div>`;
        
      case 'image':
        return `
          <div style="${styles}">
            ${content.src ? 
              `<img src="${content.src}" alt="${content.alt || ''}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">` :
              '<div style="padding: 40px; border: 2px dashed #ccc; border-radius: 8px; text-align: center; color: #666;"><p>No image selected</p></div>'
            }
            ${content.caption ? `<p style="margin-top: 10px; text-align: center; font-style: italic; color: #666;">${content.caption}</p>` : ''}
          </div>
        `;
        
      case 'button':
        const buttonStyle = content.style === 'secondary' ? 
          'background: transparent; color: #3b82f6; border: 2px solid #3b82f6;' :
          'background: #3b82f6; color: white; border: none;';
        return `
          <div style="${styles} text-align: ${block.styles?.textAlign || 'left'};">
            <a href="${content.href || '#'}" style="display: inline-block; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; transition: all 0.2s; ${buttonStyle}">
              ${content.text || 'Click me'}
            </a>
          </div>
        `;
        
      case 'columns':
        const columnsItems = (content.columns || []).map((column: any) => `
          <div style="flex: 1; min-width: 250px; margin-bottom: 30px; text-align: center;">
            ${column.icon ? `<div style="font-size: 3em; color: #3b82f6; margin-bottom: 20px;"><i class="${column.icon}"></i></div>` : ''}
            <h3 style="margin: 20px 0 15px 0;">${column.title || ''}</h3>
            <p style="line-height: 1.6; color: #666;">${column.description || ''}</p>
          </div>
        `).join('');

        return `
          <div style="${styles}">
            ${content.title ? `<h2 style="text-align: center; margin-bottom: 20px;">${content.title}</h2>` : ''}
            ${content.subtitle ? `<p style="text-align: center; font-size: 1.2em; opacity: 0.8; margin-bottom: 50px;">${content.subtitle}</p>` : ''}
            <div style="display: flex; flex-wrap: wrap; gap: 40px; justify-content: center;">
              ${columnsItems}
            </div>
          </div>
        `;
        
      case 'gallery':
        const images = (content.images || []).map((img: any) => 
          `<div style="overflow: hidden; border-radius: 8px;">
             <img src="${img.url}" alt="${img.alt || ''}" style="width: 100%; height: 200px; object-fit: cover;">
           </div>`
        ).join('');
        
        return `
          <div style="${styles}">
            <h2 style="text-align: center; margin-bottom: 50px;">${content.title || 'Gallery'}</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
              ${images}
            </div>
          </div>
        `;
        
      case 'contact':
        return `
          <div style="${styles}">
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
        
      case 'form':
        const fields = (content.fields || []).map((field: any) => {
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
          <div style="${styles}">
            <h3 style="margin-bottom: 30px; text-align: center;">${content.title || 'Contact Form'}</h3>
            ${content.phone ? `<p style="text-align: center; margin-bottom: 10px;"><strong>Phone:</strong> ${content.phone}</p>` : ''}
            ${content.email ? `<p style="text-align: center; margin-bottom: 10px;"><strong>Email:</strong> ${content.email}</p>` : ''}
            ${content.address ? `<p style="text-align: center; margin-bottom: 30px;"><strong>Address:</strong> ${content.address}</p>` : ''}
            <form style="max-width: 600px; margin: 0 auto;">
              ${fields}
              <button type="button" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 4px; font-weight: 600; cursor: pointer; width: 100%;">
                ${content.submitText || 'Submit'}
              </button>
            </form>
          </div>
        `;
        
      case 'section':
        return `
          <section style="${styles}">
            <div style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">
              <!-- Section content will be inserted here -->
            </div>
          </section>
        `;
        
      case 'social':
        const socialLinks = (content.platforms || []).map((platform: any) => 
          `<a href="${platform.url}" style="color: #64748b; font-size: 24px; margin: 0 10px; transition: color 0.2s;" title="${platform.name}">
             <i class="${platform.icon}"></i>
           </a>`
        ).join('');
        
        return `
          <div style="${styles}">
            ${content.title ? `<h2 style="text-align: center; margin-bottom: 30px;">${content.title}</h2>` : ''}
            <div style="text-align: center;">
              ${socialLinks}
            </div>
          </div>
        `;
        
      case 'video':
        return `
          <div style="${styles}">
            ${content.url ? 
              `<div style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%; border-radius: 8px; overflow: hidden;">
                <iframe src="${content.url}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allowfullscreen></iframe>
               </div>` :
              ''
            }
          </div>
        `;
        
      case 'navigation':
        const navItems = (content.items || []).map((item: any) => 
          `<a href="${item.href}" style="color: #374151; text-decoration: none; margin: 0 20px;">${item.text}</a>`
        ).join('');
        
        return `
          <nav style="${styles} display: flex; justify-content: space-between; align-items: center; padding: 15px 0;">
            <div style="font-size: 20px; font-weight: 700; color: #1e293b;">
              ${content.logo ? `<img src="${content.logo}" alt="Logo" style="height: 40px;">` : 'Logo'}
            </div>
            <div>
              ${navItems}
            </div>
          </nav>
        `;
        
      case 'spacer':
        return `<div style="height: ${content.height || '40px'};"></div>`;
        
      case 'divider':
        return `
          <div style="${styles}">
            <hr style="
              border: none; 
              height: ${content.height || '1px'}; 
              background-color: ${content.color || '#e2e8f0'}; 
              width: ${content.width || '100%'}; 
              margin: 0 auto;
            ">
          </div>
        `;
        
      case 'product-catalog':
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
          }
        ];

        const productCards = sampleProducts.map((product: any) => `
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center;">
            <img src="${product.images[0] || '/placeholder-product.jpg'}" alt="${product.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 6px; margin-bottom: 12px;">
            <h4 style="margin: 0 0 8px 0; font-size: 16px;">${product.name}</h4>
            <div style="margin: 8px 0;">
              ${product.salePrice ? 
                `<span style="color: #dc2626; font-weight: bold;">$${product.salePrice}</span>
                 <span style="text-decoration: line-through; color: #6b7280; margin-left: 8px;">$${product.price}</span>` :
                `<span style="font-weight: bold;">$${product.price}</span>`
              }
            </div>
            <button style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-size: 14px; cursor: pointer; width: 100%;">Add to Cart</button>
          </div>
        `).join('');

        return `
          <div style="${styles}">
            <h2 style="text-align: center; margin-bottom: 40px;">${content.title || 'Our Products'}</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px;">
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
          description: 'This is a sample product description.',
          variants: [{ name: 'Color', options: ['Red', 'Blue'] }]
        };

        return `
          <div style="${styles}">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
              <div>
                <img src="${product.images[0] || '/placeholder-product.jpg'}" alt="${product.name}" style="width: 100%; height: 400px; object-fit: cover; border-radius: 8px;">
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
                <button style="background: #007bff; color: white; border: none; padding: 16px 32px; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; width: 100%;">Add to Cart</button>
              </div>
            </div>
          </div>
        `;

      case 'shopping-cart':
        return `
          <div style="${styles}">
            <h2 style="margin-bottom: 40px;">Shopping Cart</h2>
            <div style="text-align: center; padding: 40px; color: #6b7280;">
              <p>Your cart is empty</p>
              <button style="background: #007bff; color: white; border: none; padding: 12px 24px; border-radius: 4px; margin-top: 16px;">Continue Shopping</button>
            </div>
          </div>
        `;

      case 'checkout':
        return `
          <div style="${styles}">
            <h2 style="text-align: center; margin-bottom: 40px;">Checkout</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
              <div>
                <h3>Shipping Information</h3>
                <form style="display: grid; gap: 16px;">
                  <input type="text" placeholder="First Name" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 4px;">
                  <input type="text" placeholder="Last Name" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 4px;">
                  <input type="email" placeholder="Email" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 4px;">
                  <input type="text" placeholder="Address" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 4px;">
                </form>
              </div>
              <div>
                <h3>Order Summary</h3>
                <div style="background: white; padding: 24px; border-radius: 8px; border: 1px solid #e5e7eb;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Subtotal:</span>
                    <span>$0.00</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                    <span>Shipping:</span>
                    <span>$0.00</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                    <span>Total:</span>
                    <span>$0.00</span>
                  </div>
                  <button style="background: #10b981; color: white; border: none; padding: 16px; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; width: 100%; margin-top: 24px;">Place Order</button>
                </div>
              </div>
            </div>
          </div>
        `;

      case 'product-search':
        return `
          <div style="${styles}">
            <h2 style="text-align: center; margin-bottom: 40px;">Search Products</h2>
            <div style="display: flex; gap: 32px;">
              <div style="width: 250px;">
                <h3>Filters</h3>
                <div style="margin-bottom: 24px;">
                  <h4>Category</h4>
                  <label style="display: block; margin: 8px 0;"><input type="checkbox" style="margin-right: 8px;"> Electronics</label>
                  <label style="display: block; margin: 8px 0;"><input type="checkbox" style="margin-right: 8px;"> Clothing</label>
                </div>
              </div>
              <div style="flex: 1;">
                <div style="display: flex; gap: 16px; margin-bottom: 24px;">
                  <input type="text" placeholder="Search products..." style="flex: 1; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px;">
                  <select style="padding: 12px; border: 1px solid #d1d5db; border-radius: 6px;">
                    <option>Sort by</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px;">
                  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center;">
                    <div style="width: 100%; height: 150px; background: #f1f5f9; border-radius: 6px; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; color: #64748b;">No Image</div>
                    <h4 style="margin: 0 0 8px 0; font-size: 14px;">Sample Product</h4>
                    <p style="margin: 8px 0; font-weight: bold;">$29.99</p>
                    <button style="background: #007bff; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; width: 100%;">Add to Cart</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        
      default:
        return `<div style="${styles}">Unknown component: ${block.type}</div>`;
    }
  }

  /**
   * Generate inline styles from block styles object
   */
  private generateInlineStyles(styles: any): string {
    let inlineStyles = '';
    
    if (styles.backgroundColor) inlineStyles += `background-color: ${styles.backgroundColor}; `;
    if (styles.backgroundImage) inlineStyles += `background-image: url(${styles.backgroundImage}); background-size: cover; background-position: center; `;
    if (styles.textColor) inlineStyles += `color: ${styles.textColor}; `;
    if (styles.padding) inlineStyles += `padding: ${styles.padding}; `;
    if (styles.margin) inlineStyles += `margin: ${styles.margin}; `;
    if (styles.fontSize) inlineStyles += `font-size: ${styles.fontSize}; `;
    if (styles.fontWeight) inlineStyles += `font-weight: ${styles.fontWeight}; `;
    if (styles.textAlign) inlineStyles += `text-align: ${styles.textAlign}; `;
    if (styles.borderRadius) inlineStyles += `border-radius: ${styles.borderRadius}; `;
    if (styles.border) inlineStyles += `border: ${styles.border}; `;
    if (styles.boxShadow) inlineStyles += `box-shadow: ${styles.boxShadow}; `;
    if (styles.minHeight) inlineStyles += `min-height: ${styles.minHeight}; `;
    
    return inlineStyles;
  }
}
