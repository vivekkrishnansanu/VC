# MySQL Database Setup Guide

## Overview

This project is configured to use **MySQL** as the database provider, connecting to your office MySQL system.

## Prisma Schema Changes for MySQL

The schema has been updated for MySQL compatibility:

1. **Datasource Provider**: Changed from `postgresql` to `mysql`
2. **Array Fields**: `reservedExtensions` in `ExtensionSeries` converted to JSON (MySQL doesn't support native arrays)
3. **JSON Fields**: All JSON fields work with MySQL 5.7+ (JSON type support)

## Connection String Format

Update your `.env` file with the MySQL connection string:

```env
DATABASE_URL="mysql://username:password@host:port/database"
```

### Example Connection Strings

**Office MySQL Database:**
```env
DATABASE_URL="mysql://your_username:your_password@office-db.example.com:3306/vc_onboarding"
```

**Local MySQL:**
```env
DATABASE_URL="mysql://root:password@localhost:3306/vc_onboarding"
```

**With SSL (if required):**
```env
DATABASE_URL="mysql://user:password@host:3306/database?sslmode=REQUIRED"
```

**With Connection Pooling:**
```env
DATABASE_URL="mysql://user:password@host:3306/database?connection_limit=10&pool_timeout=20"
```

## Getting Office Database Credentials

You'll need the following information from your office IT/database administrator:

1. **Host**: Database server hostname or IP address
2. **Port**: Usually `3306` for MySQL
3. **Database Name**: The database name (or create `vc_onboarding`)
4. **Username**: Your database username
5. **Password**: Your database password
6. **SSL Required**: Whether SSL connection is required

## Setup Steps

### 1. Get Database Credentials

Contact your office IT team or database administrator to get:
- Database host/endpoint
- Port number (default: 3306)
- Username and password
- Database name (or permission to create one)

### 2. Create Database (if needed)

If you need to create the database:

```sql
-- Connect to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE vc_onboarding CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (if needed)
CREATE USER 'vc_user'@'%' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON vc_onboarding.* TO 'vc_user'@'%';
FLUSH PRIVILEGES;
```

### 3. Update .env File

Edit `.env` file with your office database credentials:

```env
DATABASE_URL="mysql://your_username:your_password@office-host:3306/vc_onboarding"
```

### 4. Test Connection

```bash
# Test connection (will show tables if connected)
npx prisma db pull

# Or use MySQL client
mysql -h office-host -u username -p vc_onboarding
```

### 5. Install Prisma (if not already installed)

```bash
npm install prisma @prisma/client
```

### 6. Generate Prisma Client

```bash
npx prisma generate
```

### 7. Run Migrations

```bash
# Create initial migration
npx prisma migrate dev --name init

# Or if database already exists and you want to sync
npx prisma db push
```

## MySQL Version Requirements

- **Minimum**: MySQL 5.7+ (for JSON support)
- **Recommended**: MySQL 8.0+ or MariaDB 10.2+

## MySQL-Specific Considerations

### 1. JSON Fields

The schema uses JSON fields for:
- `CreditInfo.data` - Flexible credit information
- `AuditLog.changes` - Before/after state
- `AuditLog.metadata` - Additional context
- `ExtensionSeries.reservedExtensions` - Array of extension numbers

**Usage in code:**
```typescript
// Reading JSON
const extensions = extensionSeries.reservedExtensions as string[];

// Writing JSON
await prisma.extensionSeries.update({
  where: { id: seriesId },
  data: {
    reservedExtensions: ["100", "101", "102"]
  }
});
```

### 2. Enum Handling

MySQL stores enums as strings. Prisma handles the conversion automatically.

### 3. DateTime Fields

All `DateTime` fields use MySQL's `DATETIME` type with timezone support.

### 4. Decimal Fields

`Decimal` fields (e.g., `unitPrice`, `totalPrice`) use MySQL's `DECIMAL` type for precise financial calculations.

## Connection Security

### SSL/TLS Connection

If your office database requires SSL:

```env
DATABASE_URL="mysql://user:password@host:3306/database?sslmode=REQUIRED"
```

### VPN/Network Access

If the office database is behind a VPN:
1. Connect to VPN first
2. Then run Prisma commands
3. Consider using connection pooling for better performance

### Firewall Rules

Ensure your IP address is whitelisted in the office database firewall.

## Troubleshooting

### Connection Refused

- Verify host and port are correct
- Check if you're connected to VPN (if required)
- Verify firewall rules allow your IP

### Authentication Failed

- Double-check username and password
- Verify user has permissions on the database
- Check if account is locked or expired

### SSL Required Error

Add `?sslmode=REQUIRED` to connection string

### Database Does Not Exist

- Create database first (see step 2 above)
- Or verify database name in connection string

### JSON Parsing Errors

- Ensure MySQL version is 5.7+ (JSON support)
- Check JSON field format in database

### Character Encoding Issues

- Ensure database uses `utf8mb4` character set
- Verify connection string doesn't override encoding

## Performance Tips

1. **Connection Pooling**: Use connection pooling for production
   ```env
   DATABASE_URL="mysql://user:pass@host:3306/db?connection_limit=10"
   ```

2. **Indexes**: All foreign keys and frequently queried fields are indexed

3. **Query Optimization**: Use Prisma's query optimization features
   ```typescript
   // Use select to limit fields
   const user = await prisma.user.findUnique({
     where: { id },
     select: { id: true, email: true }
   });
   ```

## Production Considerations

1. **Read Replicas**: Consider read replicas for reporting queries
2. **Backup Strategy**: Ensure office database has regular backups
3. **Monitoring**: Set up database monitoring and alerts
4. **Connection Limits**: Coordinate with office IT on connection limits
5. **Data Retention**: Plan for audit log archival strategy

## Next Steps

After database is configured:

1. ✅ Database connection configured
2. ⏭️ Generate Prisma Client: `npx prisma generate`
3. ⏭️ Run migrations: `npx prisma migrate dev --name init`
4. ⏭️ Seed master data (optional)
5. ⏭️ Start building application layer
