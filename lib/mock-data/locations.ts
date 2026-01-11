import { Location } from './types';
import { mockAccounts } from './accounts';
import { mockUsers } from './users';

export const mockLocations: Location[] = [
  {
    id: 'location-1',
    accountId: mockAccounts[0].id,
    customerId: mockUsers[2].id, // Alice Johnson
    name: 'Acme Medical - Main Office',
    addressLine1: '123 Main Street',
    addressLine2: 'Suite 100',
    city: 'New York',
    state: 'NY',
    zipcode: '10001',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'location-2',
    accountId: mockAccounts[0].id,
    name: 'Acme Medical - Downtown Branch',
    addressLine1: '456 Broadway',
    city: 'New York',
    state: 'NY',
    zipcode: '10013',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'location-3',
    accountId: mockAccounts[0].id,
    name: 'Acme Medical - Uptown Branch',
    addressLine1: '789 Park Avenue',
    city: 'New York',
    state: 'NY',
    zipcode: '10021',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'location-4',
    accountId: mockAccounts[1].id,
    customerId: mockUsers[3].id, // Bob Williams
    name: 'City Dental - Main Office',
    addressLine1: '321 Oak Street',
    city: 'Los Angeles',
    state: 'CA',
    zipcode: '90001',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: 'location-5',
    accountId: mockAccounts[1].id,
    name: 'City Dental - Westside',
    addressLine1: '654 Sunset Boulevard',
    city: 'Los Angeles',
    state: 'CA',
    zipcode: '90028',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
];

export function getLocationById(id: string): Location | undefined {
  return mockLocations.find(l => l.id === id);
}

export function getLocationsByAccountId(accountId: string): Location[] {
  return mockLocations.filter(l => l.accountId === accountId);
}

export function getLocationsByCustomerId(customerId: string): Location[] {
  return mockLocations.filter(l => l.customerId === customerId);
}

export function getAllLocations(): Location[] {
  return mockLocations;
}
