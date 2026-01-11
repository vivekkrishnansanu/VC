import { Phone, PhoneBrand, PhoneOwnership, PhoneAssignmentType } from './types';
import { mockLocations } from './locations';
import { mockUsers } from './users';

export const mockPhones: Phone[] = [
  // Location 1 phones (12 devices)
  {
    id: 'phone-1',
    locationId: mockLocations[0].id,
    brand: PhoneBrand.YEALINK,
    model: 'T46S',
    ownership: PhoneOwnership.OWNED,
    assignmentType: PhoneAssignmentType.ASSIGNED_TO_USER,
    assignedUserId: mockUsers[2].id,
    macAddress: '00:15:5D:01:01:01',
    serialNumber: 'YLK-2024-001',
    extension: '1001',
    isUnsupported: false,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: 'phone-2',
    locationId: mockLocations[0].id,
    brand: PhoneBrand.YEALINK,
    model: 'T46S',
    ownership: PhoneOwnership.OWNED,
    assignmentType: PhoneAssignmentType.ASSIGNED_TO_USER,
    macAddress: '00:15:5D:01:01:02',
    serialNumber: 'YLK-2024-002',
    extension: '1002',
    isUnsupported: false,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: 'phone-3',
    locationId: mockLocations[0].id,
    brand: PhoneBrand.POLYCOM,
    model: 'VVX 350',
    ownership: PhoneOwnership.LEASED,
    assignmentType: PhoneAssignmentType.ASSIGNED_TO_USER,
    macAddress: '00:04:F2:01:01:01',
    serialNumber: 'POL-2024-001',
    extension: '1003',
    isUnsupported: false,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: 'phone-4',
    locationId: mockLocations[0].id,
    brand: PhoneBrand.OTHER,
    model: 'Cisco 7945',
    ownership: PhoneOwnership.OWNED,
    assignmentType: PhoneAssignmentType.ASSIGNED_TO_USER,
    macAddress: '00:1E:13:01:01:01',
    serialNumber: 'CIS-2024-001',
    extension: '1004',
    isUnsupported: true, // Unsupported model
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  // Location 3 phones (8 devices)
  {
    id: 'phone-5',
    locationId: mockLocations[2].id,
    brand: PhoneBrand.YEALINK,
    model: 'T48S',
    ownership: PhoneOwnership.OWNED,
    assignmentType: PhoneAssignmentType.ASSIGNED_TO_EXTENSION,
    macAddress: '00:15:5D:02:01:01',
    serialNumber: 'YLK-2024-101',
    extension: '2001',
    isUnsupported: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Location 4 phones (6 devices)
  {
    id: 'phone-6',
    locationId: mockLocations[3].id,
    brand: PhoneBrand.YEALINK,
    model: 'T46S',
    ownership: PhoneOwnership.OWNED,
    assignmentType: PhoneAssignmentType.ASSIGNED_TO_USER,
    assignedUserId: mockUsers[3].id,
    macAddress: '00:15:5D:03:01:01',
    serialNumber: 'YLK-2024-201',
    extension: '3001',
    isUnsupported: false,
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-06'),
  },
  // Location 5 phones (4 devices - completed)
  {
    id: 'phone-7',
    locationId: mockLocations[4].id,
    brand: PhoneBrand.YEALINK,
    model: 'T46S',
    ownership: PhoneOwnership.OWNED,
    assignmentType: PhoneAssignmentType.COMMON,
    macAddress: '00:15:5D:04:01:01',
    serialNumber: 'YLK-2024-301',
    extension: '4001',
    isUnsupported: false,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
];

export function getPhonesByLocationId(locationId: string): Phone[] {
  return mockPhones.filter(p => p.locationId === locationId);
}

export function getPhoneById(id: string): Phone | undefined {
  return mockPhones.find(p => p.id === id);
}

export function getUnsupportedPhones(locationId?: string): Phone[] {
  const phones = locationId 
    ? mockPhones.filter(p => p.locationId === locationId)
    : mockPhones;
  return phones.filter(p => p.isUnsupported);
}

export function getAllPhones(): Phone[] {
  return mockPhones;
}
