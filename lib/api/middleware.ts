/**
 * API Middleware
 * 
 * Reusable middleware functions for API routes.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createUnauthorizedError,
  createForbiddenError,
  formatErrorResponse,
  createError,
  ErrorCode,
} from '@/lib/errors';
import { UserRole } from '@/types';
import { getCurrentUser } from '@/lib/auth';

// ============================================================================
// Authentication Middleware
// ============================================================================

export async function requireAuth(request: NextRequest) {
  const user = getCurrentUser();
  
  if (!user) {
    throw createUnauthorizedError('Authentication required');
  }
  
  return user;
}

// ============================================================================
// Authorization Middleware
// ============================================================================

export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
) {
  const user = await requireAuth(request);
  
  if (!allowedRoles.includes(user.role)) {
    throw createForbiddenError(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
  }
  
  return user;
}

export async function requireImplementationLead(request: NextRequest) {
  return requireRole(request, [UserRole.IMPLEMENTATION_LEAD, UserRole.ADMIN]);
}

export async function requireCustomer(request: NextRequest) {
  return requireRole(request, [UserRole.CUSTOMER]);
}

// ============================================================================
// Location Access Middleware
// ============================================================================

export async function requireLocationAccess(
  request: NextRequest,
  locationId: string
) {
  const user = await requireAuth(request);
  
  // Implementation Leads can access any location
  if (user.role === UserRole.IMPLEMENTATION_LEAD || user.role === UserRole.ADMIN) {
    return user;
  }
  
  // Customers can only access their assigned locations
  // TODO: Implement location assignment check
  // For now, allow access (will be implemented with real database)
  
  return user;
}

// ============================================================================
// Error Handler Wrapper
// ============================================================================

export function withErrorHandler(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      const errorResponse = formatErrorResponse(error);
      const statusCode = error instanceof Error && 'statusCode' in error 
        ? (error as any).statusCode 
        : 500;
      
      return NextResponse.json(errorResponse, { status: statusCode });
    }
  };
}

// ============================================================================
// Rate Limiting (Simple implementation)
// ============================================================================

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  request: NextRequest,
  limit: number = 100,
  windowMs: number = 60000 // 1 minute
): void {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip =
    forwardedFor?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return;
  }
  
  if (record.count >= limit) {
    throw createError(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      'Rate limit exceeded',
      429
    );
  }
  
  record.count++;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 60000); // Clean up every minute
