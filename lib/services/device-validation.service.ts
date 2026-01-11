/**
 * Device Validation Service
 * Validates device support and triggers approval workflow for unsupported devices
 */

import { DeviceValidationResult } from './types';
import { PhoneBrand, Phone } from '@/lib/mock-data/types';
import { mockDataService } from '@/lib/mock-data';
import { ApprovalService } from './approval.service';

export class DeviceValidationService {
  /**
   * Validate device brand and model
   */
  static validateDevice(
    brand: PhoneBrand,
    model: string
  ): DeviceValidationResult {
    const isSupported = mockDataService.masterData.isPhoneModelSupported(brand, model);

    if (isSupported) {
      return {
        isValid: true,
        isSupported: true,
        brand,
        model,
      };
    }

    // Unsupported device
    return {
      isValid: false,
      isSupported: false,
      brand,
      model,
      message: `${brand} ${model} is not a supported device. Please choose a supported model or request approval to purchase.`,
    };
  }

  /**
   * Validate and mark device as unsupported if needed
   */
  static validateAndMarkDevice(phone: Phone): {
    phone: Phone;
    requiresApproval: boolean;
    approvalId?: string;
  } {
    const validation = this.validateDevice(phone.brand, phone.model);
    
    phone.isUnsupported = !validation.isSupported;

    if (!validation.isSupported) {
      // Trigger approval workflow
      const approval = ApprovalService.requestPhonePurchase({
        phoneId: phone.id,
        locationId: phone.locationId,
        brand: phone.brand,
        model: phone.model,
        requestedBy: 'system', // In real app, get from auth context
      });

      return {
        phone,
        requiresApproval: true,
        approvalId: approval.id,
      };
    }

    return {
      phone,
      requiresApproval: false,
    };
  }

  /**
   * Get supported models for a brand
   */
  static getSupportedModels(brand: PhoneBrand): Array<{ model: string; description?: string }> {
    const models = mockDataService.masterData.getSupportedPhoneModels(brand);
    return models.map(m => ({
      model: m.model,
      description: m.description,
    }));
  }

  /**
   * Check if location has unsupported devices
   */
  static hasUnsupportedDevices(locationId: string): boolean {
    const unsupported = mockDataService.phones.getUnsupported(locationId);
    return unsupported.length > 0;
  }

  /**
   * Get all unsupported devices for a location
   */
  static getUnsupportedDevices(locationId: string): Phone[] {
    return mockDataService.phones.getUnsupported(locationId);
  }

  /**
   * Check if location can submit with unsupported devices
   */
  static canSubmitWithUnsupportedDevices(locationId: string): {
    canSubmit: boolean;
    reason: string;
    unsupportedCount: number;
  } {
    const unsupported = this.getUnsupportedDevices(locationId);
    
    if (unsupported.length === 0) {
      return {
        canSubmit: true,
        reason: '',
        unsupportedCount: 0,
      };
    }

    // Check if all unsupported devices have approved purchase requests
    // This would check approval status in real implementation
    const allApproved = true; // Placeholder - implement approval check

    if (!allApproved) {
      return {
        canSubmit: false,
        reason: `Location has ${unsupported.length} unsupported device(s) with pending approvals`,
        unsupportedCount: unsupported.length,
      };
    }

    return {
      canSubmit: true,
      reason: 'All unsupported devices have approved purchase requests',
      unsupportedCount: unsupported.length,
    };
  }
}
