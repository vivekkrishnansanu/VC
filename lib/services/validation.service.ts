/**
 * Validation Service
 * Validates working hours and call flow configurations
 */

import { WorkingHoursValidationResult, CallFlowValidationResult } from './types';
import { DayOfWeek, DeviceOwnership } from '@/lib/mock-data/types';
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
    // For now, we'll use mock data structure
    // Working hours are stored as part of onboarding or in separate table
    
    // For demo purposes, we'll check if working hours data exists
    // In production, this would query WorkingHoursSchedule table
    
    // Validate that at least one day is configured as open
    // This is a placeholder - in production, fetch actual working hours schedules
    // and validate:
    // 1. Time format (HH:mm) for open/close times
    // 2. No overlaps within the same day (if multiple shifts)
    // 3. At least one day is open
    
    // For now, we'll do basic validation
    // In production implementation:
    // const schedules = await prisma.workingHoursSchedule.findMany({
    //   where: { onboardingId: onboarding.id }
    // });
    
    // Check time format and overlaps for each day
    // Group by day and check for overlaps
    // For each day with isOpen = true:
    //   - Validate openTime and closeTime format
    //   - If multiple shifts exist (future enhancement), check overlaps
    
    // Basic validation: ensure times are valid format if provided
    // This will be fully implemented when working hours are stored in database
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate working hours schedules for overlaps (helper method)
   * This checks if multiple time ranges on the same day overlap
   */
  static validateWorkingHoursOverlaps(schedules: Array<{
    dayOfWeek: DayOfWeek;
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
  }>): string[] {
    const errors: string[] = [];
    
    // Group schedules by day
    const schedulesByDay = new Map<DayOfWeek, Array<{ openTime: string; closeTime: string }>>();
    
    for (const schedule of schedules) {
      if (!schedule.isOpen || !schedule.openTime || !schedule.closeTime) {
        continue;
      }
      
      // Validate time format
      if (!this.validateTimeFormat(schedule.openTime) || !this.validateTimeFormat(schedule.closeTime)) {
        errors.push(`Invalid time format for ${schedule.dayOfWeek}`);
        continue;
      }
      
      // Validate open time is before close time
      const openMinutes = this.timeToMinutes(schedule.openTime);
      const closeMinutes = this.timeToMinutes(schedule.closeTime);
      if (openMinutes >= closeMinutes) {
        errors.push(`${schedule.dayOfWeek}: Open time must be before close time`);
        continue;
      }
      
      // For now, we assume one shift per day
      // If multiple shifts are added in future, check overlaps here
      if (!schedulesByDay.has(schedule.dayOfWeek)) {
        schedulesByDay.set(schedule.dayOfWeek, []);
      }
      
      const daySchedules = schedulesByDay.get(schedule.dayOfWeek)!;
      
      // Check for overlaps with existing schedules for this day
      for (const existing of daySchedules) {
        if (this.timeRangesOverlap(
          schedule.openTime,
          schedule.closeTime,
          existing.openTime,
          existing.closeTime
        )) {
          errors.push(`${schedule.dayOfWeek}: Working hours overlap detected`);
          break;
        }
      }
      
      daySchedules.push({
        openTime: schedule.openTime,
        closeTime: schedule.closeTime,
      });
    }
    
    // Check that at least one day is open
    const hasOpenDay = schedules.some(s => s.isOpen);
    if (!hasOpenDay) {
      errors.push('At least one day must be configured as open');
    }
    
    return errors;
  }

  /**
   * Convert time string to minutes (helper)
   */
  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
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

    // Validate IVR configuration (NEW STRUCTURE)
    if (onboarding.hasIVR) {
      // Validate global IVR script (required at top)
      if (!onboarding.ivrScript || onboarding.ivrScript.trim().length === 0) {
        errors.push('IVR script is required when IVR is enabled');
      }
      
      // Validate global IVR fields
      if (onboarding.ivrRetryAttempts !== undefined && onboarding.ivrRetryAttempts < 0) {
        errors.push('IVR retry attempts must be 0 or greater');
      }
      
      if (onboarding.ivrWaitTime !== undefined && onboarding.ivrWaitTime < 0) {
        errors.push('IVR wait time must be 0 or greater');
      }
      
      // Validate after retry routing if retries are enabled
      if (onboarding.ivrRetryAttempts !== undefined && onboarding.ivrRetryAttempts > 0) {
        if (!onboarding.ivrAfterRetriesTarget || onboarding.ivrAfterRetriesTarget.trim().length === 0) {
          errors.push('After retry routing is required when retry attempts are configured');
        }
      }
      
      // Validate IVR options exist
      if (!onboarding.ivrOptions || onboarding.ivrOptions.length === 0) {
        errors.push('At least one IVR option is required when IVR is enabled');
      } else {
        // Validate each IVR option (simplified - only routing targets)
        for (let i = 0; i < onboarding.ivrOptions.length; i++) {
          const option = onboarding.ivrOptions[i];
          
          // Validate option number (DTMF digit)
          if (!option.optionNumber || option.optionNumber.trim().length === 0) {
            errors.push(`IVR option ${i + 1}: Option number (DTMF digit) is required`);
          }
          
          // Validate at least one target exists
          if (!option.targets || option.targets.length === 0) {
            errors.push(`IVR option ${i + 1}: At least one routing target is required`);
          } else {
            // Validate targets have either userId or extension
            const hasValidTarget = option.targets.some(
              (target: any) => target.userId || target.extension
            );
            if (!hasValidTarget) {
              errors.push(`IVR option ${i + 1}: Each target must have either userId or extension`);
            }
          }
        }
      }
    } else {
      // Validate direct routing
      // Check if direct ring targets exist
      const hasDirectTargets = 
        (onboarding.directRingUsers && onboarding.directRingUsers.length > 0) ||
        (onboarding.directRingExtensions && onboarding.directRingExtensions.length > 0);
      
      if (!hasDirectTargets) {
        errors.push('At least one direct routing target (user or extension) is required when IVR is disabled');
      }
      
      // Validate voicemail script exists for direct routing
      if (!onboarding.voicemailScript || onboarding.voicemailScript.trim().length === 0) {
        warnings.push('Voicemail script is recommended for direct routing');
      }
    }

    // Validate voicemail script (general recommendation)
    if (!onboarding.voicemailScript || onboarding.voicemailScript.trim().length === 0) {
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
   * Includes new business rules for device ownership and purchase flow
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

    // Validate FAX (explicit Yes/No required)
    if (onboarding.usesFax === undefined || onboarding.usesFax === null) {
      errors.push('FAX usage question must be answered (Yes or No)');
    } else if (onboarding.usesFax === true && !onboarding.faxNumber) {
      errors.push('FAX number is required when you use fax');
    } else if (onboarding.usesFax === false && onboarding.wantsFaxInVoiceStack === undefined) {
      errors.push('VoiceStack fax question must be answered when you do not use fax');
    }

    // Validate device ownership (NEW)
    if (onboarding.deviceOwnership === undefined || onboarding.deviceOwnership === null) {
      errors.push('Device ownership question must be answered (Owned or Not Owned)');
    } else {
      // If owned, check Yealink/Polycom question
      if (onboarding.deviceOwnership === DeviceOwnership.OWNED && onboarding.hasYealinkOrPolycom === undefined) {
        errors.push('Yealink/Polycom question must be answered when you own devices');
      }
      
      // Purchase flow validation
      const requiresPurchaseDecision = 
        onboarding.deviceOwnership === DeviceOwnership.NOT_OWNED ||
        (onboarding.deviceOwnership === DeviceOwnership.OWNED && onboarding.hasYealinkOrPolycom === false);
      
      if (requiresPurchaseDecision && onboarding.buyPhonesThroughVoiceStack === undefined) {
        errors.push('Purchase decision must be answered');
      }
      
      // If buying through VoiceStack, validate catalog selections
      if (onboarding.buyPhonesThroughVoiceStack === true) {
        if (!onboarding.deviceCatalogSelections || onboarding.deviceCatalogSelections.length === 0) {
          errors.push('At least one device must be selected from catalog when buying through VoiceStack');
        } else {
          // Validate each catalog selection
          onboarding.deviceCatalogSelections.forEach((selection: any, idx: number) => {
            if (!selection.brand || !selection.model) {
              errors.push(`Catalog selection ${idx + 1}: Brand and model are required`);
            }
            if (!selection.quantity || selection.quantity <= 0) {
              errors.push(`Catalog selection ${idx + 1}: Quantity must be greater than 0`);
            }
            if (!selection.deviceTypes || selection.deviceTypes.length === 0) {
              warnings.push(`Catalog selection ${idx + 1}: Device type(s) recommended`);
            }
          });
        }
      }
      
      // If manual device entry allowed, validate devices
      const manualEntryAllowed = 
        (onboarding.deviceOwnership === DeviceOwnership.OWNED && onboarding.hasYealinkOrPolycom === true) ||
        (onboarding.deviceOwnership === DeviceOwnership.NOT_OWNED && onboarding.buyPhonesThroughVoiceStack === false) ||
        (onboarding.deviceOwnership === DeviceOwnership.OWNED && onboarding.hasYealinkOrPolycom === false && onboarding.buyPhonesThroughVoiceStack === false);
      
      if (manualEntryAllowed) {
        const phones = mockDataService.phones.getByLocationId(locationId);
        if (phones.length === 0) {
          errors.push('At least one device must be added');
        } else {
          // Validate each device
          phones.forEach((phone, idx) => {
            if (!phone.deviceTypes || phone.deviceTypes.length === 0) {
              errors.push(`Device ${idx + 1}: Device type(s) are required`);
            }
            if (phone.assignmentType === 'ASSIGNED_TO_USER' && !phone.assignedUserId) {
              errors.push(`Device ${idx + 1}: User assignment is required`);
            }
            if (phone.assignmentType === 'ASSIGNED_TO_EXTENSION' && !phone.extension) {
              errors.push(`Device ${idx + 1}: Extension assignment is required`);
            }
            if (phone.isUnsupported) {
              errors.push(`Device ${idx + 1}: Unsupported device blocks submission`);
            }
            if (phone.hasWarnings) {
              warnings.push(`Device ${idx + 1}: ${phone.warningReason || 'Has warnings'}`);
            }
          });
        }
      }
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
