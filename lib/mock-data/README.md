# Mock Data Layer

This directory contains dummy data for development without requiring a database connection.

## Structure

- `types.ts` - TypeScript type definitions matching Prisma schema
- `users.ts` - Mock user data (Implementation Leads and Customers)
- `accounts.ts` - Mock account data
- `locations.ts` - Mock location data
- `onboarding.ts` - Mock onboarding data per location
- `phones.ts` - Mock phone device data
- `master-data.ts` - Mock master data (supported phones, phone system knowledge)
- `service.ts` - Unified service interface for accessing mock data
- `index.ts` - Main export file

## Usage

```typescript
import { mockDataService } from '@/lib/mock-data';

// Get all accounts
const accounts = mockDataService.accounts.getAll();

// Get account by ID
const account = mockDataService.accounts.getById('account-1');

// Get locations for an account
const locations = mockDataService.locations.getByAccountId('account-1');

// Get onboarding for a location
const onboarding = mockDataService.onboarding.getByLocationId('location-1');

// Get phones for a location
const phones = mockDataService.phones.getByLocationId('location-1');

// Check if phone model is supported
const isSupported = mockDataService.masterData.isPhoneModelSupported(
  PhoneBrand.YEALINK,
  'T46S'
);
```

## Mock Data Overview

### Users (4)
- 2 Implementation Leads
- 2 Customers

### Accounts (3)
- Acme Medical Group (CS VoiceStack, 3 locations)
- City Dental Practice (VoiceStack, 2 locations)
- Regional Health Network (CS VoiceStack, 5 locations)

### Locations (5)
- 3 locations for Acme Medical
- 2 locations for City Dental

### Onboarding (5)
- Various statuses: NOT_STARTED, IN_PROGRESS, PENDING_APPROVAL, COMPLETED
- Includes copy-from-previous example

### Phones (7)
- Mix of Yealink, Polycom, and Other brands
- Includes unsupported phone example (Cisco 7945)
- Various assignment types

### Master Data
- 7 supported phone models (Yealink and Polycom)
- 6 phone system knowledge entries

## Migration to Real Database

When ready to connect to MySQL:

1. Install Prisma: `npm install prisma @prisma/client`
2. Generate Prisma Client: `npx prisma generate`
3. Replace `mockDataService` calls with Prisma queries:

```typescript
// Before (mock)
const accounts = mockDataService.accounts.getAll();

// After (Prisma)
import { prisma } from '@/lib/prisma';
const accounts = await prisma.account.findMany();
```

4. Update service layer to use Prisma instead of mock data
5. Remove or keep mock data for testing

## Notes

- All dates are JavaScript `Date` objects
- IDs use simple string format (e.g., 'account-1')
- Relationships are maintained via ID references
- Mock data is in-memory only (not persisted)
