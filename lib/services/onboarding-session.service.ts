/**
 * Onboarding Session Service
 * Manages onboarding sessions, step tracking, and status management
 */

import { OnboardingStep, OnboardingSession } from './types';
import { OnboardingStatus } from '@/lib/mock-data/types';
import { mockDataService } from '@/lib/mock-data';
import { getOnboardingStore } from '@/lib/storage';

// In-memory cache (storage is handled by adapter; this is just a hot cache)
const sessionCache: Map<string, OnboardingSession> = new Map();

export class OnboardingSessionService {
  /**
   * Get or create onboarding session for a location
   */
  static async getOrCreateSession(locationId: string): Promise<OnboardingSession> {
    const existing = sessionCache.get(locationId);
    if (existing) {
      return existing;
    }

    const store = getOnboardingStore();
    const storedSession = await store.getSession(locationId);
    if (storedSession) {
      sessionCache.set(locationId, storedSession);
      return storedSession;
    }

    const onboarding =
      (await store.getOnboarding(locationId)) ??
      mockDataService.onboarding.getByLocationId(locationId);
    
    // Determine initial step based on onboarding data
    let currentStep = OnboardingStep.BASIC_DETAILS;
    const completedSteps: OnboardingStep[] = [];

    if (onboarding) {
      // Check which steps are completed
      if (onboarding.pocName && onboarding.pocEmail) {
        completedSteps.push(OnboardingStep.BASIC_DETAILS);
        currentStep = OnboardingStep.PHONE_SYSTEM;
      }
      if (onboarding.phoneSystemType) {
        completedSteps.push(OnboardingStep.PHONE_SYSTEM);
        currentStep = OnboardingStep.DEVICES;
      }
      if (onboarding.totalDevices !== undefined) {
        const phones = mockDataService.phones.getByLocationId(locationId);
        if (phones.length > 0) {
          completedSteps.push(OnboardingStep.DEVICES);
          currentStep = OnboardingStep.WORKING_HOURS;
        }
      }
      if ((onboarding as any)?.workingHours && Array.isArray((onboarding as any).workingHours) && (onboarding as any).workingHours.length > 0) {
        completedSteps.push(OnboardingStep.WORKING_HOURS);
        currentStep = OnboardingStep.CALL_FLOW;
      }
      if (onboarding.hasIVR !== undefined || (onboarding as any)?.directRingUsers || (onboarding as any)?.directRingExtensions) {
        completedSteps.push(OnboardingStep.CALL_FLOW);
        currentStep = OnboardingStep.CALL_QUEUE;
      }
      if ((onboarding as any)?.callQueue) {
        completedSteps.push(OnboardingStep.CALL_QUEUE);
        currentStep = OnboardingStep.USERS;
      }
      // Add more step checks as needed
    }

    const session: OnboardingSession = {
      id: `session-${locationId}`,
      locationId,
      currentStep,
      completedSteps,
      status: onboarding?.status || OnboardingStatus.NOT_STARTED,
      isLocked: onboarding?.status === OnboardingStatus.APPROVED || 
                onboarding?.status === OnboardingStatus.PROVISIONING ||
                onboarding?.status === OnboardingStatus.COMPLETED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await store.upsertSession(session);
    sessionCache.set(locationId, session);
    return session;
  }

  /**
   * Update current step
   */
  static async updateStep(locationId: string, step: OnboardingStep): Promise<OnboardingSession> {
    const store = getOnboardingStore();
    const session = await this.getOrCreateSession(locationId);
    
    if (session.isLocked) {
      throw new Error('Onboarding session is locked and cannot be modified');
    }

    // Mark previous step as completed if moving forward
    if (!session.completedSteps.includes(session.currentStep)) {
      session.completedSteps.push(session.currentStep);
    }

    session.currentStep = step;
    session.status = OnboardingStatus.IN_PROGRESS;
    session.updatedAt = new Date();

    await store.upsertSession(session);
    sessionCache.set(locationId, session);
    return session;
  }

  /**
   * Mark step as completed
   */
  static async completeStep(locationId: string, step: OnboardingStep): Promise<OnboardingSession> {
    const store = getOnboardingStore();
    const session = await this.getOrCreateSession(locationId);
    
    if (session.isLocked) {
      throw new Error('Onboarding session is locked and cannot be modified');
    }

    if (!session.completedSteps.includes(step)) {
      session.completedSteps.push(step);
    }

    // Auto-advance to next step if completing current step
    if (step === session.currentStep) {
      const nextStep = this.getNextStep(step);
      if (nextStep) {
        session.currentStep = nextStep;
      }
    }

    session.status = OnboardingStatus.IN_PROGRESS;
    session.updatedAt = new Date();

    await store.upsertSession(session);
    sessionCache.set(locationId, session);
    return session;
  }

  /**
   * Get next step in sequence
   */
  static getNextStep(currentStep: OnboardingStep): OnboardingStep | null {
    const stepOrder = [
      OnboardingStep.BASIC_DETAILS,
      OnboardingStep.PHONE_SYSTEM,
      OnboardingStep.DEVICES,
      OnboardingStep.WORKING_HOURS,
      OnboardingStep.CALL_FLOW,
      OnboardingStep.CALL_QUEUE,
      OnboardingStep.USERS,
      OnboardingStep.REVIEW,
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex === -1 || currentIndex === stepOrder.length - 1) {
      return null;
    }

    return stepOrder[currentIndex + 1];
  }

  /**
   * Get previous step
   */
  static getPreviousStep(currentStep: OnboardingStep): OnboardingStep | null {
    const stepOrder = [
      OnboardingStep.BASIC_DETAILS,
      OnboardingStep.PHONE_SYSTEM,
      OnboardingStep.DEVICES,
      OnboardingStep.WORKING_HOURS,
      OnboardingStep.CALL_FLOW,
      OnboardingStep.CALL_QUEUE,
      OnboardingStep.USERS,
      OnboardingStep.REVIEW,
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex <= 0) {
      return null;
    }

    return stepOrder[currentIndex - 1];
  }

  /**
   * Update session status
   */
  static updateStatus(
    locationId: string,
    status: OnboardingStatus,
    lockSession: boolean = false
  ): Promise<OnboardingSession> {
    return (async () => {
      const store = getOnboardingStore();
      const session = await this.getOrCreateSession(locationId);
    
      session.status = status;
      session.isLocked = lockSession || session.isLocked;
      session.updatedAt = new Date();

      await store.upsertSession(session);
      sessionCache.set(locationId, session);
      return session;
    })();
  }

  /**
   * Check if session can be submitted
   */
  static async canSubmit(locationId: string): Promise<{ canSubmit: boolean; reasons: string[] }> {
    // NOTE: For demo this uses cache-only. API paths that call canSubmit should call getOrCreateSession first.
    const session = sessionCache.get(locationId);
    if (!session) {
      return { canSubmit: false, reasons: ['No session loaded'] };
    }
    const reasons: string[] = [];

    if (session.isLocked) {
      reasons.push('Session is locked');
    }

    // Check if all required steps are completed
    const requiredSteps = [
      OnboardingStep.BASIC_DETAILS,
      OnboardingStep.PHONE_SYSTEM,
      OnboardingStep.DEVICES,
      OnboardingStep.WORKING_HOURS,
      OnboardingStep.CALL_FLOW,
      OnboardingStep.CALL_QUEUE,
      OnboardingStep.USERS,
    ];

    const missingSteps = requiredSteps.filter(
      step => !session.completedSteps.includes(step)
    );

    if (missingSteps.length > 0) {
      reasons.push(`Missing steps: ${missingSteps.join(', ')}`);
    }

    // Check for pending approvals
    const { ApprovalService } = await import('./approval.service');
    const pendingApprovals = ApprovalService.getPendingApprovals(locationId);
    if (pendingApprovals.length > 0) {
      reasons.push(`Pending approvals required (${pendingApprovals.length} approval(s) pending)`);
    }

    // Check validation errors (NEW: includes device ownership, IVR structure, etc.)
    const { ValidationService } = await import('./validation.service');
    const validation = ValidationService.validateOnboardingForSubmission(locationId);
    if (!validation.isValid) {
      reasons.push(...validation.errors);
    }

    return {
      canSubmit: reasons.length === 0,
      reasons,
    };
  }

  /**
   * Get session by location ID
   */
  static getSession(locationId: string): OnboardingSession | null {
    return sessionCache.get(locationId) || null;
  }

  /**
   * Reset session (for testing/debugging)
   */
  static resetSession(locationId: string): void {
    sessionCache.delete(locationId);
  }
}
