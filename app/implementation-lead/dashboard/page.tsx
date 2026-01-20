'use client';

import { useEffect, useState } from 'react';
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
import { Plus, Building2, MapPin, CheckCircle2, Clock, AlertCircle, LayoutDashboard, Users, Building, Check, X } from 'lucide-react';
import { AccountCard } from '@/components/accounts/AccountCard';
import { PortalShell } from '@/components/layouts/PortalShell';

export default function ImplementationLeadDashboard() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [showApprovals, setShowApprovals] = useState(false);
  const [loading, setLoading] = useState(true);

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
      actions={
        <Link href="/implementation-lead/accounts/create">
          <Button>
            <Plus className="h-4 w-4" />
            Create New Account
          </Button>
        </Link>
      }
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
      <div className="space-y-6">

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl border-border/50 bg-card shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Accounts</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">{accounts.length}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="text-green-600 font-medium">+{accounts.length * 2}%</span>
              <span>↑</span>
              <span className="ml-1">vs last month</span>
            </div>
            <Badge variant="secondary" className="mt-3 text-[10px] font-semibold">
              All accounts
            </Badge>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-card shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Locations</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">
              {accounts.reduce((sum, acc) => sum + (acc.locations?.length || 0), 0)}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="text-green-600 font-medium">+{Math.floor(accounts.reduce((sum, acc) => sum + (acc.locations?.length || 0), 0) * 1.5)}%</span>
              <span>↑</span>
              <span className="ml-1">vs last month</span>
            </div>
            <Badge variant="secondary" className="mt-3 text-[10px] font-semibold">
              All locations
            </Badge>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-card shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Pending Approvals</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">{pendingApprovals.length}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {pendingApprovals.length > 0 ? (
                <>
                  <span className="text-amber-600 font-medium">Requires attention</span>
                </>
              ) : (
                <>
                  <span className="text-green-600 font-medium">All clear</span>
                  <span>✓</span>
                </>
              )}
            </div>
            {pendingApprovals.length > 0 && (
              <Button 
                variant="link" 
                className="p-0 h-auto text-xs mt-3 font-semibold"
                onClick={() => setShowApprovals(true)}
              >
                View all →
              </Button>
            )}
            <Badge variant={pendingApprovals.length > 0 ? "destructive" : "secondary"} className="mt-2 text-[10px] font-semibold">
              {pendingApprovals.length > 0 ? "Action needed" : "No pending"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/50 bg-card shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold">Accounts</CardTitle>
          <CardDescription className="text-sm">All accounts and their onboarding progress.</CardDescription>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No accounts found. Create your first account to get started.
            </p>
          ) : (
            <div className="grid gap-4 grid-cols-1 grid-rows-3">
              {accounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  warnings={account.warnings}
                  progress={account.progress}
                  locations={account.locations}
                  userRole="IMPLEMENTATION_LEAD"
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
