import sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';
import { getDbConnection } from '../connection';

export interface Website {
  id: string;
  accountId: string;
  name: string;
  domain: string;
  subdomain: string;
  status: 'draft' | 'active' | 'inactive' | 'suspended';
  theme: string;
  settings?: any;
  description?: string; // Extracted from settings
  customDomain?: string; // Mapped from domain
  templateId?: string; // Extracted from settings
  createdAt: string;
  updatedAt: string;
  lastPublishedAt?: string;
  pageCount?: number;
}

export interface CreateWebsiteData {
  name: string;
  subdomain: string;
  theme?: string;
  description?: string;
  customDomain?: string;
  templateId?: string;
}

export interface UpdateWebsiteData {
  name?: string;
  domain?: string;
  subdomain?: string;
  status?: 'draft' | 'active' | 'inactive' | 'suspended';
  theme?: string;
  settings?: any;
}

export class WebsiteRepository {
  async findByAccountId(accountId: string): Promise<Website[]> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('accountId', sql.UniqueIdentifier, accountId)
      .query(`
        SELECT 
          w.Id,
          w.AccountId,
          w.Name,
          w.Domain,
          w.Subdomain,
          w.Status,
          w.Theme,
          w.Settings,
          w.CreatedAt,
          w.UpdatedAt,
          w.LastPublishedAt as lastPublishedAt,
          COUNT(p.Id) as pageCount
        FROM Website w
        LEFT JOIN Page p ON w.Id = p.WebsiteId
        WHERE w.AccountId = @accountId
        GROUP BY w.Id, w.AccountId, w.Name, w.Domain, w.Subdomain, w.Status, w.Theme, w.Settings, w.CreatedAt, w.UpdatedAt, w.LastPublishedAt
        ORDER BY w.CreatedAt DESC
      `);

