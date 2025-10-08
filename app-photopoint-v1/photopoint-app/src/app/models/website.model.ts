import { ComponentType, ResponsiveStyles } from './component.model';

/**
 * Website-related interfaces that match the backend API
 * These should be kept in sync with the backend Website and WebsitePage models
 */

export interface Website {
  id: string;
  accountId: string;
  name: string;
  description?: string;
  subdomain: string;
  domain?: string;
  customDomain?: string;
  favicon?: string;
  theme: string;
  status: 'draft' | 'published' | 'archived';
  settings?: any;
  pageCount?: number;
  visits?: number;
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
  // Backwards compatibility properties
  content?: string;
  isPublished?: boolean;
}

// Legacy Page interface for backwards compatibility
export interface Page {
  id: string;
  websiteId: string;
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  metaTitle?: string;
  isHomePage: boolean;
  isPublished: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
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
