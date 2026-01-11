/**
 * Error Tracking
 * Track and report errors for observability
 */

import { Logger } from './logger';

export interface ErrorContext {
  userId?: string;
  locationId?: string;
  accountId?: string;
  action?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

export class ErrorTracker {
  /**
   * Track error with context
   */
  static trackError(
    error: Error,
    context?: ErrorContext
  ): void {
    // Log error
    Logger.error('Error tracked', context, error);

    // In production, send to error tracking service (Sentry, Rollbar, etc.)
    // await sendToErrorTrackingService(error, context);
  }

  /**
   * Track API error
   */
  static trackApiError(
    error: Error,
    endpoint: string,
    method: string,
    context?: ErrorContext
  ): void {
    this.trackError(error, {
      ...context,
      action: 'API_ERROR',
      metadata: {
        endpoint,
        method,
        ...context?.metadata,
      },
    });
  }

  /**
   * Track validation error
   */
  static trackValidationError(
    errors: any[],
    locationId: string,
    userId: string
  ): void {
    Logger.warn('Validation error', {
      userId,
      locationId,
      action: 'VALIDATION_ERROR',
      metadata: {
        errors,
      },
    });
  }

  /**
   * Track permission denied
   */
  static trackPermissionDenied(
    userId: string,
    permission: string,
    resource: string
  ): void {
    Logger.warn('Permission denied', {
      userId,
      action: 'PERMISSION_DENIED',
      metadata: {
        permission,
        resource,
      },
    });
  }
}
