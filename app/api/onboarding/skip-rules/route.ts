/**
 * Smart Skip Rules API
 * GET: Get skip rules for a location
 */

import { NextRequest, NextResponse } from 'next/server';
import { SmartSkipService } from '@/lib/services';

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

    const skipRules = SmartSkipService.getSkipRules(locationId);
    return NextResponse.json({ skipRules });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get skip rules' },
      { status: 500 }
    );
  }
}
