import sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';
import { getDbConnection } from '../connection';

export interface Website {
  id: string;
  userId: string;
  name: string;
  domain: string;
  subdomain: string;
  status: 'draft' | 'active' | 'inactive' | 'suspended';
  theme: string;
  settings?: any;
  createdAt: string;
  updatedAt: string;
  lastPublishedAt?: string;
  pageCount?: number;
}

export interface CreateWebsiteData {
  name: string;
  subdomain: string;
  theme?: string;
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
  async findByUserId(userId: string): Promise<Website[]> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        SELECT 
          w.Id,
          w.UserId,
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
        FROM Websites w
        LEFT JOIN Pages p ON w.Id = p.WebsiteId
        WHERE w.UserId = @userId
        GROUP BY w.Id, w.UserId, w.Name, w.Domain, w.Subdomain, w.Status, w.Theme, w.Settings, w.CreatedAt, w.UpdatedAt, w.LastPublishedAt
        ORDER BY w.CreatedAt DESC
      `);

    return result.recordset.map(row => ({
      id: row.Id,
      userId: row.UserId,
      name: row.Name,
      domain: row.Domain,
      subdomain: row.Subdomain,
      status: row.Status,
      theme: row.Theme,
      settings: row.Settings ? JSON.parse(row.Settings) : null,
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt,
      lastPublishedAt: row.lastPublishedAt,
      pageCount: row.pageCount || 0
    }));
  }

  async findById(id: string, userId: string): Promise<Website | null> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        SELECT 
          w.Id,
          w.UserId,
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
        FROM Websites w
        LEFT JOIN Pages p ON w.Id = p.WebsiteId
        WHERE w.Id = @id AND w.UserId = @userId
        GROUP BY w.Id, w.UserId, w.Name, w.Domain, w.Subdomain, w.Status, w.Theme, w.Settings, w.CreatedAt, w.UpdatedAt, w.LastPublishedAt
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    const row = result.recordset[0];
    return {
      id: row.Id,
      userId: row.UserId,
      name: row.Name,
      domain: row.Domain,
      subdomain: row.Subdomain,
      status: row.Status,
      theme: row.Theme,
      settings: row.Settings ? JSON.parse(row.Settings) : null,
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
          w.UserId,
          w.Name,
          w.Domain,
          w.Subdomain,
          w.Status,
          w.Theme,
          w.Settings,
          w.CreatedAt,
          w.UpdatedAt,
          w.LastPublishedAt
        FROM Websites w
        WHERE w.Subdomain = @subdomain 
          AND w.Status = 'active'
          AND w.LastPublishedAt IS NOT NULL
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    const row = result.recordset[0];
    return {
      id: row.Id,
      userId: row.UserId,
      name: row.Name,
      domain: row.Domain,
      subdomain: row.Subdomain,
      status: row.Status,
      theme: row.Theme,
      settings: row.Settings ? JSON.parse(row.Settings) : null,
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt,
      lastPublishedAt: row.LastPublishedAt
    };
  }

  async create(userId: string, data: CreateWebsiteData): Promise<Website> {
    const pool = await getDbConnection();
    const websiteId = uuidv4();
    
    await pool.request()
      .input('id', sql.UniqueIdentifier, websiteId)
      .input('userId', sql.UniqueIdentifier, userId)
      .input('name', sql.NVarChar, data.name)
      .input('subdomain', sql.NVarChar, data.subdomain)
      .input('theme', sql.NVarChar, data.theme || 'default')
      .query(`
        INSERT INTO Websites (Id, UserId, Name, Domain, Subdomain, Status, Theme, Settings, CreatedAt, UpdatedAt)
        VALUES (@id, @userId, @name, NULL, @subdomain, 'draft', @theme, '{}', GETUTCDATE(), GETUTCDATE())
      `);

    const created = await this.findById(websiteId, userId);
    if (!created) {
      throw new Error('Failed to create website');
    }
    
    return created;
  }

  async update(id: string, userId: string, data: UpdateWebsiteData): Promise<Website | null> {
    const pool = await getDbConnection();
    
    const setParts: string[] = [];
    const request = pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('userId', sql.UniqueIdentifier, userId);

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
      return this.findById(id, userId);
    }

    setParts.push('UpdatedAt = GETUTCDATE()');

    await request.query(`
      UPDATE Websites 
      SET ${setParts.join(', ')}
      WHERE Id = @id AND UserId = @userId
    `);

    return this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const pool = await getDbConnection();
    
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        DELETE FROM Websites 
        WHERE Id = @id AND UserId = @userId
      `);

    return result.rowsAffected[0] > 0;
  }

  async publish(id: string, userId: string): Promise<Website | null> {
    const pool = await getDbConnection();
    
    await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        UPDATE Websites 
        SET Status = 'active',
            LastPublishedAt = GETUTCDATE(),
            UpdatedAt = GETUTCDATE()
        WHERE Id = @id AND UserId = @userId
      `);

    // Also update all pages to published status
    await pool.request()
      .input('websiteId', sql.UniqueIdentifier, id)
      .query(`
        UPDATE Pages 
        SET Status = 'published',
            UpdatedAt = GETUTCDATE()
        WHERE WebsiteId = @websiteId
      `);

    return this.findById(id, userId);
  }
}
