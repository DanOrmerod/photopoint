import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageComponent, ComponentType, BaseComponent } from '../../models/component-system';

@Component({
  selector: 'app-component-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="component-renderer" 
         [class]="'component-' + component.type"
         [class.editing]="isEditing"
         [class.selected]="isSelected"
         [style]="componentStyles">
      
      <!-- Hero Section Component -->
      <div *ngIf="component.type === 'hero'" class="hero-component">
        <div class="hero-content">
          <h1 [style]="getTextStyles('heading')">
            {{ getContent('heading') || 'Hero Heading' }}
          </h1>
          <p [style]="getTextStyles('subheading')" *ngIf="getContent('subheading')">
            {{ getContent('subheading') }}
          </p>
          <div class="hero-actions" *ngIf="getContent('buttonText')">
            <button class="btn btn-primary" [style]="getButtonStyles()">
              {{ getContent('buttonText') }}
            </button>
          </div>
        </div>
        <div class="hero-media" *ngIf="getContent('backgroundImage')">
          <img [src]="getContent('backgroundImage')" [alt]="getContent('heading')" />
        </div>
      </div>

      <!-- Text Component -->
      <div *ngIf="component.type === 'text'" class="text-component">
        <div [innerHTML]="getContent('content') || '<p>Add your text content here...</p>'"
             [style]="getTextStyles()">
        </div>
      </div>

      <!-- Image Component -->
      <div *ngIf="component.type === 'image'" class="image-component">
        <img [src]="getContent('src') || '/assets/placeholder-image.jpg'"
             [alt]="getContent('alt') || 'Image'"
             [style]="getImageStyles()" />
        <div class="image-caption" *ngIf="getContent('caption')" [style]="getTextStyles('caption')">
          {{ getContent('caption') }}
        </div>
      </div>

      <!-- Gallery Component -->
      <div *ngIf="component.type === 'gallery'" class="gallery-component">
        <h3 *ngIf="getContent('title')" [style]="getTextStyles('title')">
          {{ getContent('title') }}
        </h3>
        <div class="gallery-grid" [class]="'columns-' + (getContent('columns') || 3)">
          <div *ngFor="let image of getGalleryImages()" class="gallery-item">
            <img [src]="image.thumbnailUrl || image.url" 
                 [alt]="image.alt || image.title"
                 (click)="openImageModal(image)" />
          </div>
        </div>
      </div>

      <!-- Contact Form Component -->
      <div *ngIf="component.type === 'contact-form'" class="contact-form-component">
        <h3 *ngIf="getContent('title')" [style]="getTextStyles('title')">
          {{ getContent('title') }}
        </h3>
        <form class="contact-form" (submit)="$event.preventDefault()">
          <div class="form-group" *ngFor="let field of getFormFields()">
            <label [for]="field.name">{{ field.label }}</label>
            <input *ngIf="field.type === 'text' || field.type === 'email'"
                   [type]="field.type"
                   [id]="field.name"
                   [name]="field.name"
                   [required]="field.required"
                   [placeholder]="field.placeholder" />
            <textarea *ngIf="field.type === 'textarea'"
                      [id]="field.name"
                      [name]="field.name"
                      [required]="field.required"
                      [placeholder]="field.placeholder"
                      rows="4"></textarea>
          </div>
          <button type="submit" class="btn btn-primary" [style]="getButtonStyles()">
            {{ getContent('submitText') || 'Send Message' }}
          </button>
        </form>
      </div>

      <!-- Social Links Component -->
      <div *ngIf="component.type === 'social-links'" class="social-links-component">
        <h3 *ngIf="getContent('title')" [style]="getTextStyles('title')">
          {{ getContent('title') }}
        </h3>
        <div class="social-links" [class]="'layout-' + (getContent('layout') || 'horizontal')">
          <a *ngFor="let link of getSocialLinks()" 
             [href]="link.url" 
             target="_blank" 
             class="social-link"
             [class]="'social-' + link.platform">
            <i [class]="getSocialIcon(link.platform)"></i>
            <span *ngIf="getContent('showLabels')">{{ link.label }}</span>
          </a>
        </div>
      </div>

      <!-- Navigation Menu Component -->
      <div *ngIf="component.type === 'navigation'" class="navigation-component">
        <nav class="navbar" [class]="'navbar-' + (getContent('style') || 'horizontal')">
          <div class="navbar-brand" *ngIf="getContent('brand')">
            <img *ngIf="getContent('logo')" [src]="getContent('logo')" [alt]="getContent('brand')" />
            <span>{{ getContent('brand') }}</span>
          </div>
          <ul class="navbar-nav">
            <li *ngFor="let item of getNavItems()" class="nav-item">
              <a [href]="item.url" class="nav-link">{{ item.label }}</a>
            </li>
          </ul>
        </nav>
      </div>

      <!-- Footer Component -->
      <div *ngIf="component.type === 'footer'" class="footer-component">
        <div class="footer-content">
          <div class="footer-section" *ngFor="let section of getFooterSections()">
            <h4 *ngIf="section.title">{{ section.title }}</h4>
            <ul *ngIf="section.links">
              <li *ngFor="let link of section.links">
                <a [href]="link.url">{{ link.label }}</a>
              </li>
            </ul>
            <div *ngIf="section.content" [innerHTML]="section.content"></div>
          </div>
        </div>
        <div class="footer-bottom" *ngIf="getContent('copyright')">
          <p>{{ getContent('copyright') }}</p>
        </div>
      </div>

      <!-- Custom HTML Component -->
      <div *ngIf="component.type === 'html'" class="html-component">
        <div [innerHTML]="getContent('html') || '<p>Add your custom HTML here...</p>'"></div>
      </div>

      <!-- Spacer Component -->
      <div *ngIf="component.type === 'spacer'" class="spacer-component">
        <!-- Spacer is just for spacing, rendered by height in styles -->
      </div>

      <!-- Development placeholder for unknown components -->
      <div *ngIf="!isKnownComponentType()" class="unknown-component">
        <div class="placeholder">
          <h4>Unknown Component: {{ component.type }}</h4>
          <p>This component type is not yet implemented.</p>
        </div>
      </div>

    </div>
  `,
  styleUrl: './component-renderer.component.scss'
})
export class ComponentRendererComponent implements OnInit, OnChanges {
  @Input() component!: PageComponent;
  @Input() viewMode: 'desktop' | 'tablet' | 'mobile' = 'desktop';
  @Input() isSelected: boolean = false;
  @Input() isEditing: boolean = false;

  @Output() componentUpdated = new EventEmitter<PageComponent>();
  @Output() imageClicked = new EventEmitter<{src: string, alt: string}>();

  componentStyles: { [key: string]: string } = {};

  ngOnInit() {
    this.updateComponentStyles();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['component'] || changes['viewMode']) {
      this.updateComponentStyles();
    }
  }

  private updateComponentStyles() {
    if (!this.component) return;

    const styles: { [key: string]: string } = {};
    const responsiveStyles = this.getResponsiveStyles();

    // Apply spacing
    if (responsiveStyles.margin) {
      styles['margin'] = responsiveStyles.margin;
    }
    if (responsiveStyles.padding) {
      styles['padding'] = responsiveStyles.padding;
    }

    // Apply background
    if (responsiveStyles.backgroundColor) {
      styles['background-color'] = responsiveStyles.backgroundColor;
    }
    if (responsiveStyles.backgroundImage) {
      styles['background-image'] = `url(${responsiveStyles.backgroundImage})`;
      styles['background-size'] = responsiveStyles.backgroundSize || 'cover';
      styles['background-position'] = responsiveStyles.backgroundPosition || 'center';
    }

    // Apply dimensions
    if (responsiveStyles.width) {
      styles['width'] = responsiveStyles.width;
    }
    if (responsiveStyles.height) {
      styles['height'] = responsiveStyles.height;
    }
    if (responsiveStyles.minHeight) {
      styles['min-height'] = responsiveStyles.minHeight;
    }

    // Apply border and effects
    if (responsiveStyles.borderRadius) {
      styles['border-radius'] = responsiveStyles.borderRadius;
    }
    if (responsiveStyles.boxShadow) {
      styles['box-shadow'] = responsiveStyles.boxShadow;
    }

    this.componentStyles = styles;
  }

  private getResponsiveStyles(): any {
    if (!this.component.styles) {
      return {};
    }

    const styles = this.component.styles;
    
    switch (this.viewMode) {
      case 'mobile':
        return { ...styles.desktop, ...styles.mobile };
      case 'tablet':
        return { ...styles.desktop, ...styles.tablet };
      default:
        return styles.desktop || {};
    }
  }

  getContent(key: string): any {
    return this.component.content?.[key];
  }

  getTextStyles(element?: string): { [key: string]: string } {
    const styles: { [key: string]: string } = {};
    const responsiveStyles = this.getResponsiveStyles();
    
    // Get text-specific styles
    const textStyles = responsiveStyles.text || {};
    
    if (element && textStyles[element]) {
      const elementStyles = textStyles[element];
      if (elementStyles.fontSize) styles['font-size'] = elementStyles.fontSize;
      if (elementStyles.fontWeight) styles['font-weight'] = elementStyles.fontWeight;
      if (elementStyles.color) styles['color'] = elementStyles.color;
      if (elementStyles.textAlign) styles['text-align'] = elementStyles.textAlign;
      if (elementStyles.lineHeight) styles['line-height'] = elementStyles.lineHeight;
    } else {
      // Default text styles
      if (textStyles.fontSize) styles['font-size'] = textStyles.fontSize;
      if (textStyles.fontWeight) styles['font-weight'] = textStyles.fontWeight;
      if (textStyles.color) styles['color'] = textStyles.color;
      if (textStyles.textAlign) styles['text-align'] = textStyles.textAlign;
      if (textStyles.lineHeight) styles['line-height'] = textStyles.lineHeight;
    }

    return styles;
  }

  getImageStyles(): { [key: string]: string } {
    const styles: { [key: string]: string } = {};
    const responsiveStyles = this.getResponsiveStyles();
    
    if (responsiveStyles.width) styles['width'] = responsiveStyles.width;
    if (responsiveStyles.height) styles['height'] = responsiveStyles.height;
    if (responsiveStyles.borderRadius) styles['border-radius'] = responsiveStyles.borderRadius;
    
    return styles;
  }

  getButtonStyles(): { [key: string]: string } {
    const styles: { [key: string]: string } = {};
    const responsiveStyles = this.getResponsiveStyles();
    const buttonStyles = responsiveStyles.button || {};
    
    if (buttonStyles.backgroundColor) styles['background-color'] = buttonStyles.backgroundColor;
    if (buttonStyles.color) styles['color'] = buttonStyles.color;
    if (buttonStyles.padding) styles['padding'] = buttonStyles.padding;
    if (buttonStyles.borderRadius) styles['border-radius'] = buttonStyles.borderRadius;
    if (buttonStyles.fontSize) styles['font-size'] = buttonStyles.fontSize;
    
    return styles;
  }

  getGalleryImages(): any[] {
    const images = this.getContent('images');
    return Array.isArray(images) ? images : [];
  }

  getFormFields(): any[] {
    const fields = this.getContent('fields');
    return Array.isArray(fields) ? fields : [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'message', label: 'Message', type: 'textarea', required: true }
    ];
  }

  getSocialLinks(): any[] {
    const links = this.getContent('links');
    return Array.isArray(links) ? links : [];
  }

  getSocialIcon(platform: string): string {
    const icons: { [key: string]: string } = {
      facebook: 'fab fa-facebook',
      twitter: 'fab fa-twitter',
      instagram: 'fab fa-instagram',
      linkedin: 'fab fa-linkedin',
      youtube: 'fab fa-youtube',
      github: 'fab fa-github'
    };
    return icons[platform] || 'fas fa-link';
  }

  getNavItems(): any[] {
    const items = this.getContent('items');
    return Array.isArray(items) ? items : [];
  }

  getFooterSections(): any[] {
    const sections = this.getContent('sections');
    return Array.isArray(sections) ? sections : [];
  }

  openImageModal(image: any) {
    this.imageClicked.emit({ src: image.url, alt: image.alt || image.title });
  }

  isKnownComponentType(): boolean {
    const knownTypes: ComponentType[] = [
      ComponentType.HERO, ComponentType.TEXT, ComponentType.IMAGE, ComponentType.GALLERY, ComponentType.CONTACT_FORM, 
      ComponentType.SOCIAL_LINKS, ComponentType.NAVIGATION, ComponentType.FOOTER, ComponentType.HTML, ComponentType.SPACER
    ];
    return knownTypes.includes(this.component.type);
  }
}