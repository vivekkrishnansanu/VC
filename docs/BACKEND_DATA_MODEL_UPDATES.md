# Backend Data Model Updates

## Summary
This document outlines all backend data model and business rule changes to support the new UX decisions for Fax, Devices, and IVR restructuring.

---

## Schema Changes (Prisma)

### New Enums

1. **DeviceType**
   ```prisma
   enum DeviceType {
     DESKPHONE
     SOFTPHONE
     MOBILE
   }
   ```

2. **DeviceOwnership**
   ```prisma
   enum DeviceOwnership {
     OWNED
     NOT_OWNED
   }
   ```

### Updated Enums

1. **PhoneAssignmentType**
   - `COMMON` marked as deprecated (treated as `ASSIGNED_TO_EXTENSION` in new UX)
   - Only `ASSIGNED_TO_USER` and `ASSIGNED_TO_EXTENSION` used in new flow

### Account Model Updates

- Added `warningCount: Int @default(0)` - Count of locations with warnings
- Added `blockerCount: Int @default(0)` - Count of locations with blockers
- Indexed for performance

### LocationOnboarding Model Updates

**New Fields:**
- `deviceOwnership: DeviceOwnership?` - OWNED | NOT_OWNED (asked once per location)
- `hasYealinkOrPolycom: Boolean?` - If deviceOwnership = OWNED
- `buyPhonesThroughVoiceStack: Boolean?` - Purchase decision
- `deviceCatalogSelections: Json?` - Array of catalog selections when buying through VoiceStack

**IVR Global Fields (NEW):**
- `ivrScript: String?` - Global IVR script (shown at top)
- `ivrRetryAttempts: Int?` - Global retry attempts
- `ivrWaitTime: Int?` - Global wait time (seconds)
- `ivrInvalidSelectionScript: String?` - Global invalid selection script
- `ivrAfterRetriesTarget: String?` - Global after retry routing

**Legacy Fields (kept for backward compatibility):**
- `totalDevices: Int?` - Deprecated, use device count from Phone table
- `assignmentStrategy: PhoneAssignmentType?` - Deprecated, assignment now per-device

### Phone Model Updates

**New Fields:**
- `deviceTypes: DeviceType[]` - Multi-select: DESKPHONE, SOFTPHONE, MOBILE
- `hasWarnings: Boolean @default(false)` - Warning state flag
- `warningReason: String?` - Reason for warning state

**Field Rules:**
- `model: String` - Free text if `brand = OTHER`
- `isUnsupported: Boolean` - Set to `true` if brand is NOT Yealink or Polycom

### CallFlow Model Updates

**New Global IVR Fields:**
- `ivrScript: String?` - Global IVR script
- `ivrRetryAttempts: Int?` - Global retry attempts
- `ivrWaitTime: Int?` - Global wait time
- `ivrInvalidSelectionScript: String?` - Global invalid selection script
- `ivrAfterRetriesTarget: String?` - Global after retry routing

**Note:** These are also stored at `LocationOnboarding` level for easier access.

### IVROption Model Updates

**Simplified Structure:**
- Removed: `retryAttempts`, `waitTime`, `invalidSelectionScript`, `afterRetriesTarget`, `voicemailScript` (moved to global)
- Kept: `optionNumber` (DTMF digit), `label` (optional), `ringType`, `targets`

---

## TypeScript Type Updates

### New Types

1. **DeviceOwnership Enum**
   ```typescript
   export enum DeviceOwnership {
     OWNED = 'OWNED',
     NOT_OWNED = 'NOT_OWNED',
   }
   ```

2. **DeviceType Enum** (already added in previous update)

### Updated Interfaces

1. **LocationOnboarding**
   - Added `deviceOwnership?: DeviceOwnership`
   - Added `hasYealinkOrPolycom?: boolean`
   - Added `buyPhonesThroughVoiceStack?: boolean`
   - Added `deviceCatalogSelections?: Array<{...}>`
   - Added IVR global fields
   - Updated comments for deprecated fields

