/**
 * Onboarding Submit API
 * POST: Submit onboarding for a location
 */

import { NextRequest, NextResponse } from 'next/server';
import { OnboardingSessionService, ValidationService, AutomationService } from '@/lib/services';
import { OnboardingStatus } from '@/lib/mock-data/types';
import { requireOnboardingEdit } from '@/lib/auth/middleware';
import { LockService } from '@/lib/data-integrity/lock-service';
import { Logger } from '@/lib/observability/logger';
import { ErrorTracker } from '@/lib/observability/error-tracking';
import { SafeguardsService } from '@/lib/safeguards/validation-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationId } = body;

    if (!locationId) {
      return NextResponse.json(
        { error: 'locationId is required' },
        { status: 400 }
      );
    }

    // Check authentication and edit permissions
    const authResult = requireOnboardingEdit(request, locationId);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { context } = authResult;
    const userId = context.userId;

    // Check rate limiting
    const rateLimit = SafeguardsService.checkRateLimit(userId, 'SUBMIT_ONBOARDING');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Check if can submit
    const canSubmit = await OnboardingSessionService.canSubmit(locationId);
    if (!canSubmit.canSubmit) {
      return NextResponse.json(
        { error: 'Cannot submit onboarding', reasons: canSubmit.reasons },
        { status: 400 }
      );
    }

    // Validate onboarding data
    const validation = ValidationService.validateOnboardingForSubmission(locationId);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validation.errors, warnings: validation.warnings },
        { status: 400 }
      );
    }

    // Additional safeguards validation
    const safeguardsCheck = SafeguardsService.validateBeforeSubmission(locationId);
    if (!safeguardsCheck.valid) {
      ErrorTracker.trackValidationError(safeguardsCheck.errors, locationId, userId);
      return NextResponse.json(
        { error: 'Validation failed', errors: safeguardsCheck.errors, warnings: safeguardsCheck.warnings },
        { status: 400 }
      );
    }

    // Submit onboarding
    await AutomationService.onOnboardingSubmitted(locationId, userId);

    // Lock onboarding
    LockService.lockOnboarding(locationId, userId, 'Submitted for approval');

    // Update session status
    OnboardingSessionService.updateStatus(
      locationId,
      OnboardingStatus.PENDING_APPROVAL,
      true
    );

    // Log submission
    Logger.logSubmission(locationId, userId);

    return NextResponse.json({
      success: true,
      message: 'Onboarding submitted successfully',
      locationId,
    });
  } catch (error: any) {
    ErrorTracker.trackApiError(error, '/api/onboarding/submit', 'POST');
    return NextResponse.json(
      { error: error.message || 'Failed to submit onboarding' },
      { status: 500 }
    );
  }
}
