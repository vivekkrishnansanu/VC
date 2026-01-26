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
import { Building2, LayoutDashboard, MapPin, ChevronRight, AlertCircle, CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
          { title: 'Accounts', href: '/customer/dashboard', icon: <Building2 className="h-4 w-4" /> },
          { title: 'Locations', href: '/customer/dashboard', icon: <MapPin className="h-4 w-4" /> },
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
        { title: 'Accounts', href: '/customer/dashboard', icon: <Building2 className="h-4 w-4" /> },
        { title: 'Locations', href: '/customer/dashboard', icon: <MapPin className="h-4 w-4" /> },
      ]}
    >
      {/* Summary Metrics - Card Design */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">Accounts</div>
                <div className="text-2xl font-bold text-slate-900 leading-none">{accounts.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">Locations</div>
                <div className="text-2xl font-bold text-slate-900 leading-none">{totalLocations}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <LayoutDashboard className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">Overall Progress</div>
                <div className="text-2xl font-bold text-slate-900 leading-none">
                  {accounts.length > 0 
                    ? Math.round(accounts.reduce((sum, acc) => sum + (acc.progress?.percentage || 0), 0) / accounts.length)
                    : 0}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-900">Error: {error}</p>
          <p className="mt-1 text-xs text-red-700">
            Please refresh the page or contact support if the issue persists.
          </p>
        </div>
      )}

      {/* Accounts Table - Professional View */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Your Accounts</h2>
          <p className="text-sm text-slate-600">Click on any account to view locations and manage onboarding</p>
        </div>

        <Card className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {accounts.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-7 w-7 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">No accounts found</p>
                <p className="text-xs text-slate-500">Please contact your Implementation Lead to get access to accounts.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 border-b border-slate-200 hover:bg-slate-50/50">
                      <TableHead className="h-12 px-6 font-semibold text-xs text-slate-700 uppercase tracking-wider">
                        Account
                      </TableHead>
                      <TableHead className="h-12 px-6 font-semibold text-xs text-slate-700 uppercase tracking-wider w-32">
                        Product
                      </TableHead>
                      <TableHead className="h-12 px-6 font-semibold text-xs text-slate-700 uppercase tracking-wider text-center w-24">
                        Locations
                      </TableHead>
                      <TableHead className="h-12 px-6 font-semibold text-xs text-slate-700 uppercase tracking-wider w-44">
                        Progress
                      </TableHead>
                      <TableHead className="h-12 px-6 font-semibold text-xs text-slate-700 uppercase tracking-wider w-36">
                        Status
                      </TableHead>
                      <TableHead className="h-12 px-6 font-semibold text-xs text-slate-700 uppercase tracking-wider w-36">
                        Issues
                      </TableHead>
                      <TableHead className="h-12 px-6 w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((account, index) => {
                      const accountProgress = account.progress?.percentage || 0;
                      const locationCount = account.locations?.length || 0;
                      const hasBlockers = (account.warnings?.blockers?.pendingApprovals || 0) > 0 || 
                                         (account.warnings?.blockers?.unsupportedPhones || 0) > 0;
                      const hasWarnings = (account.warnings?.warnings?.missingDevices || 0) > 0 || 
                                         (account.warnings?.warnings?.incompleteCallFlow || 0) > 0;
                      const isComplete = accountProgress === 100;
                      const blockerCount = (account.warnings?.blockers?.pendingApprovals || 0) + 
                                          ((account.warnings?.blockers?.unsupportedPhones || 0) > 0 ? 1 : 0);
                      const warningCount = ((account.warnings?.warnings?.missingDevices || 0) > 0 ? 1 : 0) + 
                                          ((account.warnings?.warnings?.incompleteCallFlow || 0) > 0 ? 1 : 0);

                      let statusLabel = "Not Started";
                      let statusIcon = Clock;
                      let statusColor = "bg-slate-50 text-slate-700 border-slate-200";
                      
                      if (isComplete) {
                        statusLabel = "Completed";
                        statusIcon = CheckCircle2;
                        statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                      } else if (accountProgress > 0) {
                        statusLabel = "In Progress";
                        statusIcon = PlayCircle;
                        statusColor = "bg-blue-50 text-blue-700 border-blue-200";
                      }

                      const StatusIcon = statusIcon;

                      return (
                        <TableRow
                          key={account.id}
                          className={cn(
                            "cursor-pointer border-b border-slate-100 transition-all duration-150",
                            "hover:bg-slate-50/80",
                            index === accounts.length - 1 && "border-b-0"
                          )}
                          onClick={() => window.location.href = `/customer/account/${account.id}`}
                        >
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                <Building2 className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-sm text-slate-900 mb-0.5 truncate">
                                  {account.name}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {account.progress?.completed || 0} of {account.progress?.total || 0} locations complete
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <Badge 
                              variant="outline" 
                              className="bg-white border-slate-200 text-slate-700 text-xs font-medium px-2.5 py-1 whitespace-nowrap"
                            >
                              {account.productType?.replace('_', ' ') || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-semibold text-slate-900">{locationCount}</span>
                              <span className="text-xs text-slate-500 whitespace-nowrap">location{locationCount !== 1 ? 's' : ''}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-sm font-semibold text-slate-900 tabular-nums">
                                  {accountProgress}%
                                </span>
                                <span className="text-xs text-slate-500 font-medium tabular-nums">
                                  {account.progress?.completed || 0}/{account.progress?.total || 0}
                                </span>
                              </div>
                              <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all duration-500 ease-out",
                                    isComplete
                                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                                      : "bg-gradient-to-r from-blue-500 to-blue-600"
                                  )}
                                  style={{ width: `${accountProgress}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <Badge
                              className={cn(
                                "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border whitespace-nowrap",
                                statusColor
                              )}
                            >
                              <StatusIcon className="h-3 w-3 shrink-0" />
                              <span className="whitespace-nowrap">{statusLabel}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-2 flex-nowrap">
                              {blockerCount > 0 && (
                                <Badge 
                                  className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border-red-200 text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap shrink-0"
                                >
                                  <AlertCircle className="h-3 w-3 shrink-0" />
                                  <span className="whitespace-nowrap">{blockerCount} blocker{blockerCount > 1 ? 's' : ''}</span>
                                </Badge>
                              )}
                              {warningCount > 0 && (
                                <Badge 
                                  className="inline-flex items-center gap-1.5 bg-[#FFFDEB] text-[#92400E] border-2 border-[#F0C94F] text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap shrink-0"
                                >
                                  <AlertCircle className="h-3 w-3 shrink-0 text-[#F0C94F]" />
                                  <span className="whitespace-nowrap">{warningCount} warning{warningCount > 1 ? 's' : ''}</span>
                                </Badge>
                              )}
                              {!hasBlockers && !hasWarnings && isComplete && (
                                <Badge 
                                  className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap shrink-0"
                                >
                                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                                  <span className="whitespace-nowrap">Complete</span>
                                </Badge>
                              )}
                              {!hasBlockers && !hasWarnings && !isComplete && (
                                <span className="text-xs text-slate-400 font-medium whitespace-nowrap shrink-0">No issues</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/customer/account/${account.id}`;
                              }}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
