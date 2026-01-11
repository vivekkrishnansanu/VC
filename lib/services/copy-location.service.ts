/**
 * Copy Previous Location Service
 * Handles copying onboarding data from one location to another
 */

import { CopyPreviousLocationRequest } from './types';
import { LocationOnboarding } from '@/lib/mock-data/types';
import { mockDataService } from '@/lib/mock-data';
import { AuditLogService } from './audit-log.service';
import { getOnboardingStore } from '@/lib/storage';

// Fields that can be copied (marked with CP in requirements)
const COPYABLE_FIELDS = [
  'pocName',
  'pocContact',
  'pocEmail',
  'pocPhone',
  'preferredContactMedium',
] as const;

type CopyableField = typeof COPYABLE_FIELDS[number];

export class CopyLocationService {
  /**
   * Copy fields from one location to another
   */
  static async copyFromPreviousLocation(
    request: CopyPreviousLocationRequest,
    userId: string
  ): Promise<LocationOnboarding> {
    const { fromLocationId, toLocationId, fieldsToCopy } = request;
    const store = getOnboardingStore();

    // Get source onboarding
    const sourceOnboarding =
      (await store.getOnboarding(fromLocationId)) ??
      mockDataService.onboarding.getByLocationId(fromLocationId);
    if (!sourceOnboarding) {
      throw new Error(`Source location ${fromLocationId} has no onboarding data`);
    }

    // Get target onboarding (create if doesn't exist)
    let targetOnboarding =
      (await store.getOnboarding(toLocationId)) ??
      mockDataService.onboarding.getByLocationId(toLocationId);
    
    if (!targetOnboarding) {
      // Create new onboarding record
      const location = mockDataService.locations.getById(toLocationId);
      if (!location) {
        throw new Error(`Target location ${toLocationId} not found`);
      }

      targetOnboarding = {
        id: `onboarding-${toLocationId}`,
        locationId: toLocationId,
        status: sourceOnboarding.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Validate fields to copy
    const validFields = fieldsToCopy.filter(field => 
      COPYABLE_FIELDS.includes(field as CopyableField)
    );

    if (validFields.length === 0) {
      throw new Error('No valid fields to copy');
    }

    // Track changes for audit
    const changes: Record<string, { from: any; to: any }> = {};

    // Copy each field
    for (const field of validFields) {
      const sourceValue = sourceOnboarding[field as keyof LocationOnboarding];
      const targetValue = targetOnboarding[field as keyof LocationOnboarding];

      if (sourceValue !== undefined && sourceValue !== null) {
        changes[field] = {
          from: targetValue,
          to: sourceValue,
        };
        
        (targetOnboarding as any)[field] = sourceValue;
      }
    }

    // Update copiedFromLocationId
    targetOnboarding.copiedFromLocationId = fromLocationId;
    targetOnboarding.updatedAt = new Date();

    // Log audit
    AuditLogService.log({
      action: 'COPY',
      entityType: 'onboarding',
      entityId: targetOnboarding.id,
      userId,
      changes,
      metadata: {
        copiedFromLocationId: fromLocationId,
        copiedFields: validFields,
      },
    });

    // Persist for demo (Supabase) / future DB
    await store.upsertOnboarding(toLocationId, targetOnboarding);

    return targetOnboarding;
  }

  /**
   * Get copyable fields from a location
   */
  static getCopyableFields(locationId: string): Record<string, any> {
    const onboarding = mockDataService.onboarding.getByLocationId(locationId);
    if (!onboarding) {
      return {};
    }

    const copyable: Record<string, any> = {};
    for (const field of COPYABLE_FIELDS) {
      const value = onboarding[field as keyof LocationOnboarding];
      if (value !== undefined && value !== null) {
        copyable[field] = value;
      }
    }

    return copyable;
  }

  /**
   * Get list of locations that can be copied from (same account, different location)
   */
  static getAvailableSourceLocations(
    targetLocationId: string
  ): Array<{ id: string; name: string; hasOnboarding: boolean }> {
    const targetLocation = mockDataService.locations.getById(targetLocationId);
    if (!targetLocation) {
      return [];
    }

    // Get all locations in the same account
    const accountLocations = mockDataService.locations.getByAccountId(
      targetLocation.accountId
    );

    // Filter out the target location itself
    return accountLocations
      .filter(loc => loc.id !== targetLocationId)
      .map(loc => {
        const onboarding = mockDataService.onboarding.getByLocationId(loc.id);
        return {
          id: loc.id,
          name: loc.name,
          hasOnboarding: !!onboarding && onboarding.status !== 'NOT_STARTED',
        };
      });
  }
}
