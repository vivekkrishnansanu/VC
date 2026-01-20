'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockDataService } from '@/lib/mock-data/service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, LayoutDashboard, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LocationItem } from '@/components/accounts/LocationItem';
import { AccountWarningsService } from '@/lib/services/account-warnings.service';
import { ProgressService } from '@/lib/services/progress.service';
import { PortalShell } from '@/components/layouts/PortalShell';
import { Separator } from '@/components/ui/separator';
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
      <PortalShell title="Loading..." description="" nav={[]}>
        <p className="text-center text-sm text-muted-foreground">Loading account details...</p>
      </PortalShell>
    );
  }

  if (!account) {
    return null;
  }

  return (
    <PortalShell
      title={account.name}
      description={`${progress.total} location${progress.total !== 1 ? 's' : ''} • ${progress.completed} completed (${progress.percentage}%)`}
      nav={[
        { title: 'Dashboard', href: '/customer/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
        { title: 'Account', href: `/customer/account/${accountId}`, icon: <Building className="h-4 w-4" /> },
      ]}
      actions={
        <Link href="/customer/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
      }
    >
      <div className="space-y-8">
        {/* Overall Progress - Clear and Prominent */}
        <Card className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900 mb-1">Overall Progress</CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  {progress.completed} of {progress.total} locations fully completed
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {progress.percentage}%
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1">
                  {progress.completed}/{progress.total} complete
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="relative w-full bg-slate-200/60 rounded-full h-4 overflow-hidden shadow-inner">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden",
                    progress.percentage === 100
                      ? "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 shadow-lg shadow-emerald-500/30"
                      : "bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 shadow-lg shadow-blue-500/30"
                  )}
                  style={{ width: `${progress.percentage}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/60">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{progress.completed}</div>
                  <div className="text-xs text-slate-600 font-medium mt-1">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{progress.total - progress.completed}</div>
                  <div className="text-xs text-slate-600 font-medium mt-1">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{progress.total}</div>
                  <div className="text-xs text-slate-600 font-medium mt-1">Total Locations</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Locations */}
        <Card className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900 mb-1">Locations</CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Click on any location to continue setup
                </CardDescription>
              </div>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-sm font-bold px-3 py-1">
                {locations.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {locations.map((location, idx) => (
                <div
                  key={location.id}
                  className="animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
                >
                  <LocationItem
                    location={location}
                    progress={location.progress}
                    warnings={location.warnings}
                    onClick={() => {
                      router.push(`/customer/onboarding/${location.id}`);
                    }}
                  />
                </div>
              ))}
              {locations.length === 0 && (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Building className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">No locations found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
