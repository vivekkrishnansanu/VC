/**
 * Approval API
 * POST: Request approval
 * GET: Get approvals
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApprovalService } from '@/lib/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, locationId, entityId, metadata, requestedBy } = body;

    if (!type || !locationId || !entityId || !requestedBy) {
      return NextResponse.json(
        { error: 'type, locationId, entityId, and requestedBy are required' },
        { status: 400 }
      );
    }

    const approval = ApprovalService.requestApproval(
      { type, locationId, entityId, metadata: metadata || {} },
      requestedBy
    );

    return NextResponse.json(approval);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to request approval' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locationId = searchParams.get('locationId');
    const approvalId = searchParams.get('approvalId');

    if (approvalId) {
      const approval = ApprovalService.getApproval(approvalId);
      if (!approval) {
        return NextResponse.json(
          { error: 'Approval not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(approval);
    }

    if (locationId) {
      const approvals = ApprovalService.getApprovalsForLocation(locationId);
      const pending = ApprovalService.getPendingApprovals(locationId);
      const hasPending = ApprovalService.hasPendingApprovals(locationId);

      return NextResponse.json({
        approvals,
        pending,
        hasPending,
      });
    }

    return NextResponse.json(
      { error: 'Either locationId or approvalId is required' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get approvals' },
      { status: 500 }
    );
  }
}
