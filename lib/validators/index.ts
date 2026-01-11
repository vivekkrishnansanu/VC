/**
 * Validation Schemas
 * 
 * Centralized Zod schemas for form and API validation.
 */

import { z } from 'zod';
import { 
  ProductType, 
  PhoneSystemType, 
  PhoneBrand, 
  PhoneOwnership, 
  PhoneAssignmentType,
  ContactMedium,
  DayOfWeek,
} from '@/types';

// ============================================================================
// Account Schemas
// ============================================================================

export const accountSchema = z.object({
  name: z.string().min(2, 'Account name must be at least 2 characters'),
  productType: z.nativeEnum(ProductType),
  totalLocations: z.number().min(1, 'At least one location is required'),
  accountId: z.string().optional(),
});

export const accountContactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  isPrimary: z.boolean().default(false),
});

// ============================================================================
// Location Schemas
// ============================================================================

export const locationSchema = z.object({
  accountId: z.string(),
  name: z.string().min(2, 'Location name is required'),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipcode: z.string().min(5, 'Zipcode is required'),
});

// ============================================================================
// Onboarding Schemas
// ============================================================================

export const basicDetailsSchema = z.object({
  pocName: z.string().min(2, 'POC name is required'),
  pocEmail: z.string().email('Valid email is required'),
  pocPhone: z.string().min(10, 'Valid phone number is required'),
  preferredContactMedium: z.nativeEnum(ContactMedium).optional(),
  practiceManagementSoftware: z.string().optional(),
});

export const phoneSystemSchema = z.object({
  phoneSystemType: z.nativeEnum(PhoneSystemType).optional(),
  phoneSystemDetails: z.string().optional(),
  phoneSystemVoipType: z.string().optional(),
  callForwardingSupported: z.boolean().optional(),
  usesFax: z.boolean().optional(),
  faxNumber: z.string().optional(),
  wantsFaxInVoiceStack: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.phoneSystemType === PhoneSystemType.TRADITIONAL && !data.phoneSystemDetails) {
      return false;
    }
    if (data.phoneSystemType === PhoneSystemType.VOIP && !data.phoneSystemVoipType) {
      return false;
    }
    return true;
  },
  {
    message: 'Phone system details are required',
  }
);

export const deviceSchema = z.object({
  brand: z.nativeEnum(PhoneBrand),
  model: z.string().min(1, 'Model is required'),
  ownership: z.nativeEnum(PhoneOwnership),
  assignmentType: z.nativeEnum(PhoneAssignmentType),
  userFirstName: z.string().optional(),
  userLastName: z.string().optional(),
  userEmail: z.string().email().optional(),
  macAddress: z.string().optional(),
  serialNumber: z.string().optional(),
  extension: z.string().optional(),
}).refine(
  (data) => {
    if (data.assignmentType === PhoneAssignmentType.ASSIGNED_TO_USER) {
      return !!(data.userFirstName && data.userLastName && data.userEmail);
    }
    return true;
  },
  {
    message: 'User details are required when assigned to user',
  }
);

export const workingHoursSchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek),
  isOpen: z.boolean(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
}).refine(
  (data) => {
    if (data.isOpen) {
      return !!(data.openTime && data.closeTime);
    }
    return true;
  },
  {
    message: 'Open and close times are required when location is open',
  }
);

export const callFlowSchema = z.object({
  greetingMessage: z.string().min(1, 'Greeting message is required'),
  hasIVR: z.boolean(),
  ivrOptions: z.array(z.any()).optional(),
  directRingType: z.enum(['users', 'extensions']).optional(),
  directTargets: z.array(z.any()).optional(),
  voicemailScript: z.string().optional(),
});

// ============================================================================
// API Request Schemas
// ============================================================================

export const createAccountRequestSchema = z.object({
  name: z.string().min(2),
  productType: z.nativeEnum(ProductType),
  totalLocations: z.number().min(1),
  accountId: z.string().optional(),
  primaryPOC: accountContactSchema,
  additionalContacts: z.array(accountContactSchema).optional(),
});

export const submitOnboardingRequestSchema = z.object({
  locationId: z.string(),
  userId: z.string(),
});

export const approvalRequestSchema = z.object({
  locationId: z.string(),
  type: z.string(),
  reason: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});
