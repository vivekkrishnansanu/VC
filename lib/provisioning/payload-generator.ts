/**
 * Provisioning Payload Generator
 * Generates clean, implementation-ready JSON payloads for provisioning
 */

import { mockDataService } from '@/lib/mock-data';
import { Logger } from '@/lib/observability/logger';

export interface ProvisioningPayload {
  locationId: string;
  locationName: string;
  accountId: string;
  accountName: string;
  timestamp: string;
  version: string;
  
  // Location details
  location: {
    name: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      zipcode: string;
    };
  };

  // Contact information
  contacts: {
    primary: {
      name: string;
      email: string;
      phone: string;
      preferredContactMedium?: string;
    };
  };

  // Phone system
  phoneSystem: {
    type: string;
    details?: string;
    voipProvider?: string;
    callForwardingSupported?: boolean;
    fax: {
      usesFax: boolean;
      faxNumber?: string;
      wantsFaxInVoiceStack?: boolean;
    };
  };

  // Devices
  devices: Array<{
    id: string;
    brand: string;
    model: string;
    ownership: string;
    assignmentType: string;
    macAddress?: string;
    serialNumber?: string;
    extension?: string;
    assignedUser?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
  }>;

  // Users (from device assignments)
  users: Array<{
    firstName: string;
    lastName: string;
    email: string;
    extension?: string;
  }>;

  // Extensions
  extensions: Array<{
    extension: string;
    assignedTo: 'user' | 'device' | 'common';
    userId?: string;
    deviceId?: string;
  }>;

  // Working hours
  workingHours: Array<{
    day: string;
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
  }>;

  // Call flow
  callFlow: {
    greetingMessage?: string;
    hasIVR: boolean;
    ivr?: {
      options: Array<{
        optionNumber: string;
        script: string;
        ringType: 'users' | 'extensions';
        targets: Array<{
          userId?: string;
          extension?: string;
        }>;
        retryAttempts: number;
        waitTime: number;
        invalidSelectionScript?: string;
        afterRetriesTarget: string;
        voicemailScript?: string;
      }>;
    };
    directRouting?: {
      ringType: 'users' | 'extensions';
      targets: Array<{
        userId?: string;
        extension?: string;
      }>;
    };
    voicemail: {
      script?: string;
      sharedUsers?: string[];
    };
  };

  // Metadata
  metadata: {
    practiceManagementSoftware?: string;
    totalDevices: number;
    assignmentStrategy?: string;
    submittedAt?: string;
    generatedAt: string;
  };
}

