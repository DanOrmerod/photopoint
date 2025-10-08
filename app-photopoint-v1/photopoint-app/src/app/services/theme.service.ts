import { Injectable } from '@angular/core';
import { Theme } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  
  private themes: Theme[] = [
    // MODERN MINIMAL THEME
    {
      id: 'modern-minimal',
      name: 'Modern Minimal',
      description: 'Clean, sophisticated design with plenty of white space and elegant typography',
      category: 'business',
      preview: {
        primaryColor: '#0f172a',
        secondaryColor: '#64748b',
        backgroundColor: '#ffffff',
        textColor: '#1e293b',
        accentColor: '#3b82f6'
      },
      styles: {
        typography: {
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
          headingFont: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '16px',
          lineHeight: '1.6',
          headingWeight: '600',
          bodyWeight: '400'
        },
        colors: {
          primary: '#0f172a',
          secondary: '#64748b',
          accent: '#3b82f6',
          background: '#ffffff',
          surface: '#f8fafc',
          text: '#1e293b',
          textLight: '#64748b',
          border: '#e2e8f0',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444'
        },
        layout: {
          containerWidth: '1200px',
          borderRadius: '8px',
          shadows: {
            small: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            large: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          },
          spacing: {
            xs: '0.5rem',
            sm: '1rem',
            md: '1.5rem',
            lg: '2rem',
            xl: '3rem',
            xxl: '4rem'
          }
        },
        components: {
          button: {
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            fontWeight: '500',
            textTransform: 'none'
          },
          card: {
            padding: '1.5rem',
            borderRadius: '12px',
            shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            background: '#ffffff'
          }
        }
      },
      cssVariables: {
        '--primary-color': '#0f172a',
        '--secondary-color': '#64748b',
        '--accent-color': '#3b82f6',
        '--background-color': '#ffffff',
        '--surface-color': '#f8fafc',
        '--text-color': '#1e293b',
        '--text-light': '#64748b',
        '--border-color': '#e2e8f0',
        '--border-radius': '8px',
        '--shadow-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        '--shadow-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        '--font-family': '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
      }
    },

    // CREATIVE BOLD THEME
    {
      id: 'creative-bold',
      name: 'Creative Bold',
      description: 'Vibrant and energetic design perfect for creative agencies and portfolios',
      category: 'creative',
      preview: {
        primaryColor: '#7c3aed',
        secondaryColor: '#ec4899',
        backgroundColor: '#0f0f23',
        textColor: '#ffffff',
        accentColor: '#06b6d4'
      },
      styles: {
        typography: {
          fontFamily: '"Poppins", sans-serif',
          headingFont: '"Poppins", sans-serif',
          fontSize: '16px',
          lineHeight: '1.7',
          headingWeight: '700',
          bodyWeight: '400'
        },
        colors: {
          primary: '#7c3aed',
          secondary: '#ec4899',
          accent: '#06b6d4',
          background: '#0f0f23',
          surface: '#1e1b4b',
          text: '#ffffff',
          textLight: '#c7d2fe',
          border: '#4c1d95',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444'
        },
        layout: {
          containerWidth: '1280px',
          borderRadius: '16px',
          shadows: {
            small: '0 4px 6px -1px rgba(124, 58, 237, 0.2)',
            medium: '0 10px 15px -3px rgba(124, 58, 237, 0.3)',
            large: '0 25px 50px -12px rgba(124, 58, 237, 0.4)'
          },
          spacing: {
            xs: '0.75rem',
            sm: '1.25rem',
            md: '2rem',
            lg: '3rem',
            xl: '4rem',
            xxl: '6rem'
          }
        },
        components: {
          button: {
            padding: '1rem 2rem',
            borderRadius: '12px',
            fontWeight: '600',
            textTransform: 'none'
          },
          card: {
            padding: '2rem',
            borderRadius: '20px',
            shadow: '0 10px 15px -3px rgba(124, 58, 237, 0.3)',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
          }
        }
      },
      cssVariables: {
        '--primary-color': '#7c3aed',
        '--secondary-color': '#ec4899',
        '--accent-color': '#06b6d4',
        '--background-color': '#0f0f23',
        '--surface-color': '#1e1b4b',
        '--text-color': '#ffffff',
        '--text-light': '#c7d2fe',
        '--border-color': '#4c1d95',
        '--border-radius': '16px',
        '--shadow-sm': '0 4px 6px -1px rgba(124, 58, 237, 0.2)',
        '--shadow-md': '0 10px 15px -3px rgba(124, 58, 237, 0.3)',
        '--shadow-lg': '0 25px 50px -12px rgba(124, 58, 237, 0.4)',
        '--font-family': '"Poppins", sans-serif'
      }
    },

    // PROFESSIONAL BUSINESS THEME
    {
      id: 'professional-business',
      name: 'Professional Business',
      description: 'Corporate and trustworthy design ideal for business websites and services',
      category: 'business',
      preview: {
        primaryColor: '#1f2937',
        secondaryColor: '#6b7280',
        backgroundColor: '#ffffff',
        textColor: '#111827',
        accentColor: '#059669'
      },
      styles: {
        typography: {
          fontFamily: '"Source Sans Pro", sans-serif',
          headingFont: '"Playfair Display", serif',
          fontSize: '16px',
          lineHeight: '1.6',
          headingWeight: '700',
          bodyWeight: '400'
        },
        colors: {
          primary: '#1f2937',
          secondary: '#6b7280',
          accent: '#059669',
          background: '#ffffff',
          surface: '#f9fafb',
          text: '#111827',
          textLight: '#6b7280',
          border: '#d1d5db',
          success: '#059669',
          warning: '#d97706',
          error: '#dc2626'
        },
        layout: {
          containerWidth: '1140px',
          borderRadius: '4px',
          shadows: {
            small: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            large: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          },
          spacing: {
            xs: '0.5rem',
            sm: '1rem',
            md: '1.5rem',
            lg: '2rem',
            xl: '2.5rem',
            xxl: '3rem'
          }
        },
        components: {
          button: {
            padding: '0.75rem 1.25rem',
            borderRadius: '4px',
            fontWeight: '600',
            textTransform: 'uppercase'
          },
          card: {
            padding: '1.5rem',
            borderRadius: '8px',
            shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            background: '#ffffff'
          }
        }
      },
      cssVariables: {
        '--primary-color': '#1f2937',
        '--secondary-color': '#6b7280',
        '--accent-color': '#059669',
        '--background-color': '#ffffff',
        '--surface-color': '#f9fafb',
        '--text-color': '#111827',
        '--text-light': '#6b7280',
        '--border-color': '#d1d5db',
        '--border-radius': '4px',
        '--shadow-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        '--font-family': '"Source Sans Pro", sans-serif',
        '--heading-font': '"Playfair Display", serif'
      }
    },

    // ARTISTIC PORTFOLIO THEME
    {
      id: 'artistic-portfolio',
      name: 'Artistic Portfolio',
      description: 'Elegant and artistic design perfect for photographers and artists',
      category: 'portfolio',
      preview: {
        primaryColor: '#18181b',
        secondaryColor: '#a1a1aa',
        backgroundColor: '#fafafa',
        textColor: '#09090b',
        accentColor: '#e11d48'
      },
      styles: {
        typography: {
          fontFamily: '"Crimson Text", serif',
          headingFont: '"Playfair Display", serif',
          fontSize: '18px',
          lineHeight: '1.8',
          headingWeight: '600',
          bodyWeight: '400'
        },
        colors: {
          primary: '#18181b',
          secondary: '#a1a1aa',
          accent: '#e11d48',
          background: '#fafafa',
          surface: '#ffffff',
          text: '#09090b',
          textLight: '#71717a',
          border: '#e4e4e7',
          success: '#16a34a',
          warning: '#ea580c',
          error: '#dc2626'
        },
        layout: {
          containerWidth: '1100px',
          borderRadius: '0px',
          shadows: {
            small: '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
            medium: '0 8px 16px 0 rgba(0, 0, 0, 0.1)',
            large: '0 16px 32px 0 rgba(0, 0, 0, 0.15)'
          },
          spacing: {
            xs: '1rem',
            sm: '1.5rem',
            md: '2.5rem',
            lg: '3.5rem',
            xl: '5rem',
            xxl: '7rem'
          }
        },
        components: {
          button: {
            padding: '1rem 2rem',
            borderRadius: '0px',
            fontWeight: '400',
            textTransform: 'lowercase'
          },
          card: {
            padding: '2rem',
            borderRadius: '0px',
            shadow: '0 8px 16px 0 rgba(0, 0, 0, 0.1)',
            background: '#ffffff'
          }
        }
      },
      cssVariables: {
        '--primary-color': '#18181b',
        '--secondary-color': '#a1a1aa',
        '--accent-color': '#e11d48',
        '--background-color': '#fafafa',
        '--surface-color': '#ffffff',
        '--text-color': '#09090b',
        '--text-light': '#71717a',
        '--border-color': '#e4e4e7',
        '--border-radius': '0px',
        '--shadow-sm': '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        '--shadow-md': '0 8px 16px 0 rgba(0, 0, 0, 0.1)',
        '--shadow-lg': '0 16px 32px 0 rgba(0, 0, 0, 0.15)',
        '--font-family': '"Crimson Text", serif',
        '--heading-font': '"Playfair Display", serif'
      }
    },

    // TECH STARTUP THEME
    {
      id: 'tech-startup',
      name: 'Tech Startup',
      description: 'Modern and innovative design perfect for tech companies and startups',
      category: 'business',
      preview: {
        primaryColor: '#6366f1',
        secondaryColor: '#8b5cf6',
        backgroundColor: '#0f0f0f',
        textColor: '#ffffff',
        accentColor: '#14b8a6'
      },
      styles: {
        typography: {
          fontFamily: '"JetBrains Mono", monospace',
          headingFont: '"Space Grotesk", sans-serif',
          fontSize: '14px',
          lineHeight: '1.7',
          headingWeight: '700',
          bodyWeight: '400'
        },
        colors: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#14b8a6',
          background: '#0f0f0f',
          surface: '#1f1f1f',
          text: '#ffffff',
          textLight: '#a3a3a3',
          border: '#404040',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444'
        },
        layout: {
          containerWidth: '1280px',
          borderRadius: '12px',
          shadows: {
            small: '0 0 0 1px rgba(255, 255, 255, 0.05)',
            medium: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
            large: '0 20px 25px -5px rgba(0, 0, 0, 0.7)'
          },
          spacing: {
            xs: '0.5rem',
            sm: '1rem',
            md: '1.5rem',
            lg: '2rem',
            xl: '3rem',
            xxl: '4rem'
          }
        },
        components: {
          button: {
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontWeight: '600',
            textTransform: 'none'
          },
          card: {
            padding: '1.5rem',
            borderRadius: '16px',
            shadow: '0 0 0 1px rgba(255, 255, 255, 0.05)',
            background: '#1f1f1f'
          }
        }
      },
      cssVariables: {
        '--primary-color': '#6366f1',
        '--secondary-color': '#8b5cf6',
        '--accent-color': '#14b8a6',
        '--background-color': '#0f0f0f',
        '--surface-color': '#1f1f1f',
        '--text-color': '#ffffff',
        '--text-light': '#a3a3a3',
        '--border-color': '#404040',
        '--border-radius': '12px',
        '--shadow-sm': '0 0 0 1px rgba(255, 255, 255, 0.05)',
        '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
        '--shadow-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.7)',
        '--font-family': '"JetBrains Mono", monospace',
        '--heading-font': '"Space Grotesk", sans-serif'
      }
    },

    // WELLNESS & LIFESTYLE THEME
    {
      id: 'wellness-lifestyle',
      name: 'Wellness & Lifestyle',
      description: 'Calm and organic design perfect for wellness, health, and lifestyle brands',
      category: 'creative',
      preview: {
        primaryColor: '#059669',
        secondaryColor: '#0d9488',
        backgroundColor: '#f0fdf4',
        textColor: '#064e3b',
        accentColor: '#f59e0b'
      },
      styles: {
        typography: {
          fontFamily: '"Nunito", sans-serif',
          headingFont: '"Lora", serif',
          fontSize: '16px',
          lineHeight: '1.7',
          headingWeight: '600',
          bodyWeight: '400'
        },
        colors: {
          primary: '#059669',
          secondary: '#0d9488',
          accent: '#f59e0b',
          background: '#f0fdf4',
          surface: '#ffffff',
          text: '#064e3b',
          textLight: '#059669',
          border: '#bbf7d0',
          success: '#16a34a',
          warning: '#f59e0b',
          error: '#dc2626'
        },
        layout: {
          containerWidth: '1200px',
          borderRadius: '20px',
          shadows: {
            small: '0 2px 8px 0 rgba(5, 150, 105, 0.1)',
            medium: '0 8px 24px 0 rgba(5, 150, 105, 0.15)',
            large: '0 16px 48px 0 rgba(5, 150, 105, 0.2)'
          },
          spacing: {
            xs: '0.75rem',
            sm: '1.25rem',
            md: '2rem',
            lg: '3rem',
            xl: '4rem',
            xxl: '6rem'
          }
        },
        components: {
          button: {
            padding: '1rem 2rem',
            borderRadius: '25px',
            fontWeight: '500',
            textTransform: 'none'
          },
          card: {
            padding: '2rem',
            borderRadius: '24px',
            shadow: '0 8px 24px 0 rgba(5, 150, 105, 0.15)',
            background: '#ffffff'
          }
        }
      },
      cssVariables: {
        '--primary-color': '#059669',
        '--secondary-color': '#0d9488',
        '--accent-color': '#f59e0b',
        '--background-color': '#f0fdf4',
        '--surface-color': '#ffffff',
        '--text-color': '#064e3b',
        '--text-light': '#059669',
        '--border-color': '#bbf7d0',
        '--border-radius': '20px',
        '--shadow-sm': '0 2px 8px 0 rgba(5, 150, 105, 0.1)',
        '--shadow-md': '0 8px 24px 0 rgba(5, 150, 105, 0.15)',
        '--shadow-lg': '0 16px 48px 0 rgba(5, 150, 105, 0.2)',
        '--font-family': '"Nunito", sans-serif',
        '--heading-font': '"Lora", serif'
      }
    }
  ];

  getThemes(): Theme[] {
    return this.themes;
  }

  getThemeById(id: string): Theme | undefined {
    return this.themes.find(theme => theme.id === id);
  }

  getThemesByCategory(category: string): Theme[] {
    return this.themes.filter(theme => theme.category === category);
  }

  applyTheme(theme: Theme): void {
    // This method should only be used for generated websites, not the CMS
    // Apply CSS variables to the document root
    const root = document.documentElement;
    Object.entries(theme.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Load theme fonts
    this.loadThemeFonts(theme);
  }

  applyThemeToElement(theme: Theme, element: HTMLElement): void {
    // Apply CSS variables to a specific element (for previews/canvas)
    Object.entries(theme.cssVariables).forEach(([key, value]) => {
      element.style.setProperty(key, value);
    });

    // Load theme fonts (still needs to be document-wide)
    this.loadThemeFonts(theme);
  }

  clearDocumentTheme(): void {
    // Remove all theme-related CSS variables from document root
    const root = document.documentElement;
    const themeVariables = [
      '--primary-color', '--secondary-color', '--accent-color', '--background-color',
      '--surface-color', '--text-color', '--text-light-color', '--border-color',
      '--shadow-color', '--font-family', '--font-family-heading', '--font-size',
      '--line-height', '--border-radius', '--container-width', '--spacing-unit'
    ];
    
    themeVariables.forEach(variable => {
      root.style.removeProperty(variable);
    });
  }

  private loadThemeFonts(theme: Theme): void {
    const fonts = this.extractFontsFromTheme(theme);
    fonts.forEach(font => {
      if (!document.querySelector(`link[href*="${font}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${font}:wght@300;400;500;600;700&display=swap`;
        document.head.appendChild(link);
      }
    });
  }

  private extractFontsFromTheme(theme: Theme): string[] {
    const fonts = new Set<string>();
    
    // Extract font family names and format them for Google Fonts URL
    const fontFamily = theme.styles.typography.fontFamily.replace(/["']/g, '').split(',')[0].trim();
    const headingFont = theme.styles.typography.headingFont?.replace(/["']/g, '').split(',')[0].trim();
    
    if (fontFamily && !fontFamily.includes('system') && !fontFamily.includes('apple')) {
      fonts.add(fontFamily.replace(/ /g, '+'));
    }
    
    if (headingFont && !headingFont.includes('system') && !headingFont.includes('apple')) {
      fonts.add(headingFont.replace(/ /g, '+'));
    }
    
    return Array.from(fonts);
  }

  generateThemePreview(theme: Theme): string {
    return `
      <div style="
        background: ${theme.preview.backgroundColor};
        color: ${theme.preview.textColor};
        padding: 20px;
        border-radius: 8px;
        font-family: ${theme.styles.typography.fontFamily};
        border: 1px solid ${theme.styles.colors.border};
      ">
        <div style="
          background: ${theme.preview.primaryColor};
          height: 8px;
          border-radius: 4px;
          margin-bottom: 16px;
        "></div>
        <h3 style="
          color: ${theme.preview.primaryColor};
          font-size: 18px;
          margin: 0 0 8px 0;
          font-weight: ${theme.styles.typography.headingWeight};
        ">${theme.name}</h3>
        <p style="
          color: ${theme.preview.secondaryColor};
          font-size: 14px;
          margin: 0 0 12px 0;
          line-height: ${theme.styles.typography.lineHeight};
        ">${theme.description}</p>
        <div style="
          background: ${theme.preview.accentColor};
          color: white;
          padding: 6px 12px;
          border-radius: ${theme.styles.layout.borderRadius};
          font-size: 12px;
          display: inline-block;
          font-weight: ${theme.styles.components.button.fontWeight};
        ">Sample Button</div>
      </div>
    `;
  }
}
