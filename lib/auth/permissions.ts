/**
 * Permission System
 * Role-based access control for the onboarding platform
 */

import { UserRole } from '@/types';
import { mockDataService } from '@/lib/mock-data';

export enum Permission {
  // Account permissions
  VIEW_ACCOUNTS = 'VIEW_ACCOUNTS',
  CREATE_ACCOUNT = 'CREATE_ACCOUNT',
  EDIT_ACCOUNT = 'EDIT_ACCOUNT',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  
  // Location permissions
  VIEW_LOCATIONS = 'VIEW_LOCATIONS',
  CREATE_LOCATION = 'CREATE_LOCATION',
  EDIT_LOCATION = 'EDIT_LOCATION',
  DELETE_LOCATION = 'DELETE_LOCATION',
  
  // Onboarding permissions
  VIEW_ONBOARDING = 'VIEW_ONBOARDING',
  EDIT_ONBOARDING = 'EDIT_ONBOARDING',
  SUBMIT_ONBOARDING = 'SUBMIT_ONBOARDING',
  APPROVE_ONBOARDING = 'APPROVE_ONBOARDING',
  OVERRIDE_ONBOARDING = 'OVERRIDE_ONBOARDING',
  
  // Approval permissions
  VIEW_APPROVALS = 'VIEW_APPROVALS',
  CREATE_APPROVAL = 'CREATE_APPROVAL',
  APPROVE_REQUEST = 'APPROVE_REQUEST',
  REJECT_REQUEST = 'REJECT_REQUEST',
  
  // Audit permissions
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',
  
  // Provisioning permissions
  VIEW_PROVISIONING = 'VIEW_PROVISIONING',
  TRIGGER_PROVISIONING = 'TRIGGER_PROVISIONING',
}

// Role to permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.IMPLEMENTATION_LEAD]: [
    Permission.VIEW_ACCOUNTS,
    Permission.CREATE_ACCOUNT,
    Permission.EDIT_ACCOUNT,
    Permission.VIEW_LOCATIONS,
    Permission.CREATE_LOCATION,
    Permission.EDIT_LOCATION,
    Permission.VIEW_ONBOARDING,
    Permission.EDIT_ONBOARDING,
    Permission.APPROVE_ONBOARDING,
    Permission.OVERRIDE_ONBOARDING,
    Permission.VIEW_APPROVALS,
    Permission.APPROVE_REQUEST,
    Permission.REJECT_REQUEST,
    Permission.VIEW_AUDIT_LOGS,
    Permission.VIEW_PROVISIONING,
    Permission.TRIGGER_PROVISIONING,
  ],
  [UserRole.ADMIN]: [
    Permission.VIEW_ACCOUNTS,
    Permission.CREATE_ACCOUNT,
    Permission.EDIT_ACCOUNT,
    Permission.DELETE_ACCOUNT,
    Permission.VIEW_LOCATIONS,
    Permission.CREATE_LOCATION,
    Permission.EDIT_LOCATION,
    Permission.DELETE_LOCATION,
    Permission.VIEW_ONBOARDING,
    Permission.EDIT_ONBOARDING,
    Permission.SUBMIT_ONBOARDING,
    Permission.APPROVE_ONBOARDING,
    Permission.OVERRIDE_ONBOARDING,
    Permission.VIEW_APPROVALS,
    Permission.CREATE_APPROVAL,
    Permission.APPROVE_REQUEST,
    Permission.REJECT_REQUEST,
    Permission.VIEW_AUDIT_LOGS,
    Permission.VIEW_PROVISIONING,
    Permission.TRIGGER_PROVISIONING,
  ],
  [UserRole.CUSTOMER]: [
    Permission.VIEW_LOCATIONS, // Only their own
    Permission.VIEW_ONBOARDING, // Only their own
    Permission.EDIT_ONBOARDING, // Only their own, if not locked
    Permission.SUBMIT_ONBOARDING, // Only their own
    Permission.CREATE_APPROVAL, // For phone purchases
  ],
};

export class PermissionService {
  /**
   * Check if user has a specific permission
   */
  static hasPermission(userRole: UserRole, permission: Permission): boolean {
    return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
  }

  /**
   * Check if user can access a specific location
   */
  static canAccessLocation(
    userId: string,
    userRole: UserRole,
    locationId: string
  ): boolean {
    // Implementation Leads can access all locations
    if (userRole === UserRole.IMPLEMENTATION_LEAD || userRole === UserRole.ADMIN) {
      return true;
    }

    // Customers can only access their assigned locations
    if (userRole === UserRole.CUSTOMER) {
      const location = mockDataService.locations.getById(locationId);
      return location?.customerId === userId;
    }

    return false;
  }

  /**
   * Check if user can edit onboarding
   */
  static canEditOnboarding(
    userId: string,
    userRole: UserRole,
    locationId: string
  ): { allowed: boolean; reason?: string } {
    // Check access first
    if (!this.canAccessLocation(userId, userRole, locationId)) {
      return { allowed: false, reason: 'No access to this location' };
    }

    const onboarding = mockDataService.onboarding.getByLocationId(locationId);
    if (!onboarding) {
      return { allowed: true }; // Can create
    }

    // Check if locked
    const lockedStatuses = ['APPROVED', 'PROVISIONING', 'COMPLETED'];
    if (lockedStatuses.includes(onboarding.status)) {
      // Implementation Leads can override
      if (userRole === UserRole.IMPLEMENTATION_LEAD) {
        return { allowed: true, reason: 'Override allowed for Implementation Lead' };
      }
      return { allowed: false, reason: 'Onboarding is locked and cannot be edited' };
    }

    // Customers can only edit their own
    if (userRole === UserRole.CUSTOMER) {
      const location = mockDataService.locations.getById(locationId);
      if (location?.customerId !== userId) {
        return { allowed: false, reason: 'Not authorized to edit this location' };
      }
    }

    return { allowed: true };
  }

  /**
   * Check if user can approve
   */
  static canApprove(userRole: UserRole): boolean {
    return this.hasPermission(userRole, Permission.APPROVE_REQUEST);
  }

  /**
   * Check if user can override (edit locked onboarding)
   */
  static canOverride(userRole: UserRole): boolean {
    return this.hasPermission(userRole, Permission.OVERRIDE_ONBOARDING);
  }

  /**
   * Get all permissions for a role
   */
  static getPermissionsForRole(userRole: UserRole): Permission[] {
    return ROLE_PERMISSIONS[userRole] || [];
  }
}
