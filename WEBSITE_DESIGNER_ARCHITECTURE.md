# PhotoPoint Website Designer - Architecture & Design Document

## 🏗️ System Overview

PhotoPoint CMS is a comprehensive visual website builder that allows users to create professional websites through a drag-and-drop interface. The system consists of three main applications working together:

1. **Designer App** (`app-photopoint-v1`) - Visual website builder interface
2. **Viewer App** (`viewer-photopoint-v1`) - Renders published websites for end users  
3. **Backend API** (`svc-photopoint-v1`) - Handles data persistence and website publishing

## 🎯 Core Architecture

### Component-Based Design System

The designer uses a **block-based architecture** where websites are built by combining reusable components:

```typescript
interface DesignBlock {
  id: string;
  type: 'hero' | 'text' | 'image' | 'gallery' | 'spacer' | 'button' | 
        'columns' | 'section' | 'navigation' | 'video' | 'form' | 'social' | 'divider';
  content: any; // Component-specific content
  styles: {
    backgroundColor?: string;
    backgroundImage?: string;
    textColor?: string;
    padding?: string;
    margin?: string;
    fontSize?: string;
    // ... comprehensive styling options
  };
  layout?: {
    columns?: number;
    gap?: string;
    alignItems?: string;
    justifyContent?: string;
  };
}
```

### Application Structure

```
PhotoPoint System
├── Designer App (Port 4200)
│   ├── Visual Designer Component
│   ├── Page Preview Component  
│   ├── Theme Customizer
│   └── Website Management
├── Viewer App (Port 4300)
│   ├── Website Viewer Component
│   ├── CSS Framework Service
│   └── Public Website Rendering
└── Backend API (Port 3001)
    ├── Website Controller
    ├── Page Controller
    ├── Database Repositories
    └── Public API Endpoints
```

## 🎨 Designer Application Workflow

### 1. Website Creation
- Users create a new website with basic metadata (name, subdomain, theme)
- System generates a default website with initial page structure
- Database stores website record with status 'draft'

### 2. Visual Designer Interface

The visual designer consists of three main panels:

#### Left Panel - Component Palette
**Layout Components:**
- Section (container with background options)
- Hero Section (full-width header with call-to-action)
- Columns (responsive grid layouts)
- Spacer (vertical spacing control)
- Divider (horizontal separators)

**Content Components:**
- Text Block (rich text editor)
- Image (single image with styling)
- Gallery (responsive image grid)
- Video (embedded video content)

**Navigation Components:**
- Menu (responsive navigation with mobile toggle)

**Interactive Components:**
- Button (call-to-action buttons)
- Contact Form (configurable form fields)
- Social Links (social media integration)

#### Center Panel - Design Canvas
- **Real-time Preview:** Shows website as it will appear to visitors
- **Device Responsive:** Switch between Desktop/Tablet/Mobile views
- **Interactive Editing:** Click blocks to select and edit
- **Block Controls:** Move up/down, duplicate, delete selected blocks
- **Drag-and-Drop:** (Planned enhancement)

#### Right Panel - Style Editor
When a block is selected, provides comprehensive styling options:

**Visual Styling:**
- Background colors and images
- Text colors and typography
- Padding and margin controls
- Border styles and radius
- Box shadows and effects

**Layout Controls:**
- Text alignment
- Element positioning
- Responsive behavior
- Height and width settings

### 3. Content Storage Format

Pages store content as structured JSON:
```json
{
  "blocks": [
    {
      "type": "hero",
      "content": {
        "title": "Welcome to My Site",
        "subtitle": "Professional photography services",
        "buttonText": "Learn More",
        "backgroundImage": "/images/hero-bg.jpg"
      },
      "styles": {
        "backgroundColor": "#ffffff",
        "textColor": "#333333",
        "padding": "80px 20px",
        "textAlign": "center"
      }
    },
    {
      "type": "text",
      "content": {
        "text": "<p>About our services...</p>"
      },
      "styles": {
        "padding": "40px 20px",
        "fontSize": "18px"
      }
    }
  ]
}
```

### 4. Save & Preview Process

**Save Process:**
1. User clicks "Save" in designer
2. Design blocks converted to JSON format
3. Content sent to backend API via PUT `/websites/{id}/pages/{pageId}`
4. Database updates page content and modified timestamp
5. Designer shows save confirmation

**Preview Process:**
1. User clicks "Preview" button
2. Page Preview component renders current design blocks
3. Blocks rendered using same logic as viewer (but in CMS context)
4. Preview opens in fullscreen overlay
5. Shows exactly how page will appear when published

## 🌐 Publishing & Viewer System

### Publishing Process

When user clicks "Publish Website":

