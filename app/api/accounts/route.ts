/**
 * Accounts API
 * GET: Get all accounts with warnings and progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/middleware';
import { mockDataService } from '@/lib/mock-data';
import { AccountWarningsService } from '@/lib/services/account-warnings.service';
import { ProgressService } from '@/lib/services/progress.service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    let accounts;
    if (user.role === 'CUSTOMER') {
      // Customers only see accounts they have access to
      // For now, get accounts from their locations
      const customerLocations = mockDataService.locations.getByCustomerId(user.id);
      const accountIds = [...new Set(customerLocations.map(loc => loc.accountId))];
      accounts = accountIds.map(id => mockDataService.accounts.getById(id)).filter(Boolean);
    } else {
      // Implementation Leads see all accounts
      accounts = mockDataService.accounts.getAll();
    }

    // Enhance accounts with warnings and progress
    const accountsWithData = accounts
      .filter((account): account is NonNullable<typeof account> => account !== null && account !== undefined)
      .map(account => {
        const warnings = AccountWarningsService.calculateAccountWarnings(account.id);
        const progress = ProgressService.calculateAccountProgress(account.id);

        return {
          ...account,
          warnings,
          progress,
        };
      });

    return NextResponse.json({ accounts: accountsWithData });
  } catch (error: any) {
    console.error('Error in /api/accounts:', error);
    // Check if it's an authentication error
    if (error.statusCode === 401) {
      return NextResponse.json(
        { error: error.message || 'Authentication required' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to get accounts', details: error.stack },
      { status: error.statusCode || 500 }
    );
  }
}
