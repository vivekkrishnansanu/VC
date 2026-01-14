# Account Card UX Specification

## Overview

This document defines the revised post-login experience with account cards that display warnings, blockers, and enable card-level navigation.

---

## POST-LOGIN EXPERIENCE

### Current State Issues
- **Customer Dashboard**: Shows location cards (not account cards)
- **Implementation Lead Dashboard**: Shows accounts in table format (not cards)
- **Navigation**: Only buttons are clickable, not entire cards
- **Warnings/Blockers**: Not visible at account level

### Target State
- **Both Roles**: Show account cards after login
- **Card Navigation**: Entire card is clickable
- **Visual Warnings**: Clear badges for warnings and blockers
- **Progress Visibility**: Onboarding progress per location visible on card

---

## ACCOUNT CARD STRUCTURE

### Card Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Account Name                    [Product Type Badge]         │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Locations: 3 total                                     │  │
│ │ Progress: ████████░░ 2/3 completed                   │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ Location Breakdown:                                          │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ 📍 Location 1                    [Status Badge]       │  │
│ │    Progress: ████████░░ 80%                           │  │
│ │    🔴 2 Pending Approvals                             │  │
│ │    ⚠️ Unsupported Phones (1)                          │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ 📍 Location 2                    [Status Badge]       │  │
│ │    Progress: ██████░░░░ 60%                          │  │
│ │    ⚠️ Missing Devices                                  │  │
│ │    ⚠️ Incomplete Call Flow                             │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ 📍 Location 3                    [Status Badge]       │  │
│ │    Progress: ██████████ 100%                         │  │
│ │    ✅ Complete                                         │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ Account-Level Warnings:                                      │
│ 🔴 2 Pending Approvals (blocks submission)                  │
│ ⚠️ 1 Location with missing devices                          │
│                                                              │
│ [Card is fully clickable - hover effect on entire card]    │
└─────────────────────────────────────────────────────────────┘
```

### Card Components

#### 1. Header Section
- **Account Name** (large, bold)
- **Product Type Badge** (top right, outline variant)
- **Total Locations Count** (small text below name)

#### 2. Progress Summary
- **Overall Progress Bar**: Visual progress across all locations
- **Progress Text**: "X/Y locations completed"
- **Progress Percentage**: Calculated as (completed locations / total locations) × 100

#### 3. Location List (Expandable/Collapsible)
Each location shows:
- **Location Name** with map pin icon
- **Status Badge**: Current onboarding status
- **Progress Bar**: Individual location progress (steps completed)
- **Warning Badges** (if any):
  - 🔴 **Pending Approvals** (red, with count)
  - ⚠️ **Unsupported Phones** (yellow, with count)
  - ⚠️ **Missing Devices** (yellow)
  - ⚠️ **Incomplete Call Flow** (yellow)

#### 4. Account-Level Summary
- **Blocker Badges** (red, account-wide):
  - Total pending approvals across all locations
  - Any location with blockers
- **Warning Badges** (yellow, account-wide):
  - Locations with warnings
  - Summary counts

#### 5. Interaction
- **Entire Card**: Clickable (cursor: pointer on hover)
- **Hover State**: Card border highlight, subtle shadow
- **Click Action**: Navigate to account detail view
- **No Separate Button**: Card itself is the primary CTA

---

## WARNING & BLOCKER DEFINITIONS

### Blocker Badges (Red - Submission Blocking)

#### 1. Pending Approvals
- **Trigger**: Any location has pending phone purchase approvals
- **Display**: 🔴 "X Pending Approvals" (red badge)
- **Location**: On location card AND account card summary
- **Blocks**: Submission for that location
- **Action**: Click to view approval details

#### 2. Unsupported Phones
- **Trigger**: Location has devices with unsupported brand/model
- **Display**: ⚠️ "Unsupported Phones (X)" (yellow badge)
- **Location**: On location card
- **Blocks**: Submission until approved or changed
- **Action**: Click to navigate to Devices step

### Warning Badges (Yellow - Non-Blocking)

#### 1. Missing Devices
- **Trigger**: 
  - Device ownership = "Yes"
  - AND no devices added
  - OR device ownership = "Yes" + has Yealink/Polycom = "Yes" but no devices
- **Display**: ⚠️ "Missing Devices" (yellow badge)
- **Location**: On location card
- **Blocks**: No (warning only)
- **Action**: Click to navigate to Devices step

#### 2. Incomplete Call Flow
- **Trigger**:
  - IVR enabled but no IVR options added
  - OR IVR disabled but no direct routing targets
  - OR missing voicemail script when required
- **Display**: ⚠️ "Incomplete Call Flow" (yellow badge)
- **Location**: On location card
- **Blocks**: No (warning only)
- **Action**: Click to navigate to Call Flow step

#### 3. Missing MAC Address
- **Trigger**: Device added without MAC address
- **Display**: ⚠️ "Missing MAC Address" (yellow badge on device card, not account card)
- **Location**: Device card only
- **Blocks**: No (warning only)
- **Action**: Edit device to add MAC

---

## CALCULATION LOGIC

### Account-Level Warnings/Blockers

```typescript
interface AccountWarnings {
  blockers: {
    pendingApprovals: number;  // Count across all locations
    unsupportedPhones: number; // Count of locations with unsupported phones
  };
  warnings: {
    missingDevices: number;     // Count of locations missing devices
    incompleteCallFlow: number; // Count of locations with incomplete call flow
  };
}

