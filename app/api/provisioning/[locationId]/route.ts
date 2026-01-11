/**
 * Provisioning Payload API
 * GET: Generate provisioning payload for a location
 */

import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, Permission } from '@/lib/auth/middleware';
import { ProvisioningPayloadGenerator } from '@/lib/provisioning/payload-generator';
import { Logger } from '@/lib/observability/logger';
import { ErrorTracker } from '@/lib/observability/error-tracking';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locationId: string }> }
) {
  try {
    const { locationId } = await params;

    // Require permission
    const authResult = requirePermission(request, Permission.VIEW_PROVISIONING);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { context } = authResult;

    // Generate payload
    const { payload, valid, errors } = ProvisioningPayloadGenerator.generateAndValidate(locationId);

    if (!valid) {
      Logger.warn('Invalid provisioning payload', {
        userId: context.userId,
        locationId,
        action: 'GENERATE_PROVISIONING_PAYLOAD',
        metadata: { errors },
      });

      return NextResponse.json(
        {
          error: 'Payload validation failed',
          errors,
        },
        { status: 400 }
      );
    }

    Logger.info('Provisioning payload retrieved', {
      userId: context.userId,
      locationId,
      action: 'GET_PROVISIONING_PAYLOAD',
    });

    return NextResponse.json({
      payload,
      valid: true,
    });
  } catch (error: any) {
    const { locationId } = await params;
    ErrorTracker.trackApiError(error, `/api/provisioning/${locationId}`, 'GET');
    return NextResponse.json(
      { error: error.message || 'Failed to generate provisioning payload' },
      { status: 500 }
    );
  }
}
