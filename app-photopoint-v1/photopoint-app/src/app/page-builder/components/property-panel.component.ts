import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from '../../services/confirmation.service';
import { PageComponent, WebsitePage, ComponentType } from '../../models/component-system';

@Component({
  selector: 'app-property-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="property-panel" [class.visible]="visible">
      
      <!-- Panel Header -->
      <div class="panel-header">
        <h3 *ngIf="selectedComponent">{{ getComponentDisplayName(selectedComponent.type) }} Properties</h3>
        <h3 *ngIf="!selectedComponent && page">Page Properties</h3>
      </div>

      <!-- Component Properties -->
      <div class="panel-content" *ngIf="selectedComponent">
        
        <!-- Component Basic Settings -->
        <div class="property-group">
          <h4>Basic Settings</h4>
          
          <div class="property-field">
            <label>Component Type</label>
            <input type="text" [value]="getComponentDisplayName(selectedComponent.type)" readonly />
          </div>
          
          <div class="property-field">
            <label>Visibility</label>
            <div class="checkbox-group">
              <label>
                <input type="checkbox" 
                       [(ngModel)]="selectedComponent.isVisible"
                       (change)="onComponentChange()">
                Visible
              </label>
              <label>
                <input type="checkbox" 
                       [(ngModel)]="selectedComponent.isLocked"
                       (change)="onComponentChange()">
                Locked
              </label>
            </div>
          </div>
        </div>

        <!-- Text Component Properties -->
        <div class="property-group" *ngIf="selectedComponent.type === 'text'">
          <h4>Text Content</h4>
          <div class="property-field">
            <label>Content</label>
            <textarea [(ngModel)]="selectedComponent.content.content"
                      (ngModelChange)="onComponentChange()"
                      rows="8"
                      placeholder="Enter your text content here...">
            </textarea>
          </div>
        </div>

        <!-- Image Component Properties -->
        <div class="property-group" *ngIf="selectedComponent.type === 'image'">
          <h4>Image Settings</h4>
          <div class="property-field">
            <label>Image URL</label>
            <input type="url" 
                   [(ngModel)]="selectedComponent.content.src"
                   (ngModelChange)="onComponentChange()"
                   placeholder="https://example.com/image.jpg">
          </div>
          <div class="property-field">
            <label>Alt Text</label>
            <input type="text" 
                   [(ngModel)]="selectedComponent.content.alt"
                   (ngModelChange)="onComponentChange()"
                   placeholder="Describe the image">
          </div>
          <div class="property-field">
            <label>Caption</label>
            <input type="text" 
                   [(ngModel)]="selectedComponent.content.caption"
                   (ngModelChange)="onComponentChange()"
                   placeholder="Image caption (optional)">
          </div>
        </div>

        <!-- Hero Component Properties -->
        <div class="property-group" *ngIf="selectedComponent.type === 'hero'">
          <h4>Hero Content</h4>
          <div class="property-field">
            <label>Heading</label>
            <input type="text" 
                   [(ngModel)]="selectedComponent.content.heading"
                   (ngModelChange)="onComponentChange()"
                   placeholder="Main heading">
          </div>
          <div class="property-field">
            <label>Subheading</label>
            <textarea [(ngModel)]="selectedComponent.content.subheading"
                      (ngModelChange)="onComponentChange()"
                      rows="3"
                      placeholder="Supporting text...">
            </textarea>
          </div>
          <div class="property-field">
            <label>Button Text</label>
            <input type="text" 
                   [(ngModel)]="selectedComponent.content.buttonText"
                   (ngModelChange)="onComponentChange()"
                   placeholder="Call to action">
          </div>
          <div class="property-field">
            <label>Background Image</label>
            <input type="url" 
                   [(ngModel)]="selectedComponent.content.backgroundImage"
                   (ngModelChange)="onComponentChange()"
                   placeholder="Background image URL">
          </div>
        </div>

        <!-- Spacing Properties -->
        <div class="property-group">
          <h4>Spacing</h4>
          <div class="spacing-grid">
            <div class="property-field">
              <label>Margin Top</label>
              <input type="text" 
                     [value]="getStyleValue('margin-top')"
                     (input)="setStyleValue('margin-top', $any($event.target).value)"
                     placeholder="0px">
            </div>
            <div class="property-field">
              <label>Margin Bottom</label>
              <input type="text" 
                     [value]="getStyleValue('margin-bottom')"
                     (input)="setStyleValue('margin-bottom', $any($event.target).value)"
                     placeholder="0px">
            </div>
            <div class="property-field">
              <label>Padding Top</label>
              <input type="text" 
                     [value]="getStyleValue('padding-top')"
                     (input)="setStyleValue('padding-top', $any($event.target).value)"
                     placeholder="0px">
            </div>
            <div class="property-field">
              <label>Padding Bottom</label>
              <input type="text" 
                     [value]="getStyleValue('padding-bottom')"
                     (input)="setStyleValue('padding-bottom', $any($event.target).value)"
                     placeholder="0px">
            </div>
          </div>
        </div>

        <!-- Style Properties -->
        <div class="property-group">
          <h4>Appearance</h4>
          <div class="property-field">
            <label>Background Color</label>
            <input type="color" 
                   [value]="getStyleValue('backgroundColor')"
                   (input)="setStyleValue('backgroundColor', $any($event.target).value)">
          </div>
          <div class="property-field">
            <label>Text Color</label>
            <input type="color" 
                   [value]="getStyleValue('color')"
                   (input)="setStyleValue('color', $any($event.target).value)">
          </div>
          <div class="property-field">
            <label>Border Radius</label>
            <input type="text" 
                   [value]="getStyleValue('borderRadius')"
                   (input)="setStyleValue('borderRadius', $any($event.target).value)"
                   placeholder="0px">
          </div>
        </div>

        <!-- Component Actions -->
        <div class="property-group">
          <h4>Actions</h4>
          <div class="action-buttons">
            <button class="btn btn-secondary" (click)="duplicateComponent()">
              Duplicate Component
            </button>
            <button class="btn btn-danger" (click)="deleteComponent()">
              Delete Component
            </button>
          </div>
        </div>

      </div>

      <!-- Page Properties -->
      <div class="panel-content" *ngIf="!selectedComponent && page">
        
        <div class="property-group">
          <h4>Page Information</h4>
          <div class="property-field">
            <label>Page Title</label>
            <input type="text" 
                   [(ngModel)]="page.title"
                   (ngModelChange)="onPageChange()"
                   placeholder="Page title">
          </div>
          <div class="property-field">
            <label>URL Slug</label>
            <input type="text" 
                   [(ngModel)]="page.slug"
                   (ngModelChange)="onPageChange()"
                   placeholder="page-url">
          </div>
        </div>

        <div class="property-group">
          <h4>SEO Settings</h4>
          <div class="property-field">
            <label>Meta Title</label>
            <input type="text" 
                   [(ngModel)]="page.metaTitle"
                   (ngModelChange)="onPageChange()"
                   placeholder="SEO title">
          </div>
          <div class="property-field">
            <label>Meta Description</label>
            <textarea [(ngModel)]="page.metaDescription"
                      (ngModelChange)="onPageChange()"
                      rows="3"
                      placeholder="Page description for search engines">
            </textarea>
          </div>
        </div>

        <div class="property-group">
          <h4>Page Settings</h4>
          <div class="property-field">
            <label>
              <input type="checkbox" 
                     [(ngModel)]="page.isHomePage"
                     (ngModelChange)="onPageChange()">
              Set as Home Page
            </label>
          </div>
          <div class="property-field">
            <label>
              <input type="checkbox" 
                     [(ngModel)]="page.isPublished"
                     (ngModelChange)="onPageChange()">
              Published
            </label>
          </div>
        </div>

      </div>

      <!-- Empty State -->
      <div class="panel-content empty-state" *ngIf="!selectedComponent && !page">
        <div class="empty-message">
          <p>Select a component or page to edit its properties</p>
        </div>
      </div>

    </div>
  `,
  styleUrl: './property-panel.component.scss'
})
export class PropertyPanelComponent implements OnInit, OnChanges {
  @Input() visible: boolean = false;
  @Input() selectedComponent: PageComponent | null = null;
  @Input() page: WebsitePage | null = null;

  @Output() componentUpdated = new EventEmitter<PageComponent>();
  @Output() pageUpdated = new EventEmitter<WebsitePage>();

  constructor(private confirmationService: ConfirmationService) {}

  ngOnInit() {
    this.initializeComponentContent();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedComponent'] && this.selectedComponent) {
      this.initializeComponentContent();
    }
  }

  private initializeComponentContent() {
    if (!this.selectedComponent) return;

    // Initialize content object if it doesn't exist
    if (!this.selectedComponent.content) {
      this.selectedComponent.content = {};
    }

    // Initialize styles if they don't exist
    if (!this.selectedComponent.styles) {
      this.selectedComponent.styles = {
        desktop: {},
        tablet: {},
        mobile: {}
      };
    }
  }

  getComponentDisplayName(type: ComponentType): string {
    const displayNames: Record<string, string> = {
      'hero': 'Hero Section',
      'text': 'Text Block',
      'image': 'Image',
      'gallery': 'Photo Gallery',
      'contact-form': 'Contact Form',
      'social-links': 'Social Links',
      'navigation': 'Navigation Menu',
      'footer': 'Footer',
      'html': 'Custom HTML',
      'spacer': 'Spacer'
    };
    return displayNames[type] || type;
  }

  onComponentChange() {
    if (this.selectedComponent) {
      this.selectedComponent.updatedAt = new Date();
      this.componentUpdated.emit(this.selectedComponent);
    }
  }

  onPageChange() {
    if (this.page) {
      this.pageUpdated.emit(this.page);
    }
  }

  getStyleValue(property: string): string {
    if (!this.selectedComponent?.styles?.desktop) {
      return '';
    }
    
    const style = this.selectedComponent.styles.desktop as any;
    return style[property] || '';
  }

  setStyleValue(property: string, value: string) {
    if (!this.selectedComponent) return;

    if (!this.selectedComponent.styles) {
      this.selectedComponent.styles = {
        desktop: {},
        tablet: {},
        mobile: {}
      };
    }

    const desktopStyles = this.selectedComponent.styles.desktop as any;
    desktopStyles[property] = value;
    
    this.onComponentChange();
  }

  duplicateComponent() {
    if (this.selectedComponent) {
      const duplicated: PageComponent = {
        ...this.selectedComponent,
        id: crypto.randomUUID(),
        sortOrder: this.selectedComponent.sortOrder + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.componentUpdated.emit(duplicated);
    }
  }

  async deleteComponent() {
    if (!this.selectedComponent) return;
    
    const componentTypeName = this.selectedComponent.type || 'component';
    const confirmed = await this.confirmationService.confirmDelete(componentTypeName, 'component');
    
    if (!confirmed) {
      return;
    }
    
    // This will be handled by the parent component
    // which should call the componentDeleted event instead
  }
}