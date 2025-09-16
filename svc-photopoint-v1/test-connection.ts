import dotenv from 'dotenv';
import sql from 'mssql';

// Load environment variables
dotenv.config();

console.log('Testing database connection...');
console.log('DB_SERVER:', process.env.DB_SERVER);
console.log('DB_USERNAME:', process.env.DB_USERNAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');

const config: sql.config = {
  server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS',
  database: process.env.DB_DATABASE || 'PhotoPoint-v1',
  user: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
    enableArithAbort: true
  }
};

async function testConnection() {
  let pool: sql.ConnectionPool | null = null;
  
  try {
    console.log('\n🔌 Creating connection pool...');
    pool = new sql.ConnectionPool(config);
    
    console.log('🔐 Attempting to connect with SQL Server Authentication...');
    await pool.connect();
    
    console.log('✅ Connected successfully!');
    
    console.log('🧪 Testing query...');
    const result = await pool.request().query('SELECT 1 as test, GETDATE() as currentTime');
    console.log('Query result:', result.recordset);
    
    console.log('✅ Database connection test successful!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    if (pool) {
      try {
        await pool.close();
        console.log('🔒 Connection closed');
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
    }
  }
}

testConnection();
