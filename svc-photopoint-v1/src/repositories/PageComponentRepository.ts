import sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';
import { getDbConnection } from '../database/connection';
import { PageComponent, ComponentType, ResponsiveStyles } from './WebsitePage';

export interface CreateComponentData {
  pageId: string;
  componentType: ComponentType;
  componentData?: any;
  styles?: ResponsiveStyles;
  sortOrder?: number;
  parentId?: string;
}

export interface UpdateComponentData {
  componentType?: ComponentType;
  componentData?: any;
  styles?: ResponsiveStyles;
  sortOrder?: number;
  parentId?: string;
}

export class PageComponentRepository {
  async create(data: CreateComponentData): Promise<PageComponent> {
    const pool = await getDbConnection();
    const componentId = uuidv4();
    
    const result = await pool.request()
      .input('id', sql.VarChar, componentId)
      .input('pageId', sql.VarChar, data.pageId)
      .input('componentType', sql.VarChar, data.componentType)
      .input('componentData', sql.NVarChar, JSON.stringify(data.componentData || {}))
      .input('styles', sql.NVarChar, JSON.stringify(data.styles || {}))
      .input('sortOrder', sql.Int, data.sortOrder || 0)
      .input('parentId', sql.VarChar, data.parentId)
      .query(`
        INSERT INTO PageComponent (id, pageId, componentType, componentData, styles, sortOrder, parentId, createdAt, updatedAt)
        OUTPUT INSERTED.*
        VALUES (@id, @pageId, @componentType, @componentData, @styles, @sortOrder, @parentId, GETDATE(), GETDATE())
      `);

    return this.mapDbToModel(result.recordset[0]);
  }

  async findById(id: string): Promise<PageComponent | null> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('id', sql.VarChar, id)
      .query('SELECT * FROM PageComponent WHERE id = @id');

    return result.recordset.length > 0 ? this.mapDbToModel(result.recordset[0]) : null;
  }

  async findByPageId(pageId: string): Promise<PageComponent[]> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('pageId', sql.VarChar, pageId)
      .query('SELECT * FROM PageComponent WHERE pageId = @pageId ORDER BY sortOrder');

    return result.recordset.map(row => this.mapDbToModel(row));
  }

  async update(id: string, data: UpdateComponentData): Promise<PageComponent | null> {
    const pool = await getDbConnection();
    
    const setParts: string[] = [];
    const request = pool.request().input('id', sql.VarChar, id);

    if (data.componentType !== undefined) {
      setParts.push('componentType = @componentType');
      request.input('componentType', sql.VarChar, data.componentType);
    }

    if (data.componentData !== undefined) {
      setParts.push('componentData = @componentData');
      request.input('componentData', sql.NVarChar, JSON.stringify(data.componentData));
    }

    if (data.styles !== undefined) {
      setParts.push('styles = @styles');
      request.input('styles', sql.NVarChar, JSON.stringify(data.styles));
    }

    if (data.sortOrder !== undefined) {
      setParts.push('sortOrder = @sortOrder');
      request.input('sortOrder', sql.Int, data.sortOrder);
    }

    if (data.parentId !== undefined) {
      setParts.push('parentId = @parentId');
      request.input('parentId', sql.VarChar, data.parentId);
    }

    if (setParts.length === 0) {
      return this.findById(id);
    }

    setParts.push('updatedAt = GETDATE()');

    const result = await request.query(`
      UPDATE PageComponent 
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
      .query('DELETE FROM PageComponent WHERE id = @id');

    return result.rowsAffected[0] > 0;
  }

  async updateSortOrder(componentIds: string[], startOrder: number = 0): Promise<void> {
    const pool = await getDbConnection();
    
    for (let i = 0; i < componentIds.length; i++) {
      await pool.request()
        .input('id', sql.VarChar, componentIds[i])
        .input('sortOrder', sql.Int, startOrder + i)
        .query('UPDATE PageComponent SET sortOrder = @sortOrder, updatedAt = GETDATE() WHERE id = @id');
    }
  }

  async deleteByPageId(pageId: string): Promise<boolean> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('pageId', sql.VarChar, pageId)
      .query('DELETE FROM PageComponent WHERE pageId = @pageId');

    return result.rowsAffected[0] > 0;
  }

  private mapDbToModel(row: any): PageComponent {
    return {
      id: row.id,
      pageId: row.pageId,
      componentType: row.componentType as ComponentType,
      componentData: row.componentData ? JSON.parse(row.componentData) : {},
      styles: row.styles ? JSON.parse(row.styles) : {} as ResponsiveStyles,
      sortOrder: row.sortOrder,
      parentId: row.parentId,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }
}