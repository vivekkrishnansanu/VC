import { LocationOnboarding, OnboardingStatus, ContactMedium, PhoneSystemType, PhoneAssignmentType, DeviceOwnership } from './types';
import { mockLocations } from './locations';

export const mockOnboarding: LocationOnboarding[] = [
  {
    id: 'onboarding-1',
    locationId: mockLocations[0].id,
    status: OnboardingStatus.IN_PROGRESS,
    pocName: 'Alice Johnson',
    pocEmail: 'alice.johnson@acme.com',
    pocPhone: '+1-555-0201',
    preferredContactMedium: ContactMedium.EMAIL,
    practiceManagementSoftware: 'Epic',
    phoneSystemType: PhoneSystemType.VOIP,
    phoneSystemVoipType: 'RingCentral',
    callForwardingSupported: true,
    usesFax: true,
    faxNumber: '+1-555-0101',
    deviceOwnership: DeviceOwnership.OWNED,
    hasYealinkOrPolycom: true,
    buyPhonesThroughVoiceStack: false,
    totalDevices: 12,
    assignmentStrategy: PhoneAssignmentType.ASSIGNED_TO_USER,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 'onboarding-2',
    locationId: mockLocations[1].id,
    status: OnboardingStatus.NOT_STARTED,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'onboarding-3',
    locationId: mockLocations[2].id,
    status: OnboardingStatus.PENDING_APPROVAL,
    pocName: 'Dr. Sarah Miller',
    pocEmail: 'sarah.miller@acme.com',
    pocPhone: '+1-555-1001',
    preferredContactMedium: ContactMedium.PHONE,
    practiceManagementSoftware: 'Cerner',
    phoneSystemType: PhoneSystemType.TRADITIONAL,
    phoneSystemDetails: 'Avaya IP Office',
    callForwardingSupported: true,
    usesFax: false,
    wantsFaxInVoiceStack: true,
    deviceOwnership: DeviceOwnership.NOT_OWNED,
    buyPhonesThroughVoiceStack: true,
    totalDevices: 8,
    assignmentStrategy: PhoneAssignmentType.ASSIGNED_TO_EXTENSION,
    copiedFromLocationId: mockLocations[0].id,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-08'),
    submittedAt: new Date('2024-01-08'),
  },
  {
    id: 'onboarding-4',
    locationId: mockLocations[3].id,
    status: OnboardingStatus.IN_PROGRESS,
    pocName: 'Bob Williams',
    pocEmail: 'bob.williams@citydental.com',
    pocPhone: '+1-555-0202',
    preferredContactMedium: ContactMedium.PREFERRED_EMAIL,
    practiceManagementSoftware: 'Dentrix',
    phoneSystemType: PhoneSystemType.VOIP,
    phoneSystemVoipType: '8x8',
    callForwardingSupported: true,
    usesFax: true,
    faxNumber: '+1-555-2001',
    deviceOwnership: DeviceOwnership.OWNED,
    hasYealinkOrPolycom: true,
    buyPhonesThroughVoiceStack: false,
    totalDevices: 6,
    assignmentStrategy: PhoneAssignmentType.ASSIGNED_TO_USER,
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-09'),
  },
  {
    id: 'onboarding-5',
    locationId: mockLocations[4].id,
    status: OnboardingStatus.COMPLETED,
    pocName: 'Dr. Robert Chen',
    pocEmail: 'robert.chen@citydental.com',
    pocPhone: '+1-555-2001',
    preferredContactMedium: ContactMedium.EMAIL,
    practiceManagementSoftware: 'Dentrix',
    phoneSystemType: PhoneSystemType.VOIP,
    phoneSystemVoipType: 'Nextiva',
    callForwardingSupported: true,
    usesFax: false,
    wantsFaxInVoiceStack: false,
    deviceOwnership: DeviceOwnership.OWNED,
    hasYealinkOrPolycom: true,
    buyPhonesThroughVoiceStack: false,
    totalDevices: 4,
    assignmentStrategy: PhoneAssignmentType.COMMON,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-07'),
    submittedAt: new Date('2024-01-05'),
    completedAt: new Date('2024-01-07'),
  },
];

export function getOnboardingByLocationId(locationId: string): LocationOnboarding | undefined {
  return mockOnboarding.find(o => o.locationId === locationId);
}

export function getOnboardingById(id: string): LocationOnboarding | undefined {
  return mockOnboarding.find(o => o.id === id);
}

export function getOnboardingByStatus(status: OnboardingStatus): LocationOnboarding[] {
  return mockOnboarding.filter(o => o.status === status);
}

export function getAllOnboarding(): LocationOnboarding[] {
  return mockOnboarding;
}
