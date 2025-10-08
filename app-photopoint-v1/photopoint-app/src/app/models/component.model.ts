/**
 * Component-related interfaces for the page builder system
 * These define the component types and styling system
 */

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

export interface ResponsiveStyles {
  mobile?: ComponentStyles;
  tablet?: ComponentStyles;
  desktop?: ComponentStyles;
}

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

export interface SpacingValues {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}