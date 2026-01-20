/**
 * Onboarding Session API
 * GET: Get or create session
 * PATCH: Update session step/status
 */

import { NextRequest, NextResponse } from 'next/server';
import { OnboardingSessionService } from '@/lib/services';
import { OnboardingStep, OnboardingStatus } from '@/lib/mock-data/types';
import { requireLocationAccess } from '@/lib/auth/middleware';
import { ErrorTracker } from '@/lib/observability/error-tracking';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locationId = searchParams.get('locationId');

    if (!locationId) {
      return NextResponse.json(
        { error: 'locationId is required' },
        { status: 400 }
      );
    }

    // Check location access (allow in development without auth)
    const authResult = requireLocationAccess(request, locationId);
    if ('error' in authResult) {
      // In development, allow access without auth
      if (process.env.NODE_ENV === 'development' || process.env.DEMO_AUTH_BYPASS === '1') {
        // Continue without auth check
      } else {
        return authResult.error;
      }
    }

    const session = await OnboardingSessionService.getOrCreateSession(locationId);
    return NextResponse.json(session);
  } catch (error: any) {
    try {
      ErrorTracker.trackApiError(error instanceof Error ? error : new Error(String(error)), '/api/onboarding/session', 'GET');
    } catch (trackingError) {
      console.error('Error tracking failed:', trackingError);
    }
    return NextResponse.json(
      { error: error?.message || String(error) || 'Failed to get session' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationId, step, status } = body;

    if (!locationId) {
      return NextResponse.json(
        { error: 'locationId is required' },
        { status: 400 }
      );
    }

    // Check location access and edit permissions
    const authResult = requireLocationAccess(request, locationId);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { context } = authResult;

    // Check if can edit (respects locks)
    const { mockDataService } = await import('@/lib/mock-data');
    const { LockService } = await import('@/lib/data-integrity/lock-service');
    
    const onboarding = mockDataService.onboarding.getByLocationId(locationId);
    if (onboarding) {
      const lockCheck = LockService.validateEdit(
        locationId,
        onboarding.status,
        context.userId,
        context.userRole
      );

      if (!lockCheck.allowed && !lockCheck.requiresOverride) {
        return NextResponse.json(
          { error: lockCheck.reason || 'Cannot edit this onboarding' },
          { status: 403 }
        );
      }
    }

    let session;

    if (step) {
      session = await OnboardingSessionService.updateStep(locationId, step as OnboardingStep);
    } else if (status) {
      session = await OnboardingSessionService.updateStatus(
        locationId,
        status as OnboardingStatus,
        body.lockSession
      );
    } else {
      return NextResponse.json(
        { error: 'Either step or status is required' },
        { status: 400 }
      );
    }

    return NextResponse.json(session);
  } catch (error: any) {
    try {
      ErrorTracker.trackApiError(error instanceof Error ? error : new Error(String(error)), '/api/onboarding/session', 'PATCH');
    } catch (trackingError) {
      console.error('Error tracking failed:', trackingError);
    }
    return NextResponse.json(
      { error: error?.message || String(error) || 'Failed to update session' },
      { status: 500 }
    );
  }
}
