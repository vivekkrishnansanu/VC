'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { mockDataService } from '@/lib/mock-data/service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { OnboardingStatus } from '@/lib/mock-data/types';
import Link from 'next/link';
import { Plus, Building2, MapPin, CheckCircle2, Clock, AlertCircle, LayoutDashboard, Users, Building, Check, X, PlayCircle, ChevronRight } from 'lucide-react';
import { AccountCard } from '@/components/accounts/AccountCard';
import { PortalShell } from '@/components/layouts/PortalShell';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export default function ImplementationLeadDashboard() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [showApprovals, setShowApprovals] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        // Load accounts from mock data
        const allAccounts = mockDataService.accounts.getAll();
        
        // Enhance with warnings and progress
        const { AccountWarningsService } = await import('@/lib/services/account-warnings.service');
        const { ProgressService } = await import('@/lib/services/progress.service');
        
        const accountsWithData = allAccounts.map(account => {
          const warnings = AccountWarningsService.calculateAccountWarnings(account.id);
          const progress = ProgressService.calculateAccountProgress(account.id);
          
          // Get locations for this account
          const locations = mockDataService.locations.getByAccountId(account.id);
          const locationsWithData = locations.map(location => {
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
          });

          return {
            ...account,
            warnings,
            progress,
            locations: locationsWithData,
          };
        });

        setAccounts(accountsWithData);

        // Load pending approvals
        fetch('/api/approvals')
          .then(res => res.json())
          .then(data => {
            const pending = data.approvals?.filter((a: any) => a.status === 'PENDING') || [];
            setPendingApprovals(pending);
          })
          .catch(() => setPendingApprovals([]));
      } catch (error) {
        console.error('Failed to load accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, []);
  
  const getStatusBadge = (status: OnboardingStatus) => {
    const variants: Record<OnboardingStatus, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      [OnboardingStatus.NOT_STARTED]: { variant: "outline", icon: Clock },
      [OnboardingStatus.IN_PROGRESS]: { variant: "secondary", icon: Clock },
      [OnboardingStatus.PENDING_APPROVAL]: { variant: "secondary", icon: AlertCircle },
      [OnboardingStatus.APPROVED]: { variant: "default", icon: CheckCircle2 },
      [OnboardingStatus.PROVISIONING]: { variant: "secondary", icon: Clock },
      [OnboardingStatus.COMPLETED]: { variant: "default", icon: CheckCircle2 },
      [OnboardingStatus.BLOCKED]: { variant: "destructive", icon: AlertCircle },
      [OnboardingStatus.CANCELLED]: { variant: "outline", icon: AlertCircle },
    };
    
    const config = variants[status];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalLocations = accounts.reduce((sum, acc) => sum + (acc.locations?.length || 0), 0);
  const avgProgress = accounts.length > 0
    ? Math.round(accounts.reduce((sum, acc) => sum + (acc.progress?.percentage || 0), 0) / accounts.length)
    : 0;

  return (
    <PortalShell
      title="Dashboard"
      description="Manage accounts and track onboarding progress."
      nav={[
        { title: "Dashboard", href: "/implementation-lead/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
        { title: "Accounts", href: "/implementation-lead/dashboard", icon: <Building className="h-4 w-4" /> },
        { title: "Users", href: "/implementation-lead/dashboard", icon: <Users className="h-4 w-4" /> },
      ]}
    >
      <div className="space-y-6">

        {/* Summary Metrics - Professional Design */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-4 rounded-lg border border-slate-200/60 bg-slate-50/30 hover:bg-slate-50/50 transition-colors">
            <div className="h-9 w-9 rounded-md bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Building2 className="h-4.5 w-4.5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Accounts</div>
              <div className="text-2xl font-bold text-slate-900 leading-none">{accounts.length}</div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg border border-slate-200/60 bg-slate-50/30 hover:bg-slate-50/50 transition-colors">
            <div className="h-9 w-9 rounded-md bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="h-4.5 w-4.5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Locations</div>
              <div className="text-2xl font-bold text-slate-900 leading-none">
                {accounts.reduce((sum, acc) => sum + (acc.locations?.length || 0), 0)}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg border border-slate-200/60 bg-slate-50/30 hover:bg-slate-50/50 transition-colors">
            <div className="h-9 w-9 rounded-md bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertCircle className="h-4.5 w-4.5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Pending Approvals</div>
              <div className="text-2xl font-bold text-slate-900 leading-none">{pendingApprovals.length}</div>
              {pendingApprovals.length > 0 && (
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-xs mt-1.5 font-medium text-red-600 hover:text-red-700"
                  onClick={() => setShowApprovals(true)}
                >
                  View all →
                </Button>
              )}
            </div>
          </div>
        </div>

      {/* Accounts Table - Professional View */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Accounts</h2>
            <p className="text-sm text-slate-600">Track and manage all accounts and their onboarding progress</p>
          </div>
          <Link href="/implementation-lead/accounts/create">
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 py-2.5 h-11 shadow-md hover:shadow-lg transition-all duration-200 border-0 hover:scale-105 active:scale-100"
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Account
            </Button>
          </Link>
        </div>

        <Card className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {accounts.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-7 w-7 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">No accounts found</p>
                <p className="text-xs text-slate-500">Create your first account to get started.</p>
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
                          onClick={() => router.push(`/implementation-lead/accounts/${account.id}`)}
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
                          <TableCell className="px-6 py-4 text-center">
                            <span className="text-sm font-semibold text-slate-900 tabular-nums">
                              {locationCount}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-sm font-semibold text-slate-900 tabular-nums">
                                  {accountProgress}%
                                </span>
                                <span className="text-xs text-slate-500 font-medium tabular-nums">
                                  {account.progress?.completed || 0} of {account.progress?.total || 0} locations
                                </span>
                              </div>
                              <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all duration-500 ease-out",
                                    isComplete
                                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                                      : hasBlockers
                                      ? "bg-gradient-to-r from-red-500 to-red-600"
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
                                router.push(`/implementation-lead/accounts/${account.id}`);
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

      {/* Pending Approvals Dialog */}
      <Dialog open={showApprovals} onOpenChange={setShowApprovals}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pending Approvals</DialogTitle>
            <DialogDescription>
              Review and approve or reject pending phone purchase requests
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {pendingApprovals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No pending approvals
              </p>
            ) : (
              pendingApprovals.map((approval) => {
                const location = mockDataService.locations.getById(approval.metadata?.locationId || '');
                return (
                  <Card key={approval.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">Phone Purchase Request</h4>
                            <p className="text-sm text-muted-foreground">
                              Location: {location?.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Requested: {new Date(approval.requestedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="secondary">Pending</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                          <div>
                            <p className="text-sm text-muted-foreground">Device</p>
                            <p className="font-medium">{approval.metadata?.brand} {approval.metadata?.model}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Quantity</p>
                            <p className="font-medium">{approval.metadata?.quantity || 1}</p>
                          </div>
                          {approval.metadata?.totalPrice && (
                            <div className="col-span-2">
                              <p className="text-sm text-muted-foreground">Total Price</p>
                              <p className="font-medium">${approval.metadata.totalPrice.toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            size="sm"
                            onClick={async () => {
                              try {
                                const response = await fetch(`/api/approvals/${approval.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ action: 'approve' }),
                                });
                                if (response.ok) {
                                  setPendingApprovals(pendingApprovals.filter(a => a.id !== approval.id));
                                  if (pendingApprovals.length === 1) {
                                    setShowApprovals(false);
                                  }
                                }
                              } catch (error) {
                                console.error('Failed to approve:', error);
                              }
                            }}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              try {
                                const response = await fetch(`/api/approvals/${approval.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ action: 'reject' }),
                                });
                                if (response.ok) {
                                  setPendingApprovals(pendingApprovals.filter(a => a.id !== approval.id));
                                  if (pendingApprovals.length === 1) {
                                    setShowApprovals(false);
                                  }
                                }
                              } catch (error) {
                                console.error('Failed to reject:', error);
                              }
                            }}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </PortalShell>
  );
}
