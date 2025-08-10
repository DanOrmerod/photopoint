import sql from 'mssql';

// Debug environment variables
console.log('Environment check:');
console.log('DB_SERVER:', process.env.DB_SERVER);
console.log('DB_DATABASE:', process.env.DB_DATABASE);
console.log('DB_USERNAME:', process.env.DB_USERNAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');

// Validate required environment variables
if (!process.env.DB_USERNAME || !process.env.DB_PASSWORD) {
  throw new Error('Database credentials not found. Please check DB_USERNAME and DB_PASSWORD in .env file');
}

// SQL Server configuration
const config: sql.config = {
  server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS',
  database: process.env.DB_DATABASE || 'PhotoPoint-v1',
  user: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

console.log('Database config:', {
  server: config.server,
  database: config.database,
  user: config.user,
  password: config.password ? '***' : 'NOT SET'
});

// Database connection pool
let pool: sql.ConnectionPool | null = null;

export async function getDbConnection(): Promise<sql.ConnectionPool> {
  if (!pool || !pool.connected) {
    try {
      if (pool) {
        await pool.close();
      }
      
      console.log('Creating new database connection...');
      pool = new sql.ConnectionPool(config);
      
      pool.on('error', err => {
        console.error('Database pool error:', err);
        pool = null;
      });
      
      await pool.connect();
      console.log('✅ Connected to SQL Server Express');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      pool = null;
      throw error;
    }
  }
  return pool;
}

// Export connection pool for compatibility
export const connectionPool = getDbConnection();

export async function closeDbConnection(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('🔒 SQL Server connection closed');
  }
}

// Initialize database schema
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('Initializing database...');
    
    // Create a fresh connection for initialization
    const initPool = new sql.ConnectionPool(config);
    await initPool.connect();
    
    // Test the connection first
    const testResult = await initPool.request().query('SELECT 1 as test');
    console.log('✅ Database connection test successful');
    
    // Create Users table if it doesn't exist
    await initPool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
      CREATE TABLE Users (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Email NVARCHAR(255) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(255) NOT NULL,
        Username NVARCHAR(100) NULL,
        FullName NVARCHAR(255) NULL,
        ProfilePicture NVARCHAR(500) NULL,
        IsActive BIT DEFAULT 1,
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
      )
    `);
    
    // Close the init connection and set up the main pool
    await initPool.close();
    
    // Now set up the main connection pool
    pool = new sql.ConnectionPool(config);
    pool.on('error', err => {
      console.error('Database pool error:', err);
      pool = null;
    });
    await pool.connect();
    
    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

export { sql };
