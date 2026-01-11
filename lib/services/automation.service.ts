/**
 * Automation Service
 * Handles automation events and hooks
 */

import { AutomationEvent } from './types';
import { OnboardingStatus } from '@/lib/mock-data/types';
import { mockDataService } from '@/lib/mock-data';
import { OnboardingSessionService } from './onboarding-session.service';
import { AuditLogService } from './audit-log.service';

export class AutomationService {
  /**
   * Handle onboarding submission
   */
  static async onOnboardingSubmitted(
    locationId: string,
    userId: string
  ): Promise<void> {
    // Lock onboarding session
    await OnboardingSessionService.updateStatus(
      locationId,
      OnboardingStatus.PENDING_APPROVAL,
      true // Lock session
    );

    // Generate provisioning payload
    const payload = this.generateProvisioningPayload(locationId);

    // Log audit
    AuditLogService.log({
      action: 'SUBMIT',
      entityType: 'onboarding',
      entityId: locationId,
      userId,
      metadata: {
        provisioningPayload: payload,
      },
    });

    // In real implementation:
    // - Store provisioning payload
    // - Trigger provisioning workflow
    // - Send notifications
  }

  /**
   * Handle approval approved
   */
  static async onApprovalApproved(
    approvalId: string,
    locationId: string,
    userId: string
  ): Promise<void> {
    // Unblock onboarding if it was blocked
    const session = OnboardingSessionService.getSession(locationId);
    if (session && session.status === OnboardingStatus.BLOCKED) {
      await OnboardingSessionService.updateStatus(
        locationId,
        OnboardingStatus.IN_PROGRESS,
        false // Unlock
      );
    }

    // Log audit
    AuditLogService.log({
      action: 'APPROVE',
      entityType: 'approval',
      entityId: approvalId,
      userId,
      metadata: {
        locationId,
      },
    });
  }

  /**
   * Handle approval rejected
   */
  static async onApprovalRejected(
    approvalId: string,
    locationId: string,
    userId: string
  ): Promise<void> {
    // Block onboarding
    await OnboardingSessionService.updateStatus(
      locationId,
      OnboardingStatus.BLOCKED,
      true // Lock
    );

    // Log audit
    AuditLogService.log({
      action: 'REJECT',
      entityType: 'approval',
      entityId: approvalId,
      userId,
      metadata: {
        locationId,
      },
    });
  }

  /**
   * Check if all locations are completed for an account
   */
  static async checkAllLocationsCompleted(accountId: string): Promise<boolean> {
    const locations = mockDataService.locations.getByAccountId(accountId);
    
    if (locations.length === 0) {
      return false;
    }

    // Check if all locations have completed onboarding
    const allCompleted = locations.every(location => {
      const onboarding = mockDataService.onboarding.getByLocationId(location.id);
      return onboarding?.status === OnboardingStatus.COMPLETED;
    });

    if (allCompleted) {
      // Mark account as ready for provisioning
      await this.onAllLocationsCompleted(accountId);
    }

    return allCompleted;
  }

  /**
   * Handle all locations completed
   */
  static async onAllLocationsCompleted(accountId: string): Promise<void> {
    // Log audit
    AuditLogService.log({
      action: 'STATUS_CHANGE',
      entityType: 'account',
      entityId: accountId,
      userId: 'system',
      metadata: {
        event: 'ALL_LOCATIONS_COMPLETED',
        status: 'READY_FOR_PROVISIONING',
      },
    });

    // In real implementation:
    // - Update account status
    // - Trigger account-level provisioning
    // - Send notifications
    // - Generate account-level reports
  }

  /**
   * Generate provisioning payload for a location
   */
  static generateProvisioningPayload(locationId: string): Record<string, any> {
    const location = mockDataService.locations.getById(locationId);
    const onboarding = mockDataService.onboarding.getByLocationId(locationId);
    const phones = mockDataService.phones.getByLocationId(locationId);

    if (!location || !onboarding) {
      throw new Error(`Location ${locationId} or onboarding not found`);
    }

    return {
      locationId: location.id,
      locationName: location.name,
      address: {
        line1: location.addressLine1,
        line2: location.addressLine2,
        city: location.city,
        state: location.state,
        zipcode: location.zipcode,
      },
      poc: {
        name: onboarding.pocName,
        email: onboarding.pocEmail,
        phone: onboarding.pocPhone,
      },
      phoneSystem: {
        type: onboarding.phoneSystemType,
        details: onboarding.phoneSystemDetails,
        voipType: onboarding.phoneSystemVoipType,
      },
      devices: phones.map(phone => ({
        brand: phone.brand,
        model: phone.model,
        macAddress: phone.macAddress,
        serialNumber: phone.serialNumber,
        extension: phone.extension,
        assignedUser: phone.assignedUserId,
      })),
      callFlow: {
        hasIVR: onboarding.hasIVR,
        greetingMessage: onboarding.greetingMessage,
      },
      // Add more fields as needed
    };
  }

  /**
   * Process automation event
   */
  static async processEvent(event: AutomationEvent): Promise<void> {
    switch (event.type) {
      case 'ONBOARDING_SUBMITTED':
        if (event.locationId) {
          await this.onOnboardingSubmitted(event.locationId, event.metadata.userId);
        }
        break;

      case 'APPROVAL_APPROVED':
        if (event.locationId) {
          await this.onApprovalApproved(
            event.metadata.approvalId,
            event.locationId,
            event.metadata.userId
          );
        }
        break;

      case 'APPROVAL_REJECTED':
        if (event.locationId) {
          await this.onApprovalRejected(
            event.metadata.approvalId,
            event.locationId,
            event.metadata.userId
          );
        }
        break;

      case 'ALL_LOCATIONS_COMPLETED':
        if (event.accountId) {
          await this.onAllLocationsCompleted(event.accountId);
        }
        break;
    }
  }
}
