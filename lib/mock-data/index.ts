/**
 * Mock Data Layer
 * 
 * This provides dummy data for development without requiring a database connection.
 * When ready to connect to MySQL, we can swap this out for Prisma queries.
 */

export * from './users';
export * from './accounts';
export * from './locations';
export * from './onboarding';
export * from './phones';
export * from './master-data';
export { mockDataService } from './service';
