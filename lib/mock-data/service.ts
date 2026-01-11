/**
 * Mock Data Service
 * 
 * This service provides a unified interface to access mock data.
 * When ready to connect to MySQL, replace these functions with Prisma queries.
 */

import {
  getAllAccounts,
  getAccountById,
  getAccountsByProductType,
} from './accounts';

import {
  getAllLocations,
  getLocationById,
  getLocationsByAccountId,
  getLocationsByCustomerId,
} from './locations';

import {
  getAllOnboarding,
  getOnboardingById,
  getOnboardingByLocationId,
  getOnboardingByStatus,
} from './onboarding';

import {
  getAllPhones,
  getPhoneById,
  getPhonesByLocationId,
  getUnsupportedPhones,
} from './phones';

import {
  mockUsers,
  getUserById,
  getUserByEmail,
  getUsersByRole,
} from './users';

function getAllUsers() {
  return mockUsers;
}

import {
  getSupportedPhoneModels,
  isPhoneModelSupported,
  getPhoneSystemKnowledge,
  getAllPhoneSystemKnowledge,
} from './master-data';

// Re-export all query functions
export const mockDataService = {
  // Accounts
  accounts: {
    getAll: getAllAccounts,
    getById: getAccountById,
    getByProductType: getAccountsByProductType,
  },
  
  // Locations
  locations: {
    getAll: getAllLocations,
    getById: getLocationById,
    getByAccountId: getLocationsByAccountId,
    getByCustomerId: getLocationsByCustomerId,
  },
  
  // Onboarding
  onboarding: {
    getAll: getAllOnboarding,
    getById: getOnboardingById,
    getByLocationId: getOnboardingByLocationId,
    getByStatus: getOnboardingByStatus,
  },
  
  // Phones
  phones: {
    getAll: getAllPhones,
    getById: getPhoneById,
    getByLocationId: getPhonesByLocationId,
    getUnsupported: getUnsupportedPhones,
  },
  
  // Users
  users: {
    getAll: getAllUsers,
    getById: getUserById,
    getByEmail: getUserByEmail,
    getByRole: getUsersByRole,
  },
  
  // Master Data
  masterData: {
    getSupportedPhoneModels,
    isPhoneModelSupported,
    getPhoneSystemKnowledge,
    getAllPhoneSystemKnowledge,
  },
};

// Default export for convenience
export default mockDataService;