function calculateAccountWarnings(accountId: string): AccountWarnings {
  const locations = getLocationsByAccount(accountId);
  const warnings = {
    blockers: {
      pendingApprovals: 0,
      unsupportedPhones: 0,
    },
    warnings: {
      missingDevices: 0,
      incompleteCallFlow: 0,
    },
  };

  for (const location of locations) {
    // Check pending approvals
    const pendingApprovals = getPendingApprovals(location.id);
    if (pendingApprovals.length > 0) {
      warnings.blockers.pendingApprovals += pendingApprovals.length;
    }

    // Check unsupported phones
    const phones = getPhonesByLocation(location.id);
    const unsupportedPhones = phones.filter(p => p.isUnsupported);
    if (unsupportedPhones.length > 0) {
      warnings.blockers.unsupportedPhones += 1; // Count locations, not phones
    }

    // Check missing devices
    const onboarding = getOnboardingByLocation(location.id);
    if (onboarding.deviceOwnership === 'YES' && 
        onboarding.hasYealinkPolycom === 'YES' && 
        phones.length === 0) {
      warnings.warnings.missingDevices += 1;
    }

    // Check incomplete call flow
    if (isCallFlowIncomplete(location.id)) {
      warnings.warnings.incompleteCallFlow += 1;
    }
  }

  return warnings;
}
```

### Location-Level Warnings/Blockers

```typescript
interface LocationWarnings {
  blockers: {
    pendingApprovals: number;
    hasUnsupportedPhones: boolean;
  };
  warnings: {
    missingDevices: boolean;
    incompleteCallFlow: boolean;
  };
}

