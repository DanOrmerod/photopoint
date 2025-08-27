import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getDbConnection } from '../database/connection';
import sql from 'mssql';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      username?: string;
      fullName?: string;
      profilePicture?: string;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    username?: string;
    fullName?: string;
    profilePicture?: string;
  };
}

// JWT Authentication middleware
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret') as any;
    
    // Fetch user from database to ensure they still exist and are active
    const connection = await getDbConnection();
    const result = await connection.request()
      .input('userId', sql.UniqueIdentifier, decoded.id)
      .query(`
        SELECT Id, Email, Username, FullName, ProfilePicture, IsActive
        FROM Users 
        WHERE Id = @userId AND IsActive = 1
      `);

    if (result.recordset.length === 0) {
      res.status(401).json({ error: 'User not found or inactive' });
      return;
    }

    const user = result.recordset[0];
    req.user = {
      id: user.Id,
      email: user.Email,
      username: user.Username,
      fullName: user.FullName,
      profilePicture: user.ProfilePicture
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Optional authentication middleware - doesn't fail if no token
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret') as any;
    
    const connection = await getDbConnection();
    const result = await connection.request()
      .input('userId', sql.UniqueIdentifier, decoded.id) // Changed from decoded.userId to decoded.id
      .query(`
        SELECT Id, Email, Username, FullName, ProfilePicture, IsActive
        FROM Users 
        WHERE Id = @userId AND IsActive = 1
      `);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      req.user = {
        id: user.Id,
        email: user.Email,
        username: user.Username,
        fullName: user.FullName,
        profilePicture: user.ProfilePicture
      };
    }

    next();
  } catch (error) {
    // Don't fail on auth errors in optional auth
    next();
  }
};
