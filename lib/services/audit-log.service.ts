/**
 * Audit Log Service
 * Tracks all changes, submissions, approvals, and copies
 */

import { AuditLogEntry } from './types';

// In-memory audit log store (replace with database later)
const auditLogs: AuditLogEntry[] = [];

export class AuditLogService {
  /**
   * Log an audit entry
   */
  static log(entry: AuditLogEntry): void {
    const logEntry: AuditLogEntry = {
      ...entry,
      // Add timestamp
      ...(entry as any),
      timestamp: new Date(),
    };

    auditLogs.push(logEntry);

    // In real implementation, save to database
    // await prisma.auditLog.create({ data: logEntry })
  }

  /**
   * Log field changes
   */
  static logFieldChange(
    entityType: string,
    entityId: string,
    field: string,
    fromValue: any,
    toValue: any,
    userId: string
  ): void {
    this.log({
      action: 'UPDATE',
      entityType,
      entityId,
      userId,
      changes: {
        [field]: {
          from: fromValue,
          to: toValue,
        },
      },
    });
  }

  /**
   * Log copy operation
   */
  static logCopy(
    targetEntityId: string,
    sourceEntityId: string,
    fields: string[],
    userId: string
  ): void {
    this.log({
      action: 'COPY',
      entityType: 'onboarding',
      entityId: targetEntityId,
      userId,
      metadata: {
        copiedFrom: sourceEntityId,
        copiedFields: fields,
      },
    });
  }

  /**
   * Log submission
   */
  static logSubmission(
    entityType: string,
    entityId: string,
    userId: string,
    metadata?: Record<string, any>
  ): void {
    this.log({
      action: 'SUBMIT',
      entityType,
      entityId,
      userId,
      metadata,
    });
  }

  /**
   * Log approval
   */
  static logApproval(
    approvalId: string,
    userId: string,
    status: 'APPROVED' | 'REJECTED',
    comments?: string
  ): void {
    this.log({
      action: status === 'APPROVED' ? 'APPROVE' : 'REJECT',
      entityType: 'approval',
      entityId: approvalId,
      userId,
      metadata: {
        comments,
      },
    });
  }

  /**
   * Get audit logs for an entity
   */
  static getLogsForEntity(
    entityType: string,
    entityId: string
  ): AuditLogEntry[] {
    return auditLogs.filter(
      log => log.entityType === entityType && log.entityId === entityId
    );
  }

  /**
   * Get audit logs for a user
   */
  static getLogsForUser(userId: string): AuditLogEntry[] {
    return auditLogs.filter(log => log.userId === userId);
  }

  /**
   * Get all audit logs (with pagination in real implementation)
   */
  static getAllLogs(): AuditLogEntry[] {
    return [...auditLogs];
  }
}
