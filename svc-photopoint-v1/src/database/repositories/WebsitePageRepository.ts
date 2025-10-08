import sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';
import { getDbConnection } from '../connection';
import { WebsitePage, CreatePageRequest, UpdatePageRequest } from '../../models/website-builder';

export class WebsitePageRepository {
  async findPagesByWebsiteId(websiteId: string): Promise<WebsitePage[]> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .query(`
        SELECT 
          Id,
          WebsiteId,
          Title,
          Slug,
          MetaTitle,
          MetaDescription,
          IsHomePage,
          Status,
          SortOrder,
          CreatedAt,
          UpdatedAt,
          LastPublishedAt
        FROM WebsitePage
        WHERE WebsiteId = @websiteId
        ORDER BY SortOrder, CreatedAt
      `);

    return result.recordset.map(this.mapPageFromDb);
  }

  async findPublishedPagesByWebsiteId(websiteId: string): Promise<WebsitePage[]> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .query(`
        SELECT 
          Id,
          WebsiteId,
          Title,
          Slug,
          MetaTitle,
          MetaDescription,
          IsHomePage,
          Status,
          SortOrder,
          CreatedAt,
          UpdatedAt,
          LastPublishedAt
        FROM WebsitePage
        WHERE WebsiteId = @websiteId AND Status = 'published'
        ORDER BY SortOrder, CreatedAt
      `);

    return result.recordset.map(this.mapPageFromDb);
  }

  async findPageById(id: string, websiteId: string): Promise<WebsitePage | null> {
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
          MetaTitle,
          MetaDescription,
          IsHomePage,
          Status,
          SortOrder,
          CreatedAt,
          UpdatedAt,
          LastPublishedAt
        FROM WebsitePage
        WHERE Id = @id AND WebsiteId = @websiteId
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    return this.mapPageFromDb(result.recordset[0]);
  }

  async findPageBySlug(websiteId: string, slug: string): Promise<WebsitePage | null> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .input('slug', sql.VarChar(255), slug)
      .query(`
        SELECT 
          Id,
          WebsiteId,
          Title,
          Slug,
          MetaTitle,
          MetaDescription,
          IsHomePage,
          Status,
          SortOrder,
          CreatedAt,
          UpdatedAt,
          LastPublishedAt
        FROM WebsitePage
        WHERE WebsiteId = @websiteId AND Slug = @slug AND Status = 'published'
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    return this.mapPageFromDb(result.recordset[0]);
  }

  async createPage(websiteId: string, data: CreatePageRequest): Promise<WebsitePage> {
    const pool = await getDbConnection();
    const id = uuidv4();
    
    // Get next sort order
    const sortOrderResult = await pool.request()
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .query('SELECT ISNULL(MAX(SortOrder), 0) + 1 as NextSortOrder FROM WebsitePage WHERE WebsiteId = @websiteId');
    
    const sortOrder = sortOrderResult.recordset[0].NextSortOrder;
    
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .input('title', sql.NVarChar(200), data.title)
      .input('slug', sql.VarChar(255), data.slug)
      .input('metaTitle', sql.NVarChar(200), data.metaTitle || null)
      .input('metaDescription', sql.NVarChar(500), data.metaDescription || null)
      .input('isHomePage', sql.Bit, data.isHomePage || false)
      .input('sortOrder', sql.Int, sortOrder)
      .query(`
        INSERT INTO WebsitePage (Id, WebsiteId, Title, Slug, MetaTitle, MetaDescription, IsHomePage, Status, SortOrder, CreatedAt, UpdatedAt)
        OUTPUT INSERTED.*
        VALUES (@id, @websiteId, @title, @slug, @metaTitle, @metaDescription, @isHomePage, 'draft', @sortOrder, GETUTCDATE(), GETUTCDATE())
      `);

    return this.mapPageFromDb(result.recordset[0]);
  }

  async updatePage(id: string, websiteId: string, data: UpdatePageRequest): Promise<WebsitePage | null> {
    const pool = await getDbConnection();
    
    // Build dynamic update query
    const setParts = [];
    const request = pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('websiteId', sql.UniqueIdentifier, websiteId);

    if (data.title !== undefined) {
      setParts.push('Title = @title');
      request.input('title', sql.NVarChar(200), data.title);
    }
    if (data.slug !== undefined) {
      setParts.push('Slug = @slug');
      request.input('slug', sql.VarChar(255), data.slug);
    }
    if (data.metaTitle !== undefined) {
      setParts.push('MetaTitle = @metaTitle');
      request.input('metaTitle', sql.NVarChar(200), data.metaTitle);
    }
    if (data.metaDescription !== undefined) {
      setParts.push('MetaDescription = @metaDescription');
      request.input('metaDescription', sql.NVarChar(500), data.metaDescription);
    }
    if (data.isHomePage !== undefined) {
      setParts.push('IsHomePage = @isHomePage');
      request.input('isHomePage', sql.Bit, data.isHomePage);
    }
    if (data.sortOrder !== undefined) {
      setParts.push('SortOrder = @sortOrder');
      request.input('sortOrder', sql.Int, data.sortOrder);
    }
    if (data.status !== undefined) {
      setParts.push('Status = @status');
      request.input('status', sql.VarChar(20), data.status);
      
      if (data.status === 'published') {
        setParts.push('LastPublishedAt = GETUTCDATE()');
      }
    }

    if (setParts.length === 0) {
      return this.findPageById(id, websiteId);
    }

    setParts.push('UpdatedAt = GETUTCDATE()');

    const result = await request.query(`
      UPDATE WebsitePage 
      SET ${setParts.join(', ')}
      OUTPUT INSERTED.*
      WHERE Id = @id AND WebsiteId = @websiteId
    `);

    if (result.recordset.length === 0) {
      return null;
    }

    return this.mapPageFromDb(result.recordset[0]);
  }

  async deletePage(id: string, websiteId: string): Promise<boolean> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .query(`
        DELETE FROM WebsitePage
        WHERE Id = @id AND WebsiteId = @websiteId
      `);

    return result.rowsAffected[0] > 0;
  }

  async publishPage(id: string, websiteId: string): Promise<WebsitePage | null> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('websiteId', sql.UniqueIdentifier, websiteId)
      .query(`
        UPDATE WebsitePage 
        SET Status = 'published',
            LastPublishedAt = GETUTCDATE(),
            UpdatedAt = GETUTCDATE()
        OUTPUT INSERTED.*
        WHERE Id = @id AND WebsiteId = @websiteId
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    return this.mapPageFromDb(result.recordset[0]);
  }

  private mapPageFromDb(row: any): WebsitePage {
    return {
      id: row.Id,
      websiteId: row.WebsiteId,
      title: row.Title,
      slug: row.Slug,
      metaTitle: row.MetaTitle,
      metaDescription: row.MetaDescription,
      isHomePage: row.IsHomePage,
      status: row.Status,
      sortOrder: row.SortOrder,
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt,
      lastPublishedAt: row.LastPublishedAt
    };
  }
}