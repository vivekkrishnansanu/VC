# Project Structure

This document describes the complete project structure for the Implementation Automation Platform.

## Directory Structure

```
VC/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth route group
│   │   └── login/
│   ├── api/                     # API routes
│   │   ├── approvals/
│   │   ├── audit-logs/
│   │   ├── bulk/
│   │   ├── devices/
│   │   ├── extensions/
│   │   ├── onboarding/
│   │   ├── provisioning/
│   │   └── validation/
│   ├── customer/                # Customer-facing pages
│   │   ├── dashboard/
│   │   └── onboarding/
│   ├── implementation-lead/     # Implementation Lead pages
│   │   ├── accounts/
│   │   └── dashboard/
│   ├── dashboard/               # Main dashboard
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── error.tsx                # Error boundary
│   ├── global-error.tsx         # Global error boundary
│   └── globals.css              # Global styles
│
├── components/                   # React components
│   ├── auth/                    # Authentication components
│   ├── layouts/                 # Layout components
│   ├── onboarding/              # Onboarding components
│   │   └── steps/               # Onboarding step components
│   ├── ui/                      # shadcn/ui components
│   └── shadcn-studio/           # Demo components
│
├── context/                     # React Context providers
│   └── AuthContext.tsx
│
├── hooks/                       # Custom React hooks
│   ├── useApi.ts
│   └── index.ts
│
├── lib/                         # Core library code
│   ├── api/                     # API utilities
│   │   └── middleware.ts
│   ├── auth/                    # Authentication
│   │   ├── index.ts
│   │   ├── middleware.ts
│   │   └── permissions.ts
│   ├── bulk-operations/         # Bulk operations
│   ├── config/                  # Configuration
│   │   └── index.ts
│   ├── constants/              # Constants
│   │   └── index.ts
│   ├── data-integrity/          # Data integrity
│   ├── errors/                  # Error handling
│   │   └── index.ts
│   ├── mock-data/               # Mock data (development)
│   ├── observability/           # Logging & monitoring
│   ├── provisioning/            # Provisioning logic
│   ├── safeguards/              # Validation safeguards
│   ├── services/                # Business logic services
│   ├── utils/                   # Utility functions
│   │   ├── index.ts
│   │   └── api.ts
│   ├── validators/              # Validation schemas
│   │   └── index.ts
│   └── utils.ts                 # Legacy utils (backward compat)
│
├── types/                       # TypeScript type definitions
│   └── index.ts
│
├── prisma/                      # Prisma ORM
│   ├── schema.prisma
│   └── README.md
│
├── docs/                        # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SETUP.md
│   ├── DOMAIN_MODEL.md
│   ├── EXTENSIBILITY_POINTS.md
│   ├── MYSQL_SETUP.md
│   ├── ONBOARDING_STATUS_FLOW.md
│   ├── PRODUCTION_HARDENING_SUMMARY.md
│   ├── PRODUCTION_READINESS.md
│   └── SCHEMA_SUMMARY.md
│
├── assets/                      # Static assets
│   └── svg/
│
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── components.json              # shadcn/ui configuration
├── next.config.ts               # Next.js configuration
├── package.json                 # Dependencies
├── postcss.config.mjs          # PostCSS configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── README.md                    # Project README
├── SETUP.md                     # Setup instructions
├── HOW_TO_TEST.md              # Testing guide
└── TESTING_GUIDE.md            # Testing documentation
```

## Key Directories

### `/app`
Next.js App Router directory. Contains all routes and API endpoints.

### `/components`
React components organized by feature/domain.

### `/lib`
Core business logic, utilities, and services. Organized by domain.

### `/types`
Centralized TypeScript type definitions.

### `/hooks`
Custom React hooks for reusable logic.

### `/prisma`
Database schema and migrations.

### `/docs`
Comprehensive documentation.

## Architecture Principles

1. **Separation of Concerns**: Clear boundaries between UI, business logic, and data access
2. **Type Safety**: Comprehensive TypeScript types throughout
3. **Reusability**: Shared components, hooks, and utilities
4. **Scalability**: Structure supports future growth
5. **Maintainability**: Clear organization and documentation

## Adding New Features

### Adding a New Page
1. Create route in `/app/[feature]/page.tsx`
2. Add layout if needed in `/components/layouts/`
3. Create components in `/components/[feature]/`

### Adding a New API Endpoint
1. Create route in `/app/api/[feature]/route.ts`
2. Use middleware from `/lib/api/middleware.ts`
3. Add service logic in `/lib/services/`
4. Document in `/docs/API_DOCUMENTATION.md`

### Adding a New Service
1. Create service in `/lib/services/[service-name].service.ts`
2. Export from `/lib/services/index.ts`
3. Add types in `/types/index.ts`
4. Add validation in `/lib/validators/index.ts`

### Adding a New Component
1. Create in `/components/[category]/[component-name].tsx`
2. Export from index if part of a module
3. Use shadcn/ui components from `/components/ui/`

## Future Extensibility

The structure is designed to support:
- Multiple product types
- Additional user roles
- New approval workflows
- External integrations
- Advanced analytics
- Bulk operations
- Export functionality
