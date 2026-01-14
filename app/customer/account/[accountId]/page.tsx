'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockDataService } from '@/lib/mock-data/service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { LocationItem } from '@/components/accounts/LocationItem';
import { AccountWarningsService } from '@/lib/services/account-warnings.service';
import { ProgressService } from '@/lib/services/progress.service';
import Link from 'next/link';

export default function CustomerAccountDetailPage() {
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
          router.push('/customer/dashboard');
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
      <div className="h-screen bg-background overflow-hidden">
        <div className="flex h-full w-full gap-6 px-4 py-4 sm:px-6 sm:py-6">
          <div className="min-w-0 flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <p className="text-center text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!account) {
    return null;
  }

  return (
    <div className="h-screen bg-background overflow-hidden">
      <div className="flex h-full w-full gap-6 px-4 py-4 sm:px-6 sm:py-6">
        <div className="min-w-0 flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {/* Header */}
            <div className="mb-6">
              <Link href="/customer/dashboard">
                <Button variant="ghost" size="sm" className="mb-4 -ml-2">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Accounts
                </Button>
              </Link>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1">
                {account.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {progress.total} location{progress.total !== 1 ? 's' : ''} • {progress.completed} completed ({progress.percentage}%)
              </p>
            </div>

            {/* Account Summary */}
            <Card className="mb-6">
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
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Locations</h2>
              {locations.map((location) => (
                <LocationItem
                  key={location.id}
                  location={location}
                  progress={location.progress}
                  warnings={location.warnings}
                  onClick={() => {
                    router.push(`/customer/onboarding/${location.id}`);
                  }}
                />
              ))}
            </div>

            <div className="h-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
