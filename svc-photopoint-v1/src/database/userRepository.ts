import { sql, getDbConnection } from './connection';
import { logger } from '../utils/logger';

export interface User {
  id: string;
  email: string;
  passwordHash: string | null;
  username?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  googleId?: string;
  facebookId?: string;
  appleId?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  username?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  accountId?: string;
}

export interface CreateOAuthUserData {
  email: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
  provider: 'google' | 'facebook' | 'apple';
  providerId: string;
}

export class UserRepository {
  static async createUser(userData: CreateUserData): Promise<User> {
    const connection = await getDbConnection();
    
    const result = await connection.request()
      .input('email', sql.NVarChar(255), userData.email)
      .input('passwordHash', sql.NVarChar(255), userData.passwordHash)
      .input('username', sql.NVarChar(100), userData.username || null)
      .input('fullName', sql.NVarChar(200), userData.fullName || null)
      .input('firstName', sql.NVarChar(100), userData.firstName || null)
      .input('lastName', sql.NVarChar(100), userData.lastName || null)
      .query(`
        INSERT INTO [User] (Email, PasswordHash, Username, FullName, FirstName, LastName)
        OUTPUT INSERTED.Id, INSERTED.Email, INSERTED.PasswordHash, INSERTED.Username,
               INSERTED.FullName, INSERTED.FirstName, INSERTED.LastName, INSERTED.ProfilePicture,
               INSERTED.GoogleId, INSERTED.FacebookId, INSERTED.AppleId, INSERTED.IsActive,
               INSERTED.IsEmailVerified, INSERTED.LastLoginAt, INSERTED.CreatedAt, INSERTED.UpdatedAt
        VALUES (@email, @passwordHash, @username, @fullName, @firstName, @lastName)
      `);
    
    return result.recordset[0] as User;
  }

  static async createOAuthUser(userData: CreateOAuthUserData): Promise<User> {
    logger.debug('UserRepository.createOAuthUser - Input data:', {
      email: userData.email,
      username: userData.username,
      provider: userData.provider,
      providerId: userData.providerId
    });

    const connection = await getDbConnection();
    
    const providerColumn = userData.provider === 'google' ? 'GoogleId' : 
                          userData.provider === 'facebook' ? 'FacebookId' : 'AppleId';
    
    logger.debug('UserRepository.createOAuthUser - Provider column:', providerColumn);

    const result = await connection.request()
      .input('email', sql.NVarChar(255), userData.email)
      .input('username', sql.NVarChar(100), userData.username)
      .input('fullName', sql.NVarChar(200), userData.fullName || null)
      .input('profilePicture', sql.NVarChar(500), userData.profilePicture || null)
      .input('providerId', sql.NVarChar(100), userData.providerId)
      .query(`
        INSERT INTO [User] (Email, Username, FullName, ProfilePicture, ${providerColumn}, IsEmailVerified)
        OUTPUT INSERTED.Id, INSERTED.Email, INSERTED.PasswordHash, INSERTED.Username,
               INSERTED.FullName, INSERTED.FirstName, INSERTED.LastName, INSERTED.ProfilePicture,
               INSERTED.GoogleId, INSERTED.FacebookId, INSERTED.AppleId, INSERTED.IsActive,
               INSERTED.IsEmailVerified, INSERTED.LastLoginAt, INSERTED.CreatedAt, INSERTED.UpdatedAt
        VALUES (@email, @username, @fullName, @profilePicture, @providerId, 1)
      `);
    
    logger.debug('UserRepository.createOAuthUser - User created:', result.recordset[0]?.Id);
    return result.recordset[0] as User;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const connection = await getDbConnection();
    
    const result = await connection.request()
      .input('email', sql.NVarChar(255), email)
      .query(`
        SELECT Id, Email, PasswordHash, Username, FullName, FirstName, LastName, 
               ProfilePicture, GoogleId, FacebookId, AppleId, IsActive, IsEmailVerified,
               LastLoginAt, CreatedAt, UpdatedAt
        FROM [User]
        WHERE Email = @email
      `);
    
    return result.recordset[0] || null;
  }

