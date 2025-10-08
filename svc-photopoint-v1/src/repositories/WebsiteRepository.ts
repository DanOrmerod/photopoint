import sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';
import { getDbConnection } from '../database/connection';
import { Website, CreateWebsiteData, UpdateWebsiteData } from './Website';

export class WebsiteRepository {
  async create(data: CreateWebsiteData): Promise<Website> {
    const pool = await getDbConnection();
    const websiteId = uuidv4();
    
    const result = await pool.request()
      .input('id', sql.VarChar, websiteId)
      .input('accountId', sql.VarChar, data.accountId)
      .input('name', sql.NVarChar, data.name)
      .input('subdomain', sql.VarChar, data.subdomain)
      .input('customDomain', sql.VarChar, data.customDomain || null)
      .input('description', sql.NVarChar, data.description || null)
      .input('status', sql.VarChar, 'draft')
      .query(`
        INSERT INTO Website (Id, AccountId, Name, Subdomain, CustomDomain, Description, Status, CreatedAt, UpdatedAt)
        OUTPUT INSERTED.*
        VALUES (@id, @accountId, @name, @subdomain, @customDomain, @description, @status, GETUTCDATE(), GETUTCDATE())
      `);

    return this.mapDbToModel(result.recordset[0]);
  }

  async findById(id: string, accountId?: string): Promise<Website | null> {
    const pool = await getDbConnection();
    
    const query = accountId 
      ? 'SELECT * FROM Website WHERE Id = @id AND AccountId = @accountId'
      : 'SELECT * FROM Website WHERE Id = @id';
    
    const request = pool.request().input('id', sql.VarChar, id);
    
    if (accountId) {
      request.input('accountId', sql.VarChar, accountId);
    }
    
    const result = await request.query(query);

    return result.recordset.length > 0 ? this.mapDbToModel(result.recordset[0]) : null;
  }

  async findByAccountId(accountId: string): Promise<Website[]> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('accountId', sql.VarChar, accountId)
      .query('SELECT * FROM Website WHERE AccountId = @accountId ORDER BY UpdatedAt DESC');

    return result.recordset.map(row => this.mapDbToModel(row));
  }

  async update(id: string, accountId: string, data: UpdateWebsiteData): Promise<Website | null> {
    const pool = await getDbConnection();
    
    const setParts: string[] = [];
    const request = pool.request()
      .input('id', sql.VarChar, id)
      .input('accountId', sql.VarChar, accountId);

    if (data.name !== undefined) {
      setParts.push('Name = @name');
      request.input('name', sql.NVarChar, data.name);
    }

    if (data.description !== undefined) {
      setParts.push('Description = @description');
      request.input('description', sql.NVarChar, data.description);
    }

    if (data.subdomain !== undefined) {
      setParts.push('Subdomain = @subdomain');
      request.input('subdomain', sql.VarChar, data.subdomain);
    }

    if (data.customDomain !== undefined) {
      setParts.push('CustomDomain = @customDomain');
      request.input('customDomain', sql.VarChar, data.customDomain);
    }

    if (data.status !== undefined) {
      setParts.push('Status = @status');
      request.input('status', sql.VarChar, data.status);
    }

    if (setParts.length === 0) {
      return this.findById(id, accountId);
    }

    setParts.push('UpdatedAt = GETUTCDATE()');

    const result = await request.query(`
      UPDATE Website 
      SET ${setParts.join(', ')}
      OUTPUT INSERTED.*
      WHERE Id = @id AND AccountId = @accountId
    `);

    return result.recordset.length > 0 ? this.mapDbToModel(result.recordset[0]) : null;
  }

  async delete(id: string, accountId: string): Promise<boolean> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('id', sql.VarChar, id)
      .input('accountId', sql.VarChar, accountId)
      .query('DELETE FROM Website WHERE Id = @id AND AccountId = @accountId');

    return result.rowsAffected[0] > 0;
  }

  async findBySubdomain(subdomain: string): Promise<Website | null> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('subdomain', sql.VarChar, subdomain)
      .query('SELECT * FROM Website WHERE Subdomain = @subdomain');

    return result.recordset.length > 0 ? this.mapDbToModel(result.recordset[0]) : null;
  }

  async publish(id: string, accountId: string): Promise<Website | null> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('id', sql.VarChar, id)
      .input('accountId', sql.VarChar, accountId)
      .query(`
        UPDATE Website 
        SET Status = 'published', LastPublishedAt = GETDATE(), UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE Id = @id AND AccountId = @accountId
      `);

    return result.recordset.length > 0 ? this.mapDbToModel(result.recordset[0]) : null;
  }

  private mapDbToModel(row: any): Website {
    return {
      id: row.Id,
      accountId: row.AccountId,
      name: row.Name,
      description: row.Description,
      subdomain: row.Subdomain,
      customDomain: row.CustomDomain,
      favicon: row.Favicon,
      status: row.Status,
      metaTitle: row.MetaTitle,
      metaDescription: row.MetaDescription,
      metaKeywords: row.MetaKeywords,
      primaryColor: row.PrimaryColor,
      secondaryColor: row.SecondaryColor,
      fontFamily: row.FontFamily,
      logoMediaFileId: row.LogoMediaFileId,
      lastPublishedAt: row.LastPublishedAt ? new Date(row.LastPublishedAt) : undefined,
      publishedVersion: row.PublishedVersion,
      createdAt: new Date(row.CreatedAt),
      updatedAt: new Date(row.UpdatedAt)
    };
  }
}