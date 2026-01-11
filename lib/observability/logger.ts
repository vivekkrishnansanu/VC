/**
 * Observability & Logging
 * Centralized logging with structured data
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogContext {
  userId?: string;
  locationId?: string;
  accountId?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export class Logger {
  /**
   * Log with context
   */
  static log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    };

    // In production, send to logging service (Datadog, CloudWatch, etc.)
    if (level === LogLevel.ERROR) {
      console.error(JSON.stringify(logEntry, null, 2));
    } else if (level === LogLevel.WARN) {
      console.warn(JSON.stringify(logEntry, null, 2));
    } else {
      console.log(JSON.stringify(logEntry, null, 2));
    }

    // TODO: Send to external logging service
    // await sendToLoggingService(logEntry);
  }

  static debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  static info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  static warn(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.WARN, message, context, error);
  }

  static error(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Log onboarding submission
   */
  static logSubmission(locationId: string, userId: string, metadata?: Record<string, any>): void {
    this.info('Onboarding submitted', {
      userId,
      locationId,
      action: 'SUBMIT_ONBOARDING',
      metadata,
    });
  }

  /**
   * Log approval action
   */
  static logApproval(
    approvalId: string,
    action: 'APPROVED' | 'REJECTED',
    userId: string,
    metadata?: Record<string, any>
  ): void {
    this.info(`Approval ${action.toLowerCase()}`, {
      userId,
      action: `APPROVAL_${action}`,
      metadata: {
        approvalId,
        ...metadata,
      },
    });
  }

  /**
   * Log data override
   */
  static logOverride(
    entityType: string,
    entityId: string,
    userId: string,
    reason: string,
    changes: Record<string, any>
  ): void {
    this.warn('Data override performed', {
      userId,
      action: 'OVERRIDE',
      metadata: {
        entityType,
        entityId,
        reason,
        changes,
      },
    });
  }

  /**
   * Log error with full context
   */
  static logError(
    error: Error,
    context?: LogContext,
    additionalMetadata?: Record<string, any>
  ): void {
    this.error('Error occurred', {
      ...context,
      metadata: additionalMetadata,
    }, error);
  }
}
