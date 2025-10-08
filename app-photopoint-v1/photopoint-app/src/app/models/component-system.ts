// Component System Interfaces - Based on requirements from 02_Website_Requirements.md

// Additional type definitions
export type ViewMode = 'desktop' | 'tablet' | 'mobile';
export type WidthMode = 'container' | 'full-width';

// Core component types enum
export enum ComponentType {
  // Hero and Layout Components
  HERO = 'hero',
  NAVIGATION = 'navigation',
  FOOTER = 'footer',
  
  // Text Components
  TEXT = 'text',
  HEADING = 'heading', 
  PARAGRAPH = 'paragraph',
  LIST = 'list',

  // Media Components
  IMAGE = 'image',
  GALLERY = 'gallery',
  IMAGE_GALLERY = 'image_gallery',
  VIDEO = 'video', 
  IMAGE_SLIDER = 'image_slider',

  // Interactive Components
  BUTTON = 'button',
  LINK = 'link',
  FORM = 'form',
  CONTACT_FORM = 'contact-form',
  NEWSLETTER_SIGNUP = 'newsletter_signup',

  // Layout Components
  CONTAINER = 'container',
  SECTION = 'section',
  ROW = 'row',
  COLUMN = 'column',

  // Content Components
  SPACER = 'spacer',
  DIVIDER = 'divider',
  MAP = 'map',
  SOCIAL_MEDIA = 'social_media',
  SOCIAL_LINKS = 'social-links',
  ACCORDION = 'accordion',
  TABS = 'tabs',
  TESTIMONIAL = 'testimonial',
  PRICING_TABLE = 'pricing_table',

  // Custom Components
  HTML = 'html',

  // E-commerce Components
  SHOP_PRODUCT = 'shop_product',
  PRODUCT_GALLERY = 'product_gallery',
  CART = 'cart',
  CHECKOUT = 'checkout',

  // Workshop Components
  WORKSHOP_LIST = 'workshop_list',
  WORKSHOP_DETAIL = 'workshop_detail',
  BOOKING_FORM = 'booking_form'
}

// Base component interface that all components extend
export interface BaseComponent {
  id: string;
  type: ComponentType;
  parentId?: string;
  sortOrder: number;
  
  // Component content and configuration
  content?: any;
  props?: ComponentProps;

  // Responsive styling
  styles: ResponsiveStyles;

  // Component state
  isVisible: boolean;
  isLocked: boolean;
  
  // Version control
  version: number;
  
  // Audit fields
  createdAt: Date;
  updatedAt: Date;
}

// Responsive styles for different screen sizes
export interface ResponsiveStyles {
  desktop: ComponentStyles;
  tablet: ComponentStyles;
  mobile: ComponentStyles;
}

// Component styling properties
export interface ComponentStyles {
  // Layout
  width?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;

  // Spacing
  margin?: SpacingValues;
  padding?: SpacingValues;

  // Positioning
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;

  // Display and layout
  display?: 'block' | 'inline' | 'inline-block' | 'flex' | 'grid' | 'none';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: string;

  // Grid layout
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridColumn?: string;
  gridRow?: string;
  gridGap?: string;

  // Typography
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  letterSpacing?: string;
  color?: string;

  // Background
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: 'auto' | 'cover' | 'contain';
  backgroundPosition?: string;
  backgroundRepeat?: 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y';

  // Border
  border?: string;
  borderRadius?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;

  // Shadow and effects
  boxShadow?: string;
  textShadow?: string;
  opacity?: number;
  transform?: string;
  transition?: string;

  // Overflow
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto';
}

// Spacing values for margin and padding
export interface SpacingValues {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

// Generic component props interface
export interface ComponentProps {
  [key: string]: any;
}

// Page component hierarchy
export interface PageComponent extends BaseComponent {
  pageId: string;
  children?: PageComponent[];
}

// Page structure with components
export interface WebsitePage {
  id: string;
  websiteId: string;
  title: string;
  slug: string;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  
  // Page settings
  isHomePage: boolean;
  isPublished: boolean;
  sortOrder: number;
  
  // Layout settings
  layoutType: string;
  maxWidth?: string;
  backgroundColor?: string;
  backgroundImageId?: string;
  
  // Components
  components: PageComponent[];
  
  // Version control
  version: number;
  publishedVersion?: number;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
}

// Website structure
export interface Website {
  id: string;
  name: string;
  description?: string;
  subdomain: string;
  customDomain?: string;
  favicon?: string;
  status: 'draft' | 'published';
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  
  // Branding
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  logoMediaFileId?: string;
  
