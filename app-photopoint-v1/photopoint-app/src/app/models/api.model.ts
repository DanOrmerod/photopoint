import { ComponentType, ResponsiveStyles } from './component.model';

/**
 * API request and response interfaces for all endpoints
 * These define the shape of data sent to and received from the backend API
 */

// Website API requests
export interface CreateWebsiteRequest {
  name: string;
  subdomain: string;
  theme?: string;
  description?: string;
  customDomain?: string;
  templateId?: string;
}

export interface UpdateWebsiteRequest {
  name?: string;
  description?: string;
  subdomain?: string;
  domain?: string;
  customDomain?: string;
  theme?: string;
  status?: 'draft' | 'published' | 'archived';
  settings?: any;
}

// Page API requests
export interface CreatePageRequest {
  title: string;
  slug: string;
  content?: string; // For backward compatibility with simple pages
  metaTitle?: string;
  metaDescription?: string;
  isHomePage?: boolean;
  sortOrder?: number;
  status?: 'draft' | 'published';
}

export interface UpdatePageRequest {
  title?: string;
  slug?: string;
  content?: string; // For backward compatibility with simple pages
  metaTitle?: string;
  metaDescription?: string;
  isHomePage?: boolean;
  sortOrder?: number;
  status?: 'draft' | 'published';
}

// Component API requests
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

// Content Block interfaces (legacy)
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

// Common API response structure
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// Photo/Media API requests
export interface Photo {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl: string;
  uploadedAt: Date;
  userId: string;
  metadata?: {
    width: number;
    height: number;
    camera?: string;
    location?: string;
    tags?: string[];
  };
}

export interface PhotoUpload {
  id?: string;
  file: File;
  albumId?: string;
  tags?: string[];
  altText?: string;
}

export interface UploadResponse {
  // API now returns direct file object or { error: 'message' }
  id?: string;
  filename?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  url?: string;
  thumbnailUrl?: string;
  uploadedAt?: Date;
  userId?: string;
  error?: string; // Error format: { error: 'message' }
  success: boolean;
  file?: {
    id: string;
    url: string;
    thumbnailUrl?: string;
    fileName: string;
    originalName: string;
    size: number;
    mimeType: string;
  };
}