    return result.recordset.map(row => {
      const settings = row.Settings ? JSON.parse(row.Settings) : {};
      return {
        id: row.Id,
        accountId: row.AccountId,
        name: row.Name,
        domain: row.Domain,
        subdomain: row.Subdomain,
        status: row.Status,
        theme: row.Theme,
        settings: settings,
        description: settings.description || '',
        customDomain: row.Domain || '',
        templateId: settings.templateId,
        createdAt: row.CreatedAt,
        updatedAt: row.UpdatedAt,
        lastPublishedAt: row.lastPublishedAt,
        pageCount: row.pageCount || 0
      };
    });
  }

  async findById(id: string, accountId: string): Promise<Website | null> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('accountId', sql.UniqueIdentifier, accountId)
      .query(`
        SELECT 
          w.Id,
          w.AccountId,
          w.Name,
          w.Domain,
          w.Subdomain,
          w.Status,
          w.Theme,
          w.Settings,
          w.CreatedAt,
          w.UpdatedAt,
          w.LastPublishedAt as lastPublishedAt,
          COUNT(p.Id) as pageCount
        FROM Website w
        LEFT JOIN Page p ON w.Id = p.WebsiteId
        WHERE w.Id = @id AND w.AccountId = @accountId
        GROUP BY w.Id, w.AccountId, w.Name, w.Domain, w.Subdomain, w.Status, w.Theme, w.Settings, w.CreatedAt, w.UpdatedAt, w.LastPublishedAt
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    const row = result.recordset[0];
    const settings = row.Settings ? JSON.parse(row.Settings) : {};
    return {
      id: row.Id,
      accountId: row.AccountId,
      name: row.Name,
      domain: row.Domain,
      subdomain: row.Subdomain,
      status: row.Status,
      theme: row.Theme,
      settings: settings,
      description: settings.description || '',
      customDomain: row.Domain || '',
      templateId: settings.templateId,
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt,
      lastPublishedAt: row.lastPublishedAt,
      pageCount: row.pageCount || 0
    };
  }

  async findBySubdomain(subdomain: string): Promise<Website | null> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('subdomain', sql.NVarChar, subdomain)
      .query(`
        SELECT 
          w.Id,
          w.AccountId,
          w.Name,
          w.Domain,
          w.Subdomain,
          w.Status,
          w.Theme,
          w.Settings,
          w.CreatedAt,
          w.UpdatedAt,
          w.LastPublishedAt
        FROM Website w
        WHERE w.Subdomain = @subdomain 
          AND w.Status = 'active'
          AND w.LastPublishedAt IS NOT NULL
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    const row = result.recordset[0];
    const settings = row.Settings ? JSON.parse(row.Settings) : {};
    return {
      id: row.Id,
      accountId: row.AccountId,
      name: row.Name,
      domain: row.Domain,
      subdomain: row.Subdomain,
      status: row.Status,
      theme: row.Theme,
      settings: settings,
      description: settings.description || '',
      customDomain: row.Domain || '',
      templateId: settings.templateId,
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt,
      lastPublishedAt: row.LastPublishedAt
    };
  }

  async create(accountId: string, data: CreateWebsiteData): Promise<Website> {
    const pool = await getDbConnection();
    const websiteId = uuidv4();
    
    // Prepare settings object with optional fields
    const settings: any = {};
    if (data.description) {
      settings.description = data.description;
    }
    if (data.templateId) {
      settings.templateId = data.templateId;
    }
    
    await pool.request()
      .input('id', sql.UniqueIdentifier, websiteId)
      .input('accountId', sql.UniqueIdentifier, accountId)
      .input('name', sql.NVarChar, data.name)
      .input('domain', sql.NVarChar, data.customDomain || null)
      .input('subdomain', sql.NVarChar, data.subdomain)
      .input('theme', sql.NVarChar, data.theme || 'default')
      .input('settings', sql.NVarChar, JSON.stringify(settings))
      .query(`
        INSERT INTO Website (Id, AccountId, Name, Domain, Subdomain, Status, Theme, Settings, CreatedAt, UpdatedAt)
        VALUES (@id, @accountId, @name, @domain, @subdomain, 'draft', @theme, @settings, GETUTCDATE(), GETUTCDATE())
      `);

    const created = await this.findById(websiteId, accountId);
    if (!created) {
      throw new Error('Failed to create website');
    }
    
    return created;
  }

  async update(id: string, accountId: string, data: UpdateWebsiteData): Promise<Website | null> {
    const pool = await getDbConnection();
    
    const setParts: string[] = [];
    const request = pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('accountId', sql.UniqueIdentifier, accountId);

    if (data.name !== undefined) {
      setParts.push('Name = @name');
      request.input('name', sql.NVarChar, data.name);
    }
    if (data.domain !== undefined) {
      setParts.push('Domain = @domain');
      request.input('domain', sql.NVarChar, data.domain);
    }
    if (data.subdomain !== undefined) {
      setParts.push('Subdomain = @subdomain');
      request.input('subdomain', sql.NVarChar, data.subdomain);
    }
    if (data.status !== undefined) {
      setParts.push('Status = @status');
      request.input('status', sql.NVarChar, data.status);
    }
    if (data.theme !== undefined) {
      setParts.push('Theme = @theme');
      request.input('theme', sql.NVarChar, data.theme);
    }
    if (data.settings !== undefined) {
      setParts.push('Settings = @settings');
      request.input('settings', sql.NVarChar, JSON.stringify(data.settings));
    }

    if (setParts.length === 0) {
      return this.findById(id, accountId);
    }

    setParts.push('UpdatedAt = GETUTCDATE()');

    await request.query(`
      UPDATE Website
      SET Name = @name, Domain = @domain, Subdomain = @subdomain, UpdatedAt = GETUTCDATE()
      WHERE Id = @id AND AccountId = @accountId
    `);

    return this.findById(id, accountId);
  }

  async delete(id: string, accountId: string): Promise<boolean> {
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

  async publish(id: string, accountId: string): Promise<Website | null> {
    const pool = await getDbConnection();
    
    await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('accountId', sql.UniqueIdentifier, accountId)
      .query(`
        UPDATE Website 
        SET Status = 'active',
            LastPublishedAt = GETUTCDATE(),
            UpdatedAt = GETUTCDATE()
        WHERE Id = @id AND AccountId = @accountId
      `);

    // Also update all pages to published status
    await pool.request()
      .input('websiteId', sql.UniqueIdentifier, id)
      .query(`
        UPDATE Page 
        SET Status = 'published',
            UpdatedAt = GETUTCDATE()
        WHERE WebsiteId = @websiteId
      `);

    return this.findById(id, accountId);
  }
}
