/**
 * Device Validation Service
 * Validates device support and triggers approval workflow for unsupported devices
 */

import { DeviceValidationResult } from './types';
import { PhoneBrand, Phone, PhoneAssignmentType } from '@/lib/mock-data/types';
import { mockDataService } from '@/lib/mock-data';
import { ApprovalService } from './approval.service';

export class DeviceValidationService {
  /**
   * Check if brand is supported (only Yealink and Polycom)
   */
  static isSupportedBrand(brand: PhoneBrand): boolean {
    return brand === PhoneBrand.YEALINK || brand === PhoneBrand.POLYCOM;
  }

  /**
   * Validate device brand and model
   * 
   * Business Rules:
   * - Only Yealink and Polycom brands are supported
   * - If brand is NOT Yealink or Polycom: mark as unsupported, skip all other validations
   * - If brand = OTHER: model field is free text
   * - If brand is Yealink/Polycom: validate model against supported models list
   */
  static validateDevice(
    brand: PhoneBrand,
    model: string
  ): DeviceValidationResult {
    // Rule: If brand is NOT Yealink or Polycom, mark as unsupported immediately
    if (!this.isSupportedBrand(brand)) {
      return {
        isValid: false,
        isSupported: false,
        brand,
        model,
        message: `${brand} is not a supported brand. Only Yealink and Polycom are supported.`,
      };
    }

    // For Yealink and Polycom, validate model against supported models
    // If brand = OTHER, model is free text but device is still unsupported
    if (brand === PhoneBrand.OTHER) {
      return {
        isValid: false,
        isSupported: false,
        brand,
        model, // Free text allowed
        message: `${brand} brand is not supported. Only Yealink and Polycom are supported.`,
      };
    }

    // Validate Yealink/Polycom models against supported list
    const isSupported = mockDataService.masterData.isPhoneModelSupported(brand, model);

    if (isSupported) {
      return {
        isValid: true,
        isSupported: true,
        brand,
        model,
      };
    }

    // Unsupported model for supported brand
    return {
      isValid: false,
      isSupported: false,
      brand,
      model,
      message: `${brand} ${model} is not a supported device model. Please choose a supported model or request approval to purchase.`,
    };
  }

  /**
   * Validate and mark device as unsupported if needed
   * Also sets warning state based on validation results
   */
  static validateAndMarkDevice(phone: Phone): {
    phone: Phone;
    requiresApproval: boolean;
    approvalId?: string;
  } {
    const validation = this.validateDevice(phone.brand, phone.model);
    
    phone.isUnsupported = !validation.isSupported;
    
    // Set warning state
    phone.hasWarnings = false;
    phone.warningReason = undefined;
    
    // Check for warning conditions (non-blocking issues)
    const warnings: string[] = [];
    
    // Missing device types
    if (!phone.deviceTypes || phone.deviceTypes.length === 0) {
      warnings.push('Device type(s) not selected');
      phone.hasWarnings = true;
    }
    
    // Missing assignment target
    if (phone.assignmentType === PhoneAssignmentType.ASSIGNED_TO_USER && !phone.assignedUserId) {
      warnings.push('User assignment missing');
      phone.hasWarnings = true;
    }
    
    if (phone.assignmentType === PhoneAssignmentType.ASSIGNED_TO_EXTENSION && !phone.extension) {
      warnings.push('Extension assignment missing');
      phone.hasWarnings = true;
    }
    
    if (warnings.length > 0) {
      phone.warningReason = warnings.join('; ');
    }

    if (!validation.isSupported) {
      // Trigger approval workflow for unsupported devices
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
   * Only returns models for Yealink and Polycom
   */
  static getSupportedModels(brand: PhoneBrand): Array<{ model: string; description?: string }> {
    // Only return models for supported brands
    if (!this.isSupportedBrand(brand)) {
      return [];
    }
    
    const models = mockDataService.masterData.getSupportedPhoneModels(brand);
    return models.map(m => ({
      model: m.model,
      description: m.description,
    }));
  }
  
  /**
   * Check if model field should be free text
   * Rule: If brand = OTHER, model is free text
   */
  static isModelFreeText(brand: PhoneBrand): boolean {
    return brand === PhoneBrand.OTHER;
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