function calculateLocationWarnings(locationId: string): LocationWarnings {
  const onboarding = getOnboardingByLocation(locationId);
  const phones = getPhonesByLocation(locationId);
  const pendingApprovals = getPendingApprovals(locationId);
  const unsupportedPhones = phones.filter(p => p.isUnsupported);

  return {
    blockers: {
      pendingApprovals: pendingApprovals.length,
      hasUnsupportedPhones: unsupportedPhones.length > 0,
    },
    warnings: {
      missingDevices: checkMissingDevices(onboarding, phones),
      incompleteCallFlow: checkIncompleteCallFlow(onboarding),
    },
  };
}
```

---

## NAVIGATION BEHAVIOR

### Card Click Behavior

**Customer View:**
1. **Click Account Card** → Navigate to `/customer/account/[accountId]`
   - Shows account detail view
   - Lists all locations under this account
   - Each location card is also clickable
   - Click location → Navigate to onboarding wizard

**Implementation Lead View:**
1. **Click Account Card** → Navigate to `/implementation-lead/accounts/[accountId]`
   - Shows account detail view
   - Lists all locations
   - Shows account-level actions (edit, add location, etc.)
   - Click location → Navigate to onboarding wizard (with override capability)

### Hover States

- **Card Hover**: 
  - Border color: primary (subtle)
  - Shadow: slight elevation
  - Cursor: pointer
  - Transition: smooth (200ms)

- **Location Item Hover**:
  - Background: subtle highlight
  - Cursor: pointer (if clickable)

### Click Targets

- **Primary**: Entire card (excluding nested interactive elements)
- **Secondary**: Location items within card (if expandable)
- **Tertiary**: Warning badges (if they have specific actions)

---

## VISUAL DESIGN SPECIFICATIONS

### Card Styling

```css
.account-card {
  /* Base */
  border: 1px solid border-color;
  border-radius: 8px;
  padding: 24px;
  background: background-color;
  cursor: pointer;
  transition: all 200ms ease;

  /* Hover */
  &:hover {
    border-color: primary-color;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  /* Active/Selected */
  &:active {
    transform: scale(0.98);
  }
}
```

### Badge Specifications

#### Blocker Badges (Red)
- **Color**: `destructive` variant (red)
- **Icon**: AlertCircle
- **Text**: Bold
- **Size**: Small (sm)
- **Position**: Top right of location item or account summary

#### Warning Badges (Yellow)
- **Color**: `warning` variant (yellow/amber)
- **Icon**: AlertTriangle
- **Text**: Medium weight
- **Size**: Small (sm)
- **Position**: Below status badge on location item

#### Status Badges
- **Color**: Based on status (outline, secondary, default, destructive)
- **Icon**: Status-specific icon
- **Text**: Status name
- **Size**: Small (sm)

### Progress Bar

- **Height**: 8px
- **Background**: Secondary color (light)
- **Fill**: Primary color
- **Border Radius**: Full (rounded)
- **Animation**: Smooth transition on progress change

---

## INFORMATION ARCHITECTURE

### Card Hierarchy

1. **Account Level** (Top)
   - Account name
   - Product type
   - Overall progress

2. **Location Level** (Middle)
   - Location name
   - Location status
   - Location progress
   - Location warnings/blockers

3. **Summary Level** (Bottom)
   - Account-wide blockers
   - Account-wide warnings

### Data Priority

**Always Visible:**
- Account name
- Total locations
- Overall progress
- Location count with blockers/warnings

**Expandable/Collapsible:**
- Individual location details
- Full location list (if > 3 locations)

**On Hover:**
- Additional context tooltips
- Quick action hints

---

## RESPONSIVE BEHAVIOR

### Mobile (< 640px)
- **Card Layout**: Full width, stacked
- **Location List**: Collapsed by default, expandable
- **Badges**: Stacked vertically
- **Progress Bars**: Full width

### Tablet (640px - 1024px)
- **Card Layout**: 2 columns (if multiple accounts)
- **Location List**: Show 2-3 locations, "View All" link
- **Badges**: Horizontal layout where possible

### Desktop (> 1024px)
- **Card Layout**: 3 columns (if multiple accounts)
- **Location List**: Show all locations (up to 5, then scroll)
- **Badges**: Horizontal layout
- **Hover Effects**: Full interactive states

---

## IMPLEMENTATION CHECKLIST

### Data Requirements
- [ ] Calculate account-level warnings/blockers
- [ ] Calculate location-level warnings/blockers
- [ ] Aggregate progress across locations
- [ ] Fetch pending approvals per location
- [ ] Check device validation status
- [ ] Check call flow completion status

### UI Components
- [ ] Account card component
- [ ] Location item component (within card)
- [ ] Warning badge component
- [ ] Blocker badge component
- [ ] Progress bar component
- [ ] Clickable card wrapper

### Navigation
- [ ] Card click handler
- [ ] Route to account detail view
- [ ] Route to location onboarding
- [ ] Deep linking from badges to specific steps

### Visual States
- [ ] Card hover state
- [ ] Card active/clicked state
- [ ] Badge hover tooltips
- [ ] Loading state (skeleton)
- [ ] Empty state (no accounts)

---

## USER FLOWS

### Customer Flow

```
Login
  ↓
Account Dashboard (Account Cards)
  ↓
Click Account Card
  ↓
Account Detail View
  ├─ View all locations
  ├─ See account-level warnings
  └─ Click Location
     ↓
     Onboarding Wizard (resume at current step)
```

### Implementation Lead Flow

```
Login
  ↓
Account Dashboard (All Account Cards)
  ├─ See all accounts
  ├─ See account-level warnings across accounts
  └─ Click Account Card
     ↓
     Account Detail View
     ├─ View all locations
     ├─ Account actions (edit, add location)
     ├─ See account-level warnings
     └─ Click Location
        ↓
        Onboarding Wizard (with override capability)
```

---

## EDGE CASES

### No Accounts
- Show empty state: "No accounts found. Contact your Implementation Lead."
- Show "Create Account" button (Implementation Lead only)

### No Locations
- Show: "No locations yet. Add your first location."
- Show "Add Location" button

### All Locations Complete
- Show success state: "All locations completed! ✅"
- Green accent on card
- No warnings/blockers shown

### Multiple Blockers
- Show all blocker badges
- Prioritize: Pending Approvals > Unsupported Phones
- Group warnings together

### Loading State
- Show skeleton cards
- Show loading spinner
- Disable interactions during load

---

## ACCESSIBILITY

### Keyboard Navigation
- **Tab**: Navigate between account cards
- **Enter/Space**: Activate card (navigate)
- **Arrow Keys**: Navigate within card (if expandable)

### Screen Readers
- **Card Role**: `button` or `link`
- **Aria Label**: "Account [name], [X] locations, [progress]% complete"
- **Badge Announcements**: "Warning: [type], [count]"
- **Status Announcements**: "Status: [status name]"

### Visual Indicators
- **Focus Ring**: Clear focus indicator on keyboard navigation
- **Color Contrast**: WCAG AA compliant for all text/badges
- **Icon + Text**: All badges have both icon and text

---

## METRICS TO TRACK

### User Engagement
- Card click rate
- Navigation from cards to onboarding
- Time to identify blockers
- Warning badge click-through rate

### Performance
- Card load time
- Warning calculation time
- Navigation response time

### Business Metrics
- Accounts with blockers (count)
- Average time to resolve blockers
- Locations stuck in pending approval

---

## NEXT STEPS

1. **Review & Approve**: Stakeholder review of this specification
2. **Wireframes**: Create detailed wireframes for each card state
3. **Component Design**: Design system components for cards and badges
4. **Data Layer**: Implement warning/blocker calculation logic
5. **UI Implementation**: Build account card components
6. **Testing**: Test all warning/blocker scenarios
7. **User Testing**: Validate with internal team
