import { Injectable } from '@angular/core';
import { CSSFramework } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CssFrameworkService {

  /**
   * Generate the base CSS framework that should be loaded once
   * This includes reset, typography, layout utilities, and responsive grid
   */
  generateBaseCSS(): string {
    return `
      /* PhotoPoint CSS Framework - Base Styles */
      
      /* Reset & Base Styles */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        line-height: 1.6;
        color: #333;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      img {
        max-width: 100%;
        height: auto;
      }
      
      /* Typography Utilities */
      .pp-text-xs { font-size: 0.75rem; }
      .pp-text-sm { font-size: 0.875rem; }
      .pp-text-base { font-size: 1rem; }
      .pp-text-lg { font-size: 1.125rem; }
      .pp-text-xl { font-size: 1.25rem; }
      .pp-text-2xl { font-size: 1.5rem; }
      .pp-text-3xl { font-size: 1.875rem; }
      .pp-text-4xl { font-size: 2.25rem; }
      .pp-text-5xl { font-size: 3rem; }
      
      .pp-font-light { font-weight: 300; }
      .pp-font-normal { font-weight: 400; }
      .pp-font-medium { font-weight: 500; }
      .pp-font-semibold { font-weight: 600; }
      .pp-font-bold { font-weight: 700; }
      
      .pp-text-left { text-align: left; }
      .pp-text-center { text-align: center; }
      .pp-text-right { text-align: right; }
      .pp-text-justify { text-align: justify; }
      
      /* Layout Utilities */
      .pp-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
      }
      
      .pp-row {
        display: flex;
        flex-wrap: wrap;
        margin: 0 -0.5rem;
      }
      
      .pp-col {
        flex: 1;
        padding: 0 0.5rem;
      }
      
      .pp-col-1 { flex: 0 0 8.333333%; }
      .pp-col-2 { flex: 0 0 16.666667%; }
      .pp-col-3 { flex: 0 0 25%; }
      .pp-col-4 { flex: 0 0 33.333333%; }
      .pp-col-5 { flex: 0 0 41.666667%; }
      .pp-col-6 { flex: 0 0 50%; }
      .pp-col-7 { flex: 0 0 58.333333%; }
      .pp-col-8 { flex: 0 0 66.666667%; }
      .pp-col-9 { flex: 0 0 75%; }
      .pp-col-10 { flex: 0 0 83.333333%; }
      .pp-col-11 { flex: 0 0 91.666667%; }
      .pp-col-12 { flex: 0 0 100%; }
      
      /* Spacing Utilities */
      .pp-m-0 { margin: 0; }
      .pp-m-1 { margin: 0.25rem; }
      .pp-m-2 { margin: 0.5rem; }
      .pp-m-3 { margin: 0.75rem; }
      .pp-m-4 { margin: 1rem; }
      .pp-m-5 { margin: 1.25rem; }
      .pp-m-6 { margin: 1.5rem; }
      .pp-m-8 { margin: 2rem; }
      .pp-m-10 { margin: 2.5rem; }
      .pp-m-12 { margin: 3rem; }
      
      .pp-mt-0 { margin-top: 0; }
      .pp-mt-1 { margin-top: 0.25rem; }
      .pp-mt-2 { margin-top: 0.5rem; }
      .pp-mt-3 { margin-top: 0.75rem; }
      .pp-mt-4 { margin-top: 1rem; }
      .pp-mt-5 { margin-top: 1.25rem; }
      .pp-mt-6 { margin-top: 1.5rem; }
      .pp-mt-8 { margin-top: 2rem; }
      .pp-mt-10 { margin-top: 2.5rem; }
      .pp-mt-12 { margin-top: 3rem; }
      
      .pp-mb-0 { margin-bottom: 0; }
      .pp-mb-1 { margin-bottom: 0.25rem; }
      .pp-mb-2 { margin-bottom: 0.5rem; }
      .pp-mb-3 { margin-bottom: 0.75rem; }
      .pp-mb-4 { margin-bottom: 1rem; }
      .pp-mb-5 { margin-bottom: 1.25rem; }
      .pp-mb-6 { margin-bottom: 1.5rem; }
      .pp-mb-8 { margin-bottom: 2rem; }
      .pp-mb-10 { margin-bottom: 2.5rem; }
      .pp-mb-12 { margin-bottom: 3rem; }
      
      .pp-ml-0 { margin-left: 0; }
      .pp-ml-1 { margin-left: 0.25rem; }
      .pp-ml-2 { margin-left: 0.5rem; }
      .pp-ml-3 { margin-left: 0.75rem; }
      .pp-ml-4 { margin-left: 1rem; }
      .pp-ml-auto { margin-left: auto; }
      
      .pp-mr-0 { margin-right: 0; }
      .pp-mr-1 { margin-right: 0.25rem; }
      .pp-mr-2 { margin-right: 0.5rem; }
      .pp-mr-3 { margin-right: 0.75rem; }
      .pp-mr-4 { margin-right: 1rem; }
      .pp-mr-auto { margin-right: auto; }
      
      .pp-mx-auto { margin-left: auto; margin-right: auto; }
      
      .pp-p-0 { padding: 0; }
      .pp-p-1 { padding: 0.25rem; }
      .pp-p-2 { padding: 0.5rem; }
      .pp-p-3 { padding: 0.75rem; }
      .pp-p-4 { padding: 1rem; }
      .pp-p-5 { padding: 1.25rem; }
      .pp-p-6 { padding: 1.5rem; }
      .pp-p-8 { padding: 2rem; }
      .pp-p-10 { padding: 2.5rem; }
      .pp-p-12 { padding: 3rem; }
      
      .pp-pt-0 { padding-top: 0; }
      .pp-pt-1 { padding-top: 0.25rem; }
      .pp-pt-2 { padding-top: 0.5rem; }
      .pp-pt-3 { padding-top: 0.75rem; }
      .pp-pt-4 { padding-top: 1rem; }
      .pp-pt-5 { padding-top: 1.25rem; }
      .pp-pt-6 { padding-top: 1.5rem; }
      .pp-pt-8 { padding-top: 2rem; }
      .pp-pt-10 { padding-top: 2.5rem; }
      .pp-pt-12 { padding-top: 3rem; }
      
      .pp-pb-0 { padding-bottom: 0; }
      .pp-pb-1 { padding-bottom: 0.25rem; }
      .pp-pb-2 { padding-bottom: 0.5rem; }
      .pp-pb-3 { padding-bottom: 0.75rem; }
      .pp-pb-4 { padding-bottom: 1rem; }
      .pp-pb-5 { padding-bottom: 1.25rem; }
      .pp-pb-6 { padding-bottom: 1.5rem; }
      .pp-pb-8 { padding-bottom: 2rem; }
      .pp-pb-10 { padding-bottom: 2.5rem; }
      .pp-pb-12 { padding-bottom: 3rem; }
      
      .pp-pl-0 { padding-left: 0; }
      .pp-pl-1 { padding-left: 0.25rem; }
      .pp-pl-2 { padding-left: 0.5rem; }
      .pp-pl-3 { padding-left: 0.75rem; }
      .pp-pl-4 { padding-left: 1rem; }
      .pp-pl-5 { padding-left: 1.25rem; }
      .pp-pl-6 { padding-left: 1.5rem; }
      
      .pp-pr-0 { padding-right: 0; }
      .pp-pr-1 { padding-right: 0.25rem; }
      .pp-pr-2 { padding-right: 0.5rem; }
      .pp-pr-3 { padding-right: 0.75rem; }
      .pp-pr-4 { padding-right: 1rem; }
      .pp-pr-5 { padding-right: 1.25rem; }
      .pp-pr-6 { padding-right: 1.5rem; }
      
      /* Flexbox Utilities */
      .pp-flex { display: flex; }
      .pp-flex-col { flex-direction: column; }
      .pp-flex-row { flex-direction: row; }
      .pp-flex-wrap { flex-wrap: wrap; }
      .pp-flex-nowrap { flex-wrap: nowrap; }
      
      .pp-items-start { align-items: flex-start; }
      .pp-items-center { align-items: center; }
      .pp-items-end { align-items: flex-end; }
      .pp-items-stretch { align-items: stretch; }
      
      .pp-justify-start { justify-content: flex-start; }
      .pp-justify-center { justify-content: center; }
      .pp-justify-end { justify-content: flex-end; }
      .pp-justify-between { justify-content: space-between; }
      .pp-justify-around { justify-content: space-around; }
      
      /* Display Utilities */
      .pp-block { display: block; }
      .pp-inline-block { display: inline-block; }
      .pp-inline { display: inline; }
      .pp-hidden { display: none; }
      
      /* Position Utilities */
      .pp-relative { position: relative; }
      .pp-absolute { position: absolute; }
      .pp-fixed { position: fixed; }
      .pp-sticky { position: sticky; }
      
      /* Responsive Design */
      @media (max-width: 768px) {
        .pp-container {
          padding: 0 0.75rem;
        }
        
        .pp-row {
          margin: 0 -0.25rem;
        }
        
        .pp-col {
          padding: 0 0.25rem;
        }
        
        .pp-sm-col-1 { flex: 0 0 8.333333%; }
        .pp-sm-col-2 { flex: 0 0 16.666667%; }
        .pp-sm-col-3 { flex: 0 0 25%; }
        .pp-sm-col-4 { flex: 0 0 33.333333%; }
        .pp-sm-col-6 { flex: 0 0 50%; }
        .pp-sm-col-12 { flex: 0 0 100%; }
      }
      
      @media (min-width: 768px) and (max-width: 1024px) {
        .pp-md-col-1 { flex: 0 0 8.333333%; }
        .pp-md-col-2 { flex: 0 0 16.666667%; }
        .pp-md-col-3 { flex: 0 0 25%; }
        .pp-md-col-4 { flex: 0 0 33.333333%; }
        .pp-md-col-6 { flex: 0 0 50%; }
        .pp-md-col-8 { flex: 0 0 66.666667%; }
        .pp-md-col-12 { flex: 0 0 100%; }
      }
    `;
  }

  /**
   * Generate component-specific CSS
   */
  generateComponentCSS(): { [componentType: string]: string } {
    return {
      hero: `
        .pp-hero {
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
        }
        
        .pp-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 1;
        }
        
        .pp-hero-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
          padding: 2rem;
        }
        
        .pp-hero-title {
          font-size: 3rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1.5rem;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
        }
        
        .pp-hero-subtitle {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        
        .pp-hero-button {
          background: #3b82f6;
          color: white;
          padding: 1rem 2rem;
          border: none;
          border-radius: 8px;
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39);
        }
        
        .pp-hero-button:hover {
          background: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px 0 rgba(59, 130, 246, 0.45);
        }
        
        @media (max-width: 768px) {
          .pp-hero {
            min-height: 400px;
          }
          
          .pp-hero-title {
            font-size: 2rem;
          }
          
          .pp-hero-subtitle {
            font-size: 1rem;
          }
          
          .pp-hero-content {
            padding: 1rem;
          }
        }
      `,
      
      navigation: `
        .pp-nav {
          background: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        
        .pp-nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
        }
        
        .pp-nav-logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          text-decoration: none;
        }
        
        .pp-nav-logo img {
          height: 40px;
          width: auto;
        }
        
        .pp-nav-items {
          display: flex;
          gap: 2rem;
          list-style: none;
        }
        
        .pp-nav-link {
          color: #64748b;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
          padding: 0.5rem 0;
          border-bottom: 2px solid transparent;
        }
        
        .pp-nav-link:hover {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }
        
        .pp-nav-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #64748b;
        }
        
        @media (max-width: 768px) {
          .pp-nav-items {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            flex-direction: column;
            gap: 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s;
          }
          
          .pp-nav-items.active {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
          }
          
          .pp-nav-link {
            padding: 1rem;
            border-bottom: 1px solid #f1f5f9;
          }
          
          .pp-nav-toggle {
            display: block;
          }
        }
      `,
      
      button: `
        .pp-btn {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
          text-decoration: none;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-size: 1rem;
        }
        
        .pp-btn-primary {
          background: #3b82f6;
          color: white;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .pp-btn-primary:hover {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
        }
        
        .pp-btn-secondary {
          background: transparent;
          color: #3b82f6;
          border: 2px solid #3b82f6;
        }
        
        .pp-btn-secondary:hover {
          background: #3b82f6;
          color: white;
        }
        
        .pp-btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }
        
        .pp-btn-lg {
          padding: 1rem 2rem;
          font-size: 1.125rem;
        }
      `,
      
      form: `
        .pp-form {
          max-width: 600px;
        }
        
        .pp-form-group {
          margin-bottom: 1.5rem;
        }
        
        .pp-form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }
        
        .pp-form-input,
        .pp-form-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        
        .pp-form-input:focus,
        .pp-form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .pp-form-textarea {
          resize: vertical;
          min-height: 100px;
        }
      `,
      
      gallery: `
        .pp-gallery {
          display: grid;
          gap: 1rem;
        }
        
        .pp-gallery-1 {
          grid-template-columns: 1fr;
        }
        
        .pp-gallery-2 {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .pp-gallery-3 {
          grid-template-columns: repeat(3, 1fr);
        }
        
        .pp-gallery-4 {
          grid-template-columns: repeat(4, 1fr);
        }
        
        .pp-gallery-auto {
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }
        
        .pp-gallery-item {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s;
        }
        
        .pp-gallery-item:hover {
          transform: scale(1.03);
        }
        
        .pp-gallery-item img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }
        
        @media (max-width: 768px) {
          .pp-gallery-2,
          .pp-gallery-3,
          .pp-gallery-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 480px) {
          .pp-gallery-2,
          .pp-gallery-3,
          .pp-gallery-4 {
            grid-template-columns: 1fr;
          }
        }
      `,
      
      social: `
        .pp-social {
          display: flex;
          gap: 1rem;
        }
        
        .pp-social-center {
          justify-content: center;
        }
        
        .pp-social-left {
          justify-content: flex-start;
        }
        
        .pp-social-right {
          justify-content: flex-end;
        }
        
        .pp-social-link {
          color: #64748b;
          font-size: 1.5rem;
          transition: color 0.2s, transform 0.2s;
          text-decoration: none;
        }
        
        .pp-social-link:hover {
          color: #3b82f6;
          transform: translateY(-2px);
        }
        
        .pp-social-link.facebook:hover { color: #1877f2; }
        .pp-social-link.twitter:hover { color: #1da1f2; }
        .pp-social-link.instagram:hover { color: #e4405f; }
        .pp-social-link.linkedin:hover { color: #0a66c2; }
        .pp-social-link.youtube:hover { color: #ff0000; }
      `,
      
      divider: `
        .pp-divider {
          margin: 2rem auto;
          border: none;
          height: 1px;
          background: #e2e8f0;
        }
        
        .pp-divider-thick {
          height: 2px;
        }
        
        .pp-divider-dotted {
          background: none;
          border-top: 2px dotted #e2e8f0;
        }
        
        .pp-divider-dashed {
          background: none;
          border-top: 2px dashed #e2e8f0;
        }
      `
    };
  }

  /**
   * Generate optimized CSS for the viewer
   */
  generateViewerCSS(usedComponents: string[], theme?: any): string {
    const baseCSS = this.generateBaseCSS();
    const componentCSS = this.generateComponentCSS();
    
    // Only include CSS for components that are actually used
    let optimizedCSS = baseCSS;
    
    usedComponents.forEach(componentType => {
      if (componentCSS[componentType]) {
        optimizedCSS += `\n\n/* ${componentType.toUpperCase()} COMPONENT */\n`;
        optimizedCSS += componentCSS[componentType];
      }
    });
    
    // Add theme-specific CSS if provided
    if (theme) {
      optimizedCSS += `\n\n/* THEME STYLES */\n`;
      optimizedCSS += this.generateThemeCSS(theme);
    }
    
    return optimizedCSS;
  }

  /**
   * Generate theme-specific CSS
   */
  private generateThemeCSS(theme: any): string {
    if (!theme.styles) return '';
    
    let themeCSS = ':root {\n';
    
    // Add CSS custom properties for colors
    if (theme.styles.colors) {
      Object.entries(theme.styles.colors).forEach(([key, value]) => {
        themeCSS += `  --color-${key}: ${value};\n`;
      });
    }
    
    // Add typography variables
    if (theme.styles.typography) {
      Object.entries(theme.styles.typography).forEach(([key, value]) => {
        themeCSS += `  --${key}: ${value};\n`;
      });
    }
    
    // Add layout variables
    if (theme.styles.layout) {
      Object.entries(theme.styles.layout).forEach(([key, value]) => {
        if (typeof value === 'string') {
          themeCSS += `  --${key}: ${value};\n`;
        }
      });
    }
    
    themeCSS += '}\n';
    
    // Apply theme to components
    themeCSS += `
      body {
        font-family: var(--fontFamily, -apple-system, BlinkMacSystemFont, sans-serif);
        color: var(--color-text, #333);
        background-color: var(--color-background, white);
      }
      
      .pp-hero {
        background-color: var(--color-primary, #3b82f6);
      }
      
      .pp-btn-primary {
        background-color: var(--color-primary, #3b82f6);
      }
      
      .pp-btn-primary:hover {
        background-color: var(--color-secondary, #2563eb);
      }
      
      .pp-nav-link:hover {
        color: var(--color-primary, #3b82f6);
        border-bottom-color: var(--color-primary, #3b82f6);
      }
    `;
    
    return themeCSS;
  }
}
