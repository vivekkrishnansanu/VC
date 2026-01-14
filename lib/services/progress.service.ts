/**
 * Progress Calculation Service
 * Calculates onboarding progress for locations and accounts
 */

import { OnboardingStep } from './types';
import { mockDataService } from '@/lib/mock-data';
import { OnboardingSessionService } from './onboarding-session.service';

export interface LocationProgress {
  completed: number;
  total: number;
  percentage: number;
  currentStep: OnboardingStep | null;
}

export interface AccountProgress {
  completed: number;
  total: number;
  percentage: number;
}

export class ProgressService {
  /**
   * Total number of onboarding steps
   */
  private static readonly TOTAL_STEPS = 6;

  /**
   * Calculate progress for a single location
   */
  static calculateLocationProgress(locationId: string): LocationProgress {
    try {
      const session = OnboardingSessionService.getSession(locationId);
      
      if (session && session.completedSteps) {
        const completed = session.completedSteps.length;
        const percentage = Math.round((completed / this.TOTAL_STEPS) * 100);

        return {
          completed,
          total: this.TOTAL_STEPS,
          percentage,
          currentStep: session.currentStep,
        };
      }
    } catch (error) {
      // Fall through to fallback
    }
    
    try {
      // Fallback: check onboarding data
      const onboarding = mockDataService.onboarding.getByLocationId(locationId);
      if (!onboarding) {
        return {
          completed: 0,
          total: this.TOTAL_STEPS,
          percentage: 0,
          currentStep: null,
        };
      }

      // Estimate progress based on filled fields
      let completed = 0;
      if (onboarding.pocName && onboarding.pocEmail) completed++;
      if (onboarding.phoneSystemType) completed++;
      if (onboarding.totalDevices && onboarding.totalDevices > 0) completed++;
      // Working hours and call flow would need more specific checks
      
      const percentage = Math.round((completed / this.TOTAL_STEPS) * 100);

      return {
        completed,
        total: this.TOTAL_STEPS,
        percentage,
        currentStep: null,
      };
    } catch (error) {
      // Final fallback
      return {
        completed: 0,
        total: this.TOTAL_STEPS,
        percentage: 0,
        currentStep: null,
      };
    }
  }

  /**
   * Calculate progress for an account (all locations)
   */
  static calculateAccountProgress(accountId: string): AccountProgress {
    try {
      const locations = mockDataService.locations.getByAccountId(accountId);
      
      if (!locations || locations.length === 0) {
        return {
          completed: 0,
          total: 0,
          percentage: 0,
        };
      }

      let completed = 0;
      for (const location of locations) {
        try {
          const onboarding = mockDataService.onboarding.getByLocationId(location.id);
          if (onboarding?.status === 'COMPLETED') {
            completed++;
          }
        } catch (err) {
          console.warn(`Error checking location ${location.id} status:`, err);
        }
      }

      const percentage = locations.length > 0 ? Math.round((completed / locations.length) * 100) : 0;

      return {
        completed,
        total: locations.length,
        percentage,
      };
    } catch (error) {
      console.error(`Error calculating account progress for ${accountId}:`, error);
      return {
        completed: 0,
        total: 0,
        percentage: 0,
      };
    }
  }
}
