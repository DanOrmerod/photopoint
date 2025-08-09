# PhotoPoint SQL Scripts

This directory contains SQL scripts for setting up and managing the PhotoPoint database.

## Script Execution Order

Run these scripts in the following order for a complete setup:

### 1. Initial Setup
```bash
# Run as SQL Server Administrator (Windows Authentication or sa account)
sqlcmd -S localhost\SQLEXPRESS -E -i "00_create_user.sql"
```

### 2. Database Schema
```bash
# Run as photopoint_user or administrator
sqlcmd -S localhost\SQLEXPRESS -U photopoint_user -P "PhotoPoint2025!Secure" -i "01_initial_setup.sql"
```

### 3. Sample Data (Optional)
```bash
# Run for development/testing
sqlcmd -S localhost\SQLEXPRESS -U photopoint_user -P "PhotoPoint2025!Secure" -i "02_sample_data.sql"
```

## Script Descriptions

| Script | Purpose | Run As |
|--------|---------|---------|
| `00_create_user.sql` | Creates SQL login and database user with permissions | Administrator |
| `01_initial_setup.sql` | Creates database schema (tables, indexes, constraints) | photopoint_user |
| `02_sample_data.sql` | Inserts test data for development | photopoint_user |
| `99_cleanup.sql` | Drops all tables (⚠️ DESTRUCTIVE) | photopoint_user |

## Database Schema Overview

### Core Tables
- **Users**: User accounts and authentication
- **Photos**: Photo metadata and file information
- **Albums**: Photo collections/galleries
- **AlbumPhotos**: Many-to-many relationship between albums and photos
- **UserSessions**: JWT token management and session tracking

### Features
- **Automatic Timestamps**: CreatedAt/UpdatedAt fields with triggers
- **UUID Primary Keys**: UNIQUEIDENTIFIER for all entity IDs
- **Optimized Indexes**: Performance indexes on commonly queried fields
- **Foreign Key Constraints**: Data integrity enforcement
- **Cascading Deletes**: Clean up related data when users are deleted

## Manual Execution (SQL Server Management Studio)

1. Connect to SQL Server Express as administrator
2. Open and execute `00_create_user.sql`
3. Connect as `photopoint_user`
4. Open and execute `01_initial_setup.sql`
5. Optionally execute `02_sample_data.sql`

## Environment Setup

After running the scripts, update your `.env` file:

```bash
DB_SERVER=localhost\SQLEXPRESS
DB_DATABASE=PhotoPoint-v1
DB_USERNAME=photopoint_user
DB_PASSWORD=PhotoPoint2025!Secure
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
```

## Production Considerations

- Change the default password in `00_create_user.sql`
- Use Azure Key Vault or similar for credential management
- Enable encryption for production environments
- Implement proper backup and recovery strategies
- Consider connection pooling and monitoring

## Troubleshooting

### Common Issues

1. **Login Failed**: Ensure SQL Server is configured for mixed authentication mode
2. **Permission Denied**: Run `00_create_user.sql` as administrator first
3. **Database Not Found**: The scripts will create the database automatically
4. **Connection Timeout**: Check SQL Server Express service is running

### Verify Setup

```sql
-- Check user permissions
USE [PhotoPoint-v1];
SELECT * FROM sys.database_role_members rm
JOIN sys.database_principals dp ON rm.member_principal_id = dp.principal_id
JOIN sys.database_principals r ON rm.role_principal_id = r.principal_id
WHERE dp.name = 'photopoint_user';

-- Check tables
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';
```
