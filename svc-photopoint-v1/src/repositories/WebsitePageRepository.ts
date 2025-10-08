import sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';
import { getDbConnection } from '../database/connection';
import { WebsitePage, ComponentType, ResponsiveStyles } from './WebsitePage';

export interface CreatePageData {
  websiteId: string;
  title: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  isHomePage?: boolean;
  sortOrder?: number;
}

export interface UpdatePageData {
  title?: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  isHomePage?: boolean;
  status?: 'draft' | 'published';
  sortOrder?: number;
}

export class WebsitePageRepository {
  async create(data: CreatePageData): Promise<WebsitePage> {
    const pool = await getDbConnection();
    const pageId = uuidv4();
    
    const result = await pool.request()
      .input('id', sql.VarChar, pageId)
      .input('websiteId', sql.VarChar, data.websiteId)
      .input('title', sql.NVarChar, data.title)
      .input('slug', sql.VarChar, data.slug)
      .input('metaTitle', sql.NVarChar, data.metaTitle)
      .input('metaDescription', sql.NVarChar, data.metaDescription)
      .input('isHomePage', sql.Bit, data.isHomePage || false)
      .input('isPublished', sql.Bit, false)
      .input('sortOrder', sql.Int, data.sortOrder || 0)
      .query(`
        INSERT INTO WebsitePage (Id, WebsiteId, Title, Slug, MetaTitle, MetaDescription, IsHomePage, IsPublished, SortOrder, CreatedAt, UpdatedAt)
        OUTPUT INSERTED.*
        VALUES (@id, @websiteId, @title, @slug, @metaTitle, @metaDescription, @isHomePage, @isPublished, @sortOrder, GETDATE(), GETDATE())
      `);

    return this.mapDbToModel(result.recordset[0]);
  }

  async findById(id: string): Promise<WebsitePage | null> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('id', sql.VarChar, id)
      .query('SELECT * FROM WebsitePage WHERE Id = @id');

    return result.recordset.length > 0 ? this.mapDbToModel(result.recordset[0]) : null;
  }

  async findByWebsiteId(websiteId: string): Promise<WebsitePage[]> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('websiteId', sql.VarChar, websiteId)
      .query('SELECT * FROM WebsitePage WHERE WebsiteId = @websiteId ORDER BY SortOrder, UpdatedAt DESC');

    return result.recordset.map(row => this.mapDbToModel(row));
  }

  async findWithComponents(id: string): Promise<WebsitePage | null> {
    const pool = await getDbConnection();
    
    // Get the page
    const pageResult = await pool.request()
      .input('id', sql.VarChar, id)
      .query('SELECT * FROM WebsitePage WHERE Id = @id');

    if (pageResult.recordset.length === 0) {
      return null;
    }

    const page = this.mapDbToModel(pageResult.recordset[0]);

    // Get components for this page
    const componentsResult = await pool.request()
      .input('pageId', sql.VarChar, id)
      .query('SELECT * FROM PageComponent WHERE PageId = @pageId ORDER BY SortOrder');

    page.components = componentsResult.recordset.map(row => ({
      id: row.Id,
      pageId: row.PageId,
      componentType: row.Type as ComponentType,
      componentData: row.Content ? JSON.parse(row.Content) : {},
      styles: row.DesktopStyles ? JSON.parse(row.DesktopStyles) : {} as ResponsiveStyles,
      sortOrder: row.SortOrder,
      parentId: row.ParentId,
      createdAt: new Date(row.CreatedAt),
      updatedAt: new Date(row.UpdatedAt)
    }));

    return page;
  }

  async update(id: string, data: UpdatePageData): Promise<WebsitePage | null> {
    const pool = await getDbConnection();
    
    const setParts: string[] = [];
    const request = pool.request().input('id', sql.VarChar, id);

    if (data.title !== undefined) {
      setParts.push('Title = @title');
      request.input('title', sql.NVarChar, data.title);
    }

    if (data.slug !== undefined) {
      setParts.push('Slug = @slug');
      request.input('slug', sql.VarChar, data.slug);
    }

    if (data.metaTitle !== undefined) {
      setParts.push('MetaTitle = @metaTitle');
      request.input('metaTitle', sql.NVarChar, data.metaTitle);
    }

    if (data.metaDescription !== undefined) {
      setParts.push('MetaDescription = @metaDescription');
      request.input('metaDescription', sql.NVarChar, data.metaDescription);
    }

    if (data.isHomePage !== undefined) {
      setParts.push('IsHomePage = @isHomePage');
      request.input('isHomePage', sql.Bit, data.isHomePage);
    }

    if (data.status !== undefined) {
      setParts.push('IsPublished = @isPublished');
      request.input('isPublished', sql.Bit, data.status === 'published');
    }

    if (data.sortOrder !== undefined) {
      setParts.push('SortOrder = @sortOrder');
      request.input('sortOrder', sql.Int, data.sortOrder);
    }

    if (setParts.length === 0) {
      return this.findById(id);
    }

    setParts.push('UpdatedAt = GETDATE()');

    const result = await request.query(`
      UPDATE WebsitePage 
      SET ${setParts.join(', ')}
      OUTPUT INSERTED.*
      WHERE Id = @id
    `);

    return result.recordset.length > 0 ? this.mapDbToModel(result.recordset[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('id', sql.VarChar, id)
      .query('DELETE FROM WebsitePage WHERE Id = @id');

    return result.rowsAffected[0] > 0;
  }

  async publish(id: string): Promise<WebsitePage | null> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('id', sql.VarChar, id)
      .query(`
        UPDATE WebsitePage 
        SET IsPublished = 1, UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE Id = @id
      `);

    return result.recordset.length > 0 ? this.mapDbToModel(result.recordset[0]) : null;
  }

  async findPublishedByWebsiteId(websiteId: string): Promise<WebsitePage[]> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('websiteId', sql.VarChar, websiteId)
      .query('SELECT * FROM WebsitePage WHERE WebsiteId = @websiteId AND IsPublished = 1 ORDER BY SortOrder, UpdatedAt DESC');

    return result.recordset.map(row => this.mapDbToModel(row));
  }

  async findBySlug(websiteId: string, slug: string): Promise<WebsitePage | null> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('websiteId', sql.VarChar, websiteId)
      .input('slug', sql.VarChar, slug)
      .query('SELECT * FROM WebsitePage WHERE WebsiteId = @websiteId AND Slug = @slug');

    return result.recordset.length > 0 ? this.mapDbToModel(result.recordset[0]) : null;
  }

  private mapDbToModel(row: any): WebsitePage {
    return {
      id: row.Id,
      websiteId: row.WebsiteId,
      title: row.Title,
      slug: row.Slug,
      metaTitle: row.MetaTitle,
      metaDescription: row.MetaDescription,
      isHomePage: row.IsHomePage,
      status: row.IsPublished ? 'published' : 'draft',
      sortOrder: row.SortOrder,
      createdAt: new Date(row.CreatedAt),
      updatedAt: new Date(row.UpdatedAt)
    };
  }
}