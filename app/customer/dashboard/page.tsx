'use client';

import { useEffect, useState } from 'react';
import { mockDataService } from '@/lib/mock-data/service';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { AccountCard } from '@/components/accounts/AccountCard';
import { AccountWarningsService } from '@/lib/services/account-warnings.service';
import { ProgressService } from '@/lib/services/progress.service';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AccountData {
  id: string;
  name: string;
  productType: any;
  warnings: any;
  progress: any;
  locations: any[];
}

export default function CustomerDashboard() {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { signOut, user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to finish loading before fetching accounts
    if (authLoading) {
      setLoading(true);
      return;
    }

    // Fetch accounts with warnings and progress
    const loadAccounts = async () => {
      setLoading(true);
      setError(null);
      try {
        // In real app, get from auth context
        // Try to get from auth context first, fallback to mock
        const customerId = user?.id || 'user-3'; // Mock customer
        console.log('Loading accounts for customer:', customerId, 'user:', user);
        
        let customerLocations = mockDataService.locations.getByCustomerId(customerId);
        console.log('Found locations:', customerLocations.length, customerLocations);
        
        // If no locations found, try getting all locations for demo
        if (customerLocations.length === 0) {
          console.warn('No locations found for customer, using all locations for demo');
          customerLocations = mockDataService.locations.getAll().slice(0, 3);
        }
        
        // Get unique account IDs
        const accountIds = [...new Set(customerLocations.map(loc => loc.accountId))];
        
        // Build account data with warnings and progress
        const accountsData = await Promise.all(
          accountIds.map(async (accountId) => {
            try {
              const account = mockDataService.accounts.getById(accountId);
              if (!account) return null;

              const warnings = AccountWarningsService.calculateAccountWarnings(accountId);
              const progress = ProgressService.calculateAccountProgress(accountId);
              
              // Get locations for this account
              const accountLocations = customerLocations.filter(loc => loc.accountId === accountId);
              const locations = accountLocations.map(location => {
                try {
                  const onboarding = mockDataService.onboarding.getByLocationId(location.id);
                  const locationWarnings = AccountWarningsService.calculateLocationWarnings(location.id);
                  const locationProgress = ProgressService.calculateLocationProgress(location.id);

                  return {
                    id: location.id,
                    name: location.name,
                    addressLine1: location.addressLine1,
                    city: location.city,
                    state: location.state,
                    status: onboarding?.status || 'NOT_STARTED',
                    progress: locationProgress,
                    warnings: locationWarnings,
                  };
                } catch (err) {
                  console.error(`Error loading location ${location.id}:`, err);
                  return {
                    id: location.id,
                    name: location.name,
                    addressLine1: location.addressLine1,
                    city: location.city,
                    state: location.state,
                    status: 'NOT_STARTED',
                    progress: { completed: 0, total: 6, percentage: 0, currentStep: null },
                    warnings: { blockers: { pendingApprovals: 0, hasUnsupportedPhones: false }, warnings: { missingDevices: false, incompleteCallFlow: false } },
                  };
                }
              });

              return {
                id: account.id,
                name: account.name,
                productType: account.productType,
                warnings,
                progress,
                locations,
              };
            } catch (err) {
              console.error(`Error loading account ${accountId}:`, err);
              return null;
            }
          })
        );

        const validAccounts = accountsData.filter(Boolean) as AccountData[];
        console.log('Loaded accounts:', validAccounts.length, validAccounts);
        setAccounts(validAccounts);
      } catch (error) {
        console.error('Failed to load accounts:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load accounts';
        setError(errorMessage);
        console.error('Error details:', {
          message: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
        });
        // Set empty array on error to show empty state
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="h-screen bg-background overflow-hidden">
        <div className="flex h-full w-full gap-6 px-4 py-4 sm:px-6 sm:py-6">
          <div className="min-w-0 flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto overscroll-contain flex items-center justify-center">
              <LoadingSpinner size="lg" text="Loading accounts..." />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (accounts.length === 0 && !loading && !error) {
    return (
      <div className="h-screen bg-background overflow-hidden">
        <div className="flex h-full w-full gap-6 px-4 py-4 sm:px-6 sm:py-6">
          <div className="min-w-0 flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="space-y-4">
                <div className="mb-3 sm:mb-4">
                  <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-1">
                    My accounts
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    View your accounts and track onboarding progress.
                  </p>
                </div>
                <Separator className="mb-4 sm:mb-6" />
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground mb-2">
                    No accounts found.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Please contact your Implementation Lead to get access to accounts.
                  </p>
                </div>
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-muted-foreground p-4 bg-muted rounded-lg border border-border">
                    <p className="font-semibold mb-2">Debug info:</p>
                    <p>Loading: {loading ? 'true' : 'false'}</p>
                    <p>Auth Loading: {authLoading ? 'true' : 'false'}</p>
                    <p>User: {user ? `${user.name} (${user.id})` : 'null'}</p>
                    <p>Accounts count: {accounts.length}</p>
                    <p className="mt-2">Check browser console for details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background overflow-hidden">
      <div className="flex h-full w-full gap-3 px-3 py-3 sm:gap-4 sm:px-3 sm:py-3 md:gap-6 md:px-3 md:py-3">
        {/* Left Sidebar - Navigation */}
        <aside className="hidden h-full w-64 shrink-0 lg:block border-r border-border pr-6 overflow-y-auto">
          <div className="flex flex-col h-full space-y-6 py-2">
            {/* Logo */}
            <div className="pb-4 border-b border-border">
              <img
                src="https://voicestack.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fvoicestack-logo.91a9d9aa.svg&w=384&q=75&dpl=dpl_6YQQQr5c5yUDQKfyirHUrb7KDZfE"
                alt="VoiceStack"
                className="h-6 w-auto"
                loading="eager"
              />
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Logout Button - Bottom */}
            <div className="pt-6 border-t border-border">
              <Button
                variant="secondary"
                className="w-full justify-start gap-2"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Sign out</span>
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto overscroll-contain pl-3">
            {/* Page Header */}
            <div className="mb-3 sm:mb-4">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-1">
                My accounts
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                View your accounts and track onboarding progress.
              </p>
            </div>
            <Separator className="mb-4 sm:mb-6" />

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm font-medium text-destructive">
                  Error: {error}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please refresh the page or contact support if the issue persists.
                </p>
              </div>
            )}

            {/* Account Cards */}
            <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(1, 1fr)', gridTemplateRows: 'repeat(1, 1fr)' }}>
              {accounts.map((account) => {
                if (!account || !account.warnings || !account.progress) {
                  console.warn('Invalid account data:', account);
                  return null;
                }
                return (
                  <AccountCard
                    key={account.id}
                    account={account}
                    warnings={account.warnings}
                    progress={account.progress}
                    locations={account.locations || []}
                    userRole="CUSTOMER"
                  />
                );
              })}
            </div>

            {/* Spacer */}
            <div className="h-20" />
          </div>
        </main>
      </div>
    </div>
  );
}
