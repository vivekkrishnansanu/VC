/**
 * Data Integrity & Lock Service
 * Prevents editing after submission and enforces audit trails
 */

import { OnboardingStatus } from '@/lib/mock-data/types';
import { Logger } from '@/lib/observability/logger';
import { AuditLogService } from '@/lib/services/audit-log.service';
import { PermissionService } from '@/lib/auth/permissions';
import { UserRole } from '@/types';

export class LockService {
  /**
   * Check if onboarding is locked
   */
  static isLocked(status: OnboardingStatus): boolean {
    const lockedStatuses: OnboardingStatus[] = [
      OnboardingStatus.APPROVED,
      OnboardingStatus.PROVISIONING,
      OnboardingStatus.COMPLETED,
    ];
    return lockedStatuses.includes(status);
  }

  /**
   * Check if can edit with override
   */
  static canEditWithOverride(
    status: OnboardingStatus,
    userRole: UserRole
  ): boolean {
    if (!this.isLocked(status)) {
      return true;
    }

    // Only Implementation Leads can override
    return PermissionService.canOverride(userRole);
  }

  /**
   * Lock onboarding after submission
   */
  static lockOnboarding(
    locationId: string,
    userId: string,
    reason: string = 'Submitted for approval'
  ): void {
    Logger.info('Onboarding locked', {
      userId,
      locationId,
      action: 'LOCK_ONBOARDING',
      metadata: { reason },
    });

    AuditLogService.log({
      action: 'LOCK',
      entityType: 'onboarding',
      entityId: locationId,
      userId,
      metadata: { reason },
    });
  }

  /**
   * Unlock onboarding (override)
   */
  static unlockOnboarding(
    locationId: string,
    userId: string,
    reason: string,
    userRole: UserRole
  ): { allowed: boolean; error?: string } {
    if (!PermissionService.canOverride(userRole)) {
      return {
        allowed: false,
        error: 'Insufficient permissions to unlock',
      };
    }

    Logger.logOverride('onboarding', locationId, userId, reason, {
      action: 'UNLOCK',
    });

    AuditLogService.log({
      action: 'UNLOCK',
      entityType: 'onboarding',
      entityId: locationId,
      userId,
      metadata: {
        reason,
        override: true,
      },
    });

    return { allowed: true };
  }

  /**
   * Validate edit attempt
   */
  static validateEdit(
    locationId: string,
    currentStatus: OnboardingStatus,
    userId: string,
    userRole: UserRole
  ): { allowed: boolean; reason?: string; requiresOverride?: boolean } {
    if (!this.isLocked(currentStatus)) {
      return { allowed: true };
    }

    if (this.canEditWithOverride(currentStatus, userRole)) {
      return {
        allowed: true,
        requiresOverride: true,
        reason: 'Onboarding is locked. Override required.',
      };
    }

    return {
      allowed: false,
      reason: 'Onboarding is locked and cannot be edited',
    };
  }
}
