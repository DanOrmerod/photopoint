import express from 'express';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';

const router = express.Router();

// Mock websites data
const mockWebsites = [
  {
    id: '1',
    userId: 'user-1',
    name: 'My Portfolio Site',
    domain: 'johnsmith.mysite.com',
    subdomain: 'johnsmith',
    status: 'active',
    theme: 'portfolio',
    settings: { theme: 'dark' },
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-08-05T00:00:00Z',
    lastPublishedAt: '2025-08-05T00:00:00Z',
    pageCount: 12
  },
  {
    id: '2',
    userId: 'user-1',
    name: 'Photography Blog',
    domain: 'photos.example.com',
    subdomain: 'photos',
    status: 'draft',
    theme: 'blog',
    settings: { theme: 'light' },
    createdAt: '2025-07-20T00:00:00Z',
    updatedAt: '2025-08-08T00:00:00Z',
    lastPublishedAt: null,
    pageCount: 3
  }
];

// GET /api/mock/websites - Get all mock websites
router.get('/websites', (req: Request, res: Response) => {
  logger.debug('📋 Serving mock websites data');
  res.json({ websites: mockWebsites });
});

// GET /api/mock/websites/:id - Get specific mock website
router.get('/websites/:id', (req: Request, res: Response): void => {
  const websiteId = req.params.id;
  const website = mockWebsites.find(w => w.id === websiteId);
  
  if (!website) {
    res.status(404).json({ error: 'Website not found' });
    return;
  }
  
  logger.debug(`📋 Serving mock website: ${website.name}`);
  res.json({ website });
});

// POST /api/mock/websites - Create new mock website
router.post('/websites', (req: Request, res: Response): void => {
  const { name, subdomain, theme = 'default' } = req.body;
  
  if (!name || !subdomain) {
    res.status(400).json({ error: 'Name and subdomain are required' });
    return;
  }
  
  const newWebsite = {
    id: (mockWebsites.length + 1).toString(),
    userId: 'user-1',
    name,
    domain: `${subdomain}.photopoint.com`,
    subdomain,
    status: 'draft' as const,
    theme,
    settings: { theme: 'light' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastPublishedAt: null,
    pageCount: 1
  };
  
  mockWebsites.push(newWebsite);
  
  logger.info(`✅ Created mock website: ${name}`);
  res.status(201).json({ website: newWebsite, message: 'Website created successfully' });
});

// PUT /api/mock/websites/:id - Update mock website
router.put('/websites/:id', (req: Request, res: Response): void => {
  const websiteId = req.params.id;
  const websiteIndex = mockWebsites.findIndex(w => w.id === websiteId);
  
  if (websiteIndex === -1) {
    res.status(404).json({ error: 'Website not found' });
    return;
  }
  
  // Update website
  mockWebsites[websiteIndex] = {
    ...mockWebsites[websiteIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  logger.info(`✅ Updated mock website: ${mockWebsites[websiteIndex].name}`);
  res.json({ message: 'Website updated successfully' });
});

// DELETE /api/mock/websites/:id - Delete mock website
router.delete('/websites/:id', (req: Request, res: Response): void => {
  const websiteId = req.params.id;
  const websiteIndex = mockWebsites.findIndex(w => w.id === websiteId);
  
  if (websiteIndex === -1) {
    res.status(404).json({ error: 'Website not found' });
    return;
  }
  
  const deletedWebsite = mockWebsites.splice(websiteIndex, 1)[0];
  
  logger.info(`🗑️ Deleted mock website: ${deletedWebsite.name}`);
  res.json({ message: 'Website deleted successfully' });
});

export default router;
