import sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';
import { getDbConnection } from '../connection';
import { Template, CreateTemplateRequest } from '../../models/website-builder';

export class TemplateRepository {
  async findAllTemplates(): Promise<Template[]> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .query(`
        SELECT 
          Id,
          Name,
          Description,
          Category,
          ThumbnailUrl,
          PreviewUrl,
          Components,
          Styles,
          Settings,
          IsPublic,
          CreatedAt,
          UpdatedAt
        FROM Template
        WHERE IsPublic = 1
        ORDER BY Category, Name
      `);

    return result.recordset.map(this.mapTemplateFromDb);
  }

  async findTemplatesByCategory(category: string): Promise<Template[]> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('category', sql.VarChar(100), category)
      .query(`
        SELECT 
          Id,
          Name,
          Description,
          Category,
          ThumbnailUrl,
          PreviewUrl,
          Components,
          Styles,
          Settings,
          IsPublic,
          CreatedAt,
          UpdatedAt
        FROM Template
        WHERE Category = @category AND IsPublic = 1
        ORDER BY Name
      `);

    return result.recordset.map(this.mapTemplateFromDb);
  }

  async findTemplateById(id: string): Promise<Template | null> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .query(`
        SELECT 
          Id,
          Name,
          Description,
          Category,
          ThumbnailUrl,
          PreviewUrl,
          Components,
          Styles,
          Settings,
          IsPublic,
          CreatedAt,
          UpdatedAt
        FROM Template
        WHERE Id = @id
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    return this.mapTemplateFromDb(result.recordset[0]);
  }

  async createTemplate(data: CreateTemplateRequest): Promise<Template> {
    const pool = await getDbConnection();
    const id = uuidv4();
    
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('name', sql.NVarChar(200), data.name)
      .input('description', sql.NVarChar(1000), data.description || null)
      .input('category', sql.VarChar(100), data.category)
      .input('components', sql.NVarChar(sql.MAX), JSON.stringify(data.components))
      .input('styles', sql.NVarChar(sql.MAX), JSON.stringify(data.styles || {}))
      .input('settings', sql.NVarChar(sql.MAX), JSON.stringify(data.settings || {}))
      .input('isPublic', sql.Bit, data.isPublic || false)
      .query(`
        INSERT INTO Template (Id, Name, Description, Category, Components, Styles, Settings, IsPublic, CreatedAt, UpdatedAt)
        OUTPUT INSERTED.*
        VALUES (@id, @name, @description, @category, @components, @styles, @settings, @isPublic, GETUTCDATE(), GETUTCDATE())
      `);

    return this.mapTemplateFromDb(result.recordset[0]);
  }

  async updateTemplate(id: string, data: Partial<CreateTemplateRequest>): Promise<Template | null> {
    const pool = await getDbConnection();
    
    // Build dynamic update query
    const setParts = [];
    const request = pool.request().input('id', sql.UniqueIdentifier, id);

    if (data.name !== undefined) {
      setParts.push('Name = @name');
      request.input('name', sql.NVarChar(200), data.name);
    }
    if (data.description !== undefined) {
      setParts.push('Description = @description');
      request.input('description', sql.NVarChar(1000), data.description);
    }
    if (data.category !== undefined) {
      setParts.push('Category = @category');
      request.input('category', sql.VarChar(100), data.category);
    }
    if (data.components !== undefined) {
      setParts.push('Components = @components');
      request.input('components', sql.NVarChar(sql.MAX), JSON.stringify(data.components));
    }
    if (data.styles !== undefined) {
      setParts.push('Styles = @styles');
      request.input('styles', sql.NVarChar(sql.MAX), JSON.stringify(data.styles));
    }
    if (data.settings !== undefined) {
      setParts.push('Settings = @settings');
      request.input('settings', sql.NVarChar(sql.MAX), JSON.stringify(data.settings));
    }
    if (data.isPublic !== undefined) {
      setParts.push('IsPublic = @isPublic');
      request.input('isPublic', sql.Bit, data.isPublic);
    }

    if (setParts.length === 0) {
      return this.findTemplateById(id);
    }

    setParts.push('UpdatedAt = GETUTCDATE()');

    const result = await request.query(`
      UPDATE Template 
      SET ${setParts.join(', ')}
      OUTPUT INSERTED.*
      WHERE Id = @id
    `);

    if (result.recordset.length === 0) {
      return null;
    }

    return this.mapTemplateFromDb(result.recordset[0]);
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .query(`
        DELETE FROM Template
        WHERE Id = @id
      `);

    return result.rowsAffected[0] > 0;
  }

  async getTemplateCategories(): Promise<string[]> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .query(`
        SELECT DISTINCT Category
        FROM Template
        WHERE IsPublic = 1
        ORDER BY Category
      `);

    return result.recordset.map(row => row.Category);
  }

  private mapTemplateFromDb(row: any): Template {
    return {
      id: row.Id,
      name: row.Name,
      description: row.Description,
      category: row.Category,
      thumbnailUrl: row.ThumbnailUrl,
      previewUrl: row.PreviewUrl,
      components: row.Components ? JSON.parse(row.Components) : {},
      styles: row.Styles ? JSON.parse(row.Styles) : {},
      settings: row.Settings ? JSON.parse(row.Settings) : {},
      isPublic: row.IsPublic,
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt
    };
  }
}