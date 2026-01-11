/**
 * Bulk Operations API
 * POST: Bulk update status for multiple locations
 */

import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, Permission } from '@/lib/auth/middleware';
import { BulkOperationsService } from '@/lib/bulk-operations/bulk-service';
import { Logger } from '@/lib/observability/logger';
import { ErrorTracker } from '@/lib/observability/error-tracking';

export async function POST(request: NextRequest) {
  try {
    const authResult = requirePermission(request, Permission.EDIT_ONBOARDING);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { context } = authResult;
    const body = await request.json();
    const { locationIds, status } = body;

    if (!Array.isArray(locationIds) || locationIds.length === 0) {
      return NextResponse.json(
        { error: 'locationIds array is required' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: 'status is required' },
        { status: 400 }
      );
    }

    // Limit bulk operations to prevent abuse
    if (locationIds.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 locations per bulk operation' },
        { status: 400 }
      );
    }

    const result = await BulkOperationsService.bulkUpdateStatus(
      locationIds,
      status,
      context.userId,
      context.userRole
    );

    return NextResponse.json(result);
  } catch (error: any) {
    ErrorTracker.trackApiError(error, '/api/bulk/status', 'POST');
    return NextResponse.json(
      { error: error.message || 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}
