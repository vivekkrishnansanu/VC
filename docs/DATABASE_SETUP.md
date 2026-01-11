# Database Setup Guide

## Quick Setup Options

### Option 1: Local PostgreSQL

1. **Install PostgreSQL** (if not already installed):
   - macOS: `brew install postgresql@15`
   - Linux: `sudo apt-get install postgresql postgresql-contrib`
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/)

2. **Start PostgreSQL**:
   ```bash
   # macOS (Homebrew)
   brew services start postgresql@15
   
   # Linux
   sudo systemctl start postgresql
   ```

3. **Create Database**:
   ```bash
   # Connect to PostgreSQL
   psql postgres
   
   # Create database
   CREATE DATABASE vc_onboarding;
   
   # Create user (optional, or use default 'postgres' user)
   CREATE USER vc_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE vc_onboarding TO vc_user;
   ```

4. **Update .env file**:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vc_onboarding?schema=public"
   ```

### Option 2: Docker PostgreSQL

1. **Create docker-compose.yml**:
   ```yaml
   version: '3.8'
   services:
     db:
       image: postgres:15
       environment:
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: postgres
         POSTGRES_DB: vc_onboarding
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
   volumes:
     postgres_data:
   ```

2. **Start Docker container**:
   ```bash
   docker-compose up -d
   ```

3. **Update .env file**:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vc_onboarding?schema=public"
   ```

### Option 3: Cloud Database (Recommended for Production)

#### Supabase (Free Tier Available)

1. **Create account** at [supabase.com](https://supabase.com)
2. **Create new project**
3. **Get connection string** from Project Settings → Database
4. **Update .env file**:
   ```
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?schema=public"
   ```

#### Other Cloud Options

- **Neon** (Serverless PostgreSQL): [neon.tech](https://neon.tech)
- **Railway**: [railway.app](https://railway.app)
- **Render**: [render.com](https://render.com)
- **AWS RDS**: [aws.amazon.com/rds](https://aws.amazon.com/rds)
- **Google Cloud SQL**: [cloud.google.com/sql](https://cloud.google.com/sql)

## Verify Connection

After setting up your database:

1. **Test connection**:
   ```bash
   npx prisma db pull
   ```

2. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

3. **Run migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Open Prisma Studio** (optional):
   ```bash
   npx prisma studio
   ```

## Environment Variables

The `.env` file should contain:

```env
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
```

### Connection String Components

- **user**: Database username (default: `postgres`)
- **password**: Database password
- **host**: Database host (default: `localhost`)
- **port**: Database port (default: `5432`)
- **database**: Database name (e.g., `vc_onboarding`)
- **schema**: PostgreSQL schema (default: `public`)

## Security Notes

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use `.env.example`** for sharing configuration structure
3. **Use different databases** for development, staging, and production
4. **Rotate passwords** regularly in production
5. **Use connection pooling** for production (e.g., PgBouncer)

## Troubleshooting

### Connection Refused
- Check if PostgreSQL is running
- Verify host and port are correct
- Check firewall settings

### Authentication Failed
- Verify username and password
- Check user permissions
- Ensure user has access to the database

### Database Does Not Exist
- Create the database first (see Option 1, step 3)
- Verify database name in connection string

### SSL Required (Cloud Databases)
Add `?sslmode=require` to connection string:
```
DATABASE_URL="postgresql://user:password@host:port/database?schema=public&sslmode=require"
```

## Next Steps

After database is configured:

1. ✅ Database connection configured
2. ⏭️ Install Prisma: `npm install prisma @prisma/client`
3. ⏭️ Generate client: `npx prisma generate`
4. ⏭️ Run migrations: `npx prisma migrate dev --name init`
5. ⏭️ Seed master data (optional)
