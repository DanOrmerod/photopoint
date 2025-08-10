import express from 'express';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDbConnection } from '../database/connection';
import { authenticateToken } from '../middleware/auth';
import sql from 'mssql';

const router = express.Router();

// Test endpoint without authentication to verify logging
router.get('/test', (req: Request, res: Response) => {
  console.log('TEST ENDPOINT: Request received');
  console.log('TEST ENDPOINT: Headers:', req.headers);
  console.log('TEST ENDPOINT: Query params:', req.query);
  res.json({ message: 'Test endpoint working', timestamp: new Date() });
});

// Interfaces for TypeScript
interface Website {
  id: string;
  userId: string;
  name: string;
  domain: string;
  subdomain: string;
  status: 'draft' | 'active' | 'inactive' | 'suspended';
  theme: string;
  settings?: any;
  createdAt: string;
  updatedAt: string;
  lastPublishedAt?: string;
  pageCount?: number;
}

interface CreateWebsiteRequest {
  name: string;
  subdomain: string;
  theme?: string;
}

interface UpdateWebsiteRequest {
  name?: string;
  domain?: string;
  subdomain?: string;
  status?: 'draft' | 'active' | 'inactive' | 'suspended';
  theme?: string;
  settings?: any;
}

interface Page {
  id: string;
  websiteId: string;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  status: 'draft' | 'published';
  sortOrder: number;
  isHomePage?: boolean;
  isPublished?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreatePageRequest {
  title: string;
  slug?: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  isHomePage?: boolean;
  sortOrder?: number;
}

interface UpdatePageRequest {
  title?: string;
  slug?: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  status?: 'draft' | 'published';
  sortOrder?: number;
}

// GET /api/websites - Get all websites for authenticated user
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const pool = await getDbConnection();
    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        SELECT 
          w.Id as id,
          w.UserId as userId,
          w.Name as name,
          w.Domain as domain,
          w.Subdomain as subdomain,
          w.Status as status,
          w.Theme as theme,
          w.Settings as settings,
          w.CreatedAt as createdAt,
          w.UpdatedAt as updatedAt,
          w.LastPublishedAt as lastPublishedAt,
          COUNT(p.Id) as pageCount
        FROM Websites w
        LEFT JOIN Pages p ON w.Id = p.WebsiteId
        WHERE w.UserId = @userId
        GROUP BY w.Id, w.UserId, w.Name, w.Domain, w.Subdomain, w.Status, w.Theme, w.Settings, w.CreatedAt, w.UpdatedAt, w.LastPublishedAt
        ORDER BY w.CreatedAt DESC
      `);

    const websites: Website[] = result.recordset.map((row: any) => ({
      id: row.id,
      userId: row.userId,
      name: row.name,
      domain: row.domain,
      subdomain: row.subdomain,
      status: row.status,
      theme: row.theme,
      settings: row.settings ? JSON.parse(row.settings) : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      lastPublishedAt: row.lastPublishedAt,
      pageCount: row.pageCount || 0
    }));

    res.json({ websites });
  } catch (error) {
    console.error('Error fetching websites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/websites/:id - Get specific website
router.get('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const websiteId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const pool = await getDbConnection();
    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .query(`
        SELECT 
          w.Id as id,
          w.UserId as userId,
          w.Name as name,
          w.Domain as domain,
          w.Subdomain as subdomain,
          w.Status as status,
          w.Theme as theme,
          w.Settings as settings,
          w.CreatedAt as createdAt,
          w.UpdatedAt as updatedAt,
          w.LastPublishedAt as lastPublishedAt,
          COUNT(p.Id) as pageCount
        FROM Websites w
        LEFT JOIN Pages p ON w.Id = p.WebsiteId
        WHERE w.Id = @websiteId AND w.UserId = @userId
        GROUP BY w.Id, w.UserId, w.Name, w.Domain, w.Subdomain, w.Status, w.Theme, w.Settings, w.CreatedAt, w.UpdatedAt, w.LastPublishedAt
      `);

    if (result.recordset.length === 0) {
      res.status(404).json({ error: 'Website not found' });
      return;
    }

    const row = result.recordset[0];
    const website: Website = {
      id: row.id,
      userId: row.userId,
      name: row.name,
      domain: row.domain,
      subdomain: row.subdomain,
      status: row.status,
      theme: row.theme,
      settings: row.settings ? JSON.parse(row.settings) : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      lastPublishedAt: row.lastPublishedAt,
      pageCount: row.pageCount || 0
    };

    res.json({ website });
  } catch (error) {
    console.error('Error fetching website:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/websites - Create new website
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { name, subdomain, theme = 'default' }: CreateWebsiteRequest = req.body;

    if (!name || !subdomain) {
      res.status(400).json({ error: 'Name and subdomain are required' });
      return;
    }

    // Validate subdomain format (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(subdomain)) {
      res.status(400).json({ error: 'Subdomain must contain only lowercase letters, numbers, and hyphens' });
      return;
    }

    const websiteId = uuidv4();
    const domain = `${subdomain}.localhost:3001`; // Use port 3001 where the server is running

    const pool = await getDbConnection();
    
    // Check if subdomain is already taken
    const existingResult = await pool.request()
      .input('subdomain', sql.NVarChar(100), subdomain)
      .query('SELECT Id FROM Websites WHERE Subdomain = @subdomain');

    if (existingResult.recordset.length > 0) {
      res.status(400).json({ error: 'Subdomain is already taken' });
      return;
    }

    // Create the website
    await pool.request()
      .input('id', sql.UniqueIdentifier, websiteId)
      .input('userId', sql.UniqueIdentifier, userId)
      .input('name', sql.NVarChar(255), name)
      .input('domain', sql.NVarChar(255), domain)
      .input('subdomain', sql.NVarChar(100), subdomain)
      .input('theme', sql.NVarChar(50), theme)
      .query(`
        INSERT INTO Websites (Id, UserId, Name, Domain, Subdomain, Theme, Status)
        VALUES (@id, @userId, @name, @domain, @subdomain, @theme, 'draft')
      `);

    // Create a default home page
    const homePageId = uuidv4();
    await pool.request()
      .input('id', sql.UniqueIdentifier, homePageId)
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .input('title', sql.NVarChar(255), 'Home')
      .input('slug', sql.NVarChar(255), 'home')
      .input('content', sql.NVarChar(sql.MAX), JSON.stringify({
        blocks: [
          {
            type: 'hero',
            content: {
              title: `Welcome to ${name}`,
              subtitle: 'Your new website is ready to be customized!'
            }
          }
        ]
      }))
      .input('metaTitle', sql.NVarChar(255), name)
      .query(`
        INSERT INTO Pages (Id, WebsiteId, Title, Slug, Content, MetaTitle, Status, SortOrder)
        VALUES (@id, @websiteId, @title, @slug, @content, @metaTitle, 'draft', 1)
      `);

    // Fetch the created website
    const result = await pool.request()
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .query(`
        SELECT 
          w.Id as id,
          w.UserId as userId,
          w.Name as name,
          w.Domain as domain,
          w.Subdomain as subdomain,
          w.Status as status,
          w.Theme as theme,
          w.Settings as settings,
          w.CreatedAt as createdAt,
          w.UpdatedAt as updatedAt,
          w.LastPublishedAt as lastPublishedAt
        FROM Websites w
        WHERE w.Id = @websiteId
      `);

    const row = result.recordset[0];
    const website: Website = {
      id: row.id,
      userId: row.userId,
      name: row.name,
      domain: row.domain,
      subdomain: row.subdomain,
      status: row.status,
      theme: row.theme,
      settings: row.settings ? JSON.parse(row.settings) : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      lastPublishedAt: row.lastPublishedAt,
      pageCount: 1
    };

    res.status(201).json({ website, message: 'Website created successfully' });
  } catch (error) {
    console.error('Error creating website:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/websites/:id - Update website
router.put('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const websiteId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const updateData: UpdateWebsiteRequest = req.body;
    const allowedFields = ['name', 'domain', 'subdomain', 'status', 'theme', 'settings'];
    
    // Build dynamic update query
    const updateFields = [];
    const pool = await getDbConnection();
    const request = pool.request()
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .input('userId', sql.UniqueIdentifier, userId);

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = @${key}`);
        
        if (key === 'settings') {
          request.input(key, sql.NVarChar(sql.MAX), JSON.stringify(value));
        } else {
          request.input(key, sql.NVarChar, value);
        }
      }
    }

    if (updateFields.length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    updateFields.push('UpdatedAt = GETUTCDATE()');

    // Check if subdomain is being updated and if it's available
    if (updateData.subdomain) {
      const existingResult = await pool.request()
        .input('subdomain', sql.NVarChar(100), updateData.subdomain)
        .input('websiteId', sql.UniqueIdentifier, websiteId)
        .query('SELECT Id FROM Websites WHERE Subdomain = @subdomain AND Id != @websiteId');

      if (existingResult.recordset.length > 0) {
        res.status(400).json({ error: 'Subdomain is already taken' });
        return;
      }
    }

    const updateQuery = `
      UPDATE Websites 
      SET ${updateFields.join(', ')} 
      WHERE Id = @websiteId AND UserId = @userId
    `;

    const result = await request.query(updateQuery);

    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ error: 'Website not found' });
      return;
    }

    res.json({ message: 'Website updated successfully' });
  } catch (error) {
    console.error('Error updating website:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/websites/:id - Delete website
router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const websiteId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const pool = await getDbConnection();
    const result = await pool.request()
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        DELETE FROM Websites 
        WHERE Id = @websiteId AND UserId = @userId
      `);

    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ error: 'Website not found' });
      return;
    }

    res.json({ message: 'Website deleted successfully' });
  } catch (error) {
    console.error('Error deleting website:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/websites/:id/publish - Publish website
router.post('/:id/publish', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const websiteId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const pool = await getDbConnection();
    
    // First verify the user owns the website
    const websiteCheck = await pool.request()
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .input('userId', sql.UniqueIdentifier, userId)
      .query('SELECT Id, Status FROM Websites WHERE Id = @websiteId AND UserId = @userId');

    if (websiteCheck.recordset.length === 0) {
      res.status(404).json({ error: 'Website not found' });
      return;
    }

    // Update website status to active (published) and set lastPublishedAt
    const updateResult = await pool.request()
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        UPDATE Websites 
        SET Status = 'active', 
            LastPublishedAt = GETUTCDATE(),
            UpdatedAt = GETUTCDATE()
        WHERE Id = @websiteId AND UserId = @userId
      `);

    if (updateResult.rowsAffected[0] === 0) {
      res.status(404).json({ error: 'Website not found' });
      return;
    }

    // Optionally: Update all pages to published status as well
    await pool.request()
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .query(`
        UPDATE Pages 
        SET Status = 'published',
            UpdatedAt = GETUTCDATE(),
            PublishedAt = GETUTCDATE()
        WHERE WebsiteId = @websiteId AND Status = 'draft'
      `);

    // Fetch the updated website to return
    const result = await pool.request()
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .query(`
        SELECT 
          Id as id,
          UserId as userId,
          Name as name,
          Domain as domain,
          Subdomain as subdomain,
          Status as status,
          Theme as theme,
          Settings as settings,
          CreatedAt as createdAt,
          UpdatedAt as updatedAt,
          LastPublishedAt as lastPublishedAt
        FROM Websites
        WHERE Id = @websiteId
      `);

    const row = result.recordset[0];
    const website: Website = {
      id: row.id,
      userId: row.userId,
      name: row.name,
      domain: row.domain,
      subdomain: row.subdomain,
      status: row.status,
      theme: row.theme,
      settings: row.settings ? JSON.parse(row.settings) : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      lastPublishedAt: row.lastPublishedAt,
      pageCount: 0 // Will be populated if needed
    };

    res.json({ 
      website, 
      message: 'Website published successfully' 
    });
  } catch (error) {
    console.error('Error publishing website:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PAGE MANAGEMENT ROUTES

// GET /api/websites/:id/pages - Get all pages for a website
router.get('/:id/pages', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const websiteId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const pool = await getDbConnection();
    
    // First verify the user owns the website
    const websiteCheck = await pool.request()
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .input('userId', sql.UniqueIdentifier, userId)
      .query('SELECT Id FROM Websites WHERE Id = @websiteId AND UserId = @userId');

    if (websiteCheck.recordset.length === 0) {
      res.status(404).json({ error: 'Website not found' });
      return;
    }

    // Get all pages for the website
    const result = await pool.request()
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .query(`
        SELECT 
          Id as id,
          WebsiteId as websiteId,
          Title as title,
          Slug as slug,
          Content as content,
          MetaTitle as metaTitle,
          MetaDescription as metaDescription,
          Status as status,
          SortOrder as sortOrder,
          CreatedAt as createdAt,
          UpdatedAt as updatedAt
        FROM Pages
        WHERE WebsiteId = @websiteId
        ORDER BY SortOrder ASC, CreatedAt ASC
      `);

    const pages: Page[] = result.recordset.map((row: any) => ({
      id: row.id,
      websiteId: row.websiteId,
      title: row.title,
      slug: row.slug,
      content: row.content || '',
      metaTitle: row.metaTitle,
      metaDescription: row.metaDescription,
      status: row.status || 'draft',
      sortOrder: row.sortOrder || 0,
      isHomePage: row.slug === 'home',
      isPublished: row.status === 'published',
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));

    res.json({ pages });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/websites/:websiteId/pages/:pageId - Get specific page
router.get('/:websiteId/pages/:pageId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { websiteId, pageId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const pool = await getDbConnection();
    
    // Verify the user owns the website and get the page
    const result = await pool.request()
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .input('pageId', sql.UniqueIdentifier, pageId)
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        SELECT 
          p.Id as id,
          p.WebsiteId as websiteId,
          p.Title as title,
          p.Slug as slug,
          p.Content as content,
          p.MetaTitle as metaTitle,
          p.MetaDescription as metaDescription,
          p.Status as status,
          p.SortOrder as sortOrder,
          p.CreatedAt as createdAt,
          p.UpdatedAt as updatedAt
        FROM Pages p
        INNER JOIN Websites w ON p.WebsiteId = w.Id
        WHERE p.Id = @pageId AND p.WebsiteId = @websiteId AND w.UserId = @userId
      `);

    if (result.recordset.length === 0) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }

    const row = result.recordset[0];
    const page: Page = {
      id: row.id,
      websiteId: row.websiteId,
      title: row.title,
      slug: row.slug,
      content: row.content || '',
      metaTitle: row.metaTitle,
      metaDescription: row.metaDescription,
      status: row.status || 'draft',
      sortOrder: row.sortOrder || 0,
      isHomePage: row.slug === 'home',
      isPublished: row.status === 'published',
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };

    res.json({ page });
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/websites/:id/pages - Create new page
router.post('/:id/pages', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const websiteId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { title, slug, content = '', metaTitle, metaDescription, isHomePage = false, sortOrder }: CreatePageRequest = req.body;

    if (!title) {
      res.status(400).json({ error: 'Page title is required' });
      return;
    }

    const pool = await getDbConnection();
    
    // Verify the user owns the website
    const websiteCheck = await pool.request()
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .input('userId', sql.UniqueIdentifier, userId)
      .query('SELECT Id FROM Websites WHERE Id = @websiteId AND UserId = @userId');

    if (websiteCheck.recordset.length === 0) {
      res.status(404).json({ error: 'Website not found' });
      return;
    }

    // Generate slug if not provided
    const pageSlug = slug || title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

    // Check if slug is unique within the website
    const slugCheck = await pool.request()
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .input('slug', sql.NVarChar(255), pageSlug)
      .query('SELECT Id FROM Pages WHERE WebsiteId = @websiteId AND Slug = @slug');

    if (slugCheck.recordset.length > 0) {
      res.status(400).json({ error: 'Page with this slug already exists' });
      return;
    }

    // Get next sort order if not provided
    let pageSortOrder = sortOrder;
    if (!pageSortOrder) {
      const maxSortResult = await pool.request()
        .input('websiteId', sql.UniqueIdentifier, websiteId)
        .query('SELECT ISNULL(MAX(SortOrder), 0) + 1 as nextOrder FROM Pages WHERE WebsiteId = @websiteId');
      pageSortOrder = maxSortResult.recordset[0].nextOrder;
    }

    const pageId = uuidv4();

    // Create the page
    await pool.request()
      .input('id', sql.UniqueIdentifier, pageId)
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .input('title', sql.NVarChar(255), title)
      .input('slug', sql.NVarChar(255), pageSlug)
      .input('content', sql.NVarChar(sql.MAX), content)
      .input('metaTitle', sql.NVarChar(255), metaTitle || title)
      .input('metaDescription', sql.NVarChar(500), metaDescription || '')
      .input('sortOrder', sql.Int, pageSortOrder)
      .query(`
        INSERT INTO Pages (Id, WebsiteId, Title, Slug, Content, MetaTitle, MetaDescription, Status, SortOrder)
        VALUES (@id, @websiteId, @title, @slug, @content, @metaTitle, @metaDescription, 'draft', @sortOrder)
      `);

    // Fetch the created page
    const result = await pool.request()
      .input('pageId', sql.UniqueIdentifier, pageId)
      .query(`
        SELECT 
          Id as id,
          WebsiteId as websiteId,
          Title as title,
          Slug as slug,
          Content as content,
          MetaTitle as metaTitle,
          MetaDescription as metaDescription,
          Status as status,
          SortOrder as sortOrder,
          CreatedAt as createdAt,
          UpdatedAt as updatedAt
        FROM Pages
        WHERE Id = @pageId
      `);

    const row = result.recordset[0];
    const page: Page = {
      id: row.id,
      websiteId: row.websiteId,
      title: row.title,
      slug: row.slug,
      content: row.content || '',
      metaTitle: row.metaTitle,
      metaDescription: row.metaDescription,
      status: row.status || 'draft',
      sortOrder: row.sortOrder || 0,
      isHomePage: row.slug === 'home',
      isPublished: row.status === 'published',
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };

    res.status(201).json({ page, message: 'Page created successfully' });
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/websites/:websiteId/pages/:pageId - Update page
router.put('/:websiteId/pages/:pageId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  console.log('=== PUT /pages/:pageId STARTED ===');
  try {
    const userId = req.user?.id;
    const { websiteId, pageId } = req.params;

    console.log('PUT /pages/:pageId - Request details:');
    console.log('User ID:', userId);
    console.log('Website ID:', websiteId);
    console.log('Page ID:', pageId);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request headers:', req.headers);
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);

    if (!userId) {
      console.log('ERROR: User not authenticated - userId is:', userId);
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    console.log('✓ User authentication passed');

    console.log('✓ User authentication passed');

    const updateData: UpdatePageRequest = req.body;
    const allowedFields = ['title', 'slug', 'content', 'metaTitle', 'metaDescription', 'status', 'sortOrder'];
    
    console.log('Allowed fields:', allowedFields);
    console.log('Update data keys:', Object.keys(updateData));
    console.log('Update data values:', Object.values(updateData));
    
    // Build dynamic update query
    console.log('Creating database connection...');
    const updateFields = [];
    const pool = await getDbConnection();
    console.log('✓ Database connection established');
    
    const request = pool.request()
      .input('pageId', sql.UniqueIdentifier, pageId)
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .input('userId', sql.UniqueIdentifier, userId);

    console.log('✓ Base query parameters set:', { pageId, websiteId, userId });
    console.log('Starting field processing loop...');

    for (const [key, value] of Object.entries(updateData)) {
      console.log(`Processing field: ${key} = ${value} (type: ${typeof value})`);
      if (allowedFields.includes(key) && value !== undefined) {
        console.log(`  - Adding to update: ${key}`);
        
        // Map frontend field names to database column names
        let dbColumnName = key;
        if (key === 'metaTitle') dbColumnName = 'MetaTitle';
        if (key === 'metaDescription') dbColumnName = 'MetaDescription';
        if (key === 'sortOrder') dbColumnName = 'SortOrder';
        if (key === 'status') dbColumnName = 'Status';
        if (key === 'title') dbColumnName = 'Title';
        if (key === 'slug') dbColumnName = 'Slug';
        if (key === 'content') dbColumnName = 'Content';
        
        updateFields.push(`${dbColumnName} = @${key}`);
        
        if (key === 'content') {
          request.input(key, sql.NVarChar(sql.MAX), value);
        } else if (key === 'sortOrder') {
          request.input(key, sql.Int, value);
        } else {
          request.input(key, sql.NVarChar, value);
        }
      } else {
        console.log(`  - Skipping field: ${key} (not allowed or undefined)`);
      }
    }

    console.log('Update fields to be set:', updateFields);

    if (updateFields.length === 0) {
      console.log('ERROR: No valid fields to update');
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    updateFields.push('UpdatedAt = GETUTCDATE()');

    // Check if slug is being updated and if it's available
    if (updateData.slug) {
      console.log('SLUG CHECK: Checking if slug exists:', updateData.slug);
      console.log('SLUG CHECK: websiteId:', websiteId, 'pageId:', pageId);
      
      try {
        const slugCheckQuery = 'SELECT Id, Title, Slug FROM Pages WHERE Slug = @slug AND WebsiteId = @websiteId AND Id != @pageId';
        console.log('SLUG CHECK: Query:', slugCheckQuery);
        
        const existingResult = await pool.request()
          .input('slug', sql.NVarChar(255), updateData.slug)
          .input('websiteId', sql.UniqueIdentifier, websiteId)
          .input('pageId', sql.UniqueIdentifier, pageId)
          .query(slugCheckQuery);

        console.log('SLUG CHECK: Existing result:', existingResult.recordset);
        console.log('SLUG CHECK: Found', existingResult.recordset.length, 'conflicting pages');

        if (existingResult.recordset.length > 0) {
          console.log('SLUG CHECK: Conflicting page details:');
          existingResult.recordset.forEach((page, index) => {
            console.log(`  Page ${index + 1}: ID=${page.Id}, Title="${page.Title}", Slug="${page.Slug}"`);
          });
          console.log('SLUG CHECK: Current page being updated: ID=', pageId);
          console.log('SLUG CHECK: Slug already exists - returning 400');
          res.status(400).json({ error: 'Page with this slug already exists' });
          return;
        }
        console.log('SLUG CHECK: Slug is available');
      } catch (slugError) {
        console.error('SLUG CHECK ERROR:', slugError);
        res.status(500).json({ error: 'Error checking slug availability' });
        return;
      }
    }

    const updateQuery = `
      UPDATE Pages 
      SET ${updateFields.join(', ')} 
      FROM Pages p
      INNER JOIN Websites w ON p.WebsiteId = w.Id
      WHERE p.Id = @pageId AND p.WebsiteId = @websiteId AND w.UserId = @userId
    `;

    console.log('Final update query:', updateQuery);
    console.log('Executing update...');

    const result = await request.query(updateQuery);

    console.log('Update result:', {
      rowsAffected: result.rowsAffected,
      recordset: result.recordset
    });

    if (result.rowsAffected[0] === 0) {
      console.log('ERROR: No rows affected - page not found');
      res.status(404).json({ error: 'Page not found' });
      return;
    }

    console.log('SUCCESS: Page updated successfully');
    console.log('=== PUT /pages/:pageId COMPLETED SUCCESSFULLY ===');
    res.json({ message: 'Page updated successfully' });
  } catch (error) {
    console.log('=== PUT /pages/:pageId ERROR ===');
    console.error('Error updating page - Full error object:', error);
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown');
    console.error('Error stack:', error instanceof Error ? error.stack : 'Unknown');
    
    if (error instanceof Error && error.message.includes('FOREIGN KEY constraint')) {
      console.log('Foreign key constraint error detected');
      res.status(400).json({ error: 'Invalid website or page reference' });
    } else if (error instanceof Error && error.message.includes('invalid column name')) {
      console.log('Invalid column name error detected');
      res.status(400).json({ error: 'Database schema error' });
    } else {
      console.log('Generic server error');
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// DELETE /api/websites/:websiteId/pages/:pageId - Delete page
router.delete('/:websiteId/pages/:pageId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { websiteId, pageId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const pool = await getDbConnection();
    
    // Verify ownership and delete
    const result = await pool.request()
      .input('pageId', sql.UniqueIdentifier, pageId)
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        DELETE p
        FROM Pages p
        INNER JOIN Websites w ON p.WebsiteId = w.Id
        WHERE p.Id = @pageId AND p.WebsiteId = @websiteId AND w.UserId = @userId
      `);

    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }

    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/websites/:websiteId/pages/:pageId/preview - Preview a page
router.get('/:websiteId/pages/:pageId/preview', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { websiteId, pageId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const pool = await getDbConnection();
    
    // Get the website and page data
    const result = await pool.request()
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .input('pageId', sql.UniqueIdentifier, pageId)
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        SELECT 
          w.Name as websiteName,
          w.Title as websiteTitle,
          w.Subdomain as websiteSubdomain,
          p.Title as pageTitle,
          p.Content as pageContent,
          p.Slug as pageSlug
        FROM Pages p
        INNER JOIN Websites w ON p.WebsiteId = w.Id
        WHERE p.Id = @pageId AND p.WebsiteId = @websiteId AND w.UserId = @userId
      `);

    if (result.recordset.length === 0) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }

    const data = result.recordset[0];
    let pageContent = '';
    
    // Handle different content formats
    if (data.pageContent) {
      try {
        // Try to parse as JSON first (for block-based content)
        const contentObj = JSON.parse(data.pageContent);
        if (Array.isArray(contentObj)) {
          // Handle JSON blocks format
          pageContent = contentObj.map((block: any) => {
            switch (block.type) {
              case 'heading':
                return `<h${block.level || 1}>${block.text || ''}</h${block.level || 1}>`;
              case 'paragraph':
                return `<p>${block.text || ''}</p>`;
              case 'image':
                return `<img src="${block.src || ''}" alt="${block.alt || ''}" style="max-width: 100%; height: auto;" />`;
              default:
                return `<p>${block.text || ''}</p>`;
            }
          }).join('\n');
        } else if (contentObj.blocks) {
          // Handle nested blocks structure
          pageContent = contentObj.blocks.map((block: any) => {
            switch (block.type) {
              case 'hero':
                const title = block.content?.title || data.websiteName;
                const subtitle = block.content?.subtitle || 'Welcome to my website';
                return `
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 80px 20px; text-align: center; margin-bottom: 40px;">
                    <h1 style="font-size: 3em; margin-bottom: 20px;">${title}</h1>
                    <p style="font-size: 1.3em; opacity: 0.9;">${subtitle}</p>
                  </div>
                `;
              case 'text':
                return `<div style="margin-bottom: 30px;">${block.content?.text || ''}</div>`;
              default:
                return `<div>${block.content?.text || block.text || ''}</div>`;
            }
          }).join('\n');
        } else {
          // Handle single JSON object
          pageContent = `<div>${contentObj.content || contentObj.text || ''}</div>`;
        }
      } catch (error) {
        // Not JSON, treat as plain HTML/text
        pageContent = data.pageContent;
      }
    }

    // Create HTML preview
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.pageTitle} - ${data.websiteName || 'Website'}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        .header {
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            padding: 20px 0;
            margin-bottom: 40px;
        }
        .header h1 {
            margin: 0;
            color: #2c3e50;
        }
        .content {
            min-height: 500px;
        }
        .preview-badge {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff6b6b;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 12px;
            font-weight: bold;
            z-index: 1000;
        }
        h1, h2, h3, h4, h5, h6 {
            color: #2c3e50;
        }
        img {
            max-width: 100%;
            height: auto;
        }
    </style>
</head>
<body>
    <div class="preview-badge">PREVIEW</div>
    <div class="header">
        <div class="container">
            <h1>${data.websiteName || 'Website'}</h1>
        </div>
    </div>
    <div class="container">
        <div class="content">
            ${pageContent || '<p>No content available</p>'}
        </div>
    </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (error) {
    console.error('Error generating page preview:', error);
    res.status(500).send(`
      <html>
        <head><title>Preview Error</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1>Preview Error</h1>
          <p>An error occurred while generating the preview.</p>
        </body>
      </html>
    `);
  }
});

export default router;
