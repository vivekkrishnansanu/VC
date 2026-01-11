/**
 * Device Validation API
 * POST: Validate device brand and model
 */

import { NextRequest, NextResponse } from 'next/server';
import { DeviceValidationService } from '@/lib/services';
import { PhoneBrand } from '@/lib/mock-data/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brand, model } = body;

    if (!brand || !model) {
      return NextResponse.json(
        { error: 'brand and model are required' },
        { status: 400 }
      );
    }

    const validation = DeviceValidationService.validateDevice(
      brand as PhoneBrand,
      model
    );

    return NextResponse.json(validation);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to validate device' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const brand = searchParams.get('brand') as PhoneBrand;
    const locationId = searchParams.get('locationId');

    if (brand) {
      // Get supported models for a brand
      const models = DeviceValidationService.getSupportedModels(brand);
      return NextResponse.json({ models });
    }

    if (locationId) {
      // Check if location has unsupported devices
      const hasUnsupported = DeviceValidationService.hasUnsupportedDevices(locationId);
      const unsupported = DeviceValidationService.getUnsupportedDevices(locationId);
      const canSubmit = DeviceValidationService.canSubmitWithUnsupportedDevices(locationId);

      return NextResponse.json({
        hasUnsupported,
        unsupported,
        canSubmit: canSubmit.canSubmit,
        reason: canSubmit.reason,
      });
    }

    return NextResponse.json(
      { error: 'Either brand or locationId is required' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get device information' },
      { status: 500 }
    );
  }
}
