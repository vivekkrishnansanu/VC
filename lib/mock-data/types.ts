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

export enum PhoneOwnership {
  OWNED = 'OWNED',
  LEASED = 'LEASED',
}

export enum PhoneAssignmentType {
  ASSIGNED_TO_USER = 'ASSIGNED_TO_USER',
  ASSIGNED_TO_EXTENSION = 'ASSIGNED_TO_EXTENSION',
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
  
  // Phone & Device Details
  totalDevices?: number;
  assignmentStrategy?: PhoneAssignmentType;
  
  // Call Flow
  greetingMessage?: string;
  hasIVR?: boolean;
  ivrOptions?: IVROption[];
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
  optionNumber: string;
  script: string;
  ringType: 'users' | 'extensions';
  targets: IVROptionTarget[];
  retryAttempts: number;
  waitTime: number;
  invalidSelectionScript: string;
  afterRetriesTarget: string;
  voicemailScript: string;
}

export interface Phone {
  id: string;
  locationId: string;
  brand: PhoneBrand;
  model: string;
  ownership: PhoneOwnership;
  assignmentType: PhoneAssignmentType;
  assignedUserId?: string;
  macAddress?: string;
  serialNumber?: string;
  extension?: string;
  isUnsupported: boolean;
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
