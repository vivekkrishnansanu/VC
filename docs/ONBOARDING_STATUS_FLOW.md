# Onboarding Status Flow

## Status State Machine

```
NOT_STARTED
    ↓
IN_PROGRESS
    ↓
    ├─→ PENDING_APPROVAL (if approval required)
    │       ↓
    │   APPROVED
    │       ↓
    └─→ PROVISIONING
            ↓
        COMPLETED

    (Any status can transition to:)
    ├─→ BLOCKED (if issues arise)
    └─→ CANCELLED (if cancelled)
```

## Status Definitions

### NOT_STARTED
- **Initial State**: Location created but onboarding not initiated
- **Trigger**: Location created
- **Allowed Transitions**: 
  - → `IN_PROGRESS` (when customer starts onboarding)
- **UI State**: Show "Start Onboarding" button

### IN_PROGRESS
- **State**: Customer actively filling out onboarding form
- **Trigger**: Customer opens onboarding form or Implementation Lead initiates
- **Allowed Transitions**:
  - → `PENDING_APPROVAL` (on submit, if approval required)
  - → `PROVISIONING` (on submit, if no approval required)
  - → `BLOCKED` (if blocking issues detected)
  - → `CANCELLED` (if cancelled)
- **UI State**: 
  - Show progress indicator
  - Enable save functionality
  - Show "Submit" button when form complete
- **Business Rules**:
  - Can save progress at any time
  - Can copy from previous location
  - Form validation prevents submission until required fields complete

### PENDING_APPROVAL
- **State**: Onboarding submitted, waiting for Implementation Lead approval
- **Trigger**: Customer submits onboarding form
- **Allowed Transitions**:
  - → `APPROVED` (Implementation Lead approves)
  - → `IN_PROGRESS` (Implementation Lead requests changes)
  - → `CANCELLED` (if cancelled)
- **UI State**:
  - Show approval pending message to customer
  - Show approval queue to Implementation Lead
  - Disable form editing for customer
- **Business Rules**:
  - Implementation Lead can approve or request changes
  - Approval may trigger phone purchase requests
  - All required approvals must be completed before moving to APPROVED

### APPROVED
- **State**: All approvals granted, ready for provisioning
- **Trigger**: All required approvals completed
- **Allowed Transitions**:
  - → `PROVISIONING` (automatically or manually triggered)
  - → `IN_PROGRESS` (if changes requested)
  - → `BLOCKED` (if provisioning issues)
- **UI State**:
  - Show "Ready for Provisioning" status
  - Show approval details
- **Business Rules**:
  - Cannot edit onboarding data without reverting to IN_PROGRESS
  - Provisioning can be triggered automatically or manually

### PROVISIONING
- **State**: System is being provisioned
- **Trigger**: Provisioning process initiated
- **Allowed Transitions**:
  - → `COMPLETED` (provisioning successful)
  - → `BLOCKED` (provisioning failed)
  - → `IN_PROGRESS` (if rollback required)
- **UI State**:
  - Show provisioning progress
  - Disable all editing
- **Business Rules**:
  - Provisioning is typically automated
  - Can be manual for complex cases
  - Failures should transition to BLOCKED with error details

### COMPLETED
- **State**: Onboarding and provisioning complete
- **Trigger**: Provisioning successfully completed
- **Allowed Transitions**:
  - → `IN_PROGRESS` (if changes needed post-completion)
  - → `BLOCKED` (if issues discovered post-completion)
- **UI State**:
  - Show completion confirmation
  - Show summary of onboarding data
  - Option to view/edit (if allowed)
- **Business Rules**:
  - Generally terminal state
  - Changes may require new onboarding cycle

### BLOCKED
- **State**: Onboarding blocked due to issues
- **Trigger**: 
  - Unsupported phones detected
  - Validation failures
  - Provisioning errors
  - Manual blocking by Implementation Lead
- **Allowed Transitions**:
  - → `IN_PROGRESS` (when issues resolved)
  - → `CANCELLED` (if cannot be resolved)
- **UI State**:
  - Show blocking reason
  - Show resolution steps
  - Disable submission
- **Business Rules**:
  - Must resolve blocking issues before proceeding
  - May require approvals (e.g., phone purchase)
  - Implementation Lead can manually unblock

