/**
 * Authentication Utilities
 * 
 * Authentication helper functions.
 * Currently uses mock authentication - designed for easy replacement with real auth.
 */

import { User, UserRole } from '@/types';
import { AUTH_STORAGE_KEY } from '@/lib/constants';

// ============================================================================
// Mock Authentication (Development)
// ============================================================================

/**
 * Get current authenticated user
 * TODO: Replace with real authentication (JWT/OAuth)
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    
    const user = JSON.parse(stored);
    return user as User;
  } catch {
    return null;
  }
}

/**
 * Sign in user
 * TODO: Replace with real authentication
 * 
 * Supports both signatures for backward compatibility:
 * - signIn(user: User) - from AuthContext
 * - signIn(email: string, name: string) - direct usage
 */
export async function signIn(userOrEmail: User | string, name?: string): Promise<User> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

  let user: User;

  // Handle both signatures
  if (typeof userOrEmail === 'string') {
    // New signature: signIn(email, name)
    const email = userOrEmail;
    const userName = name || '';
    
    // Determine role based on email (temporary logic)
    const role = email.includes('@company.com') || email.includes('implementation')
      ? UserRole.IMPLEMENTATION_LEAD
      : UserRole.CUSTOMER;

    user = {
      id: `user-${Date.now()}`,
      name: userName,
      email,
      role,
    };
  } else {
    // Old signature: signIn(user)
    const inputUser = userOrEmail;
    
    // Determine role based on email if not provided
    const role = inputUser.role || (
      inputUser.email.includes('@company.com') || inputUser.email.includes('implementation')
        ? UserRole.IMPLEMENTATION_LEAD
        : UserRole.CUSTOMER
    );

    user = {
      id: inputUser.id || `user-${Date.now()}`,
      name: inputUser.name,
      email: inputUser.email,
      role,
    };
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }

  return user;
}

/**
 * Sign out user
 */
export function signOut(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

// Re-export User type for consumers importing from "@/lib/auth"
export type { User } from "@/types";
