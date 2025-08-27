import { Request, Response } from 'express';
import { WebsiteRepository, CreateWebsiteData, UpdateWebsiteData } from '../database/repositories/WebsiteRepository';
import { PageRepository } from '../database/repositories/PageRepository';

export class WebsiteController {
  private websiteRepo: WebsiteRepository;
  private pageRepo: PageRepository;

  constructor() {
    this.websiteRepo = new WebsiteRepository();
    this.pageRepo = new PageRepository();
  }

  async getAllWebsites(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      
      const websites = await this.websiteRepo.findByUserId(userId);
      res.json(websites);
    } catch (error) {
      console.error('Error fetching websites:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getWebsite(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const website = await this.websiteRepo.findById(id, userId);
      
      if (!website) {
        res.status(404).json({ error: 'Website not found' });
        return;
      }

      res.json(website);
    } catch (error) {
      console.error('Error fetching website:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createWebsite(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { name, subdomain, theme, description, customDomain, templateId } = req.body as CreateWebsiteData;

      if (!name || !subdomain) {
        res.status(400).json({ error: 'Name and subdomain are required' });
        return;
      }

      const website = await this.websiteRepo.create(userId, { 
        name, 
        subdomain, 
        theme, 
        description, 
        customDomain, 
        templateId 
      });

      res.status(201).json(website);
    } catch (error) {
      console.error('Error creating website:', error);
      if (error instanceof Error && error.message.includes('UNIQUE KEY constraint')) {
        res.status(409).json({ error: 'Subdomain already exists' });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateWebsite(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const updateData = req.body as UpdateWebsiteData;

      console.log('Updating website:', { id, updateData, userId });

      const website = await this.websiteRepo.update(id, userId, updateData);

      if (!website) {
        res.status(404).json({ error: 'Website not found' });
        return;
      }

      console.log('Updated website:', website.id);
      res.json(website);
    } catch (error) {
      console.error('Error updating website:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteWebsite(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      console.log('Deleting website:', { id, userId });

      const deleted = await this.websiteRepo.delete(id, userId);

      if (!deleted) {
        res.status(404).json({ error: 'Website not found' });
        return;
      }

      console.log('Deleted website:', id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting website:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async publishWebsite(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      console.log('Publishing website:', { id, userId });

      const website = await this.websiteRepo.publish(id, userId);

      if (!website) {
        res.status(404).json({ error: 'Website not found' });
        return;
      }

      console.log('Published website:', website.id, 'at', website.lastPublishedAt);
      res.json({ 
        message: 'Website published successfully',
        website,
        publishedAt: website.lastPublishedAt
      });
    } catch (error) {
      console.error('Error publishing website:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

    // PUBLIC ENDPOINTS (NO AUTH)
  async getPublishedWebsite(req: Request, res: Response): Promise<void> {
    try {
      const { website } = req.params; // Changed from siteSlug to website
      
      console.log('PUBLIC: Fetching published website for domain:', website);
      
      const websiteData = await this.websiteRepo.findBySubdomain(website);
      
      if (!websiteData) {
        res.status(404).json({ error: 'Published website not found' });
        return;
      }

      // Get published pages for this website
      const pages = await this.pageRepo.findPublishedByWebsiteId(websiteData.id);

      const response = {
        id: websiteData.id,
        name: websiteData.name,
        domain: websiteData.domain,
        subdomain: websiteData.subdomain,
        theme: websiteData.theme,
        settings: websiteData.settings || {},
        lastPublishedAt: websiteData.lastPublishedAt,
        pages: pages.map(page => ({
          id: page.id,
          title: page.title,
          slug: page.slug,
          html: page.content, // Return rendered HTML for viewer
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
          isHomePage: page.isHomePage,
          sortOrder: page.sortOrder
        }))
      };

      console.log('PUBLIC: Found website with', response.pages.length, 'published pages');
      res.json(response);
    } catch (error) {
      console.error('PUBLIC: Error fetching published website:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getPublishedPage(req: Request, res: Response): Promise<void> {
    try {
      const { website, pageSlug } = req.params; // Changed from siteSlug to website
      
      console.log('PUBLIC: Fetching published page:', { website, pageSlug });
      
      const page = await this.pageRepo.findBySlug(website, pageSlug);

      if (!page) {
        res.status(404).json({ error: 'Published page not found' });
        return;
      }

      console.log('PUBLIC: Found published page:', page.title);
      
      // Return page with rendered HTML for viewer
      const response = {
        id: page.id,
        title: page.title,
        slug: page.slug,
        html: page.content, // Return rendered HTML for viewer
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        isHomePage: page.isHomePage,
        website: page.website
      };
      
      res.json(response);
    } catch (error) {
      console.error('PUBLIC: Error fetching published page:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
