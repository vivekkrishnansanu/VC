# Prisma Schema Setup

## Quick Start

1. **Install Prisma**:
```bash
npm install prisma @prisma/client
```

2. **Set up environment variable**:
Create `.env` file in project root:
```
DATABASE_URL="postgresql://user:password@localhost:5432/vc_onboarding?schema=public"
```

3. **Generate Prisma Client**:
```bash
npx prisma generate
```

4. **Create database and run migrations**:
```bash
npx prisma migrate dev --name init
```

5. **Seed master data** (optional):
```bash
npx prisma db seed
```

## Schema Overview

See `/docs/SCHEMA_SUMMARY.md` for complete schema documentation.

## Key Models

- **Account** - Top-level customer account
- **Location** - Physical locations within accounts
- **LocationOnboarding** - Onboarding data per location
- **User** - Implementation Leads and Customers
- **Phone** - Phone devices
- **CallFlow** - Call routing configuration
- **AuditLog** - Comprehensive audit trail

## Documentation

- `/docs/DOMAIN_MODEL.md` - Complete domain model documentation
- `/docs/ONBOARDING_STATUS_FLOW.md` - Status state machine
- `/docs/EXTENSIBILITY_POINTS.md` - Future extensibility considerations
- `/docs/SCHEMA_SUMMARY.md` - Schema summary and statistics

## Prisma Studio

View and edit data in a GUI:
```bash
npx prisma studio
```

## Common Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Format schema
npx prisma format

# Validate schema
npx prisma validate
```

## Notes

- Schema uses PostgreSQL-specific features (JSON, arrays)
- All timestamps use `DateTime` with `@default(now())` and `@updatedAt`
- Foreign keys use appropriate cascade/set null strategies
- Comprehensive indexing for performance
