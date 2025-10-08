import sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';
import { getDbConnection } from '../database/connection';

export interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  components: any;
  styles: any;
  settings: any;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTemplateData {
  name: string;
  description?: string;
  category: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  components?: any;
  styles?: any;
  settings?: any;
  isPublic?: boolean;
}

export interface UpdateTemplateData {
  name?: string;
  description?: string;
  category?: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  components?: any;
  styles?: any;
  settings?: any;
  isPublic?: boolean;
}

export class TemplateRepository {
  async create(data: CreateTemplateData): Promise<Template> {
    const pool = await getDbConnection();
    const templateId = uuidv4();
    
    const result = await pool.request()
      .input('id', sql.VarChar, templateId)
      .input('name', sql.NVarChar, data.name)
      .input('description', sql.NVarChar, data.description)
      .input('category', sql.VarChar, data.category)
      .input('thumbnailUrl', sql.VarChar, data.thumbnailUrl)
      .input('previewUrl', sql.VarChar, data.previewUrl)
      .input('components', sql.NVarChar, JSON.stringify(data.components || {}))
      .input('styles', sql.NVarChar, JSON.stringify(data.styles || {}))
      .input('settings', sql.NVarChar, JSON.stringify(data.settings || {}))
      .input('isPublic', sql.Bit, data.isPublic || false)
      .query(`
        INSERT INTO Template (id, name, description, category, thumbnailUrl, previewUrl, components, styles, settings, isPublic, createdAt, updatedAt)
        OUTPUT INSERTED.*
        VALUES (@id, @name, @description, @category, @thumbnailUrl, @previewUrl, @components, @styles, @settings, @isPublic, GETDATE(), GETDATE())
      `);

    return this.mapDbToModel(result.recordset[0]);
  }

  async findById(id: string): Promise<Template | null> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('id', sql.VarChar, id)
      .query('SELECT * FROM Template WHERE id = @id');

    return result.recordset.length > 0 ? this.mapDbToModel(result.recordset[0]) : null;
  }

  async findAll(): Promise<Template[]> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .query('SELECT * FROM Template ORDER BY updatedAt DESC');

    return result.recordset.map(row => this.mapDbToModel(row));
  }

  async findPublic(): Promise<Template[]> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .query('SELECT * FROM Template WHERE isPublic = 1 ORDER BY updatedAt DESC');

    return result.recordset.map(row => this.mapDbToModel(row));
  }

  async findByCategory(category: string): Promise<Template[]> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('category', sql.VarChar, category)
      .query('SELECT * FROM Template WHERE category = @category AND isPublic = 1 ORDER BY updatedAt DESC');

    return result.recordset.map(row => this.mapDbToModel(row));
  }

  async update(id: string, data: UpdateTemplateData): Promise<Template | null> {
    const pool = await getDbConnection();
    
    const setParts: string[] = [];
    const request = pool.request().input('id', sql.VarChar, id);

    if (data.name !== undefined) {
      setParts.push('name = @name');
      request.input('name', sql.NVarChar, data.name);
    }

    if (data.description !== undefined) {
      setParts.push('description = @description');
      request.input('description', sql.NVarChar, data.description);
    }

    if (data.category !== undefined) {
      setParts.push('category = @category');
      request.input('category', sql.VarChar, data.category);
    }

    if (data.thumbnailUrl !== undefined) {
      setParts.push('thumbnailUrl = @thumbnailUrl');
      request.input('thumbnailUrl', sql.VarChar, data.thumbnailUrl);
    }

    if (data.previewUrl !== undefined) {
      setParts.push('previewUrl = @previewUrl');
      request.input('previewUrl', sql.VarChar, data.previewUrl);
    }

    if (data.components !== undefined) {
      setParts.push('components = @components');
      request.input('components', sql.NVarChar, JSON.stringify(data.components));
    }

    if (data.styles !== undefined) {
      setParts.push('styles = @styles');
      request.input('styles', sql.NVarChar, JSON.stringify(data.styles));
    }

    if (data.settings !== undefined) {
      setParts.push('settings = @settings');
      request.input('settings', sql.NVarChar, JSON.stringify(data.settings));
    }

    if (data.isPublic !== undefined) {
      setParts.push('isPublic = @isPublic');
      request.input('isPublic', sql.Bit, data.isPublic);
    }

    if (setParts.length === 0) {
      return this.findById(id);
    }

    setParts.push('updatedAt = GETDATE()');

    const result = await request.query(`
      UPDATE Template 
      SET ${setParts.join(', ')}
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

    return result.recordset.length > 0 ? this.mapDbToModel(result.recordset[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('id', sql.VarChar, id)
      .query('DELETE FROM Template WHERE id = @id');

    return result.rowsAffected[0] > 0;
  }

  private mapDbToModel(row: any): Template {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      thumbnailUrl: row.thumbnailUrl,
      previewUrl: row.previewUrl,
      components: row.components ? JSON.parse(row.components) : {},
      styles: row.styles ? JSON.parse(row.styles) : {},
      settings: row.settings ? JSON.parse(row.settings) : {},
      isPublic: row.isPublic,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }
}