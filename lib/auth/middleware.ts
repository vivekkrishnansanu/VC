/**
 * Authentication & Authorization Middleware
 * For API route protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { Permission, PermissionService } from './permissions';
import { UserRole } from '@/types';

// Re-export Permission for convenience
export { Permission } from './permissions';

export interface AuthContext {
  userId: string;
  userRole: UserRole;
  email: string;
}

/**
 * Get auth context from request
 * In production, extract from JWT token or session
 */
export function getAuthContext(request: NextRequest): AuthContext | null {
  // TODO: Extract from JWT token or session
  // For now, using mock auth
  const authHeader = request.headers.get('authorization');
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role') as UserRole;

  if (!userId || !userRole) {
    // Demo/dev fallback: allow local development to work without explicit headers.
    // Enable with DEMO_AUTH_BYPASS=1 (never set in production).
    if (process.env.DEMO_AUTH_BYPASS === '1' || process.env.NODE_ENV === 'development') {
      return {
        userId: 'user-3',
        userRole: UserRole.CUSTOMER,
        email: 'demo.customer@local',
      };
    }

    return null;
  }

  return {
    userId,
    userRole,
    email: '', // Extract from token in production
  };
}

/**
 * Require authentication middleware
 */
export function requireAuth(
  request: NextRequest
): { context: AuthContext } | { error: NextResponse } {
  const context = getAuthContext(request);
  
  if (!context) {
    return {
      error: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  return { context };
}

/**
 * Require permission middleware
 */
export function requirePermission(
  request: NextRequest,
  permission: Permission
): { context: AuthContext } | { error: NextResponse } {
  const authResult = requireAuth(request);
  if ('error' in authResult) {
    return authResult;
  }

  const { context } = authResult;

  if (!PermissionService.hasPermission(context.userRole, permission)) {
    return {
      error: NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      ),
    };
  }

  return { context };
}

/**
 * Require location access middleware
 */
export function requireLocationAccess(
  request: NextRequest,
  locationId: string
): { context: AuthContext } | { error: NextResponse } {
  const authResult = requireAuth(request);
  if ('error' in authResult) {
    return authResult;
  }

  const { context } = authResult;

  if (!PermissionService.canAccessLocation(context.userId, context.userRole, locationId)) {
    return {
      error: NextResponse.json(
        { error: 'Access denied to this location' },
        { status: 403 }
      ),
    };
  }

  return { context };
}

/**
 * Require edit permission for onboarding
 */
export function requireOnboardingEdit(
  request: NextRequest,
  locationId: string
): { context: AuthContext; canEdit: boolean; reason?: string } | { error: NextResponse } {
  const authResult = requireAuth(request);
  if ('error' in authResult) {
    return authResult;
  }

  const { context } = authResult;

  const editCheck = PermissionService.canEditOnboarding(
    context.userId,
    context.userRole,
    locationId
  );

  if (!editCheck.allowed) {
    return {
      error: NextResponse.json(
        { error: editCheck.reason || 'Cannot edit this onboarding' },
        { status: 403 }
      ),
    };
  }

  return {
    context,
    canEdit: editCheck.allowed,
    reason: editCheck.reason,
  };
}
