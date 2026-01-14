# UX Conditional Logic - Quick Reference

## Device Flow Decision Tree

```
START: Devices Step
│
├─ Question 1: "Do you own the devices for this location?"
│  │
│  ├─ YES
│  │  │
│  │  └─ Question 2: "Do you have Yealink or Polycom phones?"
│  │     │
│  │     ├─ YES
│  │     │  └─ → Show Device Entry Interface
│  │     │     │
│  │     │     └─ For each device:
│  │     │        ├─ Brand (Yealink, Polycom, Other)
│  │     │        ├─ Model (dropdown if Yealink/Polycom, text if Other)
│  │     │        ├─ Device Type (Deskphone, Softphone, Mobile)
│  │     │        ├─ Assignment (User or Extension)
│  │     │        └─ Details (MAC, Serial - optional)
│  │     │
│  │     └─ NO
│  │        └─ → BLOCKER: Force Purchase Flow
│  │           └─ Show: "You need to purchase supported devices"
│  │           └─ Warning Badge: "Devices need to be purchased"
│  │           └─ Cannot proceed until purchase approved
│  │
│  └─ NO
│     │
│     └─ Question 3: "Do you want to buy phones through VoiceStack?"
│        │
│        ├─ YES
│        │  └─ → Show Device Catalog
│        │     └─ Inform: "VoiceStack team will add device details after purchase"
│        │     └─ Warning Badge: "Devices will be provided or purchased"
│        │     └─ No device entry required
│        │
│        └─ NO
│           └─ → Show Manual Device Entry Interface
│              └─ Same validation as owned devices
```

## Device Validation Rules

| Brand | Model Field | Validation | Status |
|-------|-------------|------------|--------|
| Yealink | Dropdown | Supported models only | ✅ Valid |
| Polycom | Dropdown | Supported models only | ✅ Valid |
| Other | Text input | Any text | ⚠️ Unsupported (requires approval) |
| [Any other] | N/A | Not allowed | ❌ Error |

## FAX Logic Flow

```
Question: "Do you use FAX?"
│
├─ YES
│  └─ → Skip VoiceStack fax question
│  └─ → No follow-up needed
│
└─ NO
   └─ → Show follow-up question:
      └─ "Do you want to use fax in VoiceStack?"
         ├─ YES → Track preference
         └─ NO → No fax in VoiceStack
```

## IVR Section Layout (When Enabled)

```
┌─────────────────────────────────────┐
│ IVR Script (Textarea)               │
│ [Main greeting message]             │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ Global IVR Settings                 │
│ • Retry Attempts                    │
│ • Wait Time                         │
│ • Invalid Selection Script          │
│ • After Retry Routing               │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ [Add IVR Option] Button             │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ IVR Options List                    │
│ ┌─────────────────────────────┐    │
│ │ Option 1                     │    │
│ │ • Script                     │    │
│ │ • Ring Type                  │    │
│ │ • Targets                    │    │
│ └─────────────────────────────┘    │
│ ┌─────────────────────────────┐    │
│ │ Option 2                     │    │
│ │ ...                          │    │
│ └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

## Warning & Blocker States

### Warning States (Yellow Badges - Non-Blocking)

| Warning | Trigger | Display Location | Action |
|---------|---------|------------------|--------|
| Missing Devices | No devices when ownership=Yes | Account card | Navigate to Devices step |
| Incomplete Call Flow | IVR enabled but no options OR no direct routing | Account card | Navigate to Call Flow step |
| Missing MAC Address | Device without MAC | Device card | Edit device |

### Blocker States (Red Badges - Submission Blocking)

| Blocker | Trigger | Display Location | Blocks | Resolution |
|---------|---------|------------------|--------|------------|
| Pending Approvals | Phone purchase approval pending | Account card | Submission | Wait for approval |
| Unsupported Phones | Device with unsupported brand/model | Account card | Submission | Request approval or change device |
| Missing Required Fields | Any required field empty | Review step | Submission | Complete fields |

## Account Card Warning Display

```
┌─────────────────────────────────────────────┐
│ Account Name                    [Product]   │
│                                             │
│ Locations:                                   │
│ ┌───────────────────────────────────────┐ │
│ │ Location 1                    [Status] │ │
│ │ Progress: ████████░░ 80%              │ │
│ │ ⚠️ Missing Devices                     │ │
│ └───────────────────────────────────────┘ │
│                                             │
│ ┌───────────────────────────────────────┐ │
│ │ Location 2                    [Status] │ │
│ │ Progress: ██████░░░░ 60%              │ │
│ │ 🔴 2 Pending Approvals                 │ │
│ │ ⚠️ Unsupported Phones (1)             │ │
│ └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## Step-by-Step Question Flow

### Step 1: Basic Details
1. POC Name *
2. POC Email *
3. POC Phone *
4. Preferred Contact Medium
5. Practice Management Software

### Step 2: Phone System
1. Phone System Type * (Traditional/VoIP)
2. [If Traditional] System Details
3. [If VoIP] VoIP Provider
4. Call Forwarding Supported? (auto-filled if known)
5. Do you use FAX? * (Yes/No)
6. [If No] Do you want to use fax in VoiceStack?

### Step 3: Devices
1. Do you own the devices? * (Yes/No)
2. [If Yes] Do you have Yealink or Polycom phones? * (Yes/No)
3. [If Yes to #2] Device Entry:
   - Brand * (Yealink/Polycom/Other)
   - Model * (dropdown or text)
   - Device Type * (Deskphone/Softphone/Mobile - multi-select)
   - Assignment Type * (User/Extension)
   - [If User] User details
   - [If Extension] Extension number
   - MAC Address (optional)
   - Serial Number (optional)
4. [If No to #1] Do you want to buy phones through VoiceStack? * (Yes/No)
5. [If Yes to #4] Show catalog (no entry needed)
6. [If No to #4] Manual device entry (same as #3)

### Step 4: Working Hours
- For each day: Is open? Open Time, Close Time
- Copy to Other Days button

### Step 5: Call Flow
1. Greeting Message
2. Use IVR? (checkbox)
3. [If IVR] IVR Script → Global Settings → Options
4. [If No IVR] Direct Routing → Targets → Voicemail

### Step 6: Review
- Summary of all answers
- Warnings and blockers highlighted
- Submit button (disabled if blockers)
