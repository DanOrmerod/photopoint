import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';
import {
  Website,
  WebsitePage,
  Page,
  PageComponent,
  Template,
  ComponentType,
  ResponsiveStyles,
  ComponentStyles,
  SpacingValues,
  CreateWebsiteRequest,
  UpdateWebsiteRequest,
  CreatePageRequest,
  UpdatePageRequest,
  CreateComponentRequest,
  UpdateComponentRequest
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class WebsiteService {
  private readonly baseUrl = `${environment.apiUrl}/website`;
  private readonly apiUrl = environment.apiUrl;

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

  // Website methods - Observable versions (for page builder)
  getWebsites$(): Observable<Website[]> {
    return this.http.get<Website[]>(`${this.baseUrl}`, { headers: this.getHeaders() });
  }

  getWebsite$(id: string): Observable<Website> {
    return this.http.get<Website>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }

  createWebsite$(data: CreateWebsiteRequest): Observable<Website> {
    return this.http.post<Website>(`${this.baseUrl}`, data, { headers: this.getHeaders() });
  }

  updateWebsite$(id: string, data: UpdateWebsiteRequest): Observable<Website> {
    return this.http.put<Website>(`${this.baseUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  deleteWebsite$(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }

  publishWebsite$(id: string): Observable<{ message: string; website: Website; publishedAt: Date }> {
    return this.http.post<{ message: string; website: Website; publishedAt: Date }>(
      `${this.baseUrl}/${id}/publish`, {}, { headers: this.getHeaders() }
    );
  }

  // Website methods - Promise versions (for dashboard)
  async getWebsites(): Promise<Website[]> {
    const response = await firstValueFrom(
      this.http.get<any>(`${this.apiUrl}/website`, { headers: this.getHeaders() })
    );
    
    // Handle wrapped response format { success: true, data: websites, timestamp: ... }
    const websites = response.data || response;
    if (websites && Array.isArray(websites)) {
      return websites.map((w: any) => ({
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
        accountId: w.accountId || w.userId || w.ownerId,
        createdAt: new Date(w.createdAt),
        updatedAt: new Date(w.updatedAt),
        lastPublishedAt: w.lastPublishedAt ? new Date(w.lastPublishedAt) : undefined,
        settings: w.settings
      }));
    }
    return [];
  }

  async getWebsite(id: string): Promise<Website> {
    try {
      const response = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/website/${id}`, { headers: this.getHeaders() }));
      
      if (response) {
        // Handle wrapped response format { success: true, data: website, timestamp: ... }
        const w = response.data || response;
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
          accountId: w.accountId || w.userId || w.ownerId,
          createdAt: new Date(w.createdAt),
          updatedAt: new Date(w.updatedAt),
          lastPublishedAt: w.lastPublishedAt ? new Date(w.lastPublishedAt) : undefined,
          settings: w.settings
        };
      }
    } catch (error: any) {
      console.error('Failed to fetch website:', error);
      if (error.error?.error) {
        throw new Error(error.error.error);
      }
      throw new Error(error.message || 'Failed to fetch website');
    }
    throw new Error('Website not found');
  }

  async createWebsite(websiteData: CreateWebsiteRequest): Promise<Website> {
    const response = await firstValueFrom(
      this.http.post<any>(`${this.apiUrl}/website`, websiteData, { headers: this.getHeaders() })
    );
    
    // Handle wrapped response format { success: true, data: website, timestamp: ... }
    const website = response.data || response;
    return {
      id: website.id,
      name: website.name,
      description: website.description || '',
      subdomain: website.subdomain,
      customDomain: website.customDomain || '',
      favicon: website.favicon || '',
      theme: website.theme || 'default',
      status: website.status || 'draft',
      accountId: website.accountId,
      createdAt: new Date(website.createdAt),
      updatedAt: new Date(website.updatedAt),
      lastPublishedAt: website.lastPublishedAt ? new Date(website.lastPublishedAt) : undefined
    };
  }

  async updateWebsite(id: string, websiteData: UpdateWebsiteRequest): Promise<Website> {
    const response = await firstValueFrom(
      this.http.put<Website>(`${this.apiUrl}/website/${id}`, websiteData, { headers: this.getHeaders() })
    );
    return response;
  }

  async deleteWebsite(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`${this.apiUrl}/website/${id}`, { headers: this.getHeaders() })
    );
  }

  async publishWebsite(id: string): Promise<Website> {
    const response = await firstValueFrom(
      this.http.put<Website>(`${this.apiUrl}/website/${id}`, { status: 'published' }, { headers: this.getHeaders() })
    );
    return response;
  }

  async unpublishWebsite(id: string): Promise<Website> {
    const response = await firstValueFrom(
      this.http.put<Website>(`${this.apiUrl}/website/${id}`, { status: 'draft' }, { headers: this.getHeaders() })
    );
    return response;
  }

  // Public website methods (for viewers)
  async getPublicWebsite(domain: string): Promise<Website> {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}/public/website/${domain}`)
      );
      
      if (response) {
        const w = response;
        return {
          id: w.id,
          name: w.name,
          description: w.description || '',
          subdomain: w.subdomain,
          customDomain: w.customDomain || w.domain || '',
          favicon: w.favicon || '',
          status: w.status || 'published',
          theme: w.theme || 'default',
          accountId: w.accountId || w.userId || w.ownerId,
          createdAt: new Date(w.createdAt),
          updatedAt: new Date(w.updatedAt),
          lastPublishedAt: w.lastPublishedAt ? new Date(w.lastPublishedAt) : undefined,
          settings: w.settings
        };
      }
    } catch (error: any) {
      console.error('Failed to fetch public website:', error);
      throw new Error(error.message || 'Failed to fetch public website');
    }
    throw new Error('Public website not found');
  }

  async getPublicPages(domain: string): Promise<WebsitePage[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<any[]>(`${this.apiUrl}/public/website/${domain}/pages`)
      );
      
      if (response && Array.isArray(response)) {
        return response.map((p: any) => ({
          id: p.id,
          websiteId: p.websiteId,
          title: p.title,
          slug: p.slug,
          metaTitle: p.metaTitle,
          metaDescription: p.metaDescription,
          isHomePage: p.isHomePage || false,
          status: p.isPublished ? 'published' : 'draft',
          sortOrder: p.sortOrder || 0,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        }));
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch public pages:', error);
      throw new Error(error.message || 'Failed to fetch public pages');
    }
  }

  async getPublicPage(domain: string, slug: string): Promise<WebsitePage> {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}/public/website/${domain}/pages/${slug}`)
      );
      
      if (response) {
        const p = response;
        return {
          id: p.id,
          websiteId: p.websiteId,
          title: p.title,
          slug: p.slug,
          metaTitle: p.metaTitle,
          metaDescription: p.metaDescription,
          isHomePage: p.isHomePage || false,
          status: p.isPublished ? 'published' : 'draft',
          sortOrder: p.sortOrder || 0,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        };
      }
    } catch (error: any) {
      console.error('Failed to fetch public page:', error);
      throw new Error(error.message || 'Failed to fetch public page');
    }
    throw new Error('Public page not found');
  }

  // Templates method
  async getTemplates() {
    try {
      const response = await firstValueFrom(
        this.http.get<any[]>(`${this.apiUrl}/templates`, { headers: this.getHeaders() })
      );
      return response || [];
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      return [];
    }
  }

  // Page methods - Observable versions (for page builder)
  getPages$(websiteId: string): Observable<WebsitePage[]> {
    return this.http.get<WebsitePage[]>(`${this.baseUrl}/${websiteId}/pages`, { headers: this.getHeaders() });
  }

  getPage$(websiteId: string, pageId: string): Observable<WebsitePage> {
    return this.http.get<WebsitePage>(`${this.baseUrl}/${websiteId}/pages/${pageId}`, { headers: this.getHeaders() });
  }

  createPage$(websiteId: string, data: CreatePageRequest): Observable<WebsitePage> {
    return this.http.post<WebsitePage>(`${this.baseUrl}/${websiteId}/pages`, data, { headers: this.getHeaders() });
  }

  updatePage$(websiteId: string, pageId: string, data: UpdatePageRequest): Observable<WebsitePage> {
    return this.http.put<WebsitePage>(`${this.baseUrl}/${websiteId}/pages/${pageId}`, data, { headers: this.getHeaders() });
  }

  deletePage$(websiteId: string, pageId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${websiteId}/pages/${pageId}`, { headers: this.getHeaders() });
  }

  publishPage$(websiteId: string, pageId: string): Observable<{ message: string; page: WebsitePage; publishedAt: Date }> {
    return this.http.post<{ message: string; page: WebsitePage; publishedAt: Date }>(
      `${this.baseUrl}/${websiteId}/pages/${pageId}/publish`, {}, { headers: this.getHeaders() }
    );
  }

  // Page methods - Promise versions (for dashboard)
  async getPages(websiteId: string): Promise<WebsitePage[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}/website/${websiteId}/pages`, { headers: this.getHeaders() })
      );
      
      // Handle wrapped response format { success: true, data: pages, timestamp: ... }
      const pages = response.data || response;
      if (pages && Array.isArray(pages)) {
        return pages.map((p: any) => ({
          id: p.id,
          websiteId: p.websiteId,
          title: p.title,
          slug: p.slug,
          metaTitle: p.metaTitle,
          metaDescription: p.metaDescription,
          isHomePage: p.isHomePage || false,
          status: p.isPublished ? 'published' : (p.status || 'draft'),
          sortOrder: p.sortOrder || 0,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        }));
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch pages:', error);
      throw new Error(error.message || 'Failed to fetch pages');
    }
  }

  async getPage(websiteId: string, pageId: string): Promise<WebsitePage> {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}/website/${websiteId}/pages/${pageId}`, { headers: this.getHeaders() })
      );
      
      if (response) {
        const p = response;
        return {
          id: p.id,
          websiteId: p.websiteId,
          title: p.title,
          slug: p.slug,
          metaTitle: p.metaTitle,
          metaDescription: p.metaDescription,
          isHomePage: p.isHomePage || false,
          status: p.isPublished ? 'published' : (p.status || 'draft'),
          sortOrder: p.sortOrder || 0,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        };
      }
    } catch (error: any) {
      console.error('Failed to fetch page:', error);
      throw new Error(error.message || 'Failed to fetch page');
    }
    throw new Error('Page not found');
  }

  async createPage(websiteId: string, pageData: CreatePageRequest): Promise<WebsitePage> {
    const response = await firstValueFrom(
      this.http.post<any>(`${this.apiUrl}/website/${websiteId}/pages`, pageData, { headers: this.getHeaders() })
    );
    
    // Handle wrapped response format { success: true, data: page, timestamp: ... }
    const page = response.data || response;
    return {
      id: page.id,
      websiteId: page.websiteId,
      title: page.title,
      slug: page.slug,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      isHomePage: page.isHomePage || false,
      status: page.status || (page.isPublished ? 'published' : 'draft'),
      sortOrder: page.sortOrder || 0,
      createdAt: new Date(page.createdAt),
      updatedAt: new Date(page.updatedAt)
    };
  }

  async updatePage(websiteId: string, pageId: string, pageData: UpdatePageRequest): Promise<WebsitePage> {
    const response = await firstValueFrom(
      this.http.put<WebsitePage>(`${this.apiUrl}/website/${websiteId}/pages/${pageId}`, pageData, { headers: this.getHeaders() })
    );
    return response;
  }

  async deletePage(websiteId: string, pageId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`${this.apiUrl}/website/${websiteId}/pages/${pageId}`, { headers: this.getHeaders() })
    );
  }

  // Component methods (Observable versions for page builder)
  getPageComponents$(websiteId: string, pageId: string): Observable<PageComponent[]> {
    return this.http.get<PageComponent[]>(`${this.baseUrl}/${websiteId}/pages/${pageId}/components`, { headers: this.getHeaders() });
  }

  createComponent$(websiteId: string, pageId: string, data: CreateComponentRequest): Observable<PageComponent> {
    return this.http.post<PageComponent>(`${this.baseUrl}/${websiteId}/pages/${pageId}/components`, data, { headers: this.getHeaders() });
  }

  updateComponent$(websiteId: string, pageId: string, componentId: string, data: UpdateComponentRequest): Observable<PageComponent> {
    return this.http.put<PageComponent>(`${this.baseUrl}/${websiteId}/pages/${pageId}/components/${componentId}`, data, { headers: this.getHeaders() });
  }

  deleteComponent$(websiteId: string, pageId: string, componentId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${websiteId}/pages/${pageId}/components/${componentId}`, { headers: this.getHeaders() });
  }

  reorderComponents$(websiteId: string, pageId: string, componentIds: string[]): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/${websiteId}/pages/${pageId}/components/reorder`,
      { componentIds }, { headers: this.getHeaders() }
    );
  }

  duplicateComponent$(websiteId: string, pageId: string, componentId: string): Observable<PageComponent> {
    return this.http.post<PageComponent>(
      `${this.baseUrl}/${websiteId}/pages/${pageId}/components/${componentId}/duplicate`, {}, { headers: this.getHeaders() }
    );
  }

  // Template methods (Observable versions for page builder)
  getTemplates$(category?: string): Observable<Template[]> {
    const url = category 
      ? `${this.baseUrl}/templates?category=${encodeURIComponent(category)}`
      : `${this.baseUrl}/templates`;
    return this.http.get<Template[]>(url, { headers: this.getHeaders() });
  }

  getTemplate$(id: string): Observable<Template> {
    return this.http.get<Template>(`${this.baseUrl}/templates/${id}`, { headers: this.getHeaders() });
  }

  getTemplateCategories$(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/templates/categories`, { headers: this.getHeaders() });
  }

  createTemplate$(data: Partial<Template>): Observable<Template> {
    return this.http.post<Template>(`${this.baseUrl}/templates`, data, { headers: this.getHeaders() });
  }

  // Utility methods (from original WebsiteService)
  generateSubdomainSuggestion(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  isValidSubdomain(subdomain: string): boolean {
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    return subdomain.length >= 3 && subdomain.length <= 63 && subdomainRegex.test(subdomain);
  }
}