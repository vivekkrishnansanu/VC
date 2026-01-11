'use client';

import { useEffect, useState } from 'react';
import { mockDataService } from '@/lib/mock-data/service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { OnboardingStatus } from '@/lib/mock-data/types';
import Link from 'next/link';
import { Plus, Building2, MapPin, CheckCircle2, Clock, AlertCircle, LayoutDashboard, Users, Building } from 'lucide-react';
import { PortalShell } from '@/components/layouts/PortalShell';

export default function ImplementationLeadDashboard() {
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    // Load accounts from mock data
    const allAccounts = mockDataService.accounts.getAll();
    setAccounts(allAccounts);
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

  if (accounts.length === 0) {
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
            Create account
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold">Total Accounts</CardTitle>
            <Building2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{accounts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold">Total Locations</CardTitle>
            <MapPin className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {accounts.reduce((sum, acc) => sum + acc.totalLocations, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold">Pending Approvals</CardTitle>
            <AlertCircle className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Accounts</CardTitle>
          <CardDescription>All accounts and their onboarding progress.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Account Name</TableHead>
                  <TableHead className="min-w-[120px]">Product Type</TableHead>
                  <TableHead className="min-w-[100px]">Locations</TableHead>
                  <TableHead className="min-w-[200px]">Onboarding Progress</TableHead>
                  <TableHead className="min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => {
                  const locations = mockDataService.locations.getByAccountId(account.id);
                  const onboardingStatuses = locations.map(loc => {
                    const onboarding = mockDataService.onboarding.getByLocationId(loc.id);
                    return onboarding?.status || OnboardingStatus.NOT_STARTED;
                  });
                  
                  const completed = onboardingStatuses.filter(s => s === OnboardingStatus.COMPLETED).length;
                  const progress = locations.length > 0 ? (completed / locations.length) * 100 : 0;

                  return (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{account.productType}</Badge>
                      </TableCell>
                      <TableCell>{account.totalLocations}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[150px]">
                          <div className="flex-1 bg-secondary rounded-full h-2 min-w-[80px]">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {completed}/{locations.length}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link href={`/implementation-lead/accounts/${account.id}`}>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </div>
    </PortalShell>
  );
}
