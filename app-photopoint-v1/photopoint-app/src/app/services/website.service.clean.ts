import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { 
  Website, 
  CreateWebsiteRequest,
  UpdateWebsiteRequest,
  Page, 
  CreatePageRequest, 
  UpdatePageRequest
} from '../models/website.model';

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

  // Mock data for fallback
  private mockWebsites: Website[] = [
    {
      id: '1',
      name: 'My Portfolio',
      subdomain: 'portfolio',
      description: 'Personal portfolio website',
      status: 'published' as const,
      theme: 'modern',
      ownerId: '1',
      createdAt: new Date('2024-01-10T10:30:00Z'),
      updatedAt: new Date('2024-01-10T10:30:00Z')
    },
    {
      id: '2',
      name: 'Business Site',
      subdomain: 'business',
      description: 'Corporate business website',
      status: 'draft' as const,
      theme: 'corporate',
      ownerId: '1',
      createdAt: new Date('2024-01-11T14:20:00Z'),
      updatedAt: new Date('2024-01-11T14:20:00Z')
    }
  ];

  private mockPages: Page[] = [
    {
      id: '1',
      websiteId: '1',
      title: 'Home',
      slug: 'home',
      content: '<h1>Welcome</h1><p>This is the home page content.</p>',
      metaDescription: 'Welcome to my portfolio website',
      isHomePage: true,
      isPublished: true,
      sortOrder: 1,
      createdAt: new Date('2024-01-10T10:30:00Z'),
      updatedAt: new Date('2024-01-10T10:30:00Z')
    },
    {
      id: '2',
      websiteId: '1',
      title: 'About',
      slug: 'about',
      content: '<h1>About Me</h1><p>Learn more about my background and experience.</p>',
      metaDescription: 'Learn more about me and my work',
      isHomePage: false,
      isPublished: true,
      sortOrder: 2,
      createdAt: new Date('2024-01-10T10:35:00Z'),
      updatedAt: new Date('2024-01-10T10:35:00Z')
    }
  ];

  // WEBSITE METHODS
  async getWebsites(): Promise<Website[]> {
    try {
      const response = await this.http.get<{ websites: any[] }>(`${this.apiUrl}/websites`, { headers: this.getHeaders() }).toPromise();
      if (response && response.websites) {
        return response.websites.map((w: any) => ({
          id: w.id,
          name: w.name,
          description: w.description || '',
          subdomain: w.subdomain,
          customDomain: w.domain,
          favicon: w.favicon,
          status: w.status === 'active' ? 'published' : w.status,
          theme: w.theme,
          pageCount: w.pageCount || 0,
          visits: w.visits || 0,
          ownerId: w.userId,
          createdAt: new Date(w.createdAt),
          updatedAt: new Date(w.updatedAt)
        }));
      }
      return [];
    } catch (error) {
      console.log('API failed, using mock data:', error);
      return this.mockWebsites;
    }
  }

  async getWebsite(id: string): Promise<Website> {
    try {
      const response = await this.http.get<any>(`${this.apiUrl}/websites/${id}`, { headers: this.getHeaders() }).toPromise();
      if (response) {
        const w = response.website || response;
        return {
          id: w.id,
          name: w.name,
          description: w.description || '',
          subdomain: w.subdomain,
          customDomain: w.domain,
          favicon: w.favicon,
          status: w.status === 'active' ? 'published' : w.status,
          theme: w.theme,
          pageCount: w.pageCount || 0,
          visits: w.visits || 0,
          ownerId: w.userId,
          createdAt: new Date(w.createdAt),
          updatedAt: new Date(w.updatedAt)
        };
      }
    } catch (error) {
      // Fallback to mock data
    }
    
    const mockWebsite = this.mockWebsites.find(w => w.id === id);
    if (mockWebsite) return mockWebsite;
    throw new Error('Website not found');
  }

  async createWebsite(websiteData: CreateWebsiteRequest): Promise<Website> {
    try {
      const result = await this.http.post<Website>(`${this.apiUrl}/websites`, websiteData, { headers: this.getHeaders() }).toPromise();
      if (result) return result;
    } catch (error) {
      // Fallback to mock data creation
    }
    
    const newWebsite: Website = {
      id: (Math.max(...this.mockWebsites.map(w => parseInt(w.id))) + 1).toString(),
      ...websiteData,
      status: 'draft' as const,
      ownerId: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockWebsites.push(newWebsite);
    return newWebsite;
  }

  async updateWebsite(id: string, websiteData: UpdateWebsiteRequest): Promise<Website> {
    try {
      const result = await this.http.put<Website>(`${this.apiUrl}/websites/${id}`, websiteData, { headers: this.getHeaders() }).toPromise();
      if (result) return result;
    } catch (error) {
      // Fallback to mock data update
    }
    
    const websiteIndex = this.mockWebsites.findIndex(w => w.id === id);
    if (websiteIndex !== -1) {
      this.mockWebsites[websiteIndex] = {
        ...this.mockWebsites[websiteIndex],
        ...websiteData,
        updatedAt: new Date()
      };
      return this.mockWebsites[websiteIndex];
    }
    throw new Error('Website not found');
  }

  async deleteWebsite(id: string): Promise<void> {
    try {
      await this.http.delete(`${this.apiUrl}/websites/${id}`, { headers: this.getHeaders() }).toPromise();
    } catch (error) {
      const websiteIndex = this.mockWebsites.findIndex(w => w.id === id);
      if (websiteIndex !== -1) {
        this.mockWebsites.splice(websiteIndex, 1);
      }
    }
  }

  isValidSubdomain(subdomain: string): boolean {
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]{0,28}[a-z0-9])?$/;
    return subdomainRegex.test(subdomain);
  }

  async publishWebsite(websiteId: string): Promise<Website> {
    try {
      const result = await this.http.post<Website>(`${this.apiUrl}/websites/${websiteId}/publish`, {}, { headers: this.getHeaders() }).toPromise();
      if (result) return result;
    } catch (error) {
      // Mock publish fallback
    }
    
    const website = this.mockWebsites.find(w => w.id === websiteId);
    if (website) {
      website.status = 'published';
      website.updatedAt = new Date();
      return website;
    }
    throw new Error('Website not found');
  }

  // PAGE METHODS
  async getPages(websiteId: string): Promise<Page[]> {
    try {
      const response = await this.http.get<{ pages: any[] }>(`${this.apiUrl}/websites/${websiteId}/pages`, { headers: this.getHeaders() }).toPromise();
      if (response && response.pages) {
        return response.pages.map((p: any) => ({
          id: p.id,
          websiteId: p.websiteId,
          title: p.title,
          slug: p.slug,
          content: p.content,
          metaDescription: p.metaDescription,
          isHomePage: p.isHomePage || false,
          isPublished: p.isPublished || false,
          sortOrder: p.sortOrder || 0,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        }));
      }
      return [];
    } catch (error) {
      console.log('API failed, using mock pages:', error);
      return this.mockPages.filter(p => p.websiteId === websiteId);
    }
  }

  async getPage(websiteId: string, pageId: string): Promise<Page> {
    try {
      const response = await this.http.get<any>(`${this.apiUrl}/websites/${websiteId}/pages/${pageId}`, { headers: this.getHeaders() }).toPromise();
      if (response) {
        const p = response.page || response;
        return {
          id: p.id,
          websiteId: p.websiteId,
          title: p.title,
          slug: p.slug,
          content: p.content,
          metaDescription: p.metaDescription,
          isHomePage: p.isHomePage || false,
          isPublished: p.isPublished || false,
          sortOrder: p.sortOrder || 0,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        };
      }
    } catch (error) {
      // Fallback to mock data
    }
    
    const mockPage = this.mockPages.find(p => p.websiteId === websiteId && p.id === pageId);
    if (mockPage) return mockPage;
    throw new Error('Page not found');
  }

  async createPage(websiteId: string, pageData: CreatePageRequest): Promise<Page> {
    try {
      const response = await this.http.post<any>(`${this.apiUrl}/websites/${websiteId}/pages`, pageData, { headers: this.getHeaders() }).toPromise();
      if (response) {
        const p = response.page || response;
        return {
          id: p.id,
          websiteId: p.websiteId,
          title: p.title,
          slug: p.slug,
          content: p.content,
          metaDescription: p.metaDescription,
          isHomePage: p.isHomePage || false,
          isPublished: p.isPublished || false,
          sortOrder: p.sortOrder || 0,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        };
      }
    } catch (error) {
      // Fallback to mock data creation
    }
    
    const newPage: Page = {
      id: (Math.max(...this.mockPages.map(p => parseInt(p.id))) + 1).toString(),
      websiteId: websiteId,
      title: pageData.title,
      slug: pageData.slug || pageData.title.toLowerCase().replace(/\s+/g, '-'),
      content: pageData.content || '',
      metaDescription: pageData.metaDescription || '',
      isHomePage: pageData.isHomePage || false,
      isPublished: false,
      sortOrder: pageData.sortOrder || this.mockPages.length + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockPages.push(newPage);
    return newPage;
  }

  async updatePage(websiteId: string, pageId: string, pageData: UpdatePageRequest): Promise<Page> {
    try {
      const response = await this.http.put<any>(`${this.apiUrl}/websites/${websiteId}/pages/${pageId}`, pageData, { headers: this.getHeaders() }).toPromise();
      if (response) {
        const p = response.page || response;
        return {
          id: p.id,
          websiteId: p.websiteId,
          title: p.title,
          slug: p.slug,
          content: p.content,
          metaDescription: p.metaDescription,
          isHomePage: p.isHomePage || false,
          isPublished: p.isPublished || false,
          sortOrder: p.sortOrder || 0,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        };
      }
    } catch (error) {
      // Fallback to mock data update
    }
    
    const pageIndex = this.mockPages.findIndex(p => p.websiteId === websiteId && p.id === pageId);
    if (pageIndex !== -1) {
      this.mockPages[pageIndex] = {
        ...this.mockPages[pageIndex],
        ...pageData,
        updatedAt: new Date()
      };
      return this.mockPages[pageIndex];
    }
    throw new Error('Page not found');
  }

  async deletePage(websiteId: string, pageId: string): Promise<void> {
    try {
      await this.http.delete(`${this.apiUrl}/websites/${websiteId}/pages/${pageId}`, { headers: this.getHeaders() }).toPromise();
    } catch (error) {
      const pageIndex = this.mockPages.findIndex(p => p.websiteId === websiteId && p.id === pageId);
      if (pageIndex !== -1) {
        this.mockPages.splice(pageIndex, 1);
      }
    }
  }
}
