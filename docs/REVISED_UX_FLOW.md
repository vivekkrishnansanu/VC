# Revised UX Flow - Implementation Automation Platform

## Overview

This document defines the revised user experience and workflow logic based on internal team feedback. All changes prioritize clarity, progressive disclosure, and clear warning states.

---

## POST-LOGIN EXPERIENCE

### Customer View

**After Login:**
- User lands on **Account Dashboard**
- Shows **Account Cards** (one per account the customer has access to)

### Account Card Structure

Each account card displays:

1. **Account Header**
   - Account Name
   - Product Type badge
   - Total Locations count

2. **Location Progress Section**
   - List of all locations under this account
   - For each location:
     - Location name
     - Onboarding status badge
     - Progress indicator (X/Y locations completed)
     - **Warning badges** (if any):
       - 🔴 **Pending Approvals** (red badge with count)
       - ⚠️ **Missing Devices** (yellow badge)
       - ⚠️ **Unsupported Phones** (yellow badge with count)
       - ⚠️ **Incomplete Call Flow** (yellow badge)

3. **Card Interaction**
   - **Entire card is clickable** → Navigate to account detail view
   - Account detail view shows:
     - All locations with full details
     - Click location → Navigate to onboarding wizard for that location

### Implementation Lead View

**After Login:**
- Shows **Account Cards** for all accounts
- Same card structure as customer view
- Additional actions:
   - "Create Account" button (top right)
   - "View All Approvals" button (shows pending approvals across all accounts)

---

## ONBOARDING WIZARD - REVISED FLOW

### Step 1: Basic Details

**Questions:**
1. POC Name *
2. POC Email *
3. POC Phone *
4. Preferred Contact Medium
5. Practice Management Software

**Actions:**
- "Copy from Previous Location" button (if other locations exist)
- Next button

**Validation:**
- Required fields must be filled
- Email format validation

---

### Step 2: Phone System

**Questions:**
1. Phone System Type *
   - Traditional
   - VoIP
2. If Traditional → System Details (text field)
3. If VoIP → VoIP Provider (dropdown + "Other")
4. Call Forwarding Supported? (auto-filled if known from master data)
5. **FAX Section:**
   - Do you use FAX? *
     - **Yes**
     - **No**
   - If "No" → Show follow-up:
     - "Do you want to use fax in VoiceStack?" (Yes/No)

**Conditional Logic:**
- Call forwarding question skipped if master data has answer
- FAX follow-up only shown if "Do you use FAX?" = No

**Next Button** → Proceed to Step 3

---

### Step 3: Devices (MAJOR RESTRUCTURE)

#### 3.1 Device Ownership (Location-Level Question)

**Question:**
- "Do you own the devices for this location?" *
  - **Yes**
  - **No**

#### 3.2 If "Yes" (Devices Owned)

**Question:**
- "Do you have Yealink or Polycom phones?" *
  - **Yes** → Proceed to device entry
  - **No** → Force purchase flow

**If "Yes" (Has Yealink/Polycom):**
- Show device entry interface
- Each device is a **card** with:
  - Edit button
  - Warning state indicator
  - Validation state indicator

