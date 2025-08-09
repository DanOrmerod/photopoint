# PhotoPoint Database Setup

## SQL Server Express Configuration

### 1. Create SQL Server Login and User

Run these commands in SQL Server Management Studio (SSMS) or sqlcmd:

```sql
-- Connect to SQL Server as administrator (Windows Authentication)
-- Create a SQL Server login
CREATE LOGIN photopoint_user WITH PASSWORD = 'YourStrongPassword123!';

-- Create the database if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'PhotoPoint-v1')
CREATE DATABASE [PhotoPoint-v1];

-- Switch to the PhotoPoint database
USE [PhotoPoint-v1];

-- Create a database user and map it to the login
CREATE USER photopoint_user FOR LOGIN photopoint_user;

-- Grant necessary permissions
ALTER ROLE db_datareader ADD MEMBER photopoint_user;
ALTER ROLE db_datawriter ADD MEMBER photopoint_user;
ALTER ROLE db_ddladmin ADD MEMBER photopoint_user;  -- Needed for creating tables

-- Grant additional permissions for table creation and management
GRANT CREATE TABLE TO photopoint_user;
GRANT ALTER ON SCHEMA::dbo TO photopoint_user;
```

### 2. Update Environment Variables

Update your `.env` file with the credentials:

```bash
# Database Configuration
DB_SERVER=localhost\SQLEXPRESS
DB_DATABASE=PhotoPoint-v1
DB_USERNAME=photopoint_user
DB_PASSWORD=YourStrongPassword123!
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
```

### 3. Enable SQL Server Authentication

Make sure SQL Server is configured for mixed authentication:

1. Open **SQL Server Management Studio**
2. Right-click on your server instance → **Properties**
3. Go to **Security** tab
4. Select **SQL Server and Windows Authentication mode**
5. Click **OK** and restart SQL Server service

### 4. Test Connection

Start your PhotoPoint API server:

```bash
npm run dev
```

You should see:
```
✅ Connected to SQL Server Express
✅ Database schema initialized  
🚀 PhotoPoint API server running on port 3001
🗄️ Database: PhotoPoint-v1 on SQL Server Express
```

## Production Considerations

- Use a dedicated service account with minimal required permissions
- Use strong, randomly generated passwords
- Consider using Azure Key Vault or similar for credential management
- Enable encryption for production deployments
- Implement connection pooling and retry logic
- Set up proper backup strategies

## Database Schema

The application will automatically create these tables:

- **Users**: User accounts and authentication data
- **Photos**: Photo metadata and file information

Tables are created with proper foreign key constraints and indexes for optimal performance.
