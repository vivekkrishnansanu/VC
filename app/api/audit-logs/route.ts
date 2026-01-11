/**
 * Audit Logs API
 * GET: Get audit logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuditLogService } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const userId = searchParams.get('userId');

    if (entityType && entityId) {
      const logs = AuditLogService.getLogsForEntity(entityType, entityId);
      return NextResponse.json({ logs });
    }

    if (userId) {
      const logs = AuditLogService.getLogsForUser(userId);
      return NextResponse.json({ logs });
    }

    // Get all logs (with pagination in production)
    const logs = AuditLogService.getAllLogs();
    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get audit logs' },
      { status: 500 }
    );
  }
}
