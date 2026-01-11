# Domain Model Documentation

## Overview

This document describes the complete domain model for the Implementation Automation Platform - a cloud-based system that automates onboarding and implementation for telephony products.

## Core Hierarchy

```
Account
  └── Locations (1 to many)
      └── Onboarding (1 per location)
          ├── Phones (many)
          ├── Working Hours (many)
          └── Call Flow (1)
```

## Entity Relationships

### User & Authentication

**User**
- Represents both Implementation Leads (internal) and Customers (external)
- Role-based access control via `UserRole` enum
- Can be associated with multiple accounts (as Implementation Lead)
- Can be assigned to locations (as Customer)

**Relationships:**
- Many-to-Many with Account (via `AccountImplementationLead`)
- One-to-Many with Location (as customer)
- One-to-Many with Phone (assigned phones)
- One-to-Many with IVR Option Targets
- One-to-Many with Shared Voicemail

### Account

**Account**
- Top-level entity representing a customer account
- Contains account-level metadata (name, product type, total locations)
- For CS VoiceStack: includes `accountId` (future dropdown-based)
- Has one primary POC and multiple additional contacts
- Contains credit information (flexible JSON structure)

**Relationships:**
- One-to-Many with Location
- Many-to-Many with User (Implementation Leads)
- One-to-Many with AccountContact
- One-to-One with CreditInfo

### Location

**Location**
- Represents a physical location within an account
- Contains address information
- Can have one customer assigned
- Has one onboarding process
- Can have multiple phones

**Relationships:**
- Many-to-One with Account
- Many-to-One with User (customer)
- One-to-One with LocationOnboarding
- One-to-Many with Phone
- One-to-Many with LocationInvitation

### Location Onboarding

**LocationOnboarding**
- Core entity for location-level onboarding data
- Tracks status through `OnboardingStatus` enum
- Contains all onboarding form data:
  - Basic Details (POC info, contact preferences)
  - Existing Phone System details
  - Phone & Device configuration
  - Working Hours
  - Call Flow configuration
- Supports copying from previous location (`copiedFromLocationId`)

**Field Markers:**
- **(LL)** = Location Level - unique per location
- **(CP)** = Copy Previous - can be copied from another location

**Relationships:**
- One-to-One with Location
- One-to-One with CallFlow
- One-to-Many with Phone
- One-to-Many with WorkingHoursSchedule

### Phone & Device Details

**Phone**
- Represents a physical phone device at a location
- Tracks brand, model, ownership, assignment
- Can be assigned to a user or extension
- Supports unsupported phone detection
- Links to purchase requests if unsupported

**Relationships:**
- Many-to-One with Location
- Many-to-One with User (if assigned)
- One-to-One with PhonePurchaseRequest

**SupportedPhoneModel**
- Master data table for supported phone models
- Used for validation and unsupported phone detection

### Working Hours

**WorkingHoursSchedule**
- Defines operating hours per day of week
- Supports copying schedule to other days
- One record per day per onboarding

### Call Flow

**CallFlow**
- Defines call routing logic for a location
- Supports two modes:
  1. Direct routing (no IVR)
  2. IVR-based routing

**IVROption**
- Represents an IVR menu option
- Contains script, ring configuration, retry logic
- Links to targets (users or extensions)

**IVROptionTarget / CallFlowTarget**
- Represents users or extensions that ring for a call flow option
- Maintains ring order

**SharedVoicemailUser**
- Links users to shared voicemail for a call flow

### Approvals & Workflows

**Approval**
- Generic approval workflow system
- Supports multiple approval types (phone purchase, credit, provisioning)
- Tracks approval status and comments
- Links to any entity via `entityType` and `entityId`

**PhonePurchaseRequest**
- Specific approval workflow for unsupported phone purchases
- Links to credit info for billing
- Tracks pricing and approval status

### Audit Logging

**AuditLog**
- Comprehensive audit trail for all entities
- Tracks all actions (CREATE, UPDATE, DELETE, SUBMIT, APPROVE, etc.)
- Stores before/after state in JSON
- Links to user, account, location, and onboarding for filtering

### Master Data

**PhoneSystemKnowledge**
- Master data for phone system capabilities
- Tracks call forwarding support per phone system
- Used to skip questions when system capabilities are known

**ExtensionSeries**
- Defines extension number ranges per location
- Tracks reserved extensions
- Used for extension assignment validation

## Enums

### UserRole
- `IMPLEMENTATION_LEAD` - Internal staff
- `CUSTOMER` - External customer user

### ProductType
- `CS_VOICESTACK` - CS VoiceStack product
- `VOICESTACK` - VoiceStack product

### OnboardingStatus
- `NOT_STARTED` - Onboarding not initiated
- `IN_PROGRESS` - Onboarding in progress
- `PENDING_APPROVAL` - Waiting for approval
- `APPROVED` - Approved, ready for provisioning
- `PROVISIONING` - Currently being provisioned
- `COMPLETED` - Onboarding complete
- `BLOCKED` - Blocked due to issues
- `CANCELLED` - Onboarding cancelled

### PhoneSystemType
- `TRADITIONAL` - Traditional phone system
- `VOIP` - VoIP phone system

### PhoneBrand
- `YEALINK` - Yealink phones
- `POLYCOM` - Polycom phones
- `OTHER` - Other brands

### PhoneOwnership
- `OWNED` - Customer owns the phone
- `LEASED` - Phone is leased

### PhoneAssignmentType
- `ASSIGNED_TO_USER` - Phone assigned to specific user
- `ASSIGNED_TO_EXTENSION` - Phone assigned to extension
- `COMMON` - Common/shared phone

### ContactMedium
- `EMAIL` - Email contact
- `PHONE` - Phone contact
- `SMS` - SMS contact
- `PREFERRED_EMAIL` - Preferred email
- `PREFERRED_PHONE` - Preferred phone

### ApprovalStatus
- `PENDING` - Approval pending
- `APPROVED` - Approved
- `REJECTED` - Rejected
- `CANCELLED` - Cancelled

### ApprovalType
- `PHONE_PURCHASE` - Phone purchase approval
- `CREDIT_APPROVAL` - Credit approval
- `PROVISIONING` - Provisioning approval
- `CUSTOM` - Custom approval type

### AuditAction
- `CREATE` - Entity created
- `UPDATE` - Entity updated
- `DELETE` - Entity deleted
- `SUBMIT` - Onboarding submitted
- `APPROVE` - Approval granted
- `REJECT` - Approval rejected
- `COPY` - Data copied from another location
- `INVITE` - Customer invited
- `STATUS_CHANGE` - Status changed

### DayOfWeek
- `MONDAY` through `SUNDAY`

## Key Design Decisions

1. **Flexible Approval System**: Generic `Approval` model supports multiple approval types without schema changes
2. **Comprehensive Audit Logging**: All actions tracked with before/after state
3. **Copy Previous Location**: Explicit tracking via `copiedFromLocationId` for audit and dependency tracking
4. **Master Data**: `PhoneSystemKnowledge` and `SupportedPhoneModel` enable intelligent form skipping
5. **Flexible Credit Info**: JSON field allows evolution without schema changes
6. **Extension Management**: `ExtensionSeries` model supports complex extension assignment rules
7. **Call Flow Flexibility**: Supports both simple direct routing and complex IVR configurations
