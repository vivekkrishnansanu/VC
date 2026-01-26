'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProductType } from '@/lib/mock-data/types';
import { AccountWarnings, LocationWarnings } from '@/lib/services/account-warnings.service';
import { AccountProgress, LocationProgress } from '@/lib/services/progress.service';
import { LocationItem } from './LocationItem';
import { WarningBadge } from './WarningBadge';
import { Building2, ChevronRight, TrendingUp, Sparkles, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface AccountCardProps {
  account: {
    id: string;
    name: string;
    productType: ProductType;
  };
  warnings: AccountWarnings;
  progress: AccountProgress;
  locations: Array<{
    id: string;
    name: string;
    addressLine1: string;
    city: string;
    state: string;
    status: any;
    progress: LocationProgress;
    warnings: LocationWarnings;
  }>;
  userRole: 'CUSTOMER' | 'IMPLEMENTATION_LEAD';
  className?: string;
}

export function AccountCard({ account, warnings, progress, locations, userRole, className }: AccountCardProps) {
  // Defensive checks
  if (!account || !warnings || !progress) {
    console.error('AccountCard: Missing required props', { account, warnings, progress });
    return null;
  }

  const accountDetailPath = userRole === 'CUSTOMER'
    ? `/customer/account/${account.id}`
    : `/implementation-lead/accounts/${account.id}`;

  const hasBlockers = (warnings.blockers?.pendingApprovals || 0) > 0 || (warnings.blockers?.unsupportedPhones || 0) > 0;
  const hasWarnings = (warnings.warnings?.missingDevices || 0) > 0 || (warnings.warnings?.incompleteCallFlow || 0) > 0;
  const allComplete = (progress.completed || 0) === (progress.total || 0) && (progress.total || 0) > 0;
  
  // Calculate total warning/blocker counts for badge display
  const totalBlockers = (warnings.blockers?.pendingApprovals || 0) + (warnings.blockers?.unsupportedPhones || 0);
  const totalWarnings = (warnings.warnings?.missingDevices || 0) + (warnings.warnings?.incompleteCallFlow || 0);

  return (
    <Link href={accountDetailPath} className="block group">
      <Card
        className={cn(
          'cursor-pointer transition-all duration-300 rounded-xl',
          'hover:border-slate-300/60 hover:shadow-lg',
          'bg-white border border-slate-200/60 shadow-sm',
          'hover:scale-[1.005] hover:-translate-y-0.5',
          'relative overflow-hidden',
          'lg:rounded-2xl',
          className
        )}
      >
        <CardContent className="p-5 relative z-10 lg:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 group-hover:bg-slate-100 transition-colors duration-200 lg:p-3 lg:rounded-2xl">
                  <Building2 className="h-5 w-5 text-slate-700 shrink-0 lg:h-6 lg:w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 truncate mb-1 group-hover:text-slate-700 transition-colors lg:text-xl">
                    {account.name}
                  </h3>
                  <Badge className="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 border-slate-200 hover:bg-slate-200 text-xs font-bold px-3 py-1 rounded-full">
                    {account.productType.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Status Indicators */}
              {allComplete && (
                <Badge className="bg-slate-700 text-white border-0">
                  <span className="text-xs font-semibold">✓ Complete</span>
                </Badge>
              )}
              {!allComplete && totalBlockers > 0 && (
                <WarningBadge
                  type="pending-approvals"
                  count={totalBlockers}
                  variant="blocker"
                />
              )}
              {!allComplete && totalBlockers === 0 && totalWarnings > 0 && (
                <WarningBadge
                  type="missing-devices"
                  variant="warning"
                />
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/60 group-hover:bg-slate-100 transition-colors">
                <span className="text-xs font-bold text-slate-700">View</span>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Progress Summary */}
          <div className="mb-5 p-4 rounded-xl bg-slate-50/50 border border-slate-200/60 hover:border-slate-300/50 transition-colors group/progress lg:rounded-2xl lg:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">Progress</span>
                <div className="relative group/tooltip">
                  <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover/tooltip:block z-50 w-56">
                    <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
                      Overall completion percentage across all locations in this account
                      <div className="absolute left-3 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 lg:text-3xl">
                  {progress.percentage || 0}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
                <span>{progress.completed || 0} of {progress.total || 0} locations completed</span>
                <span className="text-slate-900 font-bold">{progress.completed || 0}/{progress.total || 0}</span>
              </div>
              <div className="relative w-full bg-slate-200/60 rounded-full h-2.5 overflow-hidden shadow-inner lg:h-3">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden",
                    allComplete 
                      ? "bg-slate-700" 
                      : "bg-slate-600"
                  )}
                  style={{ width: `${progress.percentage || 0}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>
          </div>

          {/* Location List */}
          {locations.length > 0 && (
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">Locations</span>
                <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {locations.length}
                </Badge>
              </div>
              {locations.slice(0, 3).map((location, idx) => (
                <div
                  key={location.id}
                  className="group/location rounded-xl border border-slate-200/60 bg-white/50 hover:bg-white hover:border-slate-300/50 hover:shadow-md transition-all duration-300"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const onboardingPath = userRole === 'CUSTOMER'
                      ? `/customer/onboarding/${location.id}`
                      : `/customer/onboarding/${location.id}`;
                    window.location.href = onboardingPath;
                  }}
                >
                  <LocationItem
                    location={location}
                    progress={location.progress}
                    warnings={location.warnings}
                  />
                </div>
              ))}
              {locations.length > 3 && (
                <div className="pt-3 border-t border-slate-200/60">
                  <p className="text-xs font-semibold text-slate-500 text-center">
                    +{locations.length - 3} more location{locations.length - 3 > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
