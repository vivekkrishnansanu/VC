# Prisma Schema Summary

## Overview

Complete Prisma schema for the Implementation Automation Platform. This schema models the entire domain for automating telephony product onboarding and implementation.

## Schema Statistics

- **Total Models**: 24
- **Total Enums**: 10
- **Relationships**: Complex many-to-many and one-to-many relationships throughout

## Model Categories

### 1. User & Authentication (1 model)
- `User` - Implementation Leads and Customers

### 2. Account Management (4 models)
- `Account` - Top-level account entity
- `AccountImplementationLead` - Many-to-many junction
- `AccountContact` - POC and additional contacts
- `CreditInfo` - Flexible credit information storage

### 3. Location Management (2 models)
- `Location` - Physical locations
- `LocationInvitation` - Customer invitation system

### 4. Onboarding (1 model)
- `LocationOnboarding` - Core onboarding data per location

### 5. Phone & Device Management (3 models)
- `Phone` - Individual phone devices
- `PhonePurchaseRequest` - Unsupported phone purchase workflow
- `SupportedPhoneModel` - Master data for supported phones

### 6. Working Hours (1 model)
- `WorkingHoursSchedule` - Day-of-week schedules

### 7. Call Flow (4 models)
- `CallFlow` - Main call flow configuration
- `IVROption` - IVR menu options
- `IVROptionTarget` - IVR option ring targets
- `CallFlowTarget` - Direct routing targets
- `SharedVoicemailUser` - Shared voicemail configuration

### 8. Approvals & Workflows (1 model)
- `Approval` - Generic approval system

### 9. Audit & Logging (1 model)
- `AuditLog` - Comprehensive audit trail

### 10. Master Data (2 models)
- `PhoneSystemKnowledge` - Phone system capabilities
- `ExtensionSeries` - Extension number management

## Key Features

### 1. Flexible Data Structures
- `CreditInfo.data` - JSON field for evolving credit information
- `AuditLog.changes` - JSON for before/after state
- `AuditLog.metadata` - JSON for additional context

### 2. Comprehensive Relationships
- Account → Locations → Onboarding hierarchy
- Many-to-many: Users ↔ Accounts (Implementation Leads)
- One-to-many: Location → Phones, Working Hours, etc.
- Complex: Call Flow with IVR options and targets

### 3. Status Tracking
- `OnboardingStatus` enum with 8 states
- Status transitions tracked in audit logs
- Status-based business rules

### 4. Approval System
- Generic `Approval` model supports multiple types
- Links to any entity via `entityType`/`entityId`
- Specific `PhonePurchaseRequest` for phone purchases

### 5. Copy Previous Location
- `LocationOnboarding.copiedFromLocationId` tracks data copying
- Enables audit trail and dependency tracking

### 6. Master Data
- `PhoneSystemKnowledge` - Skip questions when capabilities known
- `SupportedPhoneModel` - Validate and detect unsupported phones
- `ExtensionSeries` - Manage extension ranges and reservations

## Indexes

Comprehensive indexing strategy:
- Foreign keys indexed
- Status fields indexed for filtering
- Email/token fields indexed for lookups
- Composite indexes for common queries
- Date fields indexed for time-based queries

## Data Integrity

- Cascade deletes where appropriate
- Set null for optional relationships
- Unique constraints on critical fields
- Required fields enforced at schema level

## Prisma Version Compatibility

This schema is compatible with Prisma 5.x and 6.x. For Prisma 7.x, the datasource configuration needs to be moved to `prisma.config.ts` (see Prisma 7 migration guide).

## Next Steps

1. **Install Prisma**: `npm install prisma @prisma/client`
2. **Generate Client**: `npx prisma generate`
3. **Create Migration**: `npx prisma migrate dev --name init`
4. **Seed Database**: Create seed script for master data

## Database Requirements

- **Provider**: PostgreSQL (recommended)
- **Features Used**:
  - JSON fields
  - Array fields (String[])
  - Enums
  - Foreign keys
  - Indexes
  - Unique constraints

## Migration Strategy

1. Start with empty database
2. Run initial migration
3. Seed master data:
   - `SupportedPhoneModel`
   - `PhoneSystemKnowledge`
   - Default extension series (if needed)
4. Create test accounts and locations
5. Test onboarding flow end-to-end
