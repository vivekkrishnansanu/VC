/**
 * Smart Skip Service
 * Determines which questions can be skipped based on master data and previous answers
 */

import { PhoneSystemType } from '@/lib/mock-data/types';
import { mockDataService } from '@/lib/mock-data';

export interface SkipRule {
  field: string;
  shouldSkip: boolean;
  reason?: string;
}

export class SmartSkipService {
  /**
   * Check if phone system call forwarding question should be skipped
   */
  static shouldSkipCallForwardingQuestion(
    phoneSystemType: PhoneSystemType | undefined,
    phoneSystemName: string | undefined
  ): boolean {
    if (!phoneSystemType || !phoneSystemName) {
      return false;
    }

    // Check master data
    const knowledge = mockDataService.masterData.getPhoneSystemKnowledge(
      phoneSystemType,
      phoneSystemName
    );

    // Skip if we know the answer from master data
    return knowledge?.supportsCallForwarding !== undefined;
  }

  /**
   * Get call forwarding support from master data
   */
  static getCallForwardingSupport(
    phoneSystemType: PhoneSystemType,
    phoneSystemName: string
  ): boolean | null {
    const knowledge = mockDataService.masterData.getPhoneSystemKnowledge(
      phoneSystemType,
      phoneSystemName
    );

    return knowledge?.supportsCallForwarding ?? null;
  }

  /**
   * Check if IVR questions should be skipped
   */
  static shouldSkipIVRQuestions(hasIVR: boolean | undefined): boolean {
    // If IVR is explicitly set to false, skip all IVR questions
    return hasIVR === false;
  }

  /**
   * Check if user details should be skipped for a device
   * NEW: Only ASSIGNED_TO_EXTENSION skips user details (COMMON is deprecated)
   */
  static shouldSkipUserDetails(assignmentType: string | undefined): boolean {
    // Skip user details if device is assigned to extension
    // COMMON is deprecated and treated as ASSIGNED_TO_EXTENSION
    return assignmentType === 'COMMON' || assignmentType === 'ASSIGNED_TO_EXTENSION';
  }
  
  /**
   * Normalize assignment type for backward compatibility
   * Converts COMMON to ASSIGNED_TO_EXTENSION
   */
  static normalizeAssignmentType(assignmentType: string | undefined): string | undefined {
    if (assignmentType === 'COMMON') {
      return 'ASSIGNED_TO_EXTENSION';
    }
    return assignmentType;
  }

  /**
   * Check if VoiceStack fax question should be asked
   */
  static shouldAskVoiceStackFax(usesFax: boolean | undefined): boolean {
    // Only ask if they don't currently use fax
    return usesFax === false;
  }

  /**
   * Get all skip rules for current onboarding state
   */
  static getSkipRules(locationId: string): SkipRule[] {
    const onboarding = mockDataService.onboarding.getByLocationId(locationId);
    if (!onboarding) {
      return [];
    }

    const rules: SkipRule[] = [];

    // Call forwarding skip rule
    if (onboarding.phoneSystemType && onboarding.phoneSystemVoipType) {
      const shouldSkip = this.shouldSkipCallForwardingQuestion(
        onboarding.phoneSystemType,
        onboarding.phoneSystemVoipType
      );
      
      if (shouldSkip) {
        rules.push({
          field: 'callForwardingSupported',
          shouldSkip: true,
          reason: 'Call forwarding support is known for this phone system',
        });
      }
    }

    // IVR skip rules
    if (this.shouldSkipIVRQuestions(onboarding.hasIVR)) {
      rules.push({
        field: 'ivrOptions',
        shouldSkip: true,
        reason: 'IVR is disabled',
      });
      rules.push({
        field: 'ivrScript',
        shouldSkip: true,
        reason: 'IVR is disabled',
      });
      rules.push({
        field: 'ivrRetryAttempts',
        shouldSkip: true,
        reason: 'IVR is disabled',
      });
    }

    // VoiceStack fax question
    if (!this.shouldAskVoiceStackFax(onboarding.usesFax)) {
      rules.push({
        field: 'wantsFaxInVoiceStack',
        shouldSkip: true,
        reason: 'Customer already uses fax',
      });
    }

    // Device skip rules - skip user details for common phones
    const phones = mockDataService.phones.getByLocationId(locationId);
    const hasCommonPhones = phones.some(
      phone => phone.assignmentType === 'COMMON' || phone.assignmentType === 'ASSIGNED_TO_EXTENSION'
    );
    
    if (hasCommonPhones) {
      // Find which devices are common
      const commonDeviceIds = phones
        .filter(phone => phone.assignmentType === 'COMMON' || phone.assignmentType === 'ASSIGNED_TO_EXTENSION')
        .map(phone => phone.id);
      
      if (commonDeviceIds.length > 0) {
        rules.push({
          field: 'deviceUserDetails',
          shouldSkip: true,
          reason: `User details not required for ${commonDeviceIds.length} common/extension-assigned device(s)`,
        });
      }
    }

    return rules;
  }

  /**
   * Auto-fill call forwarding support from master data
   */
  static autoFillCallForwarding(
    phoneSystemType: PhoneSystemType,
    phoneSystemName: string
  ): boolean | null {
    return this.getCallForwardingSupport(phoneSystemType, phoneSystemName);
  }
}
