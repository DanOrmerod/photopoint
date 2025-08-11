import sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';
import { getDbConnection } from '../connection';

export interface Page {
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
  createdAt: string;
  updatedAt: string;
}

export interface CreatePageData {
  title: string;
  slug: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  status?: 'draft' | 'published';
  sortOrder?: number;
  isHomePage?: boolean;
}

export interface UpdatePageData {
  title?: string;
  slug?: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  status?: 'draft' | 'published';
  sortOrder?: number;
  isHomePage?: boolean;
}

export class PageRepository {
  async findByWebsiteId(websiteId: string): Promise<Page[]> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .query(`
        SELECT 
          Id,
          WebsiteId,
          Title,
          Slug,
          Content,
          MetaTitle,
          MetaDescription,
          Status,
          SortOrder,
          IsHomePage,
          CreatedAt,
          UpdatedAt
        FROM Pages
        WHERE WebsiteId = @websiteId
        ORDER BY SortOrder, CreatedAt
      `);

    return result.recordset.map(row => ({
      id: row.Id,
      websiteId: row.WebsiteId,
      title: row.Title,
      slug: row.Slug,
      content: row.Content || '',
      metaTitle: row.MetaTitle,
      metaDescription: row.MetaDescription,
      status: row.Status,
      sortOrder: row.SortOrder,
      isHomePage: row.IsHomePage || false,
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt
    }));
  }

  async findPublishedByWebsiteId(websiteId: string): Promise<Page[]> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .query(`
        SELECT 
          Id,
          WebsiteId,
          Title,
          Slug,
          Content,
          MetaTitle,
          MetaDescription,
          Status,
          SortOrder,
          IsHomePage,
          CreatedAt,
          UpdatedAt
        FROM Pages
        WHERE WebsiteId = @websiteId AND Status = 'published'
        ORDER BY SortOrder, CreatedAt
      `);

    return result.recordset.map(row => ({
      id: row.Id,
      websiteId: row.WebsiteId,
      title: row.Title,
      slug: row.Slug,
      content: row.Content || '',
      metaTitle: row.MetaTitle,
      metaDescription: row.MetaDescription,
      status: row.Status,
      sortOrder: row.SortOrder,
      isHomePage: row.IsHomePage || false,
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt
    }));
  }

  async findById(id: string, websiteId: string): Promise<Page | null> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .query(`
        SELECT 
          Id,
          WebsiteId,
          Title,
          Slug,
          Content,
          MetaTitle,
          MetaDescription,
          Status,
          SortOrder,
          IsHomePage,
          CreatedAt,
          UpdatedAt
        FROM Pages
        WHERE Id = @id AND WebsiteId = @websiteId
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    const row = result.recordset[0];
    return {
      id: row.Id,
      websiteId: row.WebsiteId,
      title: row.Title,
      slug: row.Slug,
      content: row.Content || '',
      metaTitle: row.MetaTitle,
      metaDescription: row.MetaDescription,
      status: row.Status,
      sortOrder: row.SortOrder,
      isHomePage: row.IsHomePage || false,
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt
    };
  }

  async findBySlug(websiteSubdomain: string, pageSlug: string): Promise<Page & { website: any } | null> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('subdomain', sql.NVarChar, websiteSubdomain)
      .input('pageSlug', sql.NVarChar, pageSlug)
      .query(`
        SELECT 
          p.Id,
          p.WebsiteId,
          p.Title,
          p.Slug,
          p.Content,
          p.MetaTitle,
          p.MetaDescription,
          p.Status,
          p.SortOrder,
          p.IsHomePage,
          p.CreatedAt,
          p.UpdatedAt,
          w.Id as WebsiteId,
          w.Name as WebsiteName,
          w.Domain,
          w.Subdomain,
          w.Theme,
          w.Settings as WebsiteSettings
        FROM Pages p
        INNER JOIN Websites w ON p.WebsiteId = w.Id
        WHERE w.Subdomain = @subdomain 
          AND p.Slug = @pageSlug
          AND w.Status = 'active'
          AND p.Status = 'published'
          AND w.LastPublishedAt IS NOT NULL
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    const row = result.recordset[0];
    return {
      id: row.Id,
      websiteId: row.WebsiteId,
      title: row.Title,
      slug: row.Slug,
      content: row.Content || '',
      metaTitle: row.MetaTitle,
      metaDescription: row.MetaDescription,
      status: row.Status,
      sortOrder: row.SortOrder,
      isHomePage: row.IsHomePage || false,
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt,
      website: {
        id: row.WebsiteId,
        name: row.WebsiteName,
        domain: row.Domain,
        subdomain: row.Subdomain,
        theme: row.Theme,
        settings: row.WebsiteSettings ? JSON.parse(row.WebsiteSettings) : {}
      }
    };
  }

  async create(websiteId: string, data: CreatePageData): Promise<Page> {
    const pool = await getDbConnection();
    const pageId = uuidv4();
    
    await pool.request()
      .input('id', sql.UniqueIdentifier, pageId)
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .input('title', sql.NVarChar, data.title)
      .input('slug', sql.NVarChar, data.slug)
      .input('content', sql.NVarChar, data.content || '')
      .input('metaTitle', sql.NVarChar, data.metaTitle || null)
      .input('metaDescription', sql.NVarChar, data.metaDescription || null)
      .input('status', sql.NVarChar, data.status || 'draft')
      .input('sortOrder', sql.Int, data.sortOrder || 0)
      .input('isHomePage', sql.Bit, data.isHomePage || false)
      .query(`
        INSERT INTO Pages (Id, WebsiteId, Title, Slug, Content, MetaTitle, MetaDescription, Status, SortOrder, IsHomePage, CreatedAt, UpdatedAt)
        VALUES (@id, @websiteId, @title, @slug, @content, @metaTitle, @metaDescription, @status, @sortOrder, @isHomePage, GETUTCDATE(), GETUTCDATE())
      `);

    const created = await this.findById(pageId, websiteId);
    if (!created) {
      throw new Error('Failed to create page');
    }
    
    return created;
  }

  async update(id: string, websiteId: string, data: UpdatePageData): Promise<Page | null> {
    const pool = await getDbConnection();
    
    const setParts: string[] = [];
    const request = pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('websiteId', sql.UniqueIdentifier, websiteId);

    if (data.title !== undefined) {
      setParts.push('Title = @title');
      request.input('title', sql.NVarChar, data.title);
    }
    if (data.slug !== undefined) {
      setParts.push('Slug = @slug');
      request.input('slug', sql.NVarChar, data.slug);
    }
    if (data.content !== undefined) {
      setParts.push('Content = @content');
      request.input('content', sql.NVarChar, data.content);
    }
    if (data.metaTitle !== undefined) {
      setParts.push('MetaTitle = @metaTitle');
      request.input('metaTitle', sql.NVarChar, data.metaTitle);
    }
    if (data.metaDescription !== undefined) {
      setParts.push('MetaDescription = @metaDescription');
      request.input('metaDescription', sql.NVarChar, data.metaDescription);
    }
    if (data.status !== undefined) {
      setParts.push('Status = @status');
      request.input('status', sql.NVarChar, data.status);
    }
    if (data.sortOrder !== undefined) {
      setParts.push('SortOrder = @sortOrder');
      request.input('sortOrder', sql.Int, data.sortOrder);
    }
    if (data.isHomePage !== undefined) {
      setParts.push('IsHomePage = @isHomePage');
      request.input('isHomePage', sql.Bit, data.isHomePage);
    }

    if (setParts.length === 0) {
      return this.findById(id, websiteId);
    }

    setParts.push('UpdatedAt = GETUTCDATE()');

    await request.query(`
      UPDATE Pages 
      SET ${setParts.join(', ')}
      WHERE Id = @id AND WebsiteId = @websiteId
    `);

    return this.findById(id, websiteId);
  }

  async delete(id: string, websiteId: string): Promise<boolean> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .query(`
        DELETE FROM Pages 
        WHERE Id = @id AND WebsiteId = @websiteId
      `);

    return result.rowsAffected[0] > 0;
  }
}