export class ProvisioningPayloadGenerator {
  /**
   * Generate provisioning payload for a location
   */
  static generate(locationId: string): ProvisioningPayload {
    const location = mockDataService.locations.getById(locationId);
    if (!location) {
      throw new Error(`Location ${locationId} not found`);
    }

    const account = mockDataService.accounts.getById(location.accountId);
    if (!account) {
      throw new Error(`Account ${location.accountId} not found`);
    }

    const onboarding = mockDataService.onboarding.getByLocationId(locationId);
    if (!onboarding) {
      throw new Error(`Onboarding not found for location ${locationId}`);
    }

    const phones = mockDataService.phones.getByLocationId(locationId);
    
    // Extract users from device assignments
    const usersMap = new Map<string, { firstName: string; lastName: string; email: string; extension?: string }>();
    phones.forEach(phone => {
      if (phone.assignmentType === 'ASSIGNED_TO_USER' && phone.assignedUserId) {
        const user = mockDataService.users.getById(phone.assignedUserId);
        if (user && !usersMap.has(user.id)) {
          usersMap.set(user.id, {
            firstName: user.name.split(' ')[0] || '',
            lastName: user.name.split(' ').slice(1).join(' ') || '',
            email: user.email,
            extension: phone.extension,
          });
        }
      }
    });

    // Build extensions list
    const extensions = phones
      .filter(p => p.extension)
      .map(phone => ({
        extension: phone.extension!,
        assignedTo: phone.assignmentType === 'ASSIGNED_TO_USER' ? 'user' as const :
                   phone.assignmentType === 'ASSIGNED_TO_EXTENSION' ? 'device' as const :
                   'common' as const,
        userId: phone.assignedUserId,
        deviceId: phone.id,
      }));

    // Build devices payload
    const devicesPayload = phones.map(phone => ({
      id: phone.id,
      brand: phone.brand,
      model: phone.model,
      ownership: phone.ownership,
      assignmentType: phone.assignmentType,
      macAddress: phone.macAddress || undefined,
      serialNumber: phone.serialNumber || undefined,
      extension: phone.extension || undefined,
      assignedUser: phone.assignedUserId ? {
        firstName: usersMap.get(phone.assignedUserId)?.firstName,
        lastName: usersMap.get(phone.assignedUserId)?.lastName,
        email: usersMap.get(phone.assignedUserId)?.email,
      } : undefined,
    }));

    // Build call flow payload
    const callFlowPayload: ProvisioningPayload['callFlow'] = {
      greetingMessage: onboarding.greetingMessage || undefined,
      hasIVR: onboarding.hasIVR || false,
      voicemail: {
        script: onboarding.greetingMessage || undefined,
        sharedUsers: [], // TODO: Get from shared voicemail users
      },
    };

    // TODO: Add IVR and direct routing from call flow data
    // This would come from the CallFlow model in the database

    const payload: ProvisioningPayload = {
      locationId: location.id,
      locationName: location.name,
      accountId: account.id,
      accountName: account.name,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      
      location: {
        name: location.name,
        address: {
          line1: location.addressLine1,
          line2: location.addressLine2 || undefined,
          city: location.city,
          state: location.state,
          zipcode: location.zipcode,
        },
      },

      contacts: {
        primary: {
          name: onboarding.pocName || '',
          email: onboarding.pocEmail || '',
          phone: onboarding.pocPhone || '',
          preferredContactMedium: onboarding.preferredContactMedium || undefined,
        },
      },

      phoneSystem: {
        type: onboarding.phoneSystemType || '',
        details: onboarding.phoneSystemDetails || undefined,
        voipProvider: onboarding.phoneSystemVoipType || undefined,
        callForwardingSupported: onboarding.callForwardingSupported || undefined,
        fax: {
          usesFax: onboarding.usesFax || false,
          faxNumber: onboarding.faxNumber || undefined,
          wantsFaxInVoiceStack: onboarding.wantsFaxInVoiceStack || undefined,
        },
      },

      devices: devicesPayload,
      users: Array.from(usersMap.values()),
      extensions,

      workingHours: [], // TODO: Get from WorkingHoursSchedule model

      callFlow: callFlowPayload,

      metadata: {
        practiceManagementSoftware: onboarding.practiceManagementSoftware || undefined,
        totalDevices: phones.length,
        assignmentStrategy: onboarding.assignmentStrategy || undefined,
        submittedAt: onboarding.submittedAt?.toISOString() || undefined,
        generatedAt: new Date().toISOString(),
      },
    };

    Logger.info('Provisioning payload generated', {
      locationId,
      action: 'GENERATE_PROVISIONING_PAYLOAD',
      metadata: {
        deviceCount: devicesPayload.length,
        userCount: usersMap.size,
        extensionCount: extensions.length,
      },
    });

    return payload;
  }

  /**
   * Validate payload before sending to provisioning system
   */
  static validate(payload: ProvisioningPayload): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!payload.location.name) {
      errors.push('Location name is required');
    }

    if (!payload.contacts.primary.email) {
      errors.push('Primary contact email is required');
    }

    if (payload.devices.length === 0) {
      errors.push('At least one device is required');
    }

    if (!payload.phoneSystem.type) {
      errors.push('Phone system type is required');
    }

    if (payload.callFlow.hasIVR && !payload.callFlow.ivr) {
      errors.push('IVR configuration is missing');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate payload and validate
   */
  static generateAndValidate(locationId: string): {
    payload: ProvisioningPayload;
    valid: boolean;
    errors: string[];
  } {
    const payload = this.generate(locationId);
    const validation = this.validate(payload);

    return {
      payload,
      ...validation,
    };
  }
}
