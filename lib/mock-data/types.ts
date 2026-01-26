/**
 * Type definitions matching Prisma schema
 * These will be replaced with Prisma-generated types when database is connected
 */

export enum UserRole {
  IMPLEMENTATION_LEAD = 'IMPLEMENTATION_LEAD',
  CUSTOMER = 'CUSTOMER',
}

export enum ProductType {
  CS_VOICESTACK = 'CS_VOICESTACK',
  VOICESTACK = 'VOICESTACK',
}

export enum OnboardingStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  PROVISIONING = 'PROVISIONING',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED',
  CANCELLED = 'CANCELLED',
}

export enum OnboardingStep {
  BASIC_DETAILS = 'BASIC_DETAILS',
  PHONE_SYSTEM = 'PHONE_SYSTEM',
  DEVICES = 'DEVICES',
  WORKING_HOURS = 'WORKING_HOURS',
  CALL_FLOW = 'CALL_FLOW',
  CALL_QUEUE = 'CALL_QUEUE',
  USERS = 'USERS',
  REVIEW = 'REVIEW',
}

export enum PhoneSystemType {
  TRADITIONAL = 'TRADITIONAL',
  VOIP = 'VOIP',
}

export enum PhoneBrand {
  YEALINK = 'YEALINK',
  POLYCOM = 'POLYCOM',
  OTHER = 'OTHER',
}

export enum DeviceType {
  DESKPHONE = 'DESKPHONE',
  SOFTPHONE = 'SOFTPHONE',
  MOBILE = 'MOBILE',
}

export enum DeviceOwnership {
  OWNED = 'OWNED',
  NOT_OWNED = 'NOT_OWNED',
}

export enum PhoneOwnership {
  OWNED = 'OWNED',
  LEASED = 'LEASED',
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

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export enum ContactMedium {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  SMS = 'SMS',
  PREFERRED_EMAIL = 'PREFERRED_EMAIL',
  PREFERRED_PHONE = 'PREFERRED_PHONE',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface AccountContact {
  id: string;
  accountId: string;
  name: string;
  phone: string;
  email: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  name: string;
  productType: ProductType;
  totalLocations: number;
  accountId?: string; // For CS VoiceStack
  
  // NEW: Dashboard aggregation fields (computed or cached)
  warningCount?: number; // Count of locations with warnings
  blockerCount?: number; // Count of locations with blockers
  
  contacts: AccountContact[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Location {
  id: string;
  accountId: string;
  customerId?: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipcode: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationOnboarding {
  id: string;
  locationId: string;
  status: OnboardingStatus;
  
  // Basic Details
  pocName?: string;
  pocContact?: string;
  pocEmail?: string;
  pocPhone?: string;
  preferredContactMedium?: ContactMedium;
  practiceManagementSoftware?: string;
  
  // Existing Phone System
  phoneSystemType?: PhoneSystemType;
  phoneSystemDetails?: string;
  phoneSystemVoipType?: string;
  callForwardingSupported?: boolean;
  usesFax?: boolean;
  faxNumber?: string;
  wantsFaxInVoiceStack?: boolean;
  
  // Device Ownership & Purchase Flow (NEW)
  deviceOwnership?: DeviceOwnership; // OWNED | NOT_OWNED (asked once per location)
  hasYealinkOrPolycom?: boolean; // If deviceOwnership = OWNED
  buyPhonesThroughVoiceStack?: boolean; // Purchase decision
  /**
   * Optional lightweight “catalog” selection. When buyPhonesThroughVoiceStack=true,
   * we can store what was selected without requiring per-device details.
   */
  deviceCatalogSelections?: Array<{
    brand: PhoneBrand;
    model: string;
    quantity: number;
    deviceTypes?: DeviceType[];
  }>;

  // Phone & Device Details (Legacy)
  totalDevices?: number;
  /**
   * Deprecated in the new UX. Assignment now lives per device card.
   */
  assignmentStrategy?: PhoneAssignmentType;
  
  // Call Flow
  greetingMessage?: string;
  hasIVR?: boolean;
  ivrOptions?: IVROption[];
  /**
   * New IVR layout globals (shown outside options when IVR is enabled).
   * For backward compatibility, these can be copied into each option payload when generating provisioning.
   */
  ivrScript?: string;
  ivrRetryAttempts?: number;
  ivrWaitTime?: number;
  ivrInvalidSelectionScript?: string;
  ivrAfterRetriesTarget?: string;
  voicemailScript?: string;
  sharedVoicemailUsers?: string[];
  directRingUsers?: string[];
  directRingExtensions?: string[];
  
  // Copy tracking
  copiedFromLocationId?: string;
  
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  completedAt?: Date;
}

export interface IVROptionTarget {
  userId?: string;
  extension?: string;
}

export interface IVROption {
  id: string;
  optionNumber: string; // DTMF digit (e.g., "1", "2", "3")
  label?: string; // Optional label/description (replaces script field in new UX)
  /**
   * @deprecated In new UX, IVR script is global. This field kept for backward compatibility.
   */
  script?: string;
  ringType: 'users' | 'extensions';
  targets: IVROptionTarget[];
  /**
   * @deprecated Global IVR fields moved to LocationOnboarding level.
   * These are kept for backward compatibility but should not be used in new code.
   */
  retryAttempts?: number;
  waitTime?: number;
  invalidSelectionScript?: string;
  afterRetriesTarget?: string;
  voicemailScript?: string;
}

export interface Phone {
  id: string;
  locationId: string;
  brand: PhoneBrand;
  model: string; // Free text if brand = OTHER
  ownership: PhoneOwnership;
  assignmentType: PhoneAssignmentType;
  assignedUserId?: string;
  userFirstName?: string; // User info when assigned to user
  userLastName?: string;
  userEmail?: string;
  macAddress?: string;
  serialNumber?: string;
  extension?: string;
  isUnsupported: boolean;
  enableUserDetection?: boolean; // Device-level feature to identify user with name (only for extension assignment)
  
  // NEW: Device Type & Warnings
  deviceTypes?: DeviceType[]; // Multi-select: DESKPHONE, SOFTPHONE, MOBILE
  hasWarnings?: boolean;
  warningReason?: string; // Reason for warning state
  
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportedPhoneModel {
  id: string;
  brand: PhoneBrand;
  model: string;
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhoneSystemKnowledge {
  id: string;
  phoneSystemType: PhoneSystemType;
  phoneSystemName: string;
  phoneSystemDetails?: string;
  supportsCallForwarding?: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
