/**
 * Central type definitions for the Implementation Automation Platform
 * 
 * This file contains all shared types, interfaces, and enums used across the application.
 * Types are organized by domain area for better maintainability.
 */

// ============================================================================
// User & Authentication Types
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum UserRole {
  IMPLEMENTATION_LEAD = 'IMPLEMENTATION_LEAD',
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN', // Future: System administrators
}

export interface AuthContext {
  userId: string;
  userRole: UserRole;
  email: string;
}

// ============================================================================
// Account Types
// ============================================================================

export interface Account {
  id: string;
  name: string;
  productType: ProductType;
  totalLocations: number;
  accountId?: string; // For CS VoiceStack
  createdAt: Date;
  updatedAt: Date;
}

export enum ProductType {
  CS_VOICESTACK = 'CS_VOICESTACK',
  VOICESTACK = 'VOICESTACK',
}

export interface AccountContact {
  id: string;
  accountId: string;
  name: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export interface CreditInfo {
  id: string;
  accountId: string;
  data: Record<string, any>; // Flexible JSON structure
}

// ============================================================================
// Location Types
// ============================================================================

export interface Location {
  id: string;
  accountId: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipcode: string;
  customerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Onboarding Types
// ============================================================================

export interface LocationOnboarding {
  id: string;
  locationId: string;
  status: OnboardingStatus;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  isLocked: boolean;
  lockedAt?: Date;
  lockedBy?: string;
  submittedAt?: Date;
  submittedBy?: string;
  // Basic Details
  pocName?: string;
  pocEmail?: string;
  pocPhone?: string;
  preferredContactMedium?: ContactMedium;
  practiceManagementSoftware?: string;
  // Phone System
  phoneSystemType?: PhoneSystemType;
  phoneSystemDetails?: string;
  phoneSystemVoipType?: string;
  callForwardingSupported?: boolean;
  usesFax?: boolean;
  faxNumber?: string;
  wantsFaxInVoiceStack?: boolean;
  // Devices
  totalDevices?: number;
  assignmentStrategy?: PhoneAssignmentType;
  // Call Flow
  hasIVR?: boolean;
  greetingMessage?: string;
  ivrOptions?: IVROption[];
  noIvrUsersOrExtensions?: string[];
  noIvrVoicemailScript?: string;
  sharedVoicemailUsers?: string[];
  // Copy tracking
  copiedFromLocationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum OnboardingStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  PROVISIONING = 'PROVISIONING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum OnboardingStep {
  BASIC_DETAILS = 'BASIC_DETAILS',
  PHONE_SYSTEM = 'PHONE_SYSTEM',
  DEVICES = 'DEVICES',
  WORKING_HOURS = 'WORKING_HOURS',
  CALL_FLOW = 'CALL_FLOW',
  REVIEW = 'REVIEW',
}

export enum ContactMedium {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  SMS = 'SMS',
  PREFERRED_EMAIL = 'PREFERRED_EMAIL',
  PREFERRED_PHONE = 'PREFERRED_PHONE',
}

export enum PhoneSystemType {
  TRADITIONAL = 'TRADITIONAL',
  VOIP = 'VOIP',
}

// ============================================================================
// Device Types
// ============================================================================

export interface Phone {
  id: string;
  locationId: string;
  brand: PhoneBrand;
  model: string; // Free text if brand = OTHER
  ownership: PhoneOwnership;
  assignmentType: PhoneAssignmentType;
  assignedUserId?: string;
  userFirstName?: string;
  userLastName?: string;
  userEmail?: string;
  macAddress?: string;
  serialNumber?: string;
  extension?: string;
  isUnsupported: boolean;
  
  // NEW: Device Type & Warnings
  deviceTypes?: DeviceType[]; // Multi-select: DESKPHONE, SOFTPHONE, MOBILE
  hasWarnings?: boolean;
  warningReason?: string; // Reason for warning state
  