2. **Phone**
   - Added `deviceTypes?: DeviceType[]`
   - Added `hasWarnings?: boolean`
   - Added `warningReason?: string`
   - Updated `model` comment: "Free text if brand = OTHER"

3. **IVROption**
   - Removed global IVR fields (moved to LocationOnboarding)
   - Added `label?: string` (replaces script in new UX)
   - Marked old fields as deprecated

4. **Account**
   - Added `warningCount?: number`
   - Added `blockerCount?: number`

---

## Business Rules & Validation

### Device Validation Rules

1. **Brand Validation**
   - Only **Yealink** and **Polycom** are supported brands
   - If brand is NOT Yealink or Polycom:
     - Mark device as `isUnsupported = true`
     - Skip all other validations
     - Block submission

2. **Model Field Rules**
   - If `brand = OTHER`: Model field is **free text**
   - If `brand = YEALINK` or `POLYCOM`: Validate model against supported models list

3. **Device Warning Logic**
   - `hasWarnings = true` if:
     - Missing device type(s)
     - Missing assignment target (user or extension)
   - `warningReason` stores concatenated warning messages

### Device Ownership Flow

1. **Question 1**: "Do you own the devices?" → `deviceOwnership: OWNED | NOT_OWNED`

2. **If OWNED**:
   - **Question 2**: "Do you have Yealink or Polycom phones?" → `hasYealinkOrPolycom: boolean`
   - **If YES**: Allow device entry
   - **If NO**: Force purchase decision

3. **If NOT_OWNED**:
   - Skip device entry
   - Show warning: "Devices will be provided or purchased"
   - Force purchase decision

4. **Purchase Decision** (shown when required):
   - **Question 3**: "Do you want to buy phones through VoiceStack?" → `buyPhonesThroughVoiceStack: boolean`
   - **If YES**: Show catalog, create approval request, disable device editing
   - **If NO**: Allow manual device entry

### Purchase Flow Triggers

**Force purchase decision when:**
- `deviceOwnership = NOT_OWNED`, OR
- `deviceOwnership = OWNED` AND `hasYealinkOrPolycom = false`, OR
- Unsupported devices exist

**When `buyPhonesThroughVoiceStack = true`:**
- Disable device editing
- Create approval request via `ApprovalService.requestCatalogPurchase()`
- Store selections in `deviceCatalogSelections`

### FAX Logic

1. **Explicit Yes/No**: `usesFax: boolean` (required, no undefined)
2. **If Yes**: Collect `faxNumber` (required)
3. **If No**: Show follow-up → `wantsFaxInVoiceStack: boolean` (required)

### IVR Structure

**Global Fields** (stored at `LocationOnboarding` level):
- `ivrScript` - Required when IVR enabled
- `ivrRetryAttempts` - Global retry attempts
- `ivrWaitTime` - Global wait time
- `ivrInvalidSelectionScript` - Global invalid selection script
- `ivrAfterRetriesTarget` - Global after retry routing

**Option Fields** (simplified):
- `optionNumber` - DTMF digit
- `label` - Optional label
- `ringType` - "users" or "extensions"
- `targets` - Routing targets only

**Validation Rules:**
- IVR script required when IVR enabled
- Global retry/wait time must be >= 0
- After retry routing required if retries > 0
- Each option must have at least one routing target

---

## Service Updates

### DeviceValidationService

**New Methods:**
- `isSupportedBrand(brand: PhoneBrand): boolean` - Check if brand is Yealink or Polycom
- `isModelFreeText(brand: PhoneBrand): boolean` - Check if model should be free text

**Updated Methods:**
- `validateDevice()` - Now checks brand first, marks unsupported immediately if not Yealink/Polycom
- `validateAndMarkDevice()` - Sets `hasWarnings` and `warningReason` based on validation

### ValidationService

