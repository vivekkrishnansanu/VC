# API Documentation

## Overview

RESTful API endpoints for the Implementation Automation Platform onboarding system.

Base URL: `/api`

## Authentication

All endpoints require authentication (to be implemented). Include user context in request body or headers.

## Endpoints

### Onboarding Session

#### GET `/api/onboarding/session?locationId={id}`
Get or create onboarding session for a location.

**Query Parameters:**
- `locationId` (required): Location ID

**Response:**
```json
{
  "id": "session-location-1",
  "locationId": "location-1",
  "currentStep": "BASIC_DETAILS",
  "completedSteps": ["BASIC_DETAILS"],
  "status": "IN_PROGRESS",
  "isLocked": false,
  "createdAt": "2024-01-10T10:00:00Z",
  "updatedAt": "2024-01-10T10:00:00Z"
}
```

#### PATCH `/api/onboarding/session`
Update session step or status.

**Request Body:**
```json
{
  "locationId": "location-1",
  "step": "PHONE_SYSTEM",  // Optional
  "status": "IN_PROGRESS",  // Optional
  "lockSession": false      // Optional, for status updates
}
```

---

### Copy Previous Location

#### GET `/api/onboarding/copy?locationId={id}`
Get available source locations for copying.

**Query Parameters:**
- `locationId` (required): Target location ID

**Response:**
```json
[
  {
    "id": "location-1",
    "name": "Acme Medical - Main Office",
    "hasOnboarding": true,
    "copyableFields": {
      "pocName": "Alice Johnson",
      "pocEmail": "alice@example.com",
      "pocPhone": "+1-555-0101",
      "preferredContactMedium": "EMAIL"
    }
  }
]
```

#### POST `/api/onboarding/copy`
Copy fields from one location to another.

**Request Body:**
```json
{
  "fromLocationId": "location-1",
  "toLocationId": "location-2",
  "fieldsToCopy": ["pocName", "pocEmail", "pocPhone", "preferredContactMedium"],
  "userId": "user-1"
}
```

**Response:**
```json
{
  "id": "onboarding-location-2",
  "locationId": "location-2",
  "pocName": "Alice Johnson",
  "pocEmail": "alice@example.com",
  "copiedFromLocationId": "location-1",
  ...
}
```

---

### Smart Skip Rules

#### GET `/api/onboarding/skip-rules?locationId={id}`
Get skip rules for a location based on master data.

**Query Parameters:**
- `locationId` (required): Location ID

**Response:**
```json
{
  "skipRules": [
    {
      "field": "callForwardingSupported",
      "shouldSkip": true,
      "reason": "Call forwarding support is known for this phone system"
    },
    {
      "field": "ivrOptions",
      "shouldSkip": true,
      "reason": "IVR is disabled"
    }
  ]
}
```

---

### Device Validation

#### POST `/api/devices/validate`
Validate device brand and model.

**Request Body:**
```json
{
  "brand": "YEALINK",
  "model": "T46S"
}
```

**Response:**
```json
{
  "isValid": true,
  "isSupported": true,
  "brand": "YEALINK",
  "model": "T46S"
}
```

#### GET `/api/devices/validate?brand={brand}`
Get supported models for a brand.

**Query Parameters:**
- `brand` (required): Phone brand (YEALINK, POLYCOM, OTHER)

**Response:**
```json
{
  "models": [
    {
      "model": "T46S",
      "description": "12-line IP phone with color display"
    },
    {
      "model": "T48S",
      "description": "16-line IP phone with color display"
    }
  ]
}
```

#### GET `/api/devices/validate?locationId={id}`
Check unsupported devices for a location.

**Query Parameters:**
- `locationId` (required): Location ID

**Response:**
```json
{
  "hasUnsupported": true,
  "unsupported": [
    {
      "id": "phone-4",
      "brand": "OTHER",
      "model": "Cisco 7945",
      "isUnsupported": true
    }
  ],
  "canSubmit": false,
  "reason": "Location has 1 unsupported device(s) with pending approvals"
}
```

---

### Approvals

#### POST `/api/approvals`
Request an approval.

**Request Body:**
```json
{
  "type": "PHONE_PURCHASE",
  "locationId": "location-1",
  "entityId": "phone-4",
  "metadata": {
    "brand": "OTHER",
    "model": "Cisco 7945",
    "quantity": 1,
    "unitPrice": 299.99
  },
  "requestedBy": "user-1"
}
```

**Response:**
```json
{
  "id": "approval-1",
  "status": "PENDING",
  "requestedBy": "user-1",
  "requestedAt": "2024-01-10T10:00:00Z"
}
```

#### GET `/api/approvals?locationId={id}`
Get approvals for a location.

**Query Parameters:**
- `locationId` (required): Location ID

**Response:**
```json
{
  "approvals": [
    {
      "id": "approval-1",
      "status": "PENDING",
      "requestedBy": "user-1",
      "requestedAt": "2024-01-10T10:00:00Z"
    }
  ],
  "pending": [...],
  "hasPending": true
}
```

