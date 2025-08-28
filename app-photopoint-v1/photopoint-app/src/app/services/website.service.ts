import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';

// Import interfaces from the models
export interface Website {
  id: string;
  name: string;
  description: string;
  subdomain: string;
  customDomain?: string;
  favicon?: string;
  status: 'draft' | 'published';
  theme: string;
  pageCount?: number;
  visits?: number;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Page {
  id: string;
  websiteId: string;
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  isHomePage: boolean;
  isPublished: boolean;
  sortOrder: number;
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
  subdomain?: string;
  customDomain?: string;
  theme?: string;
  status?: 'draft' | 'published';
}

export interface CreatePageRequest {
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  metaTitle?: string;
  isHomePage?: boolean;
  isPublished?: boolean;
  sortOrder?: number;
}

export interface UpdatePageRequest {
  title?: string;
  slug?: string;
  content?: string;
  metaDescription?: string;
  metaTitle?: string;
  isHomePage?: boolean;
  isPublished?: boolean;
  sortOrder?: number;
  status?: 'draft' | 'published';
}

@Injectable({
  providedIn: 'root'
})
export class WebsiteService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // WEBSITE METHODS
  async getWebsites(): Promise<Website[]> {
      const response = await firstValueFrom(
        this.http.get<Website[]>(`${this.apiUrl}/websites`, { headers: this.getHeaders() })
      );
      if (response && Array.isArray(response)) {
        return response.map((w: any) => ({
          id: w.id,
          name: w.name,
          description: w.description || '',
          subdomain: w.subdomain,
          customDomain: w.customDomain || w.domain || '',
          favicon: w.favicon || '',
          status: w.status === 'active' ? 'published' : (w.status || 'draft'),
          theme: w.theme || 'default',
          pageCount: w.pageCount || 0,
          visits: w.visits || 0,
          ownerId: w.userId || w.ownerId,
          createdAt: new Date(w.createdAt),
          updatedAt: new Date(w.updatedAt)
        }));
      }
      return [];
  }