**Updated Methods:**
- `validateCallFlow()` - Validates new IVR structure (global fields at onboarding level)
- `validateOnboardingForSubmission()` - Includes:
  - Device ownership validation
  - Purchase flow validation
  - Catalog selection validation
  - Device-level validation (types, assignments, unsupported)

### ApprovalService

**New Methods:**
- `requestCatalogPurchase()` - Request approval for catalog selections
- `shouldForcePurchaseFlow()` - Determine if purchase decision should be forced

**Updated Methods:**
- `requestPhonePurchase()` - Still works for individual unsupported devices

### AccountWarningsService

**Updated Methods:**
- `isMissingDevices()` - Updated logic based on device ownership and purchase flow
- Handles catalog selections vs manual devices

### SmartSkipService

**New Methods:**
- `normalizeAssignmentType()` - Convert COMMON to ASSIGNED_TO_EXTENSION

**Updated Methods:**
- `shouldSkipUserDetails()` - Updated comments for COMMON deprecation

---

## Backward Compatibility

### Migration Helpers

Created `lib/services/migration-helpers.ts` with utilities:

1. **normalizeAssignmentType()** - Converts COMMON to ASSIGNED_TO_EXTENSION
2. **migrateDeviceOwnership()** - Converts boolean `ownsDevices` to `DeviceOwnership` enum
3. **migrateIVRGlobalFields()** - Migrates IVR fields from options to global level
4. **ensureDeviceFields()** - Ensures devices have new required fields

### Legacy Field Support

- `totalDevices` - Still supported, but deprecated
- `assignmentStrategy` - Still supported, but deprecated (assignment now per-device)
- `COMMON` assignment type - Still in enum, automatically normalized to `ASSIGNED_TO_EXTENSION`
- Old IVR option fields - Deprecated but kept for backward compatibility

### Data Migration Path

1. **Existing data with `ownsDevices: boolean`**:
   - Use `MigrationHelpers.migrateDeviceOwnership()` to convert to enum

2. **Existing data with `COMMON` assignment**:
   - Use `MigrationHelpers.normalizeAssignmentType()` to convert

3. **Existing IVR options with individual retry/wait**:
   - Use `MigrationHelpers.migrateIVRGlobalFields()` to extract to global level

---

## API Contract Changes

### No Breaking Changes

All changes are **additive** or **deprecation-only**:
- New fields are optional
- Old fields remain functional
- Services handle both old and new data formats

### New Endpoints (Future)

- `/api/accounts/[accountId]/warnings` - Already implemented
- `/api/approvals/catalog` - For catalog purchase approvals (can use existing `/api/approvals`)

---

## Testing Checklist

- [x] Schema compiles without errors
- [x] TypeScript types compile without errors
- [x] Validation service handles new device ownership flow
- [x] Device validation enforces brand rules
- [x] IVR validation checks global fields
- [x] Approval service triggers for catalog purchases
- [x] Account warnings aggregate correctly
- [x] Backward compatibility helpers work
- [ ] Integration tests for new flow
- [ ] Migration script for existing data

---

## Next Steps

1. **Database Migration**: Run Prisma migration to update schema
2. **Data Migration**: Use migration helpers to convert existing data
3. **Frontend Integration**: Update UI components to use new fields
4. **Testing**: Comprehensive testing of new validation rules
5. **Documentation**: Update API documentation with new fields

---

## Files Modified

### Schema & Types
- `prisma/schema.prisma`
- `lib/mock-data/types.ts`
- `types/index.ts`
- `lib/mock-data/onboarding.ts`

### Services
- `lib/services/device-validation.service.ts`
- `lib/services/validation.service.ts`
- `lib/services/approval.service.ts`
- `lib/services/account-warnings.service.ts`
- `lib/services/smart-skip.service.ts`
- `lib/services/onboarding-session.service.ts`
- `lib/services/migration-helpers.ts` (NEW)

### Exports
- `lib/services/index.ts`
