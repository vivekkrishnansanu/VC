/**
 * Extension Management Service
 * Handles extension series generation, validation, and duplicate prevention
 */

import { ExtensionSeriesConfig } from './types';
import { mockDataService } from '@/lib/mock-data';

// In-memory extension series store (replace with database later)
const extensionSeries: Map<string, ExtensionSeriesConfig> = new Map();

export class ExtensionService {
  /**
   * Create or update extension series for a location
   */
  static createExtensionSeries(config: ExtensionSeriesConfig): ExtensionSeriesConfig {
    // Validate range
    if (config.startRange >= config.endRange) {
      throw new Error('Start range must be less than end range');
    }

    if (config.startRange < 0 || config.endRange < 0) {
      throw new Error('Extension ranges must be positive');
    }

    // Check for existing series
    const existing = extensionSeries.get(config.locationId);
    if (existing) {
      // Merge reserved extensions
      const mergedReserved = [
        ...new Set([...existing.reservedExtensions, ...config.reservedExtensions]),
      ];
      config.reservedExtensions = mergedReserved;
    }

    extensionSeries.set(config.locationId, config);
    return config;
  }

  /**
   * Generate available extensions for a location
   */
  static generateAvailableExtensions(
    locationId: string,
    count: number
  ): string[] {
    const series = extensionSeries.get(locationId);
    if (!series) {
      throw new Error(`No extension series configured for location ${locationId}`);
    }

    // Get existing extensions for this location
    const phones = mockDataService.phones.getByLocationId(locationId);
    const usedExtensions = new Set(
      phones
        .map(p => p.extension)
        .filter((ext): ext is string => ext !== undefined && ext !== null)
    );

    // Generate extensions
    const available: string[] = [];
    const reservedSet = new Set(series.reservedExtensions);

    for (let i = series.startRange; i <= series.endRange && available.length < count; i++) {
      const extension = series.prefix
        ? `${series.prefix}${i.toString().padStart(3, '0')}`
        : i.toString();

      // Check if extension is available
      if (!usedExtensions.has(extension) && !reservedSet.has(extension)) {
        available.push(extension);
      }
    }

    if (available.length < count) {
      throw new Error(
        `Not enough available extensions. Found ${available.length}, needed ${count}`
      );
    }

    return available;
  }

  /**
   * Validate extension is available
   */
  static isExtensionAvailable(locationId: string, extension: string): boolean {
    const series = extensionSeries.get(locationId);
    if (!series) {
      return false;
    }

    // Check if in range
    const numericPart = series.prefix
      ? parseInt(extension.replace(series.prefix, ''))
      : parseInt(extension);

    if (numericPart < series.startRange || numericPart > series.endRange) {
      return false;
    }

    // Check if reserved
    if (series.reservedExtensions.includes(extension)) {
      return false;
    }

    // Check if already used
    const phones = mockDataService.phones.getByLocationId(locationId);
    const isUsed = phones.some(p => p.extension === extension);

    return !isUsed;
  }

  /**
   * Reserve an extension
   */
  static reserveExtension(locationId: string, extension: string): void {
    const series = extensionSeries.get(locationId);
    if (!series) {
      throw new Error(`No extension series configured for location ${locationId}`);
    }

    if (!series.reservedExtensions.includes(extension)) {
      series.reservedExtensions.push(extension);
      extensionSeries.set(locationId, series);
    }
  }

  /**
   * Get extension series for a location
   */
  static getExtensionSeries(locationId: string): ExtensionSeriesConfig | null {
    return extensionSeries.get(locationId) || null;
  }

  /**
   * Get default extension series (if not configured)
   */
  static getDefaultExtensionSeries(locationId: string): ExtensionSeriesConfig {
    return {
      locationId,
      startRange: 1000,
      endRange: 9999,
      reservedExtensions: [],
    };
  }

  /**
   * Initialize extension series for a location with defaults
   */
  static initializeExtensionSeries(locationId: string): ExtensionSeriesConfig {
    const existing = extensionSeries.get(locationId);
    if (existing) {
      return existing;
    }

    const defaultSeries = this.getDefaultExtensionSeries(locationId);
    extensionSeries.set(locationId, defaultSeries);
    return defaultSeries;
  }
}