1. **Frontend Service Call:**
   ```typescript
   publishWebsite(id: string): Promise<Website> {
     return this.http.post<any>(`${this.apiUrl}/websites/${id}/publish`, {}, 
       { headers: this.getHeaders() }).toPromise()
       .then(response => {
         // Handle success response
         return this.mapWebsiteResponse(response.website);
       });
   }
   ```

2. **Backend Processing:**
   ```typescript
   async publishWebsite(req: Request, res: Response): Promise<void> {
     // Update website status to 'active' 
     // Set LastPublishedAt timestamp
     // Update all pages to 'published' status
     const website = await this.websiteRepo.publish(websiteId, userId);
     res.json({ message: "Website published successfully", website });
   }
   ```

3. **Database Updates:**
   - Website status changed from 'draft' to 'active'
   - LastPublishedAt timestamp set
   - All pages marked as published
   - Website becomes accessible via public URLs

### Viewer Application Architecture

The viewer app renders published websites for end users:

**URL Structure:**
- `subdomain.localhost:4300` (development)
- `subdomain.photopoint.studio` (production)
- `customdomain.com` (custom domains)

**Rendering Process:**

1. **Domain Extraction:**
   ```typescript
   extractDomainFromUrl(): string {
     const hostname = window.location.hostname;
     if (hostname.includes('.localhost')) {
       return hostname.split('.')[0]; // Extract subdomain
     }
     return hostname;
   }
   ```

2. **Content Fetching:**
   ```typescript
   // Viewer calls public API endpoints
   GET /api/v1/websites/website/${domain}        // Get website data
   GET /api/v1/websites/website/${domain}/pages  // Get all published pages
   ```

3. **Block Rendering:**
   Each block type has specific rendering logic:
   ```typescript
   renderBlock(block: any): SafeHtml {
     switch (block.type) {
       case 'hero':
         return this.renderHeroBlock(block);
       case 'text':
         return this.renderTextBlock(block);
       case 'image':
         return this.renderImageBlock(block);
       // ... other block types
     }
   }
   ```

4. **CSS Framework:**
   - Base CSS framework loaded once and cached
   - Component-specific styles injected as needed
   - Responsive design utilities applied
   - Theme-based styling with CSS custom properties

## 🎯 Preview vs Published Rendering

### Preview Rendering (In Designer)

**Context:** Page Preview Component in Designer App
**Purpose:** Show designers exactly how their page will look
**Process:**
1. Takes current `designBlocks` array from designer state
2. Renders each block using preview rendering methods
3. Applies current styles and content in real-time
4. Shows in fullscreen overlay within designer app

**Rendering Logic:**
```typescript
// In page-preview.component.ts
renderBlockContent(block: any): SafeHtml {
  switch (block.type) {
    case 'hero':
      return this.sanitizer.bypassSecurityTrustHtml(`
        <div class="hero-block" style="${this.getBlockStyles(block)}">
          <h1>${block.content.title || 'Hero Title'}</h1>
          <p>${block.content.subtitle || ''}</p>
        </div>
      `);
    case 'divider':
      return this.sanitizer.bypassSecurityTrustHtml(`
        <hr style="border: none; height: ${block.content.height || '1px'}; 
                   background-color: ${block.content.color || '#e2e8f0'};">
      `);
    // ... other block types
  }
}
```

### Published Website Rendering (In Viewer)

**Context:** Website Viewer Component in Viewer App
**Purpose:** Deliver optimized, fast-loading websites to end users
**Process:**
1. Fetches published website data from public API
2. Gets all published pages and their content
3. Renders blocks using production-optimized rendering
4. Applies CSS framework for performance and consistency

**Rendering Logic:**
```typescript
// In viewer.service.ts - Production rendering
renderBlock(block: any): SafeHtml {
  const baseStyles = this.getBlockStyles(block);
  
  switch (block.type) {
    case 'hero':
      return this.sanitizer.bypassSecurityTrustHtml(`
        <section class="hero-section" style="${baseStyles}">
          <div class="container">
            <h1 class="hero-title">${this.escapeHtml(block.content.title || '')}</h1>
            ${block.content.subtitle ? 
              `<p class="hero-subtitle">${this.escapeHtml(block.content.subtitle)}</p>` : ''}
            ${block.content.buttonText ? 
              `<a href="${block.content.buttonUrl || '#'}" class="hero-button">
                 ${this.escapeHtml(block.content.buttonText)}
               </a>` : ''}
          </div>
        </section>
      `);
    case 'divider':
      return this.sanitizer.bypassSecurityTrustHtml(`
        <div class="divider-block" style="${baseStyles}">
          <hr style="width: ${block.content.width || '100%'}; 
                     height: ${block.content.height || '1px'}; 
                     background-color: ${block.content.color || '#e2e8f0'};
                     border: none;
                     border-style: ${block.content.style || 'solid'};">
        </div>
      `);
    // ... other block types with production optimization
  }
}
```

