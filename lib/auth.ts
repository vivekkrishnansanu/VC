/**
 * Authentication Utilities
 * 
 * Re-exports from auth/index for backward compatibility.
 * This file maintains the original interface.
 */

export { 
  getCurrentUser, 
  signIn, 
  signOut, 
  isAuthenticated 
} from './auth/index';

// Re-export User type
export type { User } from '@/types';
