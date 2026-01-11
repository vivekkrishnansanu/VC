import { Account, AccountContact, ProductType } from './types';
import { mockUsers } from './users';

export const mockAccounts: Account[] = [
  {
    id: 'account-1',
    name: 'Acme Medical Group',
    productType: ProductType.CS_VOICESTACK,
    totalLocations: 3,
    accountId: 'CS-ACME-001',
    contacts: [
      {
        id: 'contact-1',
        accountId: 'account-1',
        name: 'Dr. Sarah Miller',
        phone: '+1-555-1001',
        email: 'sarah.miller@acme.com',
        isPrimary: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'contact-2',
        accountId: 'account-1',
        name: 'Mike Johnson',
        phone: '+1-555-1002',
        email: 'mike.johnson@acme.com',
        isPrimary: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: mockUsers[0].id,
  },
  {
    id: 'account-2',
    name: 'City Dental Practice',
    productType: ProductType.VOICESTACK,
    totalLocations: 2,
    contacts: [
      {
        id: 'contact-3',
        accountId: 'account-2',
        name: 'Dr. Robert Chen',
        phone: '+1-555-2001',
        email: 'robert.chen@citydental.com',
        isPrimary: true,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
    ],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    createdBy: mockUsers[0].id,
  },
  {
    id: 'account-3',
    name: 'Regional Health Network',
    productType: ProductType.CS_VOICESTACK,
    totalLocations: 5,
    accountId: 'CS-RHN-001',
    contacts: [
      {
        id: 'contact-4',
        accountId: 'account-3',
        name: 'Emily Davis',
        phone: '+1-555-3001',
        email: 'emily.davis@rhn.com',
        isPrimary: true,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      },
    ],
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
    createdBy: mockUsers[1].id,
  },
];

export function getAccountById(id: string): Account | undefined {
  return mockAccounts.find(a => a.id === id);
}

export function getAllAccounts(): Account[] {
  return mockAccounts;
}

export function getAccountsByProductType(productType: ProductType): Account[] {
  return mockAccounts.filter(a => a.productType === productType);
}
