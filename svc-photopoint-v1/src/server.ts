// Load environment variables FIRST - before any other imports that might use them
import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import passport from 'passport';

// Import passport configuration
import './config/passport';

// Import routes
import photoRoutes from './routes/photos';
import authRoutes from './routes/auth';
import oauthRoutes from './routes/oauth';

// Import database
import { initializeDatabase } from './database/connection';

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Initialize Passport
app.use(passport.initialize());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'PhotoPoint API v1'
  });
});


// API routes
app.use('/api/v1/photos', photoRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/auth', oauthRoutes); // OAuth routes under /api/v1/auth

app.get('/api/v1', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to PhotoPoint API v1',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      photos: '/api/v1/photos',
      auth: '/api/v1/auth',
      oauth: {
        google: '/api/v1/auth/google',
        facebook: '/api/v1/auth/facebook',
        status: '/api/v1/auth/oauth/status'
      }
    }
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server and initialize database
async function startServer() {
  try {
    // Initialize database schema
    await initializeDatabase();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 PhotoPoint API server running on port ${PORT}`);
      console.log(`📍 Health check available at: http://localhost:${PORT}/health`);
      console.log(`🔗 API endpoint available at: http://localhost:${PORT}/api/v1`);
      console.log(`🗄️ Database: PhotoPointDB on SQL Server Express`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the application
startServer();

export default app;