  static async findByUsername(username: string): Promise<User | null> {
    const connection = await getDbConnection();
    
    const result = await connection.request()
      .input('username', sql.NVarChar(100), username)
      .query(`
        SELECT Id, Email, PasswordHash, Username, FullName, FirstName, LastName, 
               ProfilePicture, GoogleId, FacebookId, AppleId, IsActive, IsEmailVerified,
               LastLoginAt, CreatedAt, UpdatedAt
        FROM [User]
        WHERE Username = @username
      `);
    
    return result.recordset[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const connection = await getDbConnection();
    
    const result = await connection.request()
      .input('id', sql.UniqueIdentifier, id)
      .query(`
        SELECT Id, Email, PasswordHash, Username, FullName, FirstName, LastName,
               ProfilePicture, GoogleId, FacebookId, AppleId, IsActive, IsEmailVerified,
               LastLoginAt, CreatedAt, UpdatedAt
        FROM [User]
        WHERE Id = @id
      `);
    
    return result.recordset[0] || null;
  }

  static async updateUser(id: string, updates: Partial<CreateUserData>): Promise<User | null> {
    const connection = await getDbConnection();
    const request = connection.request().input('id', sql.UniqueIdentifier, id);

    const setParts: string[] = [];
    
    if (updates.email) {
      request.input('email', sql.NVarChar(255), updates.email);
      setParts.push('Email = @email');
    }
    
    if (updates.passwordHash) {
      request.input('passwordHash', sql.NVarChar(255), updates.passwordHash);
      setParts.push('PasswordHash = @passwordHash');
    }

    if (setParts.length === 0) {
      throw new Error('No fields to update');
    }

    setParts.push('UpdatedAt = GETUTCDATE()');

    const result = await request.query(`
      UPDATE [User]
      SET ${setParts.join(', ')}
      OUTPUT INSERTED.Id, INSERTED.Email, INSERTED.PasswordHash,
             INSERTED.CreatedAt, INSERTED.UpdatedAt
      WHERE Id = @id
    `);

    return result.recordset[0] || null;
  }

  static async deleteUser(id: string): Promise<boolean> {
    const connection = await getDbConnection();
    
    const result = await connection.request()
      .input('id', sql.UniqueIdentifier, id)
      .query(`DELETE FROM [User] WHERE Id = @id`);

    return result.rowsAffected[0] > 0;
  }

  static async getAllUsers(): Promise<User[]> {
    const connection = await getDbConnection();
    
    const result = await connection.query(`
      SELECT Id, Email, PasswordHash, Username, FullName, FirstName, LastName,
             ProfilePicture, GoogleId, FacebookId, AppleId, IsActive, IsEmailVerified,
             LastLoginAt, CreatedAt, UpdatedAt
      FROM [User]
      ORDER BY CreatedAt DESC
    `);

    return result.recordset as User[];
  }

  // OAuth-specific methods
  static async updateOAuthId(id: string, provider: 'google' | 'facebook' | 'apple', providerId: string): Promise<User | null> {
    logger.debug('UserRepository.updateOAuthId - Input:', { id, provider, providerId });
    
    const connection = await getDbConnection();
    const providerColumn = provider === 'google' ? 'GoogleId' : 
                          provider === 'facebook' ? 'FacebookId' : 'AppleId';
    
    logger.debug('UserRepository.updateOAuthId - Provider column:', providerColumn);

    const result = await connection.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('providerId', sql.NVarChar(100), providerId)
      .query(`
        UPDATE [User]
        SET ${providerColumn} = @providerId, UpdatedAt = GETUTCDATE()
        OUTPUT INSERTED.Id, INSERTED.Email, INSERTED.PasswordHash, INSERTED.Username,
               INSERTED.FullName, INSERTED.FirstName, INSERTED.LastName, INSERTED.ProfilePicture,
               INSERTED.GoogleId, INSERTED.FacebookId, INSERTED.AppleId, INSERTED.IsActive,
               INSERTED.IsEmailVerified, INSERTED.LastLoginAt, INSERTED.CreatedAt, INSERTED.UpdatedAt
        WHERE Id = @id
      `);

    logger.debug('UserRepository.updateOAuthId - Updated user:', result.recordset[0]?.Id || 'None');
    return result.recordset[0] || null;
  }

  static async findByOAuthId(provider: 'google' | 'facebook' | 'apple', providerId: string): Promise<User | null> {
    logger.debug('UserRepository.findByOAuthId - Searching for:', { provider, providerId });
    
    const connection = await getDbConnection();
    const providerColumn = provider === 'google' ? 'GoogleId' : 
                          provider === 'facebook' ? 'FacebookId' : 'AppleId';
    
    logger.debug('UserRepository.findByOAuthId - Provider column:', providerColumn);

    const result = await connection.request()
      .input('providerId', sql.NVarChar(100), providerId)
      .query(`
        SELECT Id, Email, PasswordHash, Username, FullName, FirstName, LastName,
               ProfilePicture, GoogleId, FacebookId, AppleId, IsActive, IsEmailVerified,
               LastLoginAt, CreatedAt, UpdatedAt
        FROM [User]
        WHERE ${providerColumn} = @providerId
      `);
    
    logger.debug('UserRepository.findByOAuthId - Found user:', result.recordset[0]?.Id || 'None');
    return result.recordset[0] || null;
  }
}
