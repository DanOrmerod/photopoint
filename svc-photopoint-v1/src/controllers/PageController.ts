import { Request, Response } from 'express';
import { PageRepository, CreatePageData, UpdatePageData } from '../database/repositories/PageRepository';
import { WebsiteRepository } from '../database/repositories/WebsiteRepository';
import { AuthenticatedRequest } from '../middleware/auth';

export class PageController {
  private pageRepo: PageRepository;
  private websiteRepo: WebsiteRepository;

  constructor() {
    this.pageRepo = new PageRepository();
    this.websiteRepo = new WebsiteRepository();
  }

  async getPages(req: Request, res: Response): Promise<void> {
    try {
      const { id: websiteId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      console.log('Fetching pages for website:', { websiteId, userId });

      // Verify user owns the website
      const website = await this.websiteRepo.findById(websiteId, userId);
      if (!website) {
        res.status(404).json({ error: 'Website not found' });
        return;
      }

      const pages = await this.pageRepo.findByWebsiteId(websiteId);

      console.log(`Found ${pages.length} pages for website ${websiteId}`);
      res.json(pages);
    } catch (error) {
      console.error('Error fetching pages:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getPage(req: Request, res: Response): Promise<void> {
    try {
      const { websiteId, pageId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      console.log('Fetching page:', { websiteId, pageId, userId });

      // Verify user owns the website
      const website = await this.websiteRepo.findById(websiteId, userId);
      if (!website) {
        res.status(404).json({ error: 'Website not found' });
        return;
      }

      const page = await this.pageRepo.findById(pageId, websiteId);
      if (!page) {
        res.status(404).json({ error: 'Page not found' });
        return;
      }

      console.log('Found page:', page.title);
      res.json(page);
    } catch (error) {
      console.error('Error fetching page:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createPage(req: Request, res: Response): Promise<void> {
    try {
      const { id: websiteId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const pageData = req.body as CreatePageData;

      if (!pageData.title || !pageData.slug) {
        res.status(400).json({ error: 'Title and slug are required' });
        return;
      }

      console.log('Creating page:', { websiteId, pageData, userId });

      // Verify user owns the website
      const website = await this.websiteRepo.findById(websiteId, userId);
      if (!website) {
        res.status(404).json({ error: 'Website not found' });
        return;
      }

      const page = await this.pageRepo.create(websiteId, pageData);

      console.log('Created page:', page.id);
      res.status(201).json(page);
    } catch (error) {
      console.error('Error creating page:', error);
      if (error instanceof Error && error.message.includes('UNIQUE KEY constraint')) {
        res.status(409).json({ error: 'Page slug already exists for this website' });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updatePage(req: Request, res: Response): Promise<void> {
    try {
      const { websiteId, pageId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const updateData = req.body as UpdatePageData;

      console.log('Updating page:', { websiteId, pageId, updateData, userId });

      // Verify user owns the website
      const website = await this.websiteRepo.findById(websiteId, userId);
      if (!website) {
        res.status(404).json({ error: 'Website not found' });
        return;
      }

      const page = await this.pageRepo.update(pageId, websiteId, updateData);

      if (!page) {
        res.status(404).json({ error: 'Page not found' });
        return;
      }

      console.log('Updated page:', page.id);
      res.json(page);
    } catch (error) {
      console.error('Error updating page:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deletePage(req: Request, res: Response): Promise<void> {
    try {
      const { websiteId, pageId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      console.log('Deleting page:', { websiteId, pageId, userId });

      // Verify user owns the website
      const website = await this.websiteRepo.findById(websiteId, userId);
      if (!website) {
        res.status(404).json({ error: 'Website not found' });
        return;
      }

      const deleted = await this.pageRepo.delete(pageId, websiteId);

      if (!deleted) {
        res.status(404).json({ error: 'Page not found' });
        return;
      }

      console.log('Deleted page:', pageId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting page:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async previewPage(req: Request, res: Response): Promise<void> {
    try {
      const { websiteId, pageId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      console.log('Previewing page:', { websiteId, pageId, userId });

      // Verify user owns the website
      const website = await this.websiteRepo.findById(websiteId, userId);
      if (!website) {
        res.status(404).json({ error: 'Website not found' });
        return;
      }

      const page = await this.pageRepo.findById(pageId, websiteId);
      if (!page) {
        res.status(404).json({ error: 'Page not found' });
        return;
      }

      const response = {
        page,
        website: {
          id: website.id,
          name: website.name,
          theme: website.theme,
          settings: website.settings
        }
      };

      console.log('Preview for page:', page.title);
      res.json(response);
    } catch (error) {
      console.error('Error previewing page:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
