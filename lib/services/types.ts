/**
 * Service Layer Types
 * Types for backend services and API contracts
 */

import { OnboardingStatus } from '@/lib/mock-data/types';

export enum OnboardingStep {
  BASIC_DETAILS = 'BASIC_DETAILS',
  PHONE_SYSTEM = 'PHONE_SYSTEM',
  DEVICES = 'DEVICES',
  WORKING_HOURS = 'WORKING_HOURS',
  CALL_FLOW = 'CALL_FLOW',
  REVIEW = 'REVIEW',
}

export interface OnboardingSession {
  id: string;
  locationId: string;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  status: OnboardingStatus;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CopyPreviousLocationRequest {
  fromLocationId: string;
  toLocationId: string;
  fieldsToCopy: string[]; // Field names to copy
}

export interface DeviceValidationResult {
  isValid: boolean;
  isSupported: boolean;
  brand: string;
  model: string;
  message?: string;
}

export interface ApprovalRequest {
  type: 'PHONE_PURCHASE' | 'CREDIT_APPROVAL' | 'PROVISIONING';
  locationId: string;
  entityId: string; // Phone ID, account ID, etc.
  metadata: Record<string, any>;
}

export interface ApprovalResponse {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedBy: string;
  requestedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  comments?: string;
}

export interface ExtensionSeriesConfig {
  locationId: string;
  prefix?: string;
  startRange: number;
  endRange: number;
  reservedExtensions: string[];
}

export interface WorkingHoursValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface CallFlowValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface AutomationEvent {
  type: 'ONBOARDING_SUBMITTED' | 'APPROVAL_APPROVED' | 'APPROVAL_REJECTED' | 'ALL_LOCATIONS_COMPLETED';
  locationId?: string;
  accountId?: string;
  metadata: Record<string, any>;
}

export interface AuditLogEntry {
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  changes?: Record<string, { from: any; to: any }>;
  metadata?: Record<string, any>;
}
