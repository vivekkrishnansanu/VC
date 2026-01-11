# Architecture Documentation

## Overview

This document describes the architecture decisions, security model, and production readiness features of the Implementation Automation Platform.

## Security Architecture

### Role-Based Access Control (RBAC)

**Roles:**
- **Implementation Lead**: Internal staff with full access
- **Customer**: External users with location-scoped access

**Permission System:**
- Centralized permission definitions in `lib/auth/permissions.ts`
- Middleware-based enforcement in API routes
- Client-side permission checks for UI rendering

**Access Control:**
- Customers can only access their assigned locations
- Implementation Leads can access all accounts and locations
- Edit permissions respect onboarding lock status
- Override capabilities for Implementation Leads with audit trail

### Authentication & Authorization

**Current Implementation:**
- Mock authentication (to be replaced with JWT/OAuth)
- Header-based auth context (`x-user-id`, `x-user-role`)
- Session-based auth for production

**Production Requirements:**
- JWT token validation
- Session management
- Token refresh mechanism
- OAuth integration (Google Sign-In)

## Data Integrity

### Locking Mechanism

**Locked States:**
- `APPROVED`: Locked after approval
- `PROVISIONING`: Locked during provisioning
- `COMPLETED`: Locked after completion

**Override Capability:**
- Only Implementation Leads can override locks
- All overrides are logged with reason
- Audit trail maintained for all changes

### Audit Trail

**Logged Actions:**
- CREATE, UPDATE, DELETE
- SUBMIT, APPROVE, REJECT
- COPY (from previous location)
- LOCK, UNLOCK, OVERRIDE
- STATUS_CHANGE

**Audit Log Structure:**
```typescript
{
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  changes?: { from: any; to: any };
  metadata?: Record<string, any>;
  timestamp: Date;
}
```

## Observability

### Logging

**Log Levels:**
- DEBUG: Development debugging
- INFO: Normal operations
- WARN: Warning conditions
- ERROR: Error conditions

**Structured Logging:**
- JSON format for easy parsing
- Context included (userId, locationId, action)
- Error stack traces captured

**Logged Events:**
- Onboarding submissions
- Approval actions
- Data overrides
- API errors
- Validation failures
- Permission denials

### Error Tracking

**Error Context:**
- User ID
- Location/Account ID
- Action being performed
- Request ID for tracing
- Additional metadata

**Error Types Tracked:**
- API errors
- Validation errors
- Permission denied
- System errors

## Provisioning Handoff

### Payload Structure

**Clean JSON Format:**
- No internal IDs exposed
- Implementation-ready structure
- All required data included
- Validated before generation

**Payload Components:**
1. Location details (address, name)
2. Contact information
3. Phone system configuration
4. Devices (with MAC addresses, extensions)
5. Users (extracted from device assignments)
6. Extensions (mapped to users/devices)
7. Working hours (per day)
8. Call flow (IVR or direct routing)
9. Metadata (PMS, assignment strategy)

**Validation:**
- Schema validation before generation
- Required field checks
- Data consistency validation
- Business rule validation

**Versioning:**
- Payload version field
- Backward compatibility considerations
- Schema evolution support

## Scalability

### Bulk Operations

**Supported Operations:**
- Bulk status updates (up to 100 locations)
- Bulk provisioning payload generation (up to 50 locations)
- Bulk approvals

**Rate Limiting:**
- Per-user rate limits
- Per-action rate limits
- Configurable thresholds

**Performance Considerations:**
- Batch processing for large operations
- Async processing for long-running tasks
- Progress tracking for bulk operations

### Database Optimization

**Indexing Strategy:**
- Foreign keys indexed
- Status fields indexed
- Frequently queried fields indexed
- Composite indexes for common queries

**Query Optimization:**
- Eager loading for related data
- Pagination for large result sets
- Caching for master data

## Future Extensibility

### Product Types

**Extension Points:**
- Product type enum can be extended
- Product-specific logic in service layer
- Product-specific onboarding flows
- Product-specific provisioning payloads

### IVR Logic

**Extension Points:**
- IVR option types
- Custom routing logic
- Advanced IVR features (time-based, holiday schedules)
- Integration with external IVR systems

### Approval Types

**Extension Points:**
- Approval type enum
- Approval workflow configuration
- Multi-level approvals
- Approval delegation

### PMS Integrations

**Extension Points:**
- PMS connector interface
- Data mapping configuration
- Sync mechanisms
- Error handling

## API Contracts

### Authentication

**Headers Required:**
```
Authorization: Bearer <token>
x-user-id: <userId>
x-user-role: <role>
```

### Error Responses

**Standard Format:**
```json
{
  "error": "Error message",
  "details": "Optional additional details",
  "code": "ERROR_CODE"
}
```

**Status Codes:**
- 200: Success
- 400: Bad Request (validation error)
- 401: Unauthorized (authentication required)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

## Production Checklist

### Security
- [x] Role-based access control
- [x] Permission middleware
- [x] Location access checks
- [x] Edit permission validation
- [ ] JWT token validation
- [ ] Session management
- [ ] HTTPS enforcement
- [ ] CORS configuration
- [ ] Input sanitization
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention

### Observability
- [x] Structured logging
- [x] Error tracking
- [x] Audit logging
- [ ] Log aggregation (Datadog, CloudWatch)
- [ ] Error monitoring (Sentry, Rollbar)
- [ ] Performance monitoring
- [ ] Request tracing

### Data Integrity
- [x] Lock mechanism
- [x] Override with audit trail
- [x] Validation before submission
- [ ] Database transactions
- [ ] Optimistic locking
- [ ] Data backup strategy
- [ ] Disaster recovery plan

### Provisioning
- [x] Payload generation
- [x] Payload validation
- [x] Schema definition
- [ ] Payload versioning
- [ ] Integration testing
- [ ] Rollback mechanism

### Scalability
- [x] Bulk operations
- [x] Rate limiting structure
- [ ] Database connection pooling
- [ ] Caching layer
- [ ] Load balancing
- [ ] Horizontal scaling support

## Deployment Considerations

### Environment Variables

**Required:**
- `DATABASE_URL`: MySQL connection string
- `JWT_SECRET`: Secret for JWT signing
- `NODE_ENV`: Environment (development, production)

**Optional:**
- `LOG_LEVEL`: Logging level
- `RATE_LIMIT_MAX`: Max requests per window
- `RATE_LIMIT_WINDOW`: Rate limit window in ms

### Monitoring

**Metrics to Track:**
- API response times
- Error rates
- Submission success rate
- Approval processing time
- Bulk operation performance

### Security

**Best Practices:**
- Never expose internal IDs in payloads
- Sanitize all user input
- Validate all data before processing
- Log all sensitive operations
- Use parameterized queries (Prisma)
- Implement rate limiting
- Use HTTPS in production
- Regular security audits

## Migration Path

### From Mock to Production

1. **Authentication:**
   - Replace mock auth with JWT
   - Implement session management
   - Add token refresh

2. **Database:**
   - Replace mock data with Prisma
   - Run migrations
   - Seed master data

3. **Logging:**
   - Connect to logging service
   - Set up log aggregation
   - Configure alerts

4. **Error Tracking:**
   - Connect to error tracking service
   - Set up error alerts
   - Configure error grouping

5. **Monitoring:**
   - Set up APM
   - Configure dashboards
   - Set up alerts
