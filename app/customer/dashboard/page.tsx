'use client';

import { useEffect, useState } from 'react';
import { mockDataService } from '@/lib/mock-data/service';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { AccountCard } from '@/components/accounts/AccountCard';
import { AccountWarningsService } from '@/lib/services/account-warnings.service';
import { ProgressService } from '@/lib/services/progress.service';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PortalShell } from '@/components/layouts/PortalShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, LayoutDashboard, MapPin, TrendingUp, Info } from 'lucide-react';

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
  const { user, isLoading: authLoading } = useAuth();

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Loading accounts..." />
        </div>
      </div>
    );
  }

  if (accounts.length === 0 && !loading && !error) {
    return (
      <PortalShell
        title="My accounts"
        description="View your accounts and track onboarding progress."
        nav={[
          { title: 'Dashboard', href: '/customer/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
        ]}
      >
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl p-12 text-center max-w-md shadow-lg">
            <div className="h-20 w-20 rounded-full bg-slate-100 border border-slate-200/60 flex items-center justify-center mx-auto mb-6">
              <Building2 className="h-10 w-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No accounts found</h3>
            <p className="text-sm text-slate-600 mb-6">
              Please contact your Implementation Lead to get access to accounts.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200/60">
              <span className="text-xs font-semibold text-slate-700">Waiting for access</span>
            </div>
          </div>
        </div>
      </PortalShell>
    );
  }

  const totalLocations = accounts.reduce((sum, acc) => sum + (acc.locations?.length || 0), 0);
  const avgProgress = accounts.length > 0 
    ? Math.round(accounts.reduce((sum, acc) => sum + (acc.progress?.percentage || 0), 0) / accounts.length)
    : 0;

  return (
    <PortalShell
      title="My accounts"
      description="View your accounts and track onboarding progress."
      nav={[
        { title: 'Dashboard', href: '/customer/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
      ]}
      sidebarMetrics={[
        {
          label: 'Accounts',
          value: accounts.length,
          color: 'primary',
          trend: { value: `+${accounts.length * 2}%`, direction: 'up' },
        },
        {
          label: 'Locations',
          value: totalLocations,
          color: 'success',
          trend: { value: `+${Math.floor(totalLocations * 1.5)}%`, direction: 'up' },
        },
      ]}
      sidebarProgress={{
        label: 'Onboarding Progress',
        value: avgProgress,
        target: 100,
        color: 'primary',
      }}
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_0_rgba(0,0,0,0.12)] hover:border-slate-300/50 transition-all duration-500 group relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-bold text-slate-600 uppercase tracking-wide">Total Accounts</CardTitle>
              <div className="relative group/tooltip">
                <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover/tooltip:block z-50 w-48">
                  <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
                    Number of active accounts you have access to
                    <div className="absolute left-3 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
                  </div>
                </div>
              </div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-slate-100 border border-slate-200/60 flex items-center justify-center group-hover:bg-slate-50 transition-colors duration-200">
              <Building2 className="h-6 w-6 text-slate-700" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-slate-900 mb-2">{accounts.length}</div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mb-4">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+{accounts.length * 2}%</span>
              <span className="text-slate-500 font-normal">vs last month</span>
            </div>
            <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-[10px] font-bold px-2.5 py-1">
              Active accounts
            </Badge>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_0_rgba(0,0,0,0.12)] hover:border-slate-300/50 transition-all duration-500 group relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-bold text-slate-600 uppercase tracking-wide">Total Locations</CardTitle>
              <div className="relative group/tooltip">
                <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover/tooltip:block z-50 w-48">
                  <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
                    Total number of locations across all accounts
                    <div className="absolute left-3 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
                  </div>
                </div>
              </div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-slate-100 border border-slate-200/60 flex items-center justify-center group-hover:bg-slate-50 transition-colors duration-200">
              <MapPin className="h-6 w-6 text-slate-700" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-slate-900 mb-2">{totalLocations}</div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mb-4">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+{Math.floor(totalLocations * 1.5)}%</span>
              <span className="text-slate-500 font-normal">vs last month</span>
            </div>
            <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-[10px] font-bold px-2.5 py-1">
              All locations
            </Badge>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_0_rgba(0,0,0,0.12)] hover:border-slate-300/50 transition-all duration-500 group relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-bold text-slate-600 uppercase tracking-wide">Onboarding Progress</CardTitle>
              <div className="relative group/tooltip">
                <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover/tooltip:block z-50 w-56">
                  <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
                    Average completion percentage across all accounts
                    <div className="absolute left-3 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
                  </div>
                </div>
              </div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-slate-100 border border-slate-200/60 flex items-center justify-center group-hover:bg-slate-50 transition-colors duration-200">
              <LayoutDashboard className="h-6 w-6 text-slate-700" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-slate-900 mb-2">
              {accounts.length > 0 
                ? Math.round(accounts.reduce((sum, acc) => sum + (acc.progress?.percentage || 0), 0) / accounts.length)
                : 0}%
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mb-4">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+12%</span>
              <span className="text-slate-500 font-normal">completion rate</span>
            </div>
            <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-[10px] font-bold px-2.5 py-1">
              Average progress
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8 bg-slate-100" />

      {error && (
        <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive">Error: {error}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Please refresh the page or contact support if the issue persists.
          </p>
        </div>
      )}

      <div className="grid gap-8">
        {accounts.map((account, idx) => {
          if (!account || !account.warnings || !account.progress) {
            console.warn('Invalid account data:', account);
            return null;
          }
          return (
            <div
              key={account.id}
              className="animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
            >
              <AccountCard
                account={account}
                warnings={account.warnings}
                progress={account.progress}
                locations={account.locations || []}
                userRole="CUSTOMER"
              />
            </div>
          );
        })}
      </div>
    </PortalShell>
  );
}
