import express from 'express';
import { WebsiteController } from '../controllers/WebsiteController';
import { PageController } from '../controllers/PageController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Initialize controllers
const websiteController = new WebsiteController();
const pageController = new PageController();

// Test endpoint without authentication to verify logging
router.get('/test', (req, res) => {
  console.log('TEST ENDPOINT: Request received');
  console.log('TEST ENDPOINT: Headers:', req.headers);
  console.log('TEST ENDPOINT: Query params:', req.query);
  res.json({ message: 'Test endpoint working', timestamp: new Date() });
});

// PUBLIC ROUTES (No Authentication) - MUST COME FIRST to avoid auth conflicts
router.get('/website/:website', (req, res) => websiteController.getPublishedWebsite(req, res));
router.get('/website/:website/pages/:pageSlug', (req, res) => websiteController.getPublishedPage(req, res));

// WEBSITE ROUTES (Protected)
router.get('/', authenticateToken, (req, res) => websiteController.getAllWebsites(req, res));
router.get('/:id', authenticateToken, (req, res) => websiteController.getWebsite(req, res));
router.post('/', authenticateToken, (req, res) => websiteController.createWebsite(req, res));
router.put('/:id', authenticateToken, (req, res) => websiteController.updateWebsite(req, res));
router.delete('/:id', authenticateToken, (req, res) => websiteController.deleteWebsite(req, res));

// PUBLISH ROUTES (Protected)
router.post('/:id/publish', authenticateToken, (req, res) => websiteController.publishWebsite(req, res));

// PAGE ROUTES (Protected)
router.get('/:id/pages', authenticateToken, (req, res) => pageController.getPages(req, res));
router.get('/:websiteId/pages/:pageId', authenticateToken, (req, res) => pageController.getPage(req, res));
router.post('/:id/pages', authenticateToken, (req, res) => pageController.createPage(req, res));
router.put('/:websiteId/pages/:pageId', authenticateToken, (req, res) => pageController.updatePage(req, res));
router.delete('/:websiteId/pages/:pageId', authenticateToken, (req, res) => pageController.deletePage(req, res));

// PREVIEW ROUTES (Protected)
router.get('/:websiteId/pages/:pageId/preview', authenticateToken, (req, res) => pageController.previewPage(req, res));

export default router;
