import sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';
import { getDbConnection } from '../connection';
import { Website, CreateWebsiteRequest, UpdateWebsiteRequest } from '../../models/website-builder';

export class WebsiteBuilderRepository {
  async findWebsitesByAccountId(accountId: string): Promise<Website[]> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('accountId', sql.UniqueIdentifier, accountId)
      .query(`
        SELECT 
          Id,
          AccountId,
          Name,
          Subdomain,
          Domain,
          Theme,
          Status,
          Settings,
          CreatedAt,
          UpdatedAt,
          LastPublishedAt
        FROM Website
        WHERE AccountId = @accountId
        ORDER BY UpdatedAt DESC
      `);

    return result.recordset.map(this.mapWebsiteFromDb);
  }

  async findWebsiteById(id: string, accountId: string): Promise<Website | null> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('accountId', sql.UniqueIdentifier, accountId)
      .query(`
        SELECT 
          Id,
          AccountId,
          Name,
          Subdomain,
          Domain,
          Theme,
          Status,
          Settings,
          CreatedAt,
          UpdatedAt,
          LastPublishedAt
        FROM Website
        WHERE Id = @id AND AccountId = @accountId
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    return this.mapWebsiteFromDb(result.recordset[0]);
  }

  async findWebsiteBySubdomain(subdomain: string): Promise<Website | null> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('subdomain', sql.VarChar(100), subdomain)
      .query(`
        SELECT 
          Id,
          AccountId,
          Name,
          Subdomain,
          Domain,
          Theme,
          Status,
          Settings,
          CreatedAt,
          UpdatedAt,
          LastPublishedAt
        FROM Website
        WHERE Subdomain = @subdomain AND Status = 'published'
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    return this.mapWebsiteFromDb(result.recordset[0]);
  }

  async createWebsite(accountId: string, data: CreateWebsiteRequest): Promise<Website> {
    const pool = await getDbConnection();
    const id = uuidv4();
    
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('accountId', sql.UniqueIdentifier, accountId)
      .input('name', sql.NVarChar(200), data.name)
      .input('subdomain', sql.VarChar(100), data.subdomain)
      .input('theme', sql.VarChar(100), data.theme || 'default')
      .input('settings', sql.NVarChar(sql.MAX), JSON.stringify({}))
      .query(`
        INSERT INTO Website (Id, AccountId, Name, Subdomain, Theme, Status, Settings, CreatedAt, UpdatedAt)
        OUTPUT INSERTED.*
        VALUES (@id, @accountId, @name, @subdomain, @theme, 'draft', @settings, GETUTCDATE(), GETUTCDATE())
      `);

    return this.mapWebsiteFromDb(result.recordset[0]);
  }

  async updateWebsite(id: string, accountId: string, data: UpdateWebsiteRequest): Promise<Website | null> {
    const pool = await getDbConnection();
    
    // Build dynamic update query
    const setParts = [];
    const request = pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('accountId', sql.UniqueIdentifier, accountId);

    if (data.name !== undefined) {
      setParts.push('Name = @name');
      request.input('name', sql.NVarChar(200), data.name);
    }
    if (data.subdomain !== undefined) {
      setParts.push('Subdomain = @subdomain');
      request.input('subdomain', sql.VarChar(100), data.subdomain);
    }
    if (data.domain !== undefined) {
      setParts.push('Domain = @domain');
      request.input('domain', sql.VarChar(255), data.domain);
    }
    if (data.theme !== undefined) {
      setParts.push('Theme = @theme');
      request.input('theme', sql.VarChar(100), data.theme);
    }
    if (data.settings !== undefined) {
      setParts.push('Settings = @settings');
      request.input('settings', sql.NVarChar(sql.MAX), JSON.stringify(data.settings));
    }

    if (setParts.length === 0) {
      return this.findWebsiteById(id, accountId);
    }

    setParts.push('UpdatedAt = GETUTCDATE()');

    const result = await request.query(`
      UPDATE Website 
      SET ${setParts.join(', ')}
      OUTPUT INSERTED.*
      WHERE Id = @id AND AccountId = @accountId
    `);

    if (result.recordset.length === 0) {
      return null;
    }

    return this.mapWebsiteFromDb(result.recordset[0]);
  }

  async deleteWebsite(id: string, accountId: string): Promise<boolean> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('accountId', sql.UniqueIdentifier, accountId)
      .query(`
        DELETE FROM Website
        WHERE Id = @id AND AccountId = @accountId
      `);

    return result.rowsAffected[0] > 0;
  }

  async publishWebsite(id: string, accountId: string): Promise<Website | null> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('accountId', sql.UniqueIdentifier, accountId)
      .query(`
        UPDATE Website 
        SET Status = 'published', 
            LastPublishedAt = GETUTCDATE(),
            UpdatedAt = GETUTCDATE()
        OUTPUT INSERTED.*
        WHERE Id = @id AND AccountId = @accountId
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    // Also publish all pages in this website
    await pool.request()
      .input('websiteId', sql.UniqueIdentifier, id)
      .query(`
        UPDATE WebsitePage 
        SET Status = 'published',
            LastPublishedAt = GETUTCDATE(),
            UpdatedAt = GETUTCDATE()
        WHERE WebsiteId = @websiteId AND Status = 'draft'
      `);

    return this.mapWebsiteFromDb(result.recordset[0]);
  }

  private mapWebsiteFromDb(row: any): Website {
    return {
      id: row.Id,
      accountId: row.AccountId,
      name: row.Name,
      subdomain: row.Subdomain,
      domain: row.Domain,
      theme: row.Theme,
      status: row.Status,
      settings: row.Settings ? JSON.parse(row.Settings) : {},
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt,
      lastPublishedAt: row.LastPublishedAt
    };
  }
}