/**
 * Validation API
 * POST: Validate onboarding, working hours, or call flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { ValidationService } from '@/lib/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationId, type } = body;

    if (!locationId || !type) {
      return NextResponse.json(
        { error: 'locationId and type are required' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'workingHours':
        const workingHoursResult = ValidationService.validateWorkingHours(locationId);
        return NextResponse.json(workingHoursResult);

      case 'callFlow':
        const callFlowResult = ValidationService.validateCallFlow(locationId);
        return NextResponse.json(callFlowResult);

      case 'onboarding':
        const onboardingResult = ValidationService.validateOnboardingForSubmission(locationId);
        return NextResponse.json(onboardingResult);

      default:
        return NextResponse.json(
          { error: 'Invalid validation type. Use: workingHours, callFlow, or onboarding' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to validate' },
      { status: 500 }
    );
  }
}
