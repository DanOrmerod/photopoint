export interface WebsitePage {
  id: string;
  websiteId: string;
  title: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  isHomePage: boolean;
  status: 'draft' | 'published';
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  lastPublishedAt?: Date;
  components?: PageComponent[];
}

export interface PageComponent {
  id: string;
  pageId: string;
  componentType: ComponentType;
  componentData: any;
  styles: ResponsiveStyles;
  sortOrder: number;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

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
  CONTACT_FORM = 'contact_form',
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

export interface ResponsiveStyles {
  desktop?: ComponentStyles;
  tablet?: ComponentStyles;
  mobile?: ComponentStyles;
}

export interface ComponentStyles {
  width?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  margin?: string;
  padding?: string;
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;
  display?: 'block' | 'inline' | 'inline-block' | 'flex' | 'grid' | 'none';
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}