### CANCELLED
- **State**: Onboarding cancelled
- **Trigger**: 
  - Customer cancels
  - Implementation Lead cancels
  - Business decision to cancel
- **Allowed Transitions**:
  - → `NOT_STARTED` (if restarting)
  - → `IN_PROGRESS` (if reactivating)
- **UI State**:
  - Show cancellation reason
  - Option to restart
- **Business Rules**:
  - Terminal state
  - Can restart with new onboarding

## Status Transition Rules

### Who Can Change Status

| Status | Customer | Implementation Lead | System |
|--------|----------|-------------------|--------|
| NOT_STARTED → IN_PROGRESS | ✅ | ✅ | ✅ |
| IN_PROGRESS → PENDING_APPROVAL | ✅ (on submit) | ❌ | ❌ |
| IN_PROGRESS → PROVISIONING | ❌ | ✅ | ✅ (if no approval) |
| PENDING_APPROVAL → APPROVED | ❌ | ✅ | ❌ |
| PENDING_APPROVAL → IN_PROGRESS | ❌ | ✅ | ❌ |
| APPROVED → PROVISIONING | ❌ | ✅ | ✅ |
| PROVISIONING → COMPLETED | ❌ | ❌ | ✅ |
| PROVISIONING → BLOCKED | ❌ | ✅ | ✅ |
| Any → BLOCKED | ❌ | ✅ | ✅ |
| Any → CANCELLED | ✅ | ✅ | ❌ |

### Automatic Transitions

1. **IN_PROGRESS → PENDING_APPROVAL**: When customer submits and approval required
2. **IN_PROGRESS → PROVISIONING**: When customer submits and no approval required
3. **APPROVED → PROVISIONING**: Auto-triggered after approval (if configured)
4. **PROVISIONING → COMPLETED**: When provisioning API confirms success
5. **PROVISIONING → BLOCKED**: When provisioning API reports failure
6. **Any → BLOCKED**: When unsupported phones detected or validation fails

### Status Dependencies

- **PENDING_APPROVAL**: Requires all phone purchase requests approved (if any)
- **APPROVED**: Requires all required approvals completed
- **PROVISIONING**: Requires status = APPROVED
- **COMPLETED**: Requires provisioning successful

## Status-Based UI Behavior

### Form Editability

| Status | Customer Can Edit | Implementation Lead Can Edit |
|--------|------------------|----------------------------|
| NOT_STARTED | ❌ | ✅ |
| IN_PROGRESS | ✅ | ✅ |
| PENDING_APPROVAL | ❌ | ✅ |
| APPROVED | ❌ | ✅ (with approval) |
| PROVISIONING | ❌ | ❌ |
| COMPLETED | ❌ | ✅ (with approval) |
| BLOCKED | ❌ | ✅ |
| CANCELLED | ❌ | ✅ |

### Actions Available

| Status | Customer Actions | Implementation Lead Actions |
|--------|-----------------|---------------------------|
| NOT_STARTED | Start Onboarding | Start Onboarding, Edit Location |
| IN_PROGRESS | Save, Submit, Copy Previous | View, Edit, Block, Cancel |
| PENDING_APPROVAL | View | Approve, Request Changes, Cancel |
| APPROVED | View | Trigger Provisioning, Request Changes |
| PROVISIONING | View Progress | View Progress, Block |
| COMPLETED | View Summary | View Summary, Request Changes |
| BLOCKED | View Issues | Resolve, Unblock, Cancel |
| CANCELLED | Restart | Restart, Delete |

## Status Change Audit

All status changes must be logged in `AuditLog` with:
- `action`: `STATUS_CHANGE`
- `entityType`: `onboarding`
- `entityId`: LocationOnboarding ID
- `changes`: `{ from: "IN_PROGRESS", to: "PENDING_APPROVAL" }`
- `metadata`: Additional context (e.g., approval IDs, blocking reasons)

## Implementation Notes

1. **Status Validation**: Enforce transition rules at the application layer
2. **Concurrent Updates**: Use optimistic locking or database transactions
3. **Notifications**: Send notifications on status changes (email, in-app)
4. **Status History**: Maintain status change history for audit trail
5. **Bulk Operations**: Support bulk status updates for Implementation Leads
6. **Status Filters**: Enable filtering by status in all list views
