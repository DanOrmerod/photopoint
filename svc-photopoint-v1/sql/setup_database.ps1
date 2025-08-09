# PhotoPoint Database Setup Script (PowerShell)
# Run this script to set up the complete PhotoPoint database

param(
    [string]$Server = "localhost\SQLEXPRESS",
    [string]$Database = "PhotoPoint-v1", 
    [string]$Username = "PhotoPointAPI",
    [string]$Password = "Ph@toPointP0wer",
    [switch]$SkipSampleData = $false
)

Write-Host "========================================"
Write-Host "PhotoPoint Database Setup (PowerShell)"
Write-Host "========================================"
Write-Host ""

# Check if sqlcmd is available
if (-not (Get-Command "sqlcmd" -ErrorAction SilentlyContinue)) {
    Write-Error "sqlcmd not found in PATH"
    Write-Host "Please install SQL Server Command Line Utilities"
    Write-Host "Download from: https://docs.microsoft.com/en-us/sql/tools/sqlcmd-utility"
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 1: Create user and database
Write-Host "Step 1: Creating SQL Server login and database user..."
Write-Host "Running as SQL Server administrator (Windows Authentication)"
Write-Host ""

$result = & sqlcmd -S $Server -E -i "00_create_user.sql"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create user. Make sure you're running as administrator"
    Write-Host "and SQL Server Express is running with mixed authentication mode."
    Read-Host "Press Enter to exit"
    exit 1
}

# Get password if not provided
if (-not $Password) {
    $SecurePassword = Read-Host "Enter password for photopoint_user (default: PhotoPoint2025!Secure)" -AsSecureString
    if ($SecurePassword.Length -eq 0) {
        $Password = "PhotoPoint2025!Secure"
    } else {
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword)
        $Password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
        [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
    }
}

# Step 2: Create schema
Write-Host ""
Write-Host "Step 2: Creating database schema (tables, indexes, constraints)..."
Write-Host "Running as $Username..."
Write-Host ""

$result = & sqlcmd -S $Server -U $Username -P $Password -i "01_initial_setup.sql"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create database schema."
    Write-Host "Check your password and database connection."
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 3: Sample data (optional)
if (-not $SkipSampleData) {
    Write-Host ""
    Write-Host "Step 3: Adding sample data (optional)..."
    $AddSample = Read-Host "Do you want to add sample data for development? (y/N)"
    
    if ($AddSample -eq "y" -or $AddSample -eq "Y") {
        Write-Host "Adding sample data..."
        $result = & sqlcmd -S $Server -U $Username -P $Password -i "02_sample_data.sql"
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Failed to add sample data, but database setup is complete."
        }
    } else {
        Write-Host "Skipping sample data."
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host "Database Setup Complete!" -ForegroundColor Green
Write-Host "========================================"
Write-Host ""
Write-Host "Database: $Database"
Write-Host "Server: $Server"
Write-Host "User: $Username"
Write-Host ""
Write-Host "Update your .env file with these settings:" -ForegroundColor Yellow
Write-Host "DB_SERVER=$Server"
Write-Host "DB_DATABASE=$Database"
Write-Host "DB_USERNAME=$Username"
Write-Host "DB_PASSWORD=$Password"
Write-Host "DB_ENCRYPT=false"
Write-Host "DB_TRUST_SERVER_CERTIFICATE=true"
Write-Host ""
Write-Host "You can now start your PhotoPoint API server!" -ForegroundColor Green
Write-Host ""

Read-Host "Press Enter to exit"
