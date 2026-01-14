# Account Card Implementation Roadmap

## Overview

This document provides a step-by-step implementation plan for the account card redesign based on the UX specifications.

---

## PHASE 1: Data Layer (Backend Logic)

### 1.1 Warning/Blocker Calculation Service

**File**: `lib/services/account-warnings.service.ts`

**Functions Needed:**
```typescript
// Calculate warnings/blockers for a single location
calculateLocationWarnings(locationId: string): LocationWarnings

// Calculate warnings/blockers for an account (all locations)
calculateAccountWarnings(accountId: string): AccountWarnings

// Check if location has pending approvals
hasPendingApprovals(locationId: string): boolean

// Check if location has unsupported phones
hasUnsupportedPhones(locationId: string): boolean

// Check if location is missing devices
isMissingDevices(locationId: string): boolean

// Check if call flow is incomplete
isCallFlowIncomplete(locationId: string): boolean
```

**Dependencies:**
- `ApprovalService.getPendingApprovals()`
- `DeviceValidationService.hasUnsupportedDevices()`
- `ValidationService.validateCallFlow()`
- `OnboardingSessionService` (for progress calculation)

### 1.2 Progress Calculation

**File**: `lib/services/progress.service.ts`

**Functions Needed:**
```typescript
// Calculate progress for a single location
calculateLocationProgress(locationId: string): {
  completed: number;
  total: number;
  percentage: number;
}

// Calculate progress for an account
calculateAccountProgress(accountId: string): {
  completed: number;
  total: number;
  percentage: number;
}
```

---

## PHASE 2: API Endpoints

### 2.1 Account Warnings API

**File**: `app/api/accounts/[accountId]/warnings/route.ts`

**Endpoint**: `GET /api/accounts/[accountId]/warnings`

**Response:**
```json
{
  "accountId": "account-1",
  "blockers": {
    "pendingApprovals": 2,
    "unsupportedPhones": 1
  },
  "warnings": {
    "missingDevices": 1,
    "incompleteCallFlow": 1
  },
  "locations": [
    {
      "locationId": "location-1",
      "name": "Main Office",
      "status": "IN_PROGRESS",
      "progress": {
        "completed": 4,
        "total": 6,
        "percentage": 67
      },
      "blockers": {
        "pendingApprovals": 2,
        "hasUnsupportedPhones": true
      },
      "warnings": {
        "missingDevices": false,
        "incompleteCallFlow": false
      }
    }
  ]
}
```

### 2.2 Account List API (Enhanced)

**File**: `app/api/accounts/route.ts`

**Endpoint**: `GET /api/accounts`

**Enhancement**: Include warnings/blockers in response

---

## PHASE 3: UI Components

### 3.1 Account Card Component

**File**: `components/accounts/AccountCard.tsx`

**Props:**
```typescript
interface AccountCardProps {
  account: {
    id: string;
    name: string;
    productType: ProductType;
    totalLocations: number;
  };
  warnings: AccountWarnings;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  locations: Array<{
    id: string;
    name: string;
    status: OnboardingStatus;
    progress: LocationProgress;
    warnings: LocationWarnings;
  }>;
  onClick?: () => void;
}
```

**Features:**
- Clickable card (entire card)
- Hover states
- Warning/blocker badges
- Progress bars
- Location list (expandable)

### 3.2 Warning Badge Component

**File**: `components/accounts/WarningBadge.tsx`

**Props:**
```typescript
interface WarningBadgeProps {
  type: 'pending-approvals' | 'unsupported-phones' | 'missing-devices' | 'incomplete-call-flow';
  count?: number;
  variant: 'warning' | 'blocker';
}
```

### 3.3 Location Item Component

**File**: `components/accounts/LocationItem.tsx`

**Props:**
```typescript
interface LocationItemProps {
  location: {
    id: string;
    name: string;
    status: OnboardingStatus;
    progress: LocationProgress;
    warnings: LocationWarnings;
  };
  onClick?: () => void;
}
```

---

## PHASE 4: Dashboard Updates

### 4.1 Customer Dashboard

**File**: `app/customer/dashboard/page.tsx`

**Changes:**
- Replace location cards with account cards
- Fetch account data with warnings
- Implement card click navigation
- Show account-level summaries

### 4.2 Implementation Lead Dashboard

**File**: `app/implementation-lead/dashboard/page.tsx`

**Changes:**
- Replace account table with account cards
- Show all accounts as cards
- Maintain "Create Account" button
- Show account-level warnings across all accounts

---

## PHASE 5: Navigation Updates

### 5.1 Account Detail View

**New File**: `app/customer/account/[accountId]/page.tsx`
**New File**: `app/implementation-lead/accounts/[accountId]/page.tsx`

**Features:**
- Show all locations for account
- Show account-level warnings
- Location cards (also clickable)
- Account actions (Implementation Lead only)

### 5.2 Route Updates

**Routes:**
- `/customer/dashboard` → Account cards
- `/customer/account/[accountId]` → Account detail
- `/customer/onboarding/[locationId]` → Onboarding wizard
- `/implementation-lead/dashboard` → Account cards
- `/implementation-lead/accounts/[accountId]` → Account detail

---

## IMPLEMENTATION ORDER

### Week 1: Foundation
1. ✅ Create warning calculation service
2. ✅ Create progress calculation service
3. ✅ Add API endpoints for warnings
4. ✅ Test calculation logic

### Week 2: Components
1. ✅ Build AccountCard component
2. ✅ Build WarningBadge component
3. ✅ Build LocationItem component
4. ✅ Add hover states and interactions

### Week 3: Integration
1. ✅ Update Customer Dashboard
2. ✅ Update Implementation Lead Dashboard
3. ✅ Create Account Detail views
4. ✅ Update navigation flows

### Week 4: Polish
1. ✅ Add loading states
2. ✅ Add empty states
3. ✅ Accessibility improvements
4. ✅ Responsive design
5. ✅ User testing

---

## TESTING CHECKLIST

### Warning/Blocker Scenarios
- [ ] Account with pending approvals
- [ ] Account with unsupported phones
- [ ] Account with missing devices
- [ ] Account with incomplete call flow
- [ ] Account with multiple warnings
- [ ] Account with no warnings (clean state)
- [ ] Account with all locations complete

### Navigation Scenarios
- [ ] Click account card → Navigate to account detail
- [ ] Click location in card → Navigate to onboarding
- [ ] Click warning badge → Navigate to relevant step
- [ ] Keyboard navigation works
- [ ] Mobile tap targets work

### Edge Cases
- [ ] No accounts
- [ ] No locations
- [ ] Loading state
- [ ] Error state
- [ ] Empty state

---

## SUCCESS METRICS

### User Experience
- Users can identify blockers within 5 seconds
- Card click-through rate > 80%
- Navigation time reduced by 30%

### Technical
- Warning calculation < 200ms
- Card render time < 100ms
- API response time < 500ms

---

## ROLLOUT PLAN

### Phase 1: Internal Testing
- Deploy to staging
- Internal team testing
- Gather feedback

### Phase 2: Beta Release
- Release to 10% of users
- Monitor metrics
- Collect feedback

### Phase 3: Full Release
- Gradual rollout (25%, 50%, 100%)
- Monitor for issues
- Document learnings
