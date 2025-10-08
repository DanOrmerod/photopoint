import { Request, Response } from 'express';
import { WebsiteRepository } from '../repositories/WebsiteRepository';
import { WebsitePageRepository } from '../repositories/WebsitePageRepository';
import { PageComponentRepository } from '../repositories/PageComponentRepository';
import { TemplateRepository } from '../repositories/TemplateRepository';
import { ValidationUtils, ValidationError, NotFoundError } from '../utils/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { createSuccessResponse } from '../middleware/errorHandler';

export class WebsiteController {
  private websiteRepository: WebsiteRepository;
  private websitePageRepository: WebsitePageRepository;
  private pageComponentRepository: PageComponentRepository;
  private templateRepository: TemplateRepository;

  constructor() {
    this.websiteRepository = new WebsiteRepository();
    this.websitePageRepository = new WebsitePageRepository();
    this.pageComponentRepository = new PageComponentRepository();
    this.templateRepository = new TemplateRepository();
  }

  // Helper validation methods
  private validateAccountId(accountId: any): string {
    if (!accountId || typeof accountId !== 'string' || accountId.trim() === '') {
      throw new ValidationError('Account ID is required');
    }
    return accountId;
  }

  private validateId(id: any, type: string = 'ID'): string {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new ValidationError(`${type} is required`);
    }
    return id;
  }

  private validateRequestData(data: any, validator: (data: any) => any): void {
    const result = validator(data);
    if (!result.isValid) {
      throw new ValidationError('Validation failed', result.errors);
    }
  }

  // Website CRUD methods
  getAllWebsites = asyncHandler(async (req: Request, res: Response) => {
    const accountId = this.validateAccountId(req.user?.accountId);
    const websites = await this.websiteRepository.findByAccountId(accountId);
    res.json(createSuccessResponse(websites));
  });

  getWebsite = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const accountId = this.validateAccountId(req.user?.accountId);
    const websiteId = this.validateId(id, 'Website ID');

    const website = await this.websiteRepository.findById(websiteId, accountId);
    if (!website) {
      throw new NotFoundError('Website', websiteId);
    }
    res.json(createSuccessResponse(website));
  });

  createWebsite = asyncHandler(async (req: Request, res: Response) => {
    const accountId = this.validateAccountId(req.user?.accountId);
    this.validateRequestData(req.body, ValidationUtils.validateWebsite);

    const websiteData = {
      ...req.body,
      accountId: accountId
    };

    const website = await this.websiteRepository.create(websiteData);
    res.status(201).json(createSuccessResponse(website));
  });

  updateWebsite = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const accountId = this.validateAccountId(req.user?.accountId);
    const websiteId = this.validateId(id, 'Website ID');
    this.validateRequestData(req.body, ValidationUtils.validateWebsite);

    const website = await this.websiteRepository.update(websiteId, accountId, req.body);
    if (!website) {
      throw new NotFoundError('Website', websiteId);
    }
    res.json(createSuccessResponse(website));
  });

  deleteWebsite = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const accountId = this.validateAccountId(req.user?.accountId);
    const websiteId = this.validateId(id, 'Website ID');

    const success = await this.websiteRepository.delete(websiteId, accountId);
    if (!success) {
      throw new NotFoundError('Website', websiteId);
    }
    res.json(createSuccessResponse({ message: 'Website deleted successfully' }));
  });

  publishWebsite = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const accountId = this.validateAccountId(req.user?.accountId);
    const websiteId = this.validateId(id, 'Website ID');

    const website = await this.websiteRepository.publish(websiteId, accountId);
    if (!website) {
      throw new NotFoundError('Website', websiteId);
    }
    res.json(createSuccessResponse(website));
  });

  // Page CRUD methods
  getPages = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId } = req.params;
    this.validateAccountId(req.user?.accountId);
    const validWebsiteId = this.validateId(websiteId, 'Website ID');

    const pages = await this.websitePageRepository.findByWebsiteId(validWebsiteId);
    res.json(createSuccessResponse(pages));
  });

  getPage = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId, id } = req.params;
    this.validateAccountId(req.user?.accountId);
    this.validateId(websiteId, 'Website ID');
    const validPageId = this.validateId(id, 'Page ID');

    const page = await this.websitePageRepository.findById(validPageId);
    if (!page) {
      throw new NotFoundError('Page', validPageId);
    }
    res.json(createSuccessResponse(page));
  });

  createPage = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId } = req.params;
    this.validateAccountId(req.user?.accountId);
    const validWebsiteId = this.validateId(websiteId, 'Website ID');
    this.validateRequestData(req.body, ValidationUtils.validatePage);

    const pageData = {
      ...req.body,
      websiteId: validWebsiteId
    };

    const page = await this.websitePageRepository.create(pageData);
    res.status(201).json(createSuccessResponse(page));
  });

  updatePage = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId, id } = req.params;
    this.validateAccountId(req.user?.accountId);
    this.validateId(websiteId, 'Website ID');
    const validPageId = this.validateId(id, 'Page ID');
    this.validateRequestData(req.body, ValidationUtils.validatePage);

    const page = await this.websitePageRepository.update(validPageId, req.body);
    if (!page) {
      throw new NotFoundError('Page', validPageId);
    }
    res.json(createSuccessResponse(page));
  });

  deletePage = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId, id } = req.params;
    this.validateAccountId(req.user?.accountId);
    this.validateId(websiteId, 'Website ID');
    const validPageId = this.validateId(id, 'Page ID');

    const success = await this.websitePageRepository.delete(validPageId);
    if (!success) {
      throw new NotFoundError('Page', validPageId);
    }
    res.json(createSuccessResponse({ message: 'Page deleted successfully' }));
  });

  publishPage = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId, id } = req.params;
    this.validateAccountId(req.user?.accountId);
    this.validateId(websiteId, 'Website ID');
    const validPageId = this.validateId(id, 'Page ID');

    const page = await this.websitePageRepository.publish(validPageId);
    if (!page) {
      throw new NotFoundError('Page', validPageId);
    }
    res.json(createSuccessResponse(page));
  });

  // Component CRUD methods
  getPageComponents = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId, pageId } = req.params;
    this.validateAccountId(req.user?.accountId);
    this.validateId(websiteId, 'Website ID');
    const validPageId = this.validateId(pageId, 'Page ID');

    const components = await this.pageComponentRepository.findByPageId(validPageId);
    res.json(createSuccessResponse(components));
  });

  createComponent = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId, pageId } = req.params;
    this.validateAccountId(req.user?.accountId);
    this.validateId(websiteId, 'Website ID');
    const validPageId = this.validateId(pageId, 'Page ID');
    this.validateRequestData(req.body, ValidationUtils.validateComponent);

    const componentData = {
      ...req.body,
      pageId: validPageId
    };

    const component = await this.pageComponentRepository.create(componentData);
    res.status(201).json(createSuccessResponse(component));
  });

  updateComponent = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId, pageId, id } = req.params;
    this.validateAccountId(req.user?.accountId);
    this.validateId(websiteId, 'Website ID');
    this.validateId(pageId, 'Page ID');
    const validComponentId = this.validateId(id, 'Component ID');
    this.validateRequestData(req.body, ValidationUtils.validateComponent);

    const component = await this.pageComponentRepository.update(validComponentId, req.body);
    if (!component) {
      throw new NotFoundError('Component', validComponentId);
    }
    res.json(createSuccessResponse(component));
  });

  deleteComponent = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId, pageId, id } = req.params;
    this.validateAccountId(req.user?.accountId);
    this.validateId(websiteId, 'Website ID');
    this.validateId(pageId, 'Page ID');
    const validComponentId = this.validateId(id, 'Component ID');

    const success = await this.pageComponentRepository.delete(validComponentId);
    if (!success) {
      throw new NotFoundError('Component', validComponentId);
    }
    res.json(createSuccessResponse({ message: 'Component deleted successfully' }));
  });

  reorderComponents = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId, pageId } = req.params;
    const { componentIds } = req.body;
    this.validateAccountId(req.user?.accountId);
    this.validateId(websiteId, 'Website ID');
    this.validateId(pageId, 'Page ID');

    if (!Array.isArray(componentIds) || componentIds.length === 0) {
      throw new ValidationError('componentIds must be a non-empty array');
    }

    await this.pageComponentRepository.updateSortOrder(componentIds);
    res.json(createSuccessResponse({ message: 'Components reordered successfully' }));
  });

  duplicateComponent = asyncHandler(async (req: Request, res: Response) => {
    const { websiteId, pageId, id } = req.params;
    this.validateAccountId(req.user?.accountId);
    this.validateId(websiteId, 'Website ID');
    this.validateId(pageId, 'Page ID');
    const validComponentId = this.validateId(id, 'Component ID');

    // Get the original component
    const originalComponent = await this.pageComponentRepository.findById(validComponentId);
    if (!originalComponent) {
      throw new NotFoundError('Component', validComponentId);
    }

    // Create a duplicate with modified data
    const duplicateData = {
      ...originalComponent,
      id: undefined, // Remove ID so a new one is generated
      sortOrder: (originalComponent.sortOrder || 0) + 1
    };

    const component = await this.pageComponentRepository.create(duplicateData);
    res.status(201).json(createSuccessResponse(component));
  });

  // Template methods
  getAllTemplates = asyncHandler(async (req: Request, res: Response) => {
    this.validateAccountId(req.user?.accountId);
    const templates = await this.templateRepository.findAll();
    res.json(createSuccessResponse(templates));
  });

  getTemplateCategories = asyncHandler(async (req: Request, res: Response) => {
    this.validateAccountId(req.user?.accountId);
    // For now, return a static list of categories. This could be made dynamic later.
    const categories = [
      { id: 'business', name: 'Business', description: 'Professional business templates' },
      { id: 'portfolio', name: 'Portfolio', description: 'Creative portfolio templates' },
      { id: 'blog', name: 'Blog', description: 'Blog and content templates' },
      { id: 'ecommerce', name: 'E-commerce', description: 'Online store templates' },
      { id: 'personal', name: 'Personal', description: 'Personal website templates' }
    ];
    res.json(createSuccessResponse(categories));
  });

  getTemplate = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.validateAccountId(req.user?.accountId);
    const templateId = this.validateId(id, 'Template ID');

    const template = await this.templateRepository.findById(templateId);
    if (!template) {
      throw new NotFoundError('Template', templateId);
    }
    res.json(createSuccessResponse(template));
  });

  createTemplate = asyncHandler(async (req: Request, res: Response) => {
    const accountId = this.validateAccountId(req.user?.accountId);
    this.validateRequestData(req.body, ValidationUtils.validateTemplate);

    const templateData = {
      ...req.body,
      accountId: accountId
    };

    const template = await this.templateRepository.create(templateData);
    res.status(201).json(createSuccessResponse(template));
  });
}
