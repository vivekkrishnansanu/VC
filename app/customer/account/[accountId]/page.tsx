'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockDataService } from '@/lib/mock-data/service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, LayoutDashboard, Building, MapPin, ChevronRight, AlertCircle, CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccountWarningsService } from '@/lib/services/account-warnings.service';
import { ProgressService } from '@/lib/services/progress.service';
import { PortalShell } from '@/components/layouts/PortalShell';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { OnboardingStatus } from '@/lib/mock-data/types';
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
    >
      <div className="space-y-8">
        {/* Overall Progress - Small Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">Total Locations</div>
                  <div className="text-2xl font-bold text-slate-900 leading-none">{progress.total}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">In Progress</div>
                  <div className="text-2xl font-bold text-blue-600 leading-none">{progress.total - progress.completed}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">Completed</div>
                  <div className="text-2xl font-bold text-slate-900 leading-none">{progress.completed}</div>
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
                  <div className="text-2xl font-bold text-blue-600 leading-none">{progress.percentage}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Locations - Professional Table View */}
        <Card className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900 tracking-tight">Locations</CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-1 font-normal">
                  Manage and track onboarding progress for all locations
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white border-slate-300 text-slate-700 text-xs font-medium px-3 py-1">
                  {locations.length} {locations.length === 1 ? 'location' : 'locations'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {locations.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Building className="h-7 w-7 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">No locations found</p>
                <p className="text-xs text-slate-500">Add your first location to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 border-b border-slate-200 hover:bg-slate-50/50">
                      <TableHead className="h-12 px-6 font-semibold text-xs text-slate-700 uppercase tracking-wider">
                        Location
                      </TableHead>
                      <TableHead className="h-12 px-6 font-semibold text-xs text-slate-700 uppercase tracking-wider w-28">
                        Status
                      </TableHead>
                      <TableHead className="h-12 px-6 font-semibold text-xs text-slate-700 uppercase tracking-wider w-44">
                        Progress
                      </TableHead>
                      <TableHead className="h-12 px-6 font-semibold text-xs text-slate-700 uppercase tracking-wider w-36">
                        Issues
                      </TableHead>
                      <TableHead className="h-12 px-6 w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.map((location, index) => {
                      const statusConfig: Record<OnboardingStatus, { variant: "default" | "secondary" | "destructive" | "outline", icon: any, label: string, bgColor: string, textColor: string, borderColor: string }> = {
                        [OnboardingStatus.NOT_STARTED]: { 
                          variant: "outline", 
                          icon: Clock, 
                          label: "Not Started", 
                          bgColor: "bg-slate-50", 
                          textColor: "text-slate-700", 
                          borderColor: "border-slate-200" 
                        },
                        [OnboardingStatus.IN_PROGRESS]: { 
                          variant: "secondary", 
                          icon: PlayCircle, 
                          label: "In Progress", 
                          bgColor: "bg-blue-50", 
                          textColor: "text-blue-700", 
                          borderColor: "border-blue-200" 
                        },
                        [OnboardingStatus.PENDING_APPROVAL]: { 
                          variant: "secondary", 
                          icon: Clock, 
                          label: "Pending Approval", 
                          bgColor: "bg-amber-50", 
                          textColor: "text-amber-700", 
                          borderColor: "border-amber-200" 
                        },
                        [OnboardingStatus.APPROVED]: { 
                          variant: "default", 
                          icon: CheckCircle2, 
                          label: "Approved", 
                          bgColor: "bg-emerald-50", 
                          textColor: "text-emerald-700", 
                          borderColor: "border-emerald-200" 
                        },
                        [OnboardingStatus.PROVISIONING]: { 
                          variant: "secondary", 
                          icon: Clock, 
                          label: "Provisioning", 
                          bgColor: "bg-indigo-50", 
                          textColor: "text-indigo-700", 
                          borderColor: "border-indigo-200" 
                        },
                        [OnboardingStatus.COMPLETED]: { 
                          variant: "default", 
                          icon: CheckCircle2, 
                          label: "Completed", 
                          bgColor: "bg-emerald-50", 
                          textColor: "text-emerald-700", 
                          borderColor: "border-emerald-200" 
                        },
                        [OnboardingStatus.BLOCKED]: { 
                          variant: "destructive", 
                          icon: AlertCircle, 
                          label: "Blocked", 
                          bgColor: "bg-red-50", 
                          textColor: "text-red-700", 
                          borderColor: "border-red-200" 
                        },
                        [OnboardingStatus.CANCELLED]: { 
                          variant: "outline", 
                          icon: AlertCircle, 
                          label: "Cancelled", 
                          bgColor: "bg-slate-50", 
                          textColor: "text-slate-600", 
                          borderColor: "border-slate-200" 
                        },
                      };
                      
                      const statusInfo = (statusConfig[location.status as OnboardingStatus] || statusConfig[OnboardingStatus.IN_PROGRESS]) as typeof statusConfig[OnboardingStatus.IN_PROGRESS];
                      const StatusIcon = statusInfo.icon;
                      const hasBlockers = location.warnings.blockers.pendingApprovals > 0 || location.warnings.blockers.hasUnsupportedPhones;
                      const hasWarnings = location.warnings.warnings.missingDevices || location.warnings.warnings.incompleteCallFlow;
                      const isComplete = location.status === OnboardingStatus.COMPLETED;
                      const blockerCount = (location.warnings.blockers.pendingApprovals > 0 ? 1 : 0) + (location.warnings.blockers.hasUnsupportedPhones ? 1 : 0);
                      const warningCount = (location.warnings.warnings.missingDevices ? 1 : 0) + (location.warnings.warnings.incompleteCallFlow ? 1 : 0);

                      return (
                        <TableRow
                          key={location.id}
                          className={cn(
                            "cursor-pointer border-b border-slate-100 transition-all duration-150",
                            "hover:bg-slate-50/80",
                            index === locations.length - 1 && "border-b-0"
                          )}
                          onClick={() => router.push(`/customer/onboarding/${location.id}`)}
                        >
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                <MapPin className="h-4 w-4 text-slate-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-sm text-slate-900 mb-0.5 truncate">
                                  {location.name}
                                </div>
                                <div className="text-xs text-slate-500 truncate">
                                  {location.addressLine1}, {location.city}, {location.state}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <Badge
                              className={cn(
                                "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border whitespace-nowrap",
                                statusInfo.bgColor,
                                statusInfo.textColor,
                                statusInfo.borderColor
                              )}
                            >
                              <StatusIcon className="h-3 w-3 shrink-0" />
                              <span className="whitespace-nowrap">{statusInfo.label}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-sm font-semibold text-slate-900 tabular-nums">
                                  {location.progress.percentage}%
                                </span>
                                <span className="text-xs text-slate-500 font-medium tabular-nums">
                                  {location.progress.completed} of {location.progress.total} steps
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
                                  style={{ width: `${location.progress.percentage}%` }}
                                />
                              </div>
                            </div>
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
                                router.push(`/customer/onboarding/${location.id}`);
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
