/**
 * Extension Management API
 * POST: Create extension series
 * GET: Get available extensions or validate extension
 */

import { NextRequest, NextResponse } from 'next/server';
import { ExtensionService } from '@/lib/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationId, prefix, startRange, endRange, reservedExtensions } = body;

    if (!locationId || startRange === undefined || endRange === undefined) {
      return NextResponse.json(
        { error: 'locationId, startRange, and endRange are required' },
        { status: 400 }
      );
    }

    const series = ExtensionService.createExtensionSeries({
      locationId,
      prefix,
      startRange,
      endRange,
      reservedExtensions: reservedExtensions || [],
    });

    return NextResponse.json(series);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create extension series' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locationId = searchParams.get('locationId');
    const extension = searchParams.get('extension');
    const count = searchParams.get('count');

    if (!locationId) {
      return NextResponse.json(
        { error: 'locationId is required' },
        { status: 400 }
      );
    }

    if (extension) {
      // Validate extension availability
      const isAvailable = ExtensionService.isExtensionAvailable(locationId, extension);
      return NextResponse.json({ isAvailable, extension });
    }

    if (count) {
      // Generate available extensions
      const available = ExtensionService.generateAvailableExtensions(
        locationId,
        parseInt(count)
      );
      return NextResponse.json({ available, count: available.length });
    }

    // Get extension series
    const series = ExtensionService.getExtensionSeries(locationId) ||
                   ExtensionService.getDefaultExtensionSeries(locationId);

    return NextResponse.json(series);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get extension information' },
      { status: 500 }
    );
  }
}
