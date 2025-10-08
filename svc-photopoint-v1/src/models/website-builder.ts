// TypeScript models for the new component-based website builder

export interface Website {
  id: string;
  accountId: string;
  name: string;
  subdomain: string;
  domain?: string;
  theme: string;
  status: 'draft' | 'published' | 'archived';
  settings: any;
  createdAt: Date;
  updatedAt: Date;
  lastPublishedAt?: Date;
}

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

export interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  components: any;
  styles: any;
  settings: any;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum ComponentType {
  TEXT = 'text',
  HEADING = 'heading',
  IMAGE = 'image',
  GALLERY = 'gallery',
  BUTTON = 'button',
  LINK = 'link',
  VIDEO = 'video',
  FORM = 'form',
  DIVIDER = 'divider',
  SPACER = 'spacer',
  CONTAINER = 'container',
  COLUMN = 'column'
}

export interface ResponsiveStyles {
  mobile?: ComponentStyles;
  tablet?: ComponentStyles;
  desktop?: ComponentStyles;
}

export interface ComponentStyles {
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  spacing?: {
    margin?: { top: number; right: number; bottom: number; left: number; };
    padding?: { top: number; right: number; bottom: number; left: number; };
  };
  typography?: {
    fontSize?: string;
    fontWeight?: string;
    fontFamily?: string;
    color?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    lineHeight?: string;
  };
  background?: {
    color?: string;
    image?: string;
    gradient?: string;
  };
  border?: {
    width?: number;
    color?: string;
    style?: 'solid' | 'dashed' | 'dotted';
    radius?: number;
  };
  effects?: {
    shadow?: string;
    opacity?: number;
    transform?: string;
  };
}

// Request/Response interfaces for API
export interface CreateWebsiteRequest {
  name: string;
  subdomain: string;
  theme?: string;
}

export interface UpdateWebsiteRequest {
  name?: string;
  subdomain?: string;
  domain?: string;
  theme?: string;
  settings?: any;
}

export interface CreatePageRequest {
  title: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  isHomePage?: boolean;
}

export interface UpdatePageRequest {
  title?: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  isHomePage?: boolean;
  sortOrder?: number;
  status?: 'draft' | 'published';
}

export interface CreateComponentRequest {
  componentType: ComponentType;
  componentData: any;
  styles?: ResponsiveStyles;
  parentId?: string;
  sortOrder?: number;
}

export interface UpdateComponentRequest {
  componentType?: ComponentType;
  componentData?: any;
  styles?: ResponsiveStyles;
  sortOrder?: number;
  parentId?: string;
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  category: string;
  components: any;
  styles?: any;
  settings?: any;
  isPublic?: boolean;
}