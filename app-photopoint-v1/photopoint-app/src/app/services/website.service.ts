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
      status: 'published',
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
      status: 'published',
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
          status: w.status === 'active' ? 'published' : w.status === 'draft' ? 'draft' : 'archived',
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
      console.error('API getWebsites failed:', error);
      throw new Error('Failed to fetch websites from server');
    }
  }

  async getWebsite(id: string): Promise<Website> {
    try {
      const response = await this.http.get<{ website: any }>(`${this.apiUrl}/websites/${id}`, { headers: this.getHeaders() }).toPromise();
      if (response && response.website) {
        const w = response.website;
        return {
          id: w.id,
          name: w.name,
          description: w.description || '',
          subdomain: w.subdomain,
          customDomain: w.domain,
          favicon: w.favicon,
          status: w.status === 'active' ? 'published' : w.status === 'draft' ? 'draft' : 'archived',
          theme: w.theme,
          pageCount: w.pageCount || 0,
          visits: w.visits || 0,
          ownerId: w.userId,
          createdAt: new Date(w.createdAt),
          updatedAt: new Date(w.updatedAt)
        };
      }
      throw new Error('Website not found');
    } catch (error) {
      console.error('API getWebsite failed:', error);
      throw new Error('Failed to fetch website from server');
    }
  }

  async createWebsite(websiteData: CreateWebsiteRequest): Promise<Website> {
    console.log('WebsiteService.createWebsite called with:', websiteData);
    
    try {
      const response = await this.http.post<{ website: any; message: string }>(`${this.apiUrl}/websites`, websiteData, { headers: this.getHeaders() }).toPromise();
      
      if (!response) {
        throw new Error('No response from API');
      }
      
      console.log('API createWebsite response:', response);
      
      if (!response.website) {
        throw new Error('API response missing website object');
      }
      
      const w = response.website;
      const website: Website = {
        id: w.id,
        name: w.name,
        description: w.description || '',
        subdomain: w.subdomain,
        customDomain: w.domain,
        favicon: w.favicon,
        status: w.status === 'active' ? 'published' : w.status === 'draft' ? 'draft' : 'archived',
        theme: w.theme,
        pageCount: w.pageCount || 1,
        visits: w.visits || 0,
        ownerId: w.userId,
        createdAt: new Date(w.createdAt),
        updatedAt: new Date(w.updatedAt)
      };
      
      console.log('Transformed website object:', website);
      return website;
      
    } catch (error) {
      console.error('API createWebsite failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create website: ${errorMessage}`);
    }
  }

  async updateWebsite(id: string, websiteData: UpdateWebsiteRequest): Promise<Website> {
    try {
      // First, update the website
      const updateResponse = await this.http.put<{ message: string }>(`${this.apiUrl}/websites/${id}`, websiteData, { headers: this.getHeaders() }).toPromise();
      
      if (updateResponse && updateResponse.message) {
        // If update was successful, fetch the updated website
        const updatedWebsite = await this.getWebsite(id);
        return updatedWebsite;
      }
      throw new Error('Update response missing success message');
    } catch (error) {
      console.error('API updateWebsite failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to update website: ${errorMessage}`);
    }
  }

  async deleteWebsite(id: string): Promise<void> {
    try {
      await this.http.delete(`${this.apiUrl}/websites/${id}`, { headers: this.getHeaders() }).toPromise();
    } catch (error) {
      console.error('API deleteWebsite failed:', error);
      throw new Error('Failed to delete website');
    }
  }

  isValidSubdomain(subdomain: string): boolean {
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]{0,28}[a-z0-9])?$/;
    return subdomainRegex.test(subdomain);
  }

  generateSubdomainSuggestion(name: string): string {
    // Convert name to a valid subdomain format
    let suggestion = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove invalid characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    // Ensure it's not too long
    if (suggestion.length > 30) {
      suggestion = suggestion.substring(0, 30).replace(/-$/, '');
    }
    
    // Ensure it's not empty
    if (!suggestion) {
      suggestion = 'website';
    }
    
    return suggestion;
  }

  async publishWebsite(websiteId: string): Promise<Website> {
    try {
      const response = await this.http.post<{ website: any, message: string }>(`${this.apiUrl}/websites/${websiteId}/publish`, {}, { headers: this.getHeaders() }).toPromise();
      if (response && response.website) {
        const w = response.website;
        return {
          id: w.id,
          name: w.name,
          description: w.description || '',
          subdomain: w.subdomain,
          customDomain: w.domain,
          favicon: w.favicon,
          status: w.status === 'active' ? 'published' : w.status === 'draft' ? 'draft' : 'archived',
          theme: w.theme,
          pageCount: w.pageCount || 0,
          visits: w.visits || 0,
          ownerId: w.userId,
          createdAt: new Date(w.createdAt),
          updatedAt: new Date(w.updatedAt)
        };
      }
      throw new Error('Publish response missing website data');
    } catch (error) {
      console.error('API publishWebsite failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to publish website: ${errorMessage}`);
    }
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
          isPublished: p.status === 'published',
          status: p.status || 'draft',
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
          isPublished: p.status === 'published',
          status: p.status || 'draft',
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
          isPublished: p.status === 'published',
          status: p.status || 'draft',
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
      status: 'draft',
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
          isPublished: p.status === 'published',
          status: p.status || 'draft',
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
