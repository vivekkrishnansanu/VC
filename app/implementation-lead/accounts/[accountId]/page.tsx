'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockDataService } from '@/lib/mock-data/service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus } from 'lucide-react';
import { LocationItem } from '@/components/accounts/LocationItem';
import { AccountWarningsService } from '@/lib/services/account-warnings.service';
import { ProgressService } from '@/lib/services/progress.service';
import Link from 'next/link';
import { PortalShell } from '@/components/layouts/PortalShell';

export default function ImplementationLeadAccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.accountId as string;
  const [account, setAccount] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [warnings, setWarnings] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const accountData = mockDataService.accounts.getById(accountId);
        if (!accountData) {
          router.push('/implementation-lead/dashboard');
          return;
        }

        const accountLocations = mockDataService.locations.getByAccountId(accountId);
        const accountWarnings = AccountWarningsService.calculateAccountWarnings(accountId);
        const accountProgress = ProgressService.calculateAccountProgress(accountId);

        const locationsWithData = accountLocations.map(location => {
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

        setAccount(accountData);
        setLocations(locationsWithData);
        setWarnings(accountWarnings);
        setProgress(accountProgress);
      } catch (error) {
        console.error('Failed to load account:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAccount();
  }, [accountId, router]);

  if (loading) {
    return (
      <PortalShell title="Loading..." description="" nav={[]}>
        <p>Loading account details...</p>
      </PortalShell>
    );
  }

  if (!account) {
    return null;
  }

  return (
    <PortalShell
      title={account.name}
      description={`${progress.total} location${progress.total !== 1 ? 's' : ''} • ${progress.completed} completed`}
      nav={[
        { title: "Dashboard", href: "/implementation-lead/dashboard", icon: null },
        { title: "Accounts", href: "/implementation-lead/dashboard", icon: null },
      ]}
      actions={
        <Link href="/implementation-lead/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Account Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Account Summary</CardTitle>
            <CardDescription>Overall progress and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{progress.percentage}%</span>
                </div>
                <div className="flex-1 bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>

              {(warnings.blockers.pendingApprovals > 0 || warnings.blockers.unsupportedPhones > 0 ||
                warnings.warnings.missingDevices > 0 || warnings.warnings.incompleteCallFlow > 0) && (
                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm font-medium">Issues:</p>
                  {warnings.blockers.pendingApprovals > 0 && (
                    <p className="text-sm text-destructive">
                      🔴 {warnings.blockers.pendingApprovals} pending approval{warnings.blockers.pendingApprovals > 1 ? 's' : ''}
                    </p>
                  )}
                  {warnings.blockers.unsupportedPhones > 0 && (
                    <p className="text-sm text-destructive">
                      🔴 {warnings.blockers.unsupportedPhones} location{warnings.blockers.unsupportedPhones > 1 ? 's' : ''} with unsupported phones
                    </p>
                  )}
                  {warnings.warnings.missingDevices > 0 && (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      ⚠️ {warnings.warnings.missingDevices} location{warnings.warnings.missingDevices > 1 ? 's' : ''} missing devices
                    </p>
                  )}
                  {warnings.warnings.incompleteCallFlow > 0 && (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      ⚠️ {warnings.warnings.incompleteCallFlow} location{warnings.warnings.incompleteCallFlow > 1 ? 's' : ''} with incomplete call flow
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Locations */}
        <Card>
          <CardHeader>
            <CardTitle>Locations</CardTitle>
            <CardDescription>All locations under this account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {locations.map((location) => (
                <LocationItem
                  key={location.id}
                  location={location}
                  progress={location.progress}
                  warnings={location.warnings}
                  onClick={() => {
                    // Implementation Leads can view/edit onboarding
                    router.push(`/customer/onboarding/${location.id}`);
                  }}
                />
              ))}
              {locations.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No locations yet. Add your first location.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
