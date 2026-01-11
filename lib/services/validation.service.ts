/**
 * Validation Service
 * Validates working hours and call flow configurations
 */

import { WorkingHoursValidationResult, CallFlowValidationResult } from './types';
import { DayOfWeek } from '@/lib/mock-data/types';
import { mockDataService } from '@/lib/mock-data';

export class ValidationService {
  /**
   * Validate working hours schedule
   */
  static validateWorkingHours(locationId: string): WorkingHoursValidationResult {
    const errors: string[] = [];
    const onboarding = mockDataService.onboarding.getByLocationId(locationId);
    
    if (!onboarding) {
      return {
        isValid: false,
        errors: ['No onboarding data found for location'],
      };
    }

    // In real implementation, fetch working hours from database
    // For now, we'll validate based on onboarding data
    // This is a placeholder - implement actual working hours validation

    // Example validations:
    // - Check for time format (HH:mm)
    // - Check for overlaps
    // - Ensure at least one day is configured

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate call flow configuration
   */
  static validateCallFlow(locationId: string): CallFlowValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const onboarding = mockDataService.onboarding.getByLocationId(locationId);

    if (!onboarding) {
      return {
        isValid: false,
        errors: ['No onboarding data found for location'],
        warnings: [],
      };
    }

    // Validate greeting message
    if (!onboarding.greetingMessage || onboarding.greetingMessage.trim().length === 0) {
      warnings.push('Greeting message is recommended');
    }

    // Validate IVR configuration
    if (onboarding.hasIVR) {
      // In real implementation, fetch IVR options from database
      // Validate:
      // - At least one IVR option exists
      // - Each option has at least one target
      // - Retry attempts and wait time are valid
      // - Voicemail script exists if no pickup
    } else {
      // Validate direct routing
      // - At least one routing target exists
      // - Voicemail script exists
    }

    // Validate voicemail
    if (!onboarding.greetingMessage) {
      warnings.push('Voicemail script is recommended');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate time format (HH:mm)
   */
  static validateTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  /**
   * Check if two time ranges overlap
   */
  static timeRangesOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    if (!this.validateTimeFormat(start1) || !this.validateTimeFormat(end1) ||
        !this.validateTimeFormat(start2) || !this.validateTimeFormat(end2)) {
      return false;
    }

    const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const start1Min = timeToMinutes(start1);
    const end1Min = timeToMinutes(end1);
    const start2Min = timeToMinutes(start2);
    const end2Min = timeToMinutes(end2);

    return start1Min < end2Min && start2Min < end1Min;
  }

  /**
   * Validate complete onboarding before submission
   */
  static validateOnboardingForSubmission(locationId: string): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    const onboarding = mockDataService.onboarding.getByLocationId(locationId);
    if (!onboarding) {
      errors.push('Onboarding data not found');
      return { isValid: false, errors, warnings };
    }

    // Validate basic details
    if (!onboarding.pocName) errors.push('POC name is required');
    if (!onboarding.pocEmail) errors.push('POC email is required');
    if (!onboarding.pocPhone) errors.push('POC phone is required');

    // Validate phone system
    if (!onboarding.phoneSystemType) {
      errors.push('Phone system type is required');
    }

    // Validate devices
    if (!onboarding.totalDevices || onboarding.totalDevices === 0) {
      errors.push('At least one device is required');
    }

    // Validate call flow
    const callFlowValidation = this.validateCallFlow(locationId);
    errors.push(...callFlowValidation.errors);
    warnings.push(...callFlowValidation.warnings);

    // Validate working hours
    const workingHoursValidation = this.validateWorkingHours(locationId);
    errors.push(...workingHoursValidation.errors);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