## 🔄 Data Flow Architecture

### Content Creation Flow
```
Designer Interface → Visual Designer Component → Website Service → Backend API → Database
```

### Publishing Flow  
```
Publish Button → Website Service → Publish Endpoint → Database Status Update → Public API Enabled
```

### Viewer Flow
```
Public URL → Viewer App → Website Service → Public API → Database → Rendered Website
```

## 🛠️ Technical Implementation Details

### Database Schema

**Websites Table:**
```sql
- Id (UNIQUEIDENTIFIER)
- UserId (UNIQUEIDENTIFIER) 
- Name (NVARCHAR)
- Subdomain (NVARCHAR)
- Status (NVARCHAR) CHECK: 'draft', 'active', 'inactive', 'suspended'
- LastPublishedAt (DATETIME2)
- CreatedAt (DATETIME2)
- UpdatedAt (DATETIME2)
```

**Pages Table:**
```sql
- Id (UNIQUEIDENTIFIER)
- WebsiteId (UNIQUEIDENTIFIER)
- Title (NVARCHAR)
- Slug (NVARCHAR)
- Content (NVARCHAR(MAX)) -- JSON storage of blocks
- Status (NVARCHAR) -- 'draft', 'published'
- IsHomePage (BIT)
- SortOrder (INT)
```

### API Endpoints

**Designer API (Authenticated):**
- `GET /api/v1/websites` - List user's websites
- `POST /api/v1/websites` - Create new website
- `PUT /api/v1/websites/{id}` - Update website
- `POST /api/v1/websites/{id}/publish` - Publish website
- `GET /api/v1/websites/{id}/pages` - Get website pages
- `PUT /api/v1/websites/{id}/pages/{pageId}` - Update page content

**Public API (No auth required):**
- `GET /api/v1/websites/website/{domain}` - Get published website
- `GET /api/v1/websites/website/{domain}/pages` - Get published pages
- `GET /api/v1/websites/website/{domain}/pages/{slug}` - Get specific page

### CSS Framework Integration

**Base Framework:** Optimized CSS similar to Tailwind
**Component Styles:** Loaded on-demand per component type
**Theme System:** CSS custom properties for dynamic theming
**Responsive Design:** Mobile-first approach with breakpoints

## 🚀 Performance Optimizations

### CSS Optimization
- Base framework loaded once and cached
- Component-specific CSS loaded on demand  
- Theme variables for dynamic styling
- Minified production builds

### Rendering Optimization
- Only renders components actually used
- Efficient DOM updates during design
- Optimized HTML structure for viewer
- Fast preview generation

### Caching Strategy
- Static assets cached by browser
- API responses cached where appropriate
- CSS framework cached across sessions

## 📱 Responsive Design

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px  
- Desktop: > 1024px

**Responsive Features:**
- Device preview in designer
- Automatic mobile navigation toggle
- Responsive grid layouts
- Touch-friendly controls
- Optimized mobile typography

## 🔧 Extension Points

### Adding New Block Types

1. **Define Block Interface:**
   ```typescript
   // Add to DesignBlock type union
   type: 'hero' | 'text' | ... | 'newBlockType'
   ```

2. **Add to Component Palette:**
   ```html
   <div class="component-item" (click)="addBlock('newBlockType')">
     <div class="component-icon">
       <i class="fas fa-icon"></i>
     </div>
     <span>New Block</span>
   </div>
   ```

3. **Implement Rendering:**
   ```typescript
   // In visual designer
   case 'newBlockType':
     return this.renderNewBlock(block);
   
   // In viewer service  
   case 'newBlockType':
     return this.renderNewBlockForViewer(block);
   
   // In preview component
   case 'newBlockType':
     return this.renderNewBlockPreview(block);
   ```

4. **Add Default Content:**
   ```typescript
   getDefaultContent(type: DesignBlock['type']) {
     case 'newBlockType':
       return { /* default content structure */ };
   }
   ```

### Theme Customization

Themes are defined with CSS custom properties and can be dynamically applied:

```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --background-color: #ffffff;
  --text-color: #1f2937;
}
```

## 🎯 Future Enhancements

### Planned Features
- **Advanced Animation System:** Block animations and transitions
- **Component Marketplace:** Share and download custom components  
- **A/B Testing:** Test different page variations
- **SEO Optimization Tools:** Built-in SEO guidance
- **Advanced Form Builder:** Complex forms with validation
- **E-commerce Components:** Product catalogs, shopping carts
- **Multi-language Support:** Content in multiple languages
- **Advanced Analytics:** Detailed visitor analytics