  async getWebsite(id: string): Promise<Website> {
    try {
      const response = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/websites/${id}`, { headers: this.getHeaders() }));
      
      if (response) {
        const w = response.website || response;
        return {
          id: w.id,
          name: w.name,
          description: w.description || '',
          subdomain: w.subdomain,
          customDomain: w.customDomain || w.domain || '',
          favicon: w.favicon || '',
          status: w.status === 'active' ? 'published' : (w.status || 'draft'),
          theme: w.theme || 'default',
          pageCount: w.pageCount || 0,
          visits: w.visits || 0,
          ownerId: w.userId || w.ownerId,
          createdAt: new Date(w.createdAt),
          updatedAt: new Date(w.updatedAt)
        };
      }
    } catch (error) {
      console.error('Failed to fetch website:', error);
    }
    throw new Error('Website not found');
  }

  async createWebsite(websiteData: CreateWebsiteRequest): Promise<Website> {
    try {
      const response = await firstValueFrom(this.http.post<Website>(`${this.apiUrl}/websites`, websiteData, { headers: this.getHeaders() }));
      if (response) {
        return response;
      }
    } catch (error) {
      console.error('Failed to create website:', error);
    }
    throw new Error('Failed to create website');
  }

  async updateWebsite(id: string, websiteData: UpdateWebsiteRequest): Promise<Website> {
    try {
      const response = await firstValueFrom(this.http.put<Website>(`${this.apiUrl}/websites/${id}`, websiteData, { headers: this.getHeaders() }));
      if (response) {
        return response;
      }
    } catch (error) {
      console.error('Failed to update website:', error);
    }
    throw new Error('Failed to update website');
  }

  async deleteWebsite(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/websites/${id}`, { headers: this.getHeaders() }));
    } catch (error) {
      console.error('Failed to delete website:', error);
      throw error;
    }
  }

  // PUBLIC API METHODS (for viewer)
  async getPublicWebsite(domain: string): Promise<Website> {
    try {
      const response = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/websites/website/${domain}`));
      if (response) {
        const w = response;
        return {
          id: w.id,
          name: w.name,
          description: w.description || '',
          subdomain: w.subdomain,
          customDomain: w.customDomain || w.domain || '',
          favicon: w.favicon || '',
          status: w.status === 'active' ? 'published' : (w.status || 'draft'),
          theme: w.theme || 'default',
          pageCount: w.pageCount || 0,
          visits: w.visits || 0,
          ownerId: w.userId || w.ownerId,
          createdAt: new Date(w.createdAt),
          updatedAt: new Date(w.updatedAt)
        };
      }
    } catch (error) {
      console.error('Failed to fetch public website:', error);
    }
    throw new Error('Website not found');
  }

  async getPublicPages(domain: string): Promise<Page[]> {
    try {
      const response = await firstValueFrom(this.http.get<Page[]>(`${this.apiUrl}/websites/website/${domain}/pages`));
      if (response && Array.isArray(response)) {
        return response.map((p: any) => ({
          id: p.id,
          websiteId: p.websiteId,
          title: p.title,
          slug: p.slug,
          content: p.content,
          metaDescription: p.metaDescription || '',
          isHomePage: p.isHomePage || false,
          isPublished: p.status === 'published',
          sortOrder: p.sortOrder || 0,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch public pages:', error);
      throw error;
    }
  }

  async getPublicPage(domain: string, slug: string): Promise<Page> {
    try {
      const response = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/websites/website/${domain}/pages/${slug}`));
      if (response) {
        const p = response;
        return {
          id: p.id,
          websiteId: p.websiteId,
          title: p.title,
          slug: p.slug,
          content: p.content,
          metaDescription: p.metaDescription || '',
          isHomePage: p.isHomePage || false,
          isPublished: p.status === 'published',
          sortOrder: p.sortOrder || 0,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        };
      }
    } catch (error) {
      console.error('Failed to fetch public page:', error);
    }
    throw new Error('Page not found');
  }

  // PAGE METHODS
  async getPages(websiteId: string): Promise<Page[]> {
    try {
      const response = await firstValueFrom(this.http.get<Page[]>(`${this.apiUrl}/websites/${websiteId}/pages`, { headers: this.getHeaders() }));
      if (response && Array.isArray(response)) {
        return response.map((p: any) => ({
          id: p.id,
          websiteId: p.websiteId,
          title: p.title,
          slug: p.slug,
          content: p.content,
          metaDescription: p.metaDescription || '',
          isHomePage: p.isHomePage || false,
          isPublished: p.status === 'published',
          sortOrder: p.sortOrder || 0,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch pages:', error);
      throw error;
    }
  }

  async getPage(websiteId: string, pageId: string): Promise<Page> {
    try {
      const response = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/websites/${websiteId}/pages/${pageId}`, { headers: this.getHeaders() }));
      
      if (response) {
        const p = response;
        return {
          id: p.id,
          websiteId: p.websiteId,
          title: p.title,
          slug: p.slug,
          content: p.content,
          metaDescription: p.metaDescription || '',
          isHomePage: p.isHomePage || false,
          isPublished: p.status === 'published',
          sortOrder: p.sortOrder || 0,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        };
      }
    } catch (error) {
      console.error('Failed to fetch page:', error);
    }
    throw new Error('Page not found');
  }

  async createPage(websiteId: string, pageData: CreatePageRequest): Promise<Page> {
    try {
      const response = await firstValueFrom(this.http.post<Page>(`${this.apiUrl}/websites/${websiteId}/pages`, pageData, { headers: this.getHeaders() }));
      if (response) {
        return response;
      }
    } catch (error) {
      console.error('Failed to create page:', error);
    }
    throw new Error('Failed to create page');
  }

  async updatePage(websiteId: string, pageId: string, pageData: UpdatePageRequest): Promise<Page> {
    try {
      const response = await firstValueFrom(this.http.put<Page>(`${this.apiUrl}/websites/${websiteId}/pages/${pageId}`, pageData, { headers: this.getHeaders() }));
      if (response) {
        return response;
      }
    } catch (error) {
      console.error('Failed to update page:', error);
    }
    throw new Error('Failed to update page');
  }

  async deletePage(websiteId: string, pageId: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/websites/${websiteId}/pages/${pageId}`, { headers: this.getHeaders() }));
    } catch (error) {
      console.error('Failed to delete page:', error);
      throw error;
    }
  }

  // TEMPLATE METHODS
  async getTemplates() {
    // This would be a separate API call in real implementation
    return [
      { id: '1', name: 'Simple Business', description: 'Clean and professional template' },
      { id: '2', name: 'Creative Portfolio', description: 'Showcase your work' },
      { id: '3', name: 'Blog Template', description: 'Perfect for content creators' }
    ];
  }

  // UTILITY METHODS
  generateSubdomainSuggestion(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 30);
  }

  isValidSubdomain(subdomain: string): boolean {
    const subdomainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
    return subdomain.length >= 2 && 
           subdomain.length <= 63 && 
           subdomainRegex.test(subdomain) &&
           !subdomain.includes('--');
  }

  async publishWebsite(id: string): Promise<Website> {
    try {
      const response = await firstValueFrom(this.http.post<{ message: string, website: any, publishedAt: string }>(`${this.apiUrl}/websites/${id}/publish`, {}, { headers: this.getHeaders() }));
      if (response && response.website) {
        // Map the response website data to frontend Website interface
        const w = response.website;
        return {
          id: w.id,
          name: w.name,
          description: w.description || '',
          subdomain: w.subdomain,
          customDomain: w.customDomain || w.domain || '',
          favicon: w.favicon || '',
          status: w.status === 'active' ? 'published' : (w.status || 'draft'),
          theme: w.theme || 'default',
          pageCount: w.pageCount || 0,
          visits: w.visits || 0,
          ownerId: w.userId || w.ownerId,
          createdAt: new Date(w.createdAt),
          updatedAt: new Date(w.updatedAt)
        };
      }
      throw new Error('Failed to publish website');
    } catch (error) {
      console.error('Failed to publish website:', error);
      throw error;
    }
  }

  async unpublishWebsite(id: string): Promise<Website> {
    return this.updateWebsite(id, { status: 'draft' });
  }
}
