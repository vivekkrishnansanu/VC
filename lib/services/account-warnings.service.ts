/**
 * Account Warnings Service
 * Calculates warnings and blockers for accounts and locations
 */

import { mockDataService } from '@/lib/mock-data';
import { ApprovalService } from './approval.service';
import { DeviceValidationService } from './device-validation.service';
import { ValidationService } from './validation.service';

export interface LocationWarnings {
  blockers: {
    pendingApprovals: number;
    hasUnsupportedPhones: boolean;
  };
  warnings: {
    missingDevices: boolean;
    incompleteCallFlow: boolean;
  };
}

export interface AccountWarnings {
  blockers: {
    pendingApprovals: number;
    unsupportedPhones: number; // Count of locations with unsupported phones
  };
  warnings: {
    missingDevices: number; // Count of locations missing devices
    incompleteCallFlow: number; // Count of locations with incomplete call flow
  };
}

export class AccountWarningsService {
  /**
   * Calculate warnings/blockers for a single location
   */
  static calculateLocationWarnings(locationId: string): LocationWarnings {
    try {
      const onboarding = mockDataService.onboarding.getByLocationId(locationId);
      const phones = mockDataService.phones.getByLocationId(locationId);
      
      // Check pending approvals
      let pendingApprovals: any[] = [];
      try {
        pendingApprovals = ApprovalService.getPendingApprovals(locationId);
      } catch (err) {
        console.warn(`Error getting pending approvals for ${locationId}:`, err);
      }
      
      // Check unsupported phones
      const unsupportedPhones = phones?.filter(p => p.isUnsupported) || [];
      
      // Check missing devices
      const missingDevices = this.isMissingDevices(locationId, onboarding, phones || []);
      
      // Check incomplete call flow
      const incompleteCallFlow = this.isCallFlowIncomplete(locationId, onboarding);
      
      return {
        blockers: {
          pendingApprovals: pendingApprovals.length,
          hasUnsupportedPhones: unsupportedPhones.length > 0,
        },
        warnings: {
          missingDevices,
          incompleteCallFlow,
        },
      };
    } catch (error) {
      console.error(`Error calculating location warnings for ${locationId}:`, error);
      // Return safe defaults
      return {
        blockers: {
          pendingApprovals: 0,
          hasUnsupportedPhones: false,
        },
        warnings: {
          missingDevices: false,
          incompleteCallFlow: false,
        },
      };
    }
  }

  /**
   * Calculate warnings/blockers for an account (all locations)
   */
  static calculateAccountWarnings(accountId: string): AccountWarnings {
    const locations = mockDataService.locations.getByAccountId(accountId);
    
    const warnings: AccountWarnings = {
      blockers: {
        pendingApprovals: 0,
        unsupportedPhones: 0,
      },
      warnings: {
        missingDevices: 0,
        incompleteCallFlow: 0,
      },
    };

    for (const location of locations) {
      const locationWarnings = this.calculateLocationWarnings(location.id);
      
      // Aggregate blockers
      warnings.blockers.pendingApprovals += locationWarnings.blockers.pendingApprovals;
      if (locationWarnings.blockers.hasUnsupportedPhones) {
        warnings.blockers.unsupportedPhones += 1;
      }
      
      // Aggregate warnings
      if (locationWarnings.warnings.missingDevices) {
        warnings.warnings.missingDevices += 1;
      }
      if (locationWarnings.warnings.incompleteCallFlow) {
        warnings.warnings.incompleteCallFlow += 1;
      }
    }

    return warnings;
  }

  /**
   * Check if location has pending approvals
   */
  static hasPendingApprovals(locationId: string): boolean {
    const pendingApprovals = ApprovalService.getPendingApprovals(locationId);
    return pendingApprovals.length > 0;
  }

  /**
   * Check if location has unsupported phones
   */
  static hasUnsupportedPhones(locationId: string): boolean {
    const phones = mockDataService.phones.getByLocationId(locationId);
    return phones.some(p => p.isUnsupported);
  }

  /**
   * Check if location is missing devices
   * NEW LOGIC: Based on device ownership and purchase flow
   */
  private static isMissingDevices(
    locationId: string,
    onboarding: any,
    phones: any[]
  ): boolean {
    if (!onboarding) {
      return false;
    }

    // If device ownership is NOT_OWNED and not buying through VoiceStack, devices should be added manually
    if (onboarding.deviceOwnership === 'NOT_OWNED') {
      if (onboarding.buyPhonesThroughVoiceStack === false) {
        // Manual entry required but no devices
        return phones.length === 0;
      }
      // If buying through VoiceStack, catalog selections should exist
      if (onboarding.buyPhonesThroughVoiceStack === true) {
        return !onboarding.deviceCatalogSelections || onboarding.deviceCatalogSelections.length === 0;
      }
      return false; // Purchase decision not made yet
    }

    // If device ownership is OWNED
    if (onboarding.deviceOwnership === 'OWNED') {
      if (onboarding.hasYealinkOrPolycom === true) {
        // Should have devices entered manually
        return phones.length === 0;
      }
      if (onboarding.hasYealinkOrPolycom === false) {
        // Force purchase flow - check catalog or manual entry
        if (onboarding.buyPhonesThroughVoiceStack === true) {
          return !onboarding.deviceCatalogSelections || onboarding.deviceCatalogSelections.length === 0;
        }
        if (onboarding.buyPhonesThroughVoiceStack === false) {
          return phones.length === 0;
        }
        return false; // Purchase decision not made yet
      }
      return false; // Yealink/Polycom question not answered yet
    }

    // Legacy fallback: check totalDevices
    if (onboarding.totalDevices === 0 || (onboarding.totalDevices === undefined && phones.length === 0)) {
      return phones.length === 0;
    }

    return false;
  }

  /**
   * Check if call flow is incomplete
   */
  private static isCallFlowIncomplete(locationId: string, onboarding: any): boolean {
    if (!onboarding) {
      return false;
    }

    // Check IVR configuration
    if (onboarding.hasIVR) {
      // IVR enabled but no options
      if (!onboarding.ivrOptions || onboarding.ivrOptions.length === 0) {
        return true;
      }
      
      // Each option must have targets
      const hasInvalidOptions = onboarding.ivrOptions.some((option: any) => 
        !option.targets || option.targets.length === 0
      );
      if (hasInvalidOptions) {
        return true;
      }
    } else {
      // No IVR - check direct routing
      const hasDirectTargets = 
        (onboarding.directRingUsers && onboarding.directRingUsers.length > 0) ||
        (onboarding.directRingExtensions && onboarding.directRingExtensions.length > 0);
      
      if (!hasDirectTargets) {
        return true;
      }
    }

    return false;
  }
}
