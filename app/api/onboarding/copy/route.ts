/**
 * Copy Previous Location API
 * POST: Copy fields from one location to another
 */

import { NextRequest, NextResponse } from 'next/server';
import { CopyLocationService } from '@/lib/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromLocationId, toLocationId, fieldsToCopy, userId } = body;

    if (!fromLocationId || !toLocationId || !fieldsToCopy || !userId) {
      return NextResponse.json(
        { error: 'fromLocationId, toLocationId, fieldsToCopy, and userId are required' },
        { status: 400 }
      );
    }

    const onboarding = await CopyLocationService.copyFromPreviousLocation(
      { fromLocationId, toLocationId, fieldsToCopy },
      userId
    );

    return NextResponse.json(onboarding);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to copy location data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locationId = searchParams.get('locationId');

    if (!locationId) {
      return NextResponse.json(
        { error: 'locationId is required' },
        { status: 400 }
      );
    }

    // Get available source locations
    const availableLocations = CopyLocationService.getAvailableSourceLocations(locationId);
    
    // Get copyable fields for each location
    const locationsWithFields = availableLocations.map(loc => ({
      ...loc,
      copyableFields: CopyLocationService.getCopyableFields(loc.id),
    }));

    return NextResponse.json(locationsWithFields);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get available locations' },
      { status: 500 }
    );
  }
}
