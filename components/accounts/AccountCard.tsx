'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProductType } from '@/lib/mock-data/types';
import { AccountWarnings, LocationWarnings } from '@/lib/services/account-warnings.service';
import { AccountProgress, LocationProgress } from '@/lib/services/progress.service';
import { LocationItem } from './LocationItem';
import { WarningBadge } from './WarningBadge';
import { Building2, ChevronRight } from 'lucide-react';
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
          'cursor-pointer transition-all duration-300',
          'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5',
          'bg-gradient-to-br from-card to-card/50',
          'border-border/60 backdrop-blur-sm',
          className
        )}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Building2 className="h-5 w-5 text-primary shrink-0" />
                </div>
                <h3 className="text-xl font-bold text-foreground truncate">{account.name}</h3>
              </div>
              <Badge variant="outline" className="mt-1 text-xs font-medium" style={{ paddingLeft: '6px' }}>
                {account.productType.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Status Indicators */}
              {allComplete && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-sm">
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
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>

          {/* Progress Summary */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Progress</span>
              <span className="text-lg font-bold text-foreground">
                {progress.percentage || 0}%
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{progress.completed || 0} of {progress.total || 0} locations completed</span>
                <span className="font-medium">{progress.completed || 0}/{progress.total || 0}</span>
              </div>
              <div className="relative w-full bg-secondary/50 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    allComplete 
                      ? "bg-gradient-to-r from-green-500 to-emerald-600" 
                      : "bg-gradient-to-r from-primary to-primary/80"
                  )}
                  style={{ width: `${progress.percentage || 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Location List */}
          {locations.length > 0 && (
            <div className="space-y-3 mb-4">
              {locations.slice(0, 3).map((location) => (
                <div
                  key={location.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const onboardingPath = userRole === 'CUSTOMER'
                      ? `/customer/onboarding/${location.id}`
                      : `/customer/onboarding/${location.id}`; // Implementation Leads use same path
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
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{locations.length - 3} more location{locations.length - 3 > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          {/* Account Summary */}
          <div className="pt-4 border-t border-border/60 space-y-2">
            {allComplete ? (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  ✓ All locations complete
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Blockers */}
                {(warnings.blockers?.pendingApprovals || 0) > 0 && (
                  <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <WarningBadge
                      type="pending-approvals"
                      count={warnings.blockers.pendingApprovals}
                      variant="blocker"
                    />
                  </div>
                )}
                {(warnings.blockers?.unsupportedPhones || 0) > 0 && (
                  <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2">
                      <WarningBadge
                        type="unsupported-phones"
                        variant="blocker"
                      />
                      <span className="text-xs text-red-700 dark:text-red-400 font-medium">
                        ({warnings.blockers.unsupportedPhones} location{warnings.blockers.unsupportedPhones > 1 ? 's' : ''})
                      </span>
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {(warnings.warnings?.missingDevices || 0) > 0 && (
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <WarningBadge
                      type="missing-devices"
                      variant="warning"
                    />
                  </div>
                )}
                {(warnings.warnings?.incompleteCallFlow || 0) > 0 && (
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <WarningBadge
                      type="incomplete-call-flow"
                      variant="warning"
                    />
                  </div>
                )}

                {!hasBlockers && !hasWarnings && (
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground font-medium">
                      ✓ No issues detected
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