  // Publishing
  lastPublishedAt?: Date;
  publishedVersion?: number;
  
  // Multi-tenancy
  accountId: string;
  
  // Pages
  pages?: WebsitePage[];
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
}

// Component nesting rules
export interface ComponentNestingRules {
  [ComponentType.CONTAINER]: ComponentType[];
  [ComponentType.SECTION]: ComponentType[];
  [ComponentType.ROW]: ComponentType[];
  [ComponentType.COLUMN]: ComponentType[];
  // Text components cannot have children
  [ComponentType.TEXT]: never[];
  [ComponentType.HEADING]: never[];
  [ComponentType.PARAGRAPH]: never[];
  // Media components cannot have children
  [ComponentType.IMAGE]: never[];
  [ComponentType.VIDEO]: never[];
  // Interactive components cannot have children
  [ComponentType.BUTTON]: never[];
  [ComponentType.LINK]: never[];
  // And so on...
}

// Component categories for the component panel
export interface ComponentCategory {
  id: string;
  name: string;
  icon: string;
  components: ComponentDefinition[];
  isCollapsible: boolean;
}

export interface ComponentDefinition {
  type: ComponentType;
  name: string;
  description: string;
  icon: string;
  category: string;
  defaultProps: Partial<BaseComponent>;
  previewImage?: string;
}

// Template system
export interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  previewImageUrl?: string;
  
  // Template structure
  pageStructure: TemplatePageStructure[];
  styleSettings?: TemplateStyleSettings;
  
  // Template metadata
  isPublic: boolean;
  usageCount: number;
  rating?: number;
  
  // Ownership
  createdBy?: string;
  accountId?: string;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplatePageStructure {
  title: string;
  slug: string;
  isHomePage: boolean;
  components: PageComponent[];
  layoutSettings?: {
    maxWidth?: string;
    backgroundColor?: string;
  };
}

export interface TemplateStyleSettings {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  headingFont?: string;
  bodyFont?: string;
}

// State management for page builder
export interface PageBuilderState {
  currentPage: WebsitePage | null;
  selectedComponent: PageComponent | null;
  draggedComponent: ComponentType | null;
  clipboard: PageComponent | null;
  
  // History for undo/redo
  history: PageBuilderHistoryEntry[];
  historyIndex: number;
  maxHistorySize?: number;
  
  // UI state
  viewMode: ViewMode;
  widthMode: WidthMode;
  zoomLevel: number;
  
  // Panels
  componentPanelVisible: boolean;
  propertyPanelVisible: boolean;
  layersPanelVisible: boolean;
  
  // Preview mode
  isPreviewMode: boolean;
  
  // Loading and dirty state
  isLoading?: boolean;
  isDirty?: boolean;
}

export interface PageBuilderHistoryEntry {
  id: string;
  description: string;
  timestamp: Date;
  page: any; // Simplified for now - could be WebsitePage snapshot
  pageState: {
    components: PageComponent[];
    pageSettings: Partial<WebsitePage>;
  };
}

// Photography-specific component extensions
export interface GalleryComponentProps extends ComponentProps {
  dataSource: {
    type: 'folder_sync' | 'manual_selection';
    folderId?: string;
    selectedFiles?: string[];
  };
  displayMode: 'grid' | 'masonry' | 'carousel' | 'slideshow';
  columns?: number;
  spacing?: string;
  showCaptions?: boolean;
  enableLightbox?: boolean;
  aspectRatio?: 'original' | 'square' | '4:3' | '16:9';
  imageSize?: 'thumbnail' | 'medium' | 'large' | 'original';
}

export interface ImageComponentProps extends ComponentProps {
  mediaFileId?: string;
  alt?: string;
  caption?: string;
  link?: {
    type: 'none' | 'url' | 'page' | 'lightbox';
    value?: string;
  };
  sizing: 'cover' | 'contain' | 'fill' | 'scale-down';
  alignment: 'left' | 'center' | 'right';
}

export interface TextComponentProps extends ComponentProps {
  content: string;
  textType: 'paragraph' | 'heading' | 'caption';
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
  };
}

export interface ButtonComponentProps extends ComponentProps {
  text: string;
  variant: 'primary' | 'secondary' | 'outline' | 'text';
  size: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  link?: {
    type: 'url' | 'page' | 'email' | 'phone';
    value: string;
    openInNewTab?: boolean;
  };
}