**If "No" (Doesn't have Yealink/Polycom):**
- Show message: "You need to purchase supported devices"
- Show "Request Purchase" button
- Flag location with warning: "Devices need to be purchased"
- Do NOT allow proceeding until purchase approved

#### 3.3 If "No" (Devices Not Owned)

**Question:**
- "Do you want to buy phones through VoiceStack?" *
  - **Yes** → Show device catalog
    - Inform: "VoiceStack team will add device details after purchase"
    - Flag: "Devices will be provided or purchased"
  - **No** → Allow adding devices manually
    - Show device entry interface

#### 3.4 Device Entry (Per Device Card)

**Each Device Card Contains:**

1. **Device Information**
   - Brand * (dropdown: Yealink, Polycom, Other)
   - Model * (dropdown if Yealink/Polycom, text field if Other)
   - Device Type * (multi-select):
     - Deskphone
     - Softphone
     - Mobile

2. **Assignment**
   - Assignment Type * (only two options):
     - Assign to User
     - Assign to Extension
   - If "Assign to User":
     - User First Name *
     - User Last Name *
     - User Email *
   - If "Assign to Extension":
     - Extension Number *

3. **Device Details** (optional)
   - MAC Address
   - Serial Number

4. **Card States:**
   - **Valid** (green border)
   - **Warning** (yellow border) - e.g., missing MAC address
   - **Error** (red border) - e.g., unsupported brand/model
   - **Edit Button** (always visible)

**Validation Rules:**
- If Brand = "Other" → Model is text field, device marked as unsupported
- If Brand ≠ Yealink AND Brand ≠ Polycom → Device marked as unsupported
- Unsupported devices trigger approval workflow
- Warning shown: "This device requires approval"

**Actions:**
- "Add Device" button (adds new device card)
- "Remove" button on each card
- "Next" button (validates all devices)

---

### Step 4: Working Hours

**Questions:**
- For each day of week:
  - Is location open? (checkbox)
  - If open:
    - Open Time *
    - Close Time *
  - "Copy to Other Days" button

**Validation:**
- At least one day must be open
- Time format validation
- No overlapping times (if multiple shifts per day in future)

**Next Button** → Proceed to Step 5

---

### Step 5: Call Flow (RESTRUCTURED)

#### 5.1 Greeting Message

**Question:**
- Greeting Message (textarea)

#### 5.2 IVR Configuration

**Question:**
- "Use IVR (Interactive Voice Response)?" (checkbox)

**If IVR = Enabled:**

**Layout (Top to Bottom):**

1. **IVR Script** (at top)
   - Textarea for main IVR greeting script
   - Placeholder: "Thank you for calling. Please listen to the following options..."

2. **Global IVR Settings** (below script, above options)
   - Retry Attempts * (number input, default: 0)
   - Wait Time * (seconds, number input)
   - Invalid Selection Script (textarea)
   - After Retry Routing * (dropdown: "voicemail" or specific user/extension)

3. **"Add IVR Option" Button** (below global settings)

4. **IVR Options List** (below button)
   - Each option is a card showing:
     - Option Number (auto-assigned: 1, 2, 3...)
     - Option Script * (textarea)
     - Ring Type * (dropdown: "Users" or "Extensions")
     - Targets * (dynamic list)
       - Add Target button
       - Each target: User dropdown OR Extension input
     - Remove Option button

**Validation:**
- At least one IVR option required if IVR enabled
- Each option must have at least one target
- Script required for each option

**If IVR = Disabled:**

**Direct Routing:**
- Ring Type * (dropdown: "Users" or "Extensions")
- Targets * (dynamic list)
  - Add Target button
  - Each target: User dropdown OR Extension input
- Voicemail Script (textarea, recommended)

**Validation:**
- At least one routing target required
- Voicemail script recommended

**Next Button** → Proceed to Step 6

**Future Note:**
- Phase 2 will include drag-and-drop IVR flowchart UI
- Current implementation uses structured form layout

---

### Step 6: Review & Submit

**Display:**
- Summary of all answers
- Warning section highlighting:
  - Pending approvals (blocks submission)
  - Missing required fields
  - Unsupported devices (blocks submission)
  - Incomplete call flow

**Actions:**
- "Edit" links next to each section (navigate back to that step)
- "Submit" button (disabled if blockers exist)

**Submission Blockers:**
- Pending approvals
- Unsupported devices without approval
- Missing required fields
- Incomplete call flow

**After Submit:**
- Onboarding locked
- Status → PENDING_APPROVAL
- Show confirmation message

---

## WARNING STATES & BLOCKERS

### Warning Badges (Non-Blocking)

1. **Missing Devices**
   - Trigger: No devices added when ownership = Yes
   - Display: Yellow badge on account card
   - Action: Navigate to Devices step

2. **Incomplete Call Flow**
   - Trigger: IVR enabled but no options, or no direct routing targets
   - Display: Yellow badge on account card
   - Action: Navigate to Call Flow step

3. **Missing MAC Address**
   - Trigger: Device added without MAC address
   - Display: Yellow warning on device card
   - Action: Edit device to add MAC

### Blocker Badges (Submission Blocking)

1. **Pending Approvals**
   - Trigger: Phone purchase approval pending
   - Display: Red badge with count on account card
   - Blocks: Submission
   - Action: Wait for approval or navigate to approvals

2. **Unsupported Phones**
   - Trigger: Device with unsupported brand/model
   - Display: Red badge with count on account card
   - Blocks: Submission until approved
   - Action: Request approval or change device

3. **Missing Required Fields**
   - Trigger: Any required field not filled
   - Display: Red error on Review step
   - Blocks: Submission
   - Action: Complete required fields

---

## CONDITIONAL LOGIC SUMMARY

### Device Flow Logic Tree

```
Do you own the devices?
├─ YES
│  ├─ Do you have Yealink or Polycom phones?
│  │  ├─ YES → Device entry interface
│  │  └─ NO → Force purchase flow (blocker)
│  └─ [Device Entry]
│     ├─ Brand = Yealink/Polycom → Supported
│     ├─ Brand = Other → Unsupported (text model field)
│     └─ Brand ≠ Yealink/Polycom → Unsupported (approval needed)
└─ NO
   ├─ Do you want to buy phones through VoiceStack?
   │  ├─ YES → Device catalog (VoiceStack adds details)
   │  └─ NO → Manual device entry
   └─ [Manual Entry] → Same validation as owned devices
```

### FAX Logic

```
Do you use FAX?
├─ YES → Skip VoiceStack fax question
└─ NO → Show: "Do you want to use fax in VoiceStack?"
   ├─ YES → Track preference
   └─ NO → No fax in VoiceStack
```

### IVR Logic

```
Use IVR?
├─ YES
│  ├─ Show IVR Script (top)
│  ├─ Show Global IVR Settings
│  │  ├─ Retry Attempts
│  │  ├─ Wait Time
│  │  ├─ Invalid Selection Script
│  │  └─ After Retry Routing
│  ├─ Show "Add IVR Option" button
│  └─ Show IVR Options List
└─ NO
   ├─ Show Direct Routing
   │  ├─ Ring Type
   │  ├─ Targets
   │  └─ Voicemail Script
   └─ Hide all IVR-specific fields
```

---

## NAVIGATION FLOW

### Customer Journey

1. **Login** → Account Dashboard
2. **Click Account Card** → Account Detail View
3. **Click Location** → Onboarding Wizard (resumes at current step)
4. **Complete Steps** → Review & Submit
5. **Submit** → Pending Approval (locked)

### Implementation Lead Journey

1. **Login** → Account Dashboard (all accounts)
2. **Click Account Card** → Account Detail View
3. **View Approvals** → Approval Queue
4. **Approve/Reject** → Updates status, unblocks if approved
5. **Click Location** → Can view/edit (with override if locked)

---

## KEY UX PRINCIPLES

1. **Progressive Disclosure**: Only show relevant questions based on previous answers
2. **Clear Warnings**: Visual indicators (badges, colors) for all warning states
3. **Blocking Clarity**: Red badges/errors clearly indicate what blocks submission
4. **Card-Based Design**: Devices and locations use cards for better visual hierarchy
5. **Clickable Cards**: Entire cards are clickable, not just buttons
6. **Validation States**: Each device card shows its validation state
7. **Contextual Help**: Info icons with explanations where needed

---

## IMPLEMENTATION NOTES

### Removed Features
- Global Assignment Strategy question (moved to per-device)
- "Common Phone" assignment type (treated as "Assign to Extension")
- Device ownership question inside device cards (moved to location level)

### New Features
- Device Type selection (Deskphone, Softphone, Mobile)
- Simplified Assignment Type (only 2 options)
- Restructured IVR layout (script first, global settings, then options)
- Account card warnings and blockers
- Clickable account cards

### Changed Features
- FAX question now explicit Yes/No with follow-up
- Device flow completely restructured with ownership-first logic
- IVR section reorganized for better UX
- Warning states clearly defined and displayed

---

## NEXT STEPS

1. Review this UX flow with stakeholders
2. Create detailed wireframes for each step
3. Define component specifications
4. Implement step-by-step following this flow
5. Test conditional logic thoroughly
6. Validate warning states and blockers
