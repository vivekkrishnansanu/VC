/**
 * Account Warnings API
 * GET: Get warnings and blockers for an account
 */

import { NextRequest, NextResponse } from 'next/server';
import { AccountWarningsService, LocationWarnings } from '@/lib/services/account-warnings.service';
import { ProgressService, LocationProgress } from '@/lib/services/progress.service';
import { mockDataService } from '@/lib/mock-data';
import { requireLocationAccess } from '@/lib/api/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;
    
    // Check authentication
    await requireLocationAccess(request, accountId);

    const locations = mockDataService.locations.getByAccountId(accountId);
    const account = mockDataService.accounts.getById(accountId);

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Calculate account-level warnings
    const accountWarnings = AccountWarningsService.calculateAccountWarnings(accountId);
    const accountProgress = ProgressService.calculateAccountProgress(accountId);

    // Calculate location-level warnings and progress
    const locationsWithWarnings = locations.map(location => {
      const onboarding = mockDataService.onboarding.getByLocationId(location.id);
      const locationWarnings = AccountWarningsService.calculateLocationWarnings(location.id);
      const locationProgress = ProgressService.calculateLocationProgress(location.id);

      return {
        locationId: location.id,
        name: location.name,
        addressLine1: location.addressLine1,
        city: location.city,
        state: location.state,
        status: onboarding?.status || 'NOT_STARTED',
        progress: locationProgress,
        warnings: locationWarnings,
      };
    });

    return NextResponse.json({
      accountId,
      accountName: account.name,
      blockers: accountWarnings.blockers,
      warnings: accountWarnings.warnings,
      progress: accountProgress,
      locations: locationsWithWarnings,
    });
  } catch (error: any) {
    console.error('Error in /api/accounts/[accountId]/warnings:', error);
    // Check if it's an authentication error
    if (error.statusCode === 401) {
      return NextResponse.json(
        { error: error.message || 'Authentication required' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to get account warnings', details: process.env.NODE_ENV === 'development' ? error.stack : undefined },
      { status: error.statusCode || 500 }
    );
  }
}
