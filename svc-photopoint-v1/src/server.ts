import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import path from 'path';
import morgan from 'morgan';
import helmet from 'helmet';
import { initializeDatabase } from './database/connection';
// Import routes
import authRoutes from './routes/auth';
import oauthRoutes from './routes/oauth';
import photoRoutes from './routes/photos';
import websiteRoutes from './routes/websites';
import mockRoutes from './routes/mock';
// import sitesRoutes from './routes/sites';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Logging middleware
app.use(morgan('combined'));

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    // Allow subdomain requests: *.localhost:4300
    if (/^http:\/\/[a-zA-Z0-9-]+\.localhost:4300$/.test(origin)) {
      return callback(null, true);
    }
    
    // Allow production subdomains: *.photopoint.studio
    if (/^https:\/\/[a-zA-Z0-9-]+\.photopoint\.studio$/.test(origin)) {
      return callback(null, true);
    }
    
    // Allow other local dev origins if needed
    if (['http://localhost:4200', 'http://localhost:3000', 'http://localhost:4300'].includes(origin)) {
      return callback(null, true);
    }
    
    return callback(null, true); // Allow all for now during development
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Subdomain handler for serving websites (must come before API routes)
// app.use(sitesRoutes);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/auth', oauthRoutes);
app.use('/api/v1/photos', photoRoutes);
app.use('/api/v1/websites', websiteRoutes);
app.use('/api/v1/mock', mockRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'PhotoPoint API'
  });
});

// Root endpoint - API documentation
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'PhotoPoint API',
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
    // Test database connection without initialization
    console.log('Testing database connection...');
    const testConnection = new (await import('mssql')).ConnectionPool({
      server: process.env.DB_SERVER!,
      database: process.env.DB_DATABASE!,
      user: process.env.DB_USERNAME!,
      password: process.env.DB_PASSWORD!,
      options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
        enableArithAbort: true
      }
    });
    
    await testConnection.connect();
    const result = await testConnection.request().query('SELECT 1 as test');
    await testConnection.close();
    console.log('✅ Database connection test successful');
    
    // Now initialize database properly
    await initializeDatabase();
    console.log('✅ Database initialized successfully');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 PhotoPoint API server running on port ${PORT}`);
      console.log(`📍 Health check available at: http://localhost:${PORT}/health`);
      console.log(`🔗 API endpoint available at: http://localhost:${PORT}/api/v1`);
      console.log(`🌐 Website serving enabled for *.localhost:${PORT} subdomains`);
      console.log(`🗄️ Database: Connected to SQL Server`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.log('⚠️ Falling back to mock data endpoints only');
    
    // Start server without database
    app.listen(PORT, () => {
      console.log(`🚀 PhotoPoint API server running on port ${PORT} (Mock Mode)`);
      console.log(`📍 Health check available at: http://localhost:${PORT}/health`);
      console.log(`🔗 Mock API endpoints available at: http://localhost:${PORT}/api/v1/mock`);
      console.log(`⚠️ Database unavailable - using mock data only`);
    });
  }
}

// Start the application
startServer();

export default app;
