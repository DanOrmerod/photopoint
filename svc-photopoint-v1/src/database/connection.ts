import sql from 'mssql';

// Validate required database environment variables
if (!process.env.DB_USERNAME || !process.env.DB_PASSWORD) {
  throw new Error('Database credentials are required. Please set DB_USERNAME and DB_PASSWORD in your .env file.');
}

// SQL Server configuration
const config: sql.config = {
  server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS',
  database: process.env.DB_DATABASE || 'PhotoPoint-v1',
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true', // For Azure SQL
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
    enableArithAbort: true
  }
};

// Database connection pool
let pool: sql.ConnectionPool | null = null;

export async function getDbConnection(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('✅ Connected to SQL Server Express');
  }
  return pool;
}

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
    const connection = await getDbConnection();
    
    // Create Users table if it doesn't exist
    await connection.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
      CREATE TABLE Users (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Email NVARCHAR(255) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(255) NOT NULL,
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
      )
    `);
    
    // Create Photos table if it doesn't exist
    await connection.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Photos' AND xtype='U')
      CREATE TABLE Photos (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        UserId UNIQUEIDENTIFIER NOT NULL,
        FileName NVARCHAR(255) NOT NULL,
        OriginalName NVARCHAR(255) NOT NULL,
        MimeType NVARCHAR(100) NOT NULL,
        Size BIGINT NOT NULL,
        Url NVARCHAR(500) NOT NULL,
        ThumbnailUrl NVARCHAR(500),
        Width INT,
        Height INT,
        Camera NVARCHAR(255),
        Location NVARCHAR(255),
        Tags NVARCHAR(MAX), -- JSON array as string
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
      )
    `);
    
    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

export { sql };
