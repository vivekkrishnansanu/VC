/**
 * Migration Helpers
 * Utilities for backward compatibility with existing data
 */

import { PhoneAssignmentType, DeviceOwnership } from '@/lib/mock-data/types';
import { mockDataService } from '@/lib/mock-data';

/**
 * Migrate legacy assignment strategy to per-device assignment
 * This ensures backward compatibility with data that uses the old global assignmentStrategy field
 */
export class MigrationHelpers {
  /**
   * Normalize COMMON assignment type to ASSIGNED_TO_EXTENSION
   */
  static normalizeAssignmentType(assignmentType: PhoneAssignmentType | string | undefined): string | undefined {
    if (assignmentType === PhoneAssignmentType.COMMON || assignmentType === 'COMMON') {
      return 'ASSIGNED_TO_EXTENSION';
    }
    return assignmentType as string | undefined;
  }

  /**
   * Migrate legacy deviceOwnership boolean to DeviceOwnership enum
   */
  static migrateDeviceOwnership(ownsDevices: boolean | undefined): DeviceOwnership | undefined {
    if (ownsDevices === undefined || ownsDevices === null) {
      return undefined;
    }
    return ownsDevices ? DeviceOwnership.OWNED : DeviceOwnership.NOT_OWNED;
  }

  /**
   * Migrate legacy IVR option fields to global IVR fields
   * If options have individual retryAttempts/waitTime, migrate first option's values to global
   */
  static migrateIVRGlobalFields(onboarding: any): {
    ivrScript?: string;
    ivrRetryAttempts?: number;
    ivrWaitTime?: number;
    ivrInvalidSelectionScript?: string;
    ivrAfterRetriesTarget?: string;
  } {
    // If global fields already exist, use them
    if (onboarding.ivrScript || onboarding.ivrRetryAttempts !== undefined) {
      return {
        ivrScript: onboarding.ivrScript,
        ivrRetryAttempts: onboarding.ivrRetryAttempts,
        ivrWaitTime: onboarding.ivrWaitTime,
        ivrInvalidSelectionScript: onboarding.ivrInvalidSelectionScript,
        ivrAfterRetriesTarget: onboarding.ivrAfterRetriesTarget,
      };
    }

    // Migrate from first IVR option if it exists (backward compatibility)
    if (onboarding.ivrOptions && onboarding.ivrOptions.length > 0) {
      const firstOption = onboarding.ivrOptions[0];
      return {
        ivrScript: firstOption.script || onboarding.greetingMessage,
        ivrRetryAttempts: firstOption.retryAttempts,
        ivrWaitTime: firstOption.waitTime,
        ivrInvalidSelectionScript: firstOption.invalidSelectionScript,
        ivrAfterRetriesTarget: firstOption.afterRetriesTarget,
      };
    }

    return {};
  }

  /**
   * Ensure device has required fields for new model
   */
  static ensureDeviceFields(phone: any): any {
    return {
      ...phone,
      deviceTypes: phone.deviceTypes || [],
      hasWarnings: phone.hasWarnings || false,
      warningReason: phone.warningReason || undefined,
      // Normalize assignment type
      assignmentType: this.normalizeAssignmentType(phone.assignmentType) || phone.assignmentType,
    };
  }
}
