/**
 * Bulk Provisioning Payload API
 * POST: Generate provisioning payloads for multiple locations
 */

import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, Permission } from '@/lib/auth/middleware';
import { BulkOperationsService } from '@/lib/bulk-operations/bulk-service';
import { ErrorTracker } from '@/lib/observability/error-tracking';

export async function POST(request: NextRequest) {
  try {
    const authResult = requirePermission(request, Permission.VIEW_PROVISIONING);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { context } = authResult;
    const body = await request.json();
    const { locationIds } = body;

    if (!Array.isArray(locationIds) || locationIds.length === 0) {
      return NextResponse.json(
        { error: 'locationIds array is required' },
        { status: 400 }
      );
    }

    // Limit bulk operations
    if (locationIds.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 locations per bulk operation' },
        { status: 400 }
      );
    }

    const result = await BulkOperationsService.bulkGeneratePayloads(
      locationIds,
      context.userId
    );

    return NextResponse.json(result);
  } catch (error: any) {
    ErrorTracker.trackApiError(error, '/api/bulk/provisioning', 'POST');
    return NextResponse.json(
      { error: error.message || 'Failed to generate bulk payloads' },
      { status: 500 }
    );
  }
}
