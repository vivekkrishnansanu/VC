/**
 * Application Constants
 * 
 * Centralized constants used throughout the application.
 */

// Legacy constant for backward compatibility
export const AUTH_STORAGE_KEY = "vc_auth_user";

// ============================================================================
// Onboarding Constants
// ============================================================================

export const ONBOARDING_STEPS = [
  'BASIC_DETAILS',
  'PHONE_SYSTEM',
  'DEVICES',
  'WORKING_HOURS',
  'CALL_FLOW',
  'REVIEW',
] as const;

export const ONBOARDING_STEP_LABELS: Record<string, string> = {
  BASIC_DETAILS: 'Basic Details',
  PHONE_SYSTEM: 'Phone System',
  DEVICES: 'Devices',
  WORKING_HOURS: 'Working Hours',
  CALL_FLOW: 'Call Flow',
  REVIEW: 'Review',
};

// ============================================================================
// Status Constants
// ============================================================================

export const LOCKED_STATUSES = [
  'APPROVED',
  'PROVISIONING',
  'COMPLETED',
] as const;

export const EDITABLE_STATUSES = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'BLOCKED',
] as const;

// ============================================================================
// Validation Constants
// ============================================================================

export const VALIDATION_RULES = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MIN_EMAIL_LENGTH: 5,
  MAX_EMAIL_LENGTH: 255,
  MIN_PHONE_LENGTH: 10,
  MAX_PHONE_LENGTH: 20,
  MIN_DEVICES: 1,
  MAX_DEVICES: 1000,
} as const;

// ============================================================================
// Pagination Constants
// ============================================================================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const;

// ============================================================================
// API Constants
// ============================================================================

export const API_ENDPOINTS = {
  // Onboarding
  ONBOARDING_SESSION: '/api/onboarding/session',
  ONBOARDING_SUBMIT: '/api/onboarding/submit',
  ONBOARDING_COPY: '/api/onboarding/copy',
  ONBOARDING_SKIP_RULES: '/api/onboarding/skip-rules',
  
  // Devices
  DEVICES_VALIDATE: '/api/devices/validate',
  
  // Approvals
  APPROVALS: '/api/approvals',
  APPROVAL_BY_ID: (id: string) => `/api/approvals/${id}`,
  
  // Extensions
  EXTENSIONS: '/api/extensions',
  
  // Validation
  VALIDATION: '/api/validation',
  
  // Provisioning
  PROVISIONING: (locationId: string) => `/api/provisioning/${locationId}`,
  
  // Bulk Operations
  BULK_STATUS: '/api/bulk/status',
  BULK_PROVISIONING: '/api/bulk/provisioning',
  
  // Audit
  AUDIT_LOGS: '/api/audit-logs',
} as const;

// ============================================================================
// UI Constants
// ============================================================================

export const UI = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
  MODAL_ANIMATION_DURATION: 200,
} as const;

// ============================================================================
// Feature Flags
// ============================================================================

export const FEATURES = {
  BULK_OPERATIONS: 'bulk-operations',
  ADVANCED_ANALYTICS: 'advanced-analytics',
  EXPORT_DATA: 'export-data',
} as const;
