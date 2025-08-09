@echo off
REM PhotoPoint Database Setup Script
REM Run this batch file to set up the complete PhotoPoint database

echo ========================================
echo PhotoPoint Database Setup
echo ========================================
echo.

REM Check if sqlcmd is available
where sqlcmd >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: sqlcmd not found in PATH
    echo Please install SQL Server Command Line Utilities
    echo Download from: https://docs.microsoft.com/en-us/sql/tools/sqlcmd-utility
    pause
    exit /b 1
)

echo Step 1: Creating SQL Server login and database user...
echo Running as SQL Server administrator (Windows Authentication)
echo.

sqlcmd -S localhost\SQLEXPRESS -E -i "00_create_user.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create user. Make sure you're running as administrator.
    echo and SQL Server Express is running with mixed authentication mode.
    pause
    exit /b 1
)

echo.
echo Step 2: Creating database schema (tables, indexes, constraints)...
echo Running as photopoint_user...
echo.

REM Prompt for password if not set in environment
if "%DB_PASSWORD%"=="" (
    set /p DB_PASSWORD="Enter password for photopoint_user (default: PhotoPoint2025!Secure): "
    if "%DB_PASSWORD%"=="" set DB_PASSWORD=PhotoPoint2025!Secure
)

sqlcmd -S localhost\SQLEXPRESS -U photopoint_user -P "%DB_PASSWORD%" -i "01_initial_setup.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create database schema.
    echo Check your password and database connection.
    pause
    exit /b 1
)

echo.
echo Step 3: Adding sample data (optional)...
set /p ADD_SAMPLE="Do you want to add sample data for development? (y/N): "

if /i "%ADD_SAMPLE%"=="y" (
    echo Adding sample data...
    sqlcmd -S localhost\SQLEXPRESS -U photopoint_user -P "%DB_PASSWORD%" -i "02_sample_data.sql"
    if %ERRORLEVEL% NEQ 0 (
        echo WARNING: Failed to add sample data, but database setup is complete.
    )
) else (
    echo Skipping sample data.
)

echo.
echo ========================================
echo Database Setup Complete!
echo ========================================
echo.
echo Database: PhotoPoint-v1
echo Server: localhost\SQLEXPRESS
echo User: photopoint_user
echo.
echo Update your .env file with these settings:
echo DB_SERVER=localhost\SQLEXPRESS
echo DB_DATABASE=PhotoPoint-v1
echo DB_USERNAME=photopoint_user
echo DB_PASSWORD=%DB_PASSWORD%
echo DB_ENCRYPT=false
echo DB_TRUST_SERVER_CERTIFICATE=true
echo.
echo You can now start your PhotoPoint API server!
echo.
pause
