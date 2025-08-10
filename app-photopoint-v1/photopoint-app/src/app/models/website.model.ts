export interface Website {
  id: string;
  name: string;
  description?: string;
  subdomain: string;
  customDomain?: string;
  favicon?: string;
  status: 'draft' | 'published' | 'archived';
  theme?: string;
  pageCount?: number;
  visits?: number;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWebsiteRequest {
  name: string;
  description?: string;
  subdomain: string;
  customDomain?: string;
  theme?: string;
  templateId?: string;
}

export interface UpdateWebsiteRequest {
  name?: string;
  description?: string;
  customDomain?: string;
  favicon?: string;
  status?: 'draft' | 'published' | 'archived';
  theme?: string;
}

// Page-related interfaces
export interface Page {
  id: string;
  websiteId: string;
  title: string;
  slug: string;
  content?: string;
  metaDescription?: string;
  isHomePage: boolean;
  isPublished: boolean;
  status?: 'draft' | 'published' | 'archived';
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePageRequest {
  title: string;
  slug?: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  isHomePage?: boolean;
  sortOrder?: number;
}

export interface UpdatePageRequest {
  title?: string;
  slug?: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  isHomePage?: boolean;
  status?: 'draft' | 'published' | 'archived';
  sortOrder?: number;
}

// Content Block interfaces
export interface ContentBlock {
  id: string;
  pageId: string;
  type: 'text' | 'image' | 'button' | 'header' | 'gallery' | 'video';
  content: any; // JSON content specific to block type
  styles?: any; // CSS styles as JSON
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBlockRequest {
  type: ContentBlock['type'];
  content: any;
  styles?: any;
  sortOrder?: number;
}
