export interface Website {
  id: string;
  accountId: string;
  name: string;
  description?: string;
  subdomain: string;
  customDomain?: string;
  favicon?: string;
  status: 'draft' | 'published';
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  logoMediaFileId?: string;
  lastPublishedAt?: Date;
  publishedVersion?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWebsiteData {
  accountId: string;
  name: string;
  description?: string;
  subdomain: string;
  customDomain?: string;
  favicon?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  logoMediaFileId?: string;
}

export interface UpdateWebsiteData {
  name?: string;
  description?: string;
  subdomain?: string;
  customDomain?: string;
  favicon?: string;
  status?: 'draft' | 'published';
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  logoMediaFileId?: string;
}