#### GET `/api/approvals?approvalId={id}`
Get specific approval.

**Query Parameters:**
- `approvalId` (required): Approval ID

#### PATCH `/api/approvals/{id}`
Approve or reject an approval.

**Request Body:**
```json
{
  "action": "approve",  // or "reject"
  "userId": "user-2",
  "comments": "Approved for purchase"
}
```

---

### Extension Management

#### POST `/api/extensions`
Create extension series for a location.

**Request Body:**
```json
{
  "locationId": "location-1",
  "prefix": "100",
  "startRange": 1000,
  "endRange": 9999,
  "reservedExtensions": ["1000", "1001"]
}
```

#### GET `/api/extensions?locationId={id}&count={n}`
Generate available extensions.

**Query Parameters:**
- `locationId` (required): Location ID
- `count` (required): Number of extensions needed

**Response:**
```json
{
  "available": ["1002", "1003", "1004"],
  "count": 3
}
```

#### GET `/api/extensions?locationId={id}&extension={ext}`
Validate extension availability.

**Query Parameters:**
- `locationId` (required): Location ID
- `extension` (required): Extension to validate

**Response:**
```json
{
  "isAvailable": true,
  "extension": "1005"
}
```

---

### Validation

#### POST `/api/validation`
Validate onboarding, working hours, or call flow.

**Request Body:**
```json
{
  "locationId": "location-1",
  "type": "onboarding"  // "workingHours", "callFlow", or "onboarding"
}
```

**Response (onboarding):**
```json
{
  "isValid": false,
  "errors": [
    "POC name is required",
    "At least one device is required"
  ],
  "warnings": [
    "Greeting message is recommended"
  ]
}
```

---

### Onboarding Submit

#### POST `/api/onboarding/submit`
Submit onboarding for a location.

**Request Body:**
```json
{
  "locationId": "location-1",
  "userId": "user-1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Onboarding submitted successfully",
  "locationId": "location-1"
}
```

**Errors:**
- `400`: Cannot submit (validation failed, pending approvals, etc.)
- `500`: Server error

---

### Audit Logs

#### GET `/api/audit-logs?entityType={type}&entityId={id}`
Get audit logs for an entity.

**Query Parameters:**
- `entityType` (required): Entity type (onboarding, account, location, etc.)
- `entityId` (required): Entity ID

**Response:**
```json
{
  "logs": [
    {
      "action": "UPDATE",
      "entityType": "onboarding",
      "entityId": "onboarding-1",
      "userId": "user-1",
      "changes": {
        "pocName": {
          "from": "Old Name",
          "to": "New Name"
        }
      },
      "timestamp": "2024-01-10T10:00:00Z"
    }
  ]
}
```

#### GET `/api/audit-logs?userId={id}`
Get audit logs for a user.

**Query Parameters:**
- `userId` (required): User ID

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "details": "Optional additional details"
}
```

**Status Codes:**
- `200`: Success
- `400`: Bad Request (validation error, missing parameters)
- `404`: Not Found
- `500`: Internal Server Error

## Usage Examples

### Complete Onboarding Flow

1. **Get Session:**
   ```bash
   GET /api/onboarding/session?locationId=location-1
   ```

2. **Get Skip Rules:**
   ```bash
   GET /api/onboarding/skip-rules?locationId=location-1
   ```

3. **Validate Device:**
   ```bash
   POST /api/devices/validate
   { "brand": "YEALINK", "model": "T46S" }
   ```

4. **Get Available Extensions:**
   ```bash
   GET /api/extensions?locationId=location-1&count=5
   ```

5. **Validate Before Submit:**
   ```bash
   POST /api/validation
   { "locationId": "location-1", "type": "onboarding" }
   ```

6. **Submit:**
   ```bash
   POST /api/onboarding/submit
   { "locationId": "location-1", "userId": "user-1" }
   ```

### Copy Previous Location

```bash
# Get available locations
GET /api/onboarding/copy?locationId=location-2

# Copy fields
POST /api/onboarding/copy
{
  "fromLocationId": "location-1",
  "toLocationId": "location-2",
  "fieldsToCopy": ["pocName", "pocEmail"],
  "userId": "user-1"
}
```

### Approval Workflow

```bash
# Request approval (automatic on unsupported device)
POST /api/approvals
{
  "type": "PHONE_PURCHASE",
  "locationId": "location-1",
  "entityId": "phone-4",
  "requestedBy": "user-1"
}

# Approve
PATCH /api/approvals/approval-1
{
  "action": "approve",
  "userId": "user-2",
  "comments": "Approved"
}
```

## Notes

- All timestamps are in ISO 8601 format
- All IDs are strings (cuid format in production)
- Pagination not implemented yet (add for production)
- Rate limiting not implemented (add for production)
- Authentication/authorization to be implemented
