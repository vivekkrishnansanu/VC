/**
 * Error Handling System
 * 
 * Centralized error handling with proper error types and utilities.
 */

import { ApplicationError } from '@/types';

// ============================================================================
// Error Codes
// ============================================================================

export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  RESOURCE_LOCKED = 'RESOURCE_LOCKED',
  
  // Business Logic
  INVALID_STATE = 'INVALID_STATE',
  INVALID_TRANSITION = 'INVALID_TRANSITION',
  DEPENDENCY_MISSING = 'DEPENDENCY_MISSING',
  
  // System
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Onboarding
  ONBOARDING_LOCKED = 'ONBOARDING_LOCKED',
  ONBOARDING_INCOMPLETE = 'ONBOARDING_INCOMPLETE',
  APPROVAL_PENDING = 'APPROVAL_PENDING',
}

// ============================================================================
// Error Factory Functions
// ============================================================================

export function createError(
  code: ErrorCode,
  message: string,
  statusCode: number = 500,
  details?: Record<string, any>
): ApplicationError {
  return new ApplicationError(code, message, statusCode, details);
}

export function createNotFoundError(resource: string, id?: string): ApplicationError {
  return createError(
    ErrorCode.NOT_FOUND,
    `${resource}${id ? ` with id ${id}` : ''} not found`,
    404,
    { resource, id }
  );
}

export function createValidationError(message: string, field?: string): ApplicationError {
  return createError(
    ErrorCode.VALIDATION_ERROR,
    message,
    400,
    { field }
  );
}

export function createUnauthorizedError(message: string = 'Unauthorized'): ApplicationError {
  return createError(ErrorCode.UNAUTHORIZED, message, 401);
}

export function createForbiddenError(message: string = 'Forbidden'): ApplicationError {
  return createError(ErrorCode.FORBIDDEN, message, 403);
}

export function createResourceLockedError(resource: string, reason?: string): ApplicationError {
  return createError(
    ErrorCode.RESOURCE_LOCKED,
    `${resource} is locked${reason ? `: ${reason}` : ''}`,
    423,
    { resource, reason }
  );
}

// ============================================================================
// Error Response Formatter
// ============================================================================

export function formatErrorResponse(error: unknown): {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, any>;
} {
  if (error instanceof ApplicationError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
      code: ErrorCode.INTERNAL_ERROR,
    };
  }

  return {
    success: false,
    error: 'An unexpected error occurred',
    code: ErrorCode.INTERNAL_ERROR,
  };
}