  createdAt: Date;
  updatedAt: Date;
}

export enum PhoneBrand {
  YEALINK = 'YEALINK',
  POLYCOM = 'POLYCOM',
  OTHER = 'OTHER',
}

export enum PhoneOwnership {
  OWNED = 'OWNED',
  LEASED = 'LEASED',
}

export enum DeviceOwnership {
  OWNED = 'OWNED',
  NOT_OWNED = 'NOT_OWNED',
}

export enum PhoneAssignmentType {
  ASSIGNED_TO_USER = 'ASSIGNED_TO_USER',
  ASSIGNED_TO_EXTENSION = 'ASSIGNED_TO_EXTENSION',
  /**
   * Deprecated in the new UX.
   * Treat COMMON as ASSIGNED_TO_EXTENSION.
   */
  COMMON = 'COMMON',
}

export enum DeviceType {
  DESKPHONE = 'DESKPHONE',
  SOFTPHONE = 'SOFTPHONE',
  MOBILE = 'MOBILE',
}

// ============================================================================
// Call Flow Types
// ============================================================================

export interface CallFlow {
  id: string;
  locationId: string;
  greetingMessage: string;
  hasIVR: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVROption {
  id: string;
  callFlowId: string;
  optionNumber: string; // DTMF digit (e.g., "1", "2", "3")
  label?: string; // Optional label/description
  ringType: 'users' | 'extensions';
  targets: IVROptionTarget[];
  // NOTE: Global IVR fields (retryAttempts, waitTime, invalidSelectionScript, afterRetriesTarget)
  // are now stored at LocationOnboarding level and applied to all options
}

export interface IVROptionTarget {
  id: string;
  ivrOptionId: string;
  userId?: string;
  extension?: string;
}

// ============================================================================
// Working Hours Types
// ============================================================================

export interface WorkingHoursSchedule {
  id: string;
  locationId: string;
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

// ============================================================================
// Approval Types
// ============================================================================

export interface Approval {
  id: string;
  locationId: string;
  type: ApprovalType;
  status: ApprovalStatus;
  requestedBy: string;
  requestedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  reason?: string;
  metadata?: Record<string, any>;
}

export enum ApprovalType {
  PHONE_PURCHASE = 'PHONE_PURCHASE',
  OVERRIDE_LOCK = 'OVERRIDE_LOCK',
  // Future: Additional approval types
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// Provisioning Types
// ============================================================================

export interface ProvisioningPayload {
  locationId: string;
  devices: DevicePayload[];
  users: UserPayload[];
  extensions: ExtensionPayload[];
  workingHours: WorkingHoursPayload[];
  callFlow: CallFlowPayload;
}

export interface DevicePayload {
  brand: string;
  model: string;
  macAddress: string;
  serialNumber: string;
  assignmentType: string;
  userId?: string;
  extension?: string;
}

export interface UserPayload {
  firstName: string;
  lastName: string;
  email: string;
  extension?: string;
}

export interface ExtensionPayload {
  number: string;
  assignedTo: 'user' | 'device';
  assignedId: string;
}

export interface WorkingHoursPayload {
  dayOfWeek: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface CallFlowPayload {
  greetingMessage: string;
  hasIVR: boolean;
  ivrOptions?: IVROptionPayload[];
  directRouting?: DirectRoutingPayload;
}

export interface IVROptionPayload {
  optionNumber: string;
  script: string;
  ringType: 'users' | 'extensions';
  targets: string[];
  retryAttempts: number;
  waitTime: number;
  invalidSelectionScript: string;
  afterRetriesTarget: string;
  voicemailScript: string;
}

export interface DirectRoutingPayload {
  ringType: 'users' | 'extensions';
  targets: string[];
  voicemailScript: string;
}

// ============================================================================
// Error Types
// ============================================================================

export interface AppError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
}

export class ApplicationError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}

// ============================================================================
// Utility Types
// ============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
