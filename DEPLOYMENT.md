# Deployment Guide

## Quick Start (Demo)

Recommended for a demo: deploy to **Vercel** and use **Supabase** for persistence.

- Demo URL will work with save/resume using Supabase JSON tables (see `docs/SUPABASE_DEMO_SETUP.md`)
- Production can later switch to Prisma + MySQL (no Supabase)

## Production Deployment Checklist

### Pre-Deployment

- [ ] Set up production database (MySQL)
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure logging service
- [ ] Set up monitoring and alerts
- [ ] Review security settings
- [ ] Test all critical flows

### Environment Variables

Required production environment variables:

```bash
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Authentication (when implemented)
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key

# Logging
LOG_LEVEL=error
ENABLE_DEBUG_LOGS=false

# Demo mode (LOCAL/DEMO ONLY — do not set in prod)
# Allows API auth middleware to fall back to a demo user without headers.
DEMO_AUTH_BYPASS=0

# Demo persistence (optional)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

### Build Process

```bash
# Install dependencies
npm ci

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Build application
npm run build

# Start production server
npm start
```

### Database Setup

1. Create production database
2. Run migrations: `npm run db:migrate`
3. Seed initial data (if needed)
4. Verify connection

### Security Checklist

- [ ] HTTPS enabled
- [ ] Security headers configured (in next.config.ts)
- [ ] Environment variables secured
- [ ] Database credentials protected
- [ ] Rate limiting enabled
- [ ] CORS configured
- [ ] Input validation on all endpoints
- [ ] Authentication implemented
- [ ] Authorization checks in place

### Monitoring

- Set up error tracking
- Configure application logs
- Set up uptime monitoring
- Configure performance monitoring
- Set up alerting

### Scaling Considerations

- Database connection pooling
- API rate limiting
- Caching strategy
- CDN for static assets
- Load balancing (if needed)

## Deployment Platforms

### Vercel (Recommended)

1. Connect GitHub repository
2. Configure environment variables
3. Set build command: `npm run build`
4. Deploy

#### Vercel env vars (demo)

Set these in Vercel Project → Settings → Environment Variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DEMO_AUTH_BYPASS=1` (demo only)

### Docker

This repo includes a production Dockerfile using Next.js **standalone** output.

Build & run:

```bash
docker build -t vc-onboarding .
docker run --rm -p 3000:3000 \
  -e NODE_ENV=production \
  -e DEMO_AUTH_BYPASS=0 \
  vc-onboarding
```

Demo with Supabase:

```bash
docker run --rm -p 3000:3000 \
  -e NODE_ENV=production \
  -e DEMO_AUTH_BYPASS=1 \
  -e SUPABASE_URL="https://YOUR_PROJECT.supabase.co" \
  -e SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY" \
  vc-onboarding
```

### Traditional Server

1. SSH into server
2. Clone repository
3. Install dependencies: `npm ci`
4. Build: `npm run build`
5. Start with PM2: `pm2 start npm --name "app" -- start`
