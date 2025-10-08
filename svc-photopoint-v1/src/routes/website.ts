import { Router } from 'express';
import { WebsiteController } from '../controllers/WebsiteController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const controller = new WebsiteController();

// Apply authentication to all routes
router.use(authenticateToken);

// Website routes
router.get('/', controller.getAllWebsites.bind(controller));
router.get('/:id', controller.getWebsite.bind(controller));
router.post('/', controller.createWebsite.bind(controller));
router.put('/:id', controller.updateWebsite.bind(controller));
router.delete('/:id', controller.deleteWebsite.bind(controller));
router.post('/:id/publish', controller.publishWebsite.bind(controller));

// Page routes
router.get('/:websiteId/pages', controller.getPages.bind(controller));
router.get('/:websiteId/pages/:id', controller.getPage.bind(controller));
router.post('/:websiteId/pages', controller.createPage.bind(controller));
router.put('/:websiteId/pages/:id', controller.updatePage.bind(controller));
router.delete('/:websiteId/pages/:id', controller.deletePage.bind(controller));
router.post('/:websiteId/pages/:id/publish', controller.publishPage.bind(controller));

// Component routes
router.get('/:websiteId/pages/:pageId/components', controller.getPageComponents.bind(controller));
router.post('/:websiteId/pages/:pageId/components', controller.createComponent.bind(controller));
router.put('/:websiteId/pages/:pageId/components/:id', controller.updateComponent.bind(controller));
router.delete('/:websiteId/pages/:pageId/components/:id', controller.deleteComponent.bind(controller));
router.post('/:websiteId/pages/:pageId/components/reorder', controller.reorderComponents.bind(controller));
router.post('/:websiteId/pages/:pageId/components/:id/duplicate', controller.duplicateComponent.bind(controller));

// Template routes (public endpoints)
router.get('/templates', controller.getAllTemplates.bind(controller));
router.get('/templates/categories', controller.getTemplateCategories.bind(controller));
router.get('/templates/:id', controller.getTemplate.bind(controller));
router.post('/templates', controller.createTemplate.bind(controller));

export default router;