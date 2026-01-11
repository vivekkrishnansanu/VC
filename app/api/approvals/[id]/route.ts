/**
 * Approval Action API
 * PATCH: Approve or reject approval
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApprovalService } from '@/lib/services';
import { requirePermission, Permission } from '@/lib/auth/middleware';
import { Logger } from '@/lib/observability/logger';
import { ErrorTracker } from '@/lib/observability/error-tracking';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const approvalId = id;
    const body = await request.json();
    const { action, comments } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'action is required' },
        { status: 400 }
      );
    }

    // Require approval permission
    const permission = action === 'approve' ? Permission.APPROVE_REQUEST : Permission.REJECT_REQUEST;
    const authResult = requirePermission(request, permission);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { context } = authResult;
    const userId = context.userId;

    let approval;
    if (action === 'approve') {
      approval = ApprovalService.approve(approvalId, userId, comments);
      Logger.logApproval(approvalId, 'APPROVED', userId, { comments });
    } else if (action === 'reject') {
      approval = ApprovalService.reject(approvalId, userId, comments);
      Logger.logApproval(approvalId, 'REJECTED', userId, { comments });
    } else {
      return NextResponse.json(
        { error: 'action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    return NextResponse.json(approval);
  } catch (error: any) {
    const { id } = await params;
    ErrorTracker.trackApiError(error, `/api/approvals/${id}`, 'PATCH');
    return NextResponse.json(
      { error: error.message || 'Failed to update approval' },
      { status: 500 }
    );
  }
}