## 📋 **Forms & E-commerce Capability Assessment**

### ✅ Forms Support (Currently Available)

**Current Form Features:**
- Contact form block component with visual builder
- Configurable field types (text, email, textarea, select)
- Custom field labels, validation rules, and styling
- Submit button customization and action URL configuration
- Form rendering in both preview and published sites
- Basic client-side validation framework

**Advanced Form Features (Planned):**
- **Multi-step Forms:** Wizard-style forms with progress indicators
- **Conditional Logic:** Show/hide fields based on user input
- **File Upload Fields:** Document and image upload capabilities
- **Payment Forms:** Stripe/PayPal integration for paid forms
- **Form Analytics:** Submission tracking and conversion metrics
- **CRM Integration:** Automatic lead capture to popular CRM systems
- **Email Notifications:** Automated responses and admin notifications

### 🛒 E-commerce Support (Enhancement Required)

**Current E-commerce Foundation:**
- Block-based architecture supports product display components
- Template system includes e-commerce category
- Extensible design allows adding shopping cart blocks
- Payment form building blocks available

**Required E-commerce Components:**
- **Product Catalog Block:** Grid/list product displays with filtering
- **Product Detail Block:** Individual product pages with galleries
- **Shopping Cart Block:** Add-to-cart functionality with quantity controls
- **Checkout Block:** Multi-step checkout with shipping/billing forms
- **Payment Processing:** Stripe, PayPal, Square integration
- **Inventory Management:** Stock tracking and availability
- **Order Management:** Order status, tracking, and fulfillment
- **Customer Accounts:** Registration, login, order history
- **Product Search:** Search and filter functionality
- **Shipping Calculator:** Real-time shipping cost calculation

**E-commerce Architecture Extension:**
```typescript
// Proposed e-commerce block types
interface EcommerceBlock extends DesignBlock {
  type: 'product-catalog' | 'product-detail' | 'shopping-cart' | 
        'checkout' | 'customer-account' | 'order-tracking';
  content: {
    // Product catalog
    products?: Product[];
    displayMode?: 'grid' | 'list';
    itemsPerPage?: number;
    showFilters?: boolean;
    
    // Shopping cart
    cartItems?: CartItem[];
    showQuantity?: boolean;
    showRemove?: boolean;
    
    // Checkout
    steps?: CheckoutStep[];
    paymentMethods?: PaymentMethod[];
    shippingOptions?: ShippingOption[];
  };
  ecommerce?: {
    productIds?: string[];
    categoryIds?: string[];
    priceRange?: { min: number; max: number; };
    currency?: string;
    taxSettings?: TaxConfiguration;
  };
}

// Supporting data structures
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  inventory: number;
  variants?: ProductVariant[];
}

interface CartItem {
  productId: string;
  quantity: number;
  variantId?: string;
  price: number;
}
```

**Database Schema Extensions:**
```sql
-- E-commerce tables
Products (Id, WebsiteId, Name, Description, Price, Images, Category, Inventory, Status)
ProductVariants (Id, ProductId, Name, Price, Inventory, Attributes)
Orders (Id, WebsiteId, CustomerId, Status, Total, ShippingAddress, BillingAddress)
OrderItems (Id, OrderId, ProductId, Quantity, Price, VariantId)
Customers (Id, WebsiteId, Email, Name, Addresses, CreatedAt)
```

**Implementation Priority:**
1. **Phase 1:** Product catalog and detail blocks
2. **Phase 2:** Shopping cart and basic checkout
3. **Phase 3:** Payment processing integration
4. **Phase 4:** Customer accounts and order management
5. **Phase 5:** Advanced features (inventory, shipping, analytics)

### Technical Roadmap
- **Drag and Drop:** Full drag-and-drop interface
- **Real-time Collaboration:** Multiple editors on same site
- **Version Control:** Page history and rollback
- **API Integrations:** Connect to external services
- **Advanced Caching:** Redis-based caching layer
- **CDN Integration:** Global content delivery
- **Progressive Web App:** Offline editing capabilities

## 🏆 Benefits Summary

**For End Users:**
- Intuitive drag-and-drop interface
- Professional design capabilities  
- No coding knowledge required
- Real-time preview across devices
- Fast, responsive published websites

**For Developers:**
- Clean, maintainable architecture
- TypeScript throughout for type safety
- Extensible component system  
- Performance optimized rendering
- Modern CSS and responsive design practices

**For Performance:**
- Minimal CSS footprint
- Optimized asset delivery
- Fast rendering and preview
- Efficient caching strategies
- Mobile-optimized output

---

This architecture document provides a comprehensive overview of how PhotoPoint's website designer works from creation to publication, ensuring maintainable, performant, and user-friendly website building experience.
