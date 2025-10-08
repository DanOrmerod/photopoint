import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentType, ComponentDefinition, ComponentCategory } from '../../models/component-system';

@Component({
  selector: 'app-component-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="component-panel" [class.hidden]="!visible">
      
      <div class="panel-header">
        <h3>Components</h3>
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search components..."
            [(ngModel)]="searchTerm"
            (input)="onSearch($event)">
          <i class="search-icon">🔍</i>
        </div>
      </div>

      <div class="panel-content">
        
        <!-- Recently Used Components -->
        <div class="component-section" *ngIf="recentComponents.length > 0">
          <div class="section-header">
            <h4>Recently Used</h4>
          </div>
          <div class="component-grid">
            <div 
              *ngFor="let component of recentComponents"
              class="component-item recent"
              draggable="true"
              (dragstart)="onDragStart($event, component.type)"
              (click)="onComponentSelect(component.type)">
              <div class="component-icon">{{ component.icon }}</div>
              <span class="component-name">{{ component.name }}</span>
            </div>
          </div>
        </div>

        <!-- Component Categories -->
        <div 
          *ngFor="let category of filteredCategories" 
          class="component-section">
          
          <div 
            class="section-header" 
            (click)="toggleCategory(category.id)"
            [class.collapsed]="collapsedCategories.has(category.id)">
            <h4>{{ category.name }}</h4>
            <i class="collapse-icon">{{ collapsedCategories.has(category.id) ? '▶' : '▼' }}</i>
          </div>

          <div 
            class="component-grid" 
            [class.collapsed]="collapsedCategories.has(category.id)">
            <div 
              *ngFor="let component of category.components"
              class="component-item"
              draggable="true"
              (dragstart)="onDragStart($event, component.type)"
              (click)="onComponentSelect(component.type)"
              [title]="component.description">
              
              <div class="component-icon">{{ component.icon }}</div>
              <span class="component-name">{{ component.name }}</span>
              
              <!-- Preview on hover -->
              <div class="component-preview" *ngIf="component.previewImage">
                <img [src]="component.previewImage" [alt]="component.name + ' preview'">
              </div>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div class="no-results" *ngIf="filteredCategories.length === 0 && searchTerm">
          <p>No components found for "{{ searchTerm }}"</p>
          <small>Try a different search term</small>
        </div>

      </div>
    </div>
  `,
  styleUrl: './component-panel.component.scss'
})
export class ComponentPanelComponent {
  @Input() visible = true;
  @Output() componentDragStart = new EventEmitter<ComponentType>();

  searchTerm = '';
  collapsedCategories = new Set<string>();
  recentComponents: ComponentDefinition[] = [];

  // Component categories based on requirements
  categories: ComponentCategory[] = [
    {
      id: 'layout',
      name: 'Layout',
      icon: '📐',
      isCollapsible: true,
      components: [
        {
          type: ComponentType.CONTAINER,
          name: 'Container',
          description: 'Main container for page content with max-width constraints',
          icon: '📦',
          category: 'layout',
          defaultProps: {}
        },
        {
          type: ComponentType.SECTION,
          name: 'Section',
          description: 'Semantic section with background and spacing options',
          icon: '📄',
          category: 'layout',
          defaultProps: {}
        },
        {
          type: ComponentType.ROW,
          name: 'Row',
          description: 'Horizontal row container for columns',
          icon: '▬',
          category: 'layout',
          defaultProps: {}
        },
        {
          type: ComponentType.COLUMN,
          name: 'Column',
          description: 'Column within a row with responsive width',
          icon: '▌',
          category: 'layout',
          defaultProps: {}
        }
      ]
    },
    {
      id: 'content',
      name: 'Content',
      icon: '📝',
      isCollapsible: true,
      components: [
        {
          type: ComponentType.HEADING,
          name: 'Heading',
          description: 'Heading text (H1-H6) with customizable styling',
          icon: 'H',
          category: 'content',
          defaultProps: {}
        },
        {
          type: ComponentType.PARAGRAPH,
          name: 'Paragraph',
          description: 'Paragraph text with rich formatting options',
          icon: '¶',
          category: 'content',
          defaultProps: {}
        },
        {
          type: ComponentType.LIST,
          name: 'List',
          description: 'Bulleted or numbered list',
          icon: '≡',
          category: 'content',
          defaultProps: {}
        },
        {
          type: ComponentType.BUTTON,
          name: 'Button',
          description: 'Call-to-action button with link functionality',
          icon: '🔘',
          category: 'content',
          defaultProps: {}
        }
      ]
    },
    {
      id: 'photography',
      name: 'Photography',
      icon: '📸',
      isCollapsible: true,
      components: [
        {
          type: ComponentType.IMAGE,
          name: 'Image',
          description: 'Single image with caption and link options',
          icon: '🖼️',
          category: 'photography',
          defaultProps: {}
        },
        {
          type: ComponentType.IMAGE_GALLERY,
          name: 'Gallery',
          description: 'Photo gallery with multiple layout options',
          icon: '🖼️',
          category: 'photography',
          defaultProps: {}
        },
        {
          type: ComponentType.IMAGE_SLIDER,
          name: 'Slider',
          description: 'Image slider/carousel with navigation',
          icon: '🎠',
          category: 'photography',
          defaultProps: {}
        },
        {
          type: ComponentType.VIDEO,
          name: 'Video',
          description: 'Video player with customizable controls',
          icon: '🎥',
          category: 'photography',
          defaultProps: {}
        }
      ]
    },
    {
      id: 'business',
      name: 'Business',
      icon: '💼',
      isCollapsible: true,
      components: [
        {
          type: ComponentType.FORM,
          name: 'Contact Form',
          description: 'Customizable contact form',
          icon: '📝',
          category: 'business',
          defaultProps: {}
        },
        {
          type: ComponentType.TESTIMONIAL,
          name: 'Testimonial',
          description: 'Client testimonial with photo and quote',
          icon: '💬',
          category: 'business',
          defaultProps: {}
        },
        {
          type: ComponentType.PRICING_TABLE,
          name: 'Pricing Table',
          description: 'Service pricing with package options',
          icon: '💰',
          category: 'business',
          defaultProps: {}
        },
        {
          type: ComponentType.MAP,
          name: 'Map',
          description: 'Interactive map with location marker',
          icon: '🗺️',
          category: 'business',
          defaultProps: {}
        }
      ]
    },
    {
      id: 'ecommerce',
      name: 'Shop',
      icon: '🛒',
      isCollapsible: true,
      components: [
        {
          type: ComponentType.SHOP_PRODUCT,
          name: 'Product',
          description: 'Single product display with purchase options',
          icon: '🛍️',
          category: 'ecommerce',
          defaultProps: {}
        },
        {
          type: ComponentType.PRODUCT_GALLERY,
          name: 'Product Gallery',
          description: 'Grid of products for browsing',
          icon: '🏪',
          category: 'ecommerce',
          defaultProps: {}
        },
        {
          type: ComponentType.CART,
          name: 'Shopping Cart',
          description: 'Shopping cart with item management',
          icon: '🛒',
          category: 'ecommerce',
          defaultProps: {}
        }
      ]
    },
    {
      id: 'workshops',
      name: 'Courses',
      icon: '🎓',
      isCollapsible: true,
      components: [
        {
          type: ComponentType.WORKSHOP_LIST,
          name: 'Course List',
          description: 'List of available photography courses',
          icon: '📚',
          category: 'workshops',
          defaultProps: {}
        },
        {
          type: ComponentType.WORKSHOP_DETAIL,
          name: 'Course Detail',
          description: 'Detailed course information and description',
          icon: '📖',
          category: 'workshops',
          defaultProps: {}
        },
        {
          type: ComponentType.BOOKING_FORM,
          name: 'Booking Form',
          description: 'Course booking and registration form',
          icon: '📅',
          category: 'workshops',
          defaultProps: {}
        }
      ]
    }
  ];

  get filteredCategories(): ComponentCategory[] {
    if (!this.searchTerm) {
      return this.categories;
    }

    return this.categories
      .map(category => ({
        ...category,
        components: category.components.filter(component =>
          component.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          component.description.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      }))
      .filter(category => category.components.length > 0);
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
  }

  toggleCategory(categoryId: string) {
    if (this.collapsedCategories.has(categoryId)) {
      this.collapsedCategories.delete(categoryId);
    } else {
      this.collapsedCategories.add(categoryId);
    }
  }

  onDragStart(event: DragEvent, componentType: ComponentType) {
    event.dataTransfer?.setData('text/plain', componentType);
    this.componentDragStart.emit(componentType);
  }

  onComponentSelect(componentType: ComponentType) {
    // For touch devices or direct selection
    this.componentDragStart.emit(componentType);
  }
}