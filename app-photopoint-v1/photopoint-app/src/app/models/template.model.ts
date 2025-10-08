/**
 * Template-related interfaces for the website template system
 * These define template structure and configuration
 */

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'creative' | 'portfolio' | 'e-commerce' | 'blog' | 'landing' | 'restaurant' | 'agency' | 'healthcare' | 'education' | 'nonprofit' | 'fitness';
  thumbnail: string;
  theme: Theme;
  pages: {
    name: string;
    slug: string;
    title: string;
    metaDescription: string;
    blocks: TemplateBlock[];
    isHomePage?: boolean;
    seo?: {
      keywords?: string[];
      ogTitle?: string;
      ogDescription?: string;
      ogImage?: string;
    };
  }[];
  features: string[];
  preview?: {
    primaryColor: string;
    layout: string;
    typography: string;
  };
  pricing: 'free' | 'premium';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedSetupTime: string;
  targetAudience: string[];
  includesContent: boolean;
  demoUrl?: string;
  tags: string[];
}

export interface TemplateBlock {
  id: string;
  type: 'hero' | 'text' | 'image' | 'gallery' | 'spacer' | 'button' | 'columns' | 'testimonial' | 'pricing' | 'contact' | 'stats' | 'cta' | 'features' | 'faq' | 'team' | 'blog' | 'newsletter';
  content: any;
  styles: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    margin?: string;
    fontSize?: string;
    fontWeight?: string;
    textAlign?: string;
    borderRadius?: string;
    maxWidth?: string;
    backgroundImage?: string;
    backgroundSize?: string;
    backgroundPosition?: string;
    boxShadow?: string;
    [key: string]: any;
  };
  animations?: {
    entrance?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'zoomIn';
    duration?: number;
    delay?: number;
  };
  responsive?: {
    mobile?: Partial<TemplateBlock['styles']>;
    tablet?: Partial<TemplateBlock['styles']>;
    desktop?: Partial<TemplateBlock['styles']>;
  };
}

export interface TemplateConfig {
  name: string;
  description: string;
  category: string;
  theme: any;
  features: string[];
  pricing: 'free' | 'premium';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedSetupTime: string;
  targetAudience: string[];
  includesContent: boolean;
  tags: string[];
  pages: TemplatePage[];
}

export interface TemplatePage {
  name: string;
  slug: string;
  title: string;
  metaDescription: string;
  isHomePage?: boolean;
  blocks: TemplateBlock[];
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'creative' | 'portfolio' | 'e-commerce' | 'blog';
  preview: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    accentColor: string;
  };
  styles: {
    typography: {
      fontFamily: string;
      headingFont?: string;
      fontSize: string;
      lineHeight: string;
      headingWeight: string;
      bodyWeight: string;
    };
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      surface: string;
      text: string;
      textLight: string;
      border: string;
      success: string;
      warning: string;
      error: string;
    };
    layout: {
      containerWidth: string;
      borderRadius: string;
      shadows: {
        small: string;
        medium: string;
        large: string;
      };
      spacing: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
        xxl: string;
      };
    };
    components: {
      button: {
        padding: string;
        borderRadius: string;
        fontWeight: string;
        textTransform: string;
      };
      card: {
        padding: string;
        borderRadius: string;
        shadow: string;
        background: string;
      };
    };
  };
  cssVariables: { [key: string]: string };
}