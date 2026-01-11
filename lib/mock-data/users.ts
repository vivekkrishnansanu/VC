import { User, UserRole } from './types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'john.doe@company.com',
    name: 'John Doe',
    role: UserRole.IMPLEMENTATION_LEAD,
    phone: '+1-555-0101',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    lastLoginAt: new Date('2024-01-10'),
  },
  {
    id: 'user-2',
    email: 'jane.smith@company.com',
    name: 'Jane Smith',
    role: UserRole.IMPLEMENTATION_LEAD,
    phone: '+1-555-0102',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    lastLoginAt: new Date('2024-01-09'),
  },
  {
    id: 'user-3',
    email: 'customer1@client.com',
    name: 'Alice Johnson',
    role: UserRole.CUSTOMER,
    phone: '+1-555-0201',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    lastLoginAt: new Date('2024-01-10'),
  },
  {
    id: 'user-4',
    email: 'customer2@client.com',
    name: 'Bob Williams',
    role: UserRole.CUSTOMER,
    phone: '+1-555-0202',
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-06'),
  },
];

export function getUserById(id: string): User | undefined {
  return mockUsers.find(u => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return mockUsers.find(u => u.email === email);
}

export function getUsersByRole(role: UserRole): User[] {
  return mockUsers.filter(u => u.role === role);
}
