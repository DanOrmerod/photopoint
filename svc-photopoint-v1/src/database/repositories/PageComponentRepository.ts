import sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';
import { getDbConnection } from '../connection';
import { PageComponent, CreateComponentRequest, UpdateComponentRequest } from '../../models/website-builder';

export class PageComponentRepository {
  async findComponentsByPageId(pageId: string): Promise<PageComponent[]> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('pageId', sql.UniqueIdentifier, pageId)
      .query(`
        SELECT 
          Id,
          PageId,
          ComponentType,
          ComponentData,
          Styles,
          SortOrder,
          ParentId,
          CreatedAt,
          UpdatedAt
        FROM PageComponent
        WHERE PageId = @pageId
        ORDER BY SortOrder, CreatedAt
      `);

    return result.recordset.map(this.mapComponentFromDb);
  }

  async findComponentById(id: string, pageId: string): Promise<PageComponent | null> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('pageId', sql.UniqueIdentifier, pageId)
      .query(`
        SELECT 
          Id,
          PageId,
          ComponentType,
          ComponentData,
          Styles,
          SortOrder,
          ParentId,
          CreatedAt,
          UpdatedAt
        FROM PageComponent
        WHERE Id = @id AND PageId = @pageId
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    return this.mapComponentFromDb(result.recordset[0]);
  }

  async findChildComponents(parentId: string): Promise<PageComponent[]> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('parentId', sql.UniqueIdentifier, parentId)
      .query(`
        SELECT 
          Id,
          PageId,
          ComponentType,
          ComponentData,
          Styles,
          SortOrder,
          ParentId,
          CreatedAt,
          UpdatedAt
        FROM PageComponent
        WHERE ParentId = @parentId
        ORDER BY SortOrder, CreatedAt
      `);

    return result.recordset.map(this.mapComponentFromDb);
  }

  async createComponent(pageId: string, data: CreateComponentRequest): Promise<PageComponent> {
    const pool = await getDbConnection();
    const id = uuidv4();
    
    // Get next sort order for this page (or parent if specified)
    let sortOrderQuery = 'SELECT ISNULL(MAX(SortOrder), 0) + 1 as NextSortOrder FROM PageComponent WHERE PageId = @pageId';
    const request = pool.request().input('pageId', sql.UniqueIdentifier, pageId);
    
    if (data.parentId) {
      sortOrderQuery += ' AND ParentId = @parentId';
      request.input('parentId', sql.UniqueIdentifier, data.parentId);
    } else {
      sortOrderQuery += ' AND ParentId IS NULL';
    }
    
    const sortOrderResult = await request.query(sortOrderQuery);
    const sortOrder = data.sortOrder ?? sortOrderResult.recordset[0].NextSortOrder;
    
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('pageId', sql.UniqueIdentifier, pageId)
      .input('componentType', sql.VarChar(50), data.componentType)
      .input('componentData', sql.NVarChar(sql.MAX), JSON.stringify(data.componentData))
      .input('styles', sql.NVarChar(sql.MAX), JSON.stringify(data.styles || {}))
      .input('sortOrder', sql.Int, sortOrder)
      .input('parentId', sql.UniqueIdentifier, data.parentId || null)
      .query(`
        INSERT INTO PageComponent (Id, PageId, ComponentType, ComponentData, Styles, SortOrder, ParentId, CreatedAt, UpdatedAt)
        OUTPUT INSERTED.*
        VALUES (@id, @pageId, @componentType, @componentData, @styles, @sortOrder, @parentId, GETUTCDATE(), GETUTCDATE())
      `);

    return this.mapComponentFromDb(result.recordset[0]);
  }

  async updateComponent(id: string, pageId: string, data: UpdateComponentRequest): Promise<PageComponent | null> {
    const pool = await getDbConnection();
    
    // Build dynamic update query
    const setParts = [];
    const request = pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('pageId', sql.UniqueIdentifier, pageId);

    if (data.componentType !== undefined) {
      setParts.push('ComponentType = @componentType');
      request.input('componentType', sql.VarChar(50), data.componentType);
    }
    if (data.componentData !== undefined) {
      setParts.push('ComponentData = @componentData');
      request.input('componentData', sql.NVarChar(sql.MAX), JSON.stringify(data.componentData));
    }
    if (data.styles !== undefined) {
      setParts.push('Styles = @styles');
      request.input('styles', sql.NVarChar(sql.MAX), JSON.stringify(data.styles));
    }
    if (data.sortOrder !== undefined) {
      setParts.push('SortOrder = @sortOrder');
      request.input('sortOrder', sql.Int, data.sortOrder);
    }
    if (data.parentId !== undefined) {
      setParts.push('ParentId = @parentId');
      request.input('parentId', sql.UniqueIdentifier, data.parentId);
    }

    if (setParts.length === 0) {
      return this.findComponentById(id, pageId);
    }

    setParts.push('UpdatedAt = GETUTCDATE()');

    const result = await request.query(`
      UPDATE PageComponent 
      SET ${setParts.join(', ')}
      OUTPUT INSERTED.*
      WHERE Id = @id AND PageId = @pageId
    `);

    if (result.recordset.length === 0) {
      return null;
    }

    return this.mapComponentFromDb(result.recordset[0]);
  }

  async deleteComponent(id: string, pageId: string): Promise<boolean> {
    const pool = await getDbConnection();
    
    // First, delete all child components
    await pool.request()
      .input('parentId', sql.UniqueIdentifier, id)
      .query('DELETE FROM PageComponent WHERE ParentId = @parentId');
    
    // Then delete the component itself
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('pageId', sql.UniqueIdentifier, pageId)
      .query(`
        DELETE FROM PageComponent
        WHERE Id = @id AND PageId = @pageId
      `);

    return result.rowsAffected[0] > 0;
  }

  async reorderComponents(pageId: string, componentIds: string[]): Promise<void> {
    const pool = await getDbConnection();
    
    for (let i = 0; i < componentIds.length; i++) {
      await pool.request()
        .input('id', sql.UniqueIdentifier, componentIds[i])
        .input('pageId', sql.UniqueIdentifier, pageId)
        .input('sortOrder', sql.Int, i + 1)
        .query(`
          UPDATE PageComponent 
          SET SortOrder = @sortOrder, UpdatedAt = GETUTCDATE()
          WHERE Id = @id AND PageId = @pageId
        `);
    }
  }

  async duplicateComponent(id: string, pageId: string): Promise<PageComponent | null> {
    const pool = await getDbConnection();
    
    // Get the original component
    const original = await this.findComponentById(id, pageId);
    if (!original) {
      return null;
    }
    
    // Create a new component with the same data
    const newId = uuidv4();
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, newId)
      .input('pageId', sql.UniqueIdentifier, pageId)
      .input('componentType', sql.VarChar(50), original.componentType)
      .input('componentData', sql.NVarChar(sql.MAX), JSON.stringify(original.componentData))
      .input('styles', sql.NVarChar(sql.MAX), JSON.stringify(original.styles))
      .input('sortOrder', sql.Int, original.sortOrder + 1)
      .input('parentId', sql.UniqueIdentifier, original.parentId || null)
      .query(`
        INSERT INTO PageComponent (Id, PageId, ComponentType, ComponentData, Styles, SortOrder, ParentId, CreatedAt, UpdatedAt)
        OUTPUT INSERTED.*
        VALUES (@id, @pageId, @componentType, @componentData, @styles, @sortOrder, @parentId, GETUTCDATE(), GETUTCDATE())
      `);

    return this.mapComponentFromDb(result.recordset[0]);
  }

  private mapComponentFromDb(row: any): PageComponent {
    return {
      id: row.Id,
      pageId: row.PageId,
      componentType: row.ComponentType,
      componentData: row.ComponentData ? JSON.parse(row.ComponentData) : {},
      styles: row.Styles ? JSON.parse(row.Styles) : {},
      sortOrder: row.SortOrder,
      parentId: row.ParentId,
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt
    };
  }
}