'use client';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { OnboardingStatus } from '@/lib/mock-data/types';
import { LocationWarnings } from '@/lib/services/account-warnings.service';
import { LocationProgress } from '@/lib/services/progress.service';
import { MapPin, CheckCircle2, Clock, AlertCircle, PlayCircle } from 'lucide-react';
import { WarningBadge } from './WarningBadge';
import { cn } from '@/lib/utils';

interface LocationItemProps {
  location: {
    id: string;
    name: string;
    addressLine1: string;
    city: string;
    state: string;
    status: OnboardingStatus;
  };
  progress: LocationProgress;
  warnings: LocationWarnings;
  onClick?: () => void;
  className?: string;
}

const statusConfig: Record<OnboardingStatus, { variant: "default" | "secondary" | "destructive" | "outline", icon: any, label: string }> = {
  [OnboardingStatus.NOT_STARTED]: { variant: "outline", icon: Clock, label: "Not Started" },
  [OnboardingStatus.IN_PROGRESS]: { variant: "secondary", icon: PlayCircle, label: "In Progress" },
  [OnboardingStatus.PENDING_APPROVAL]: { variant: "secondary", icon: Clock, label: "Pending Approval" },
  [OnboardingStatus.APPROVED]: { variant: "default", icon: CheckCircle2, label: "Approved" },
  [OnboardingStatus.PROVISIONING]: { variant: "secondary", icon: Clock, label: "Provisioning" },
  [OnboardingStatus.COMPLETED]: { variant: "default", icon: CheckCircle2, label: "Completed" },
  [OnboardingStatus.BLOCKED]: { variant: "destructive", icon: AlertCircle, label: "Blocked" },
  [OnboardingStatus.CANCELLED]: { variant: "outline", icon: AlertCircle, label: "Cancelled" },
};

export function LocationItem({ location, progress, warnings, onClick, className }: LocationItemProps) {
  const statusInfo = statusConfig[location.status];
  const StatusIcon = statusInfo.icon;

  const hasBlockers = warnings.blockers.pendingApprovals > 0 || warnings.blockers.hasUnsupportedPhones;
  const hasWarnings = warnings.warnings.missingDevices || warnings.warnings.incompleteCallFlow;

  return (
    <div
      className={cn(
        'rounded-xl border border-border/60 bg-gradient-to-br from-muted/40 to-muted/20 p-4 space-y-3',
        'backdrop-blur-sm transition-all duration-200',
        onClick && 'cursor-pointer hover:bg-muted/60 hover:border-primary/30 hover:shadow-md',
        className
      )}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <h4 className="font-semibold text-sm text-foreground truncate">{location.name}</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {location.addressLine1}, {location.city}, {location.state}
          </p>
          
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={statusInfo.variant} className="flex items-center gap-1 text-xs">
              <StatusIcon className="h-3 w-3" />
              {statusInfo.label}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-secondary/50 rounded-full h-2.5 min-w-[100px] overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    location.status === OnboardingStatus.COMPLETED
                      ? "bg-gradient-to-r from-green-500 to-emerald-600"
                      : "bg-gradient-to-r from-primary to-primary/80"
                  )}
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                {progress.percentage}%
              </span>
            </div>

            {location.status === OnboardingStatus.COMPLETED && (
              <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>All steps completed</span>
              </div>
            )}

            {/* Blockers */}
            {warnings.blockers.pendingApprovals > 0 && (
              <WarningBadge
                type="pending-approvals"
                count={warnings.blockers.pendingApprovals}
                variant="blocker"
              />
            )}
            {warnings.blockers.hasUnsupportedPhones && (
              <WarningBadge
                type="unsupported-phones"
                variant="blocker"
              />
            )}

            {/* Warnings */}
            {warnings.warnings.missingDevices && (
              <WarningBadge
                type="missing-devices"
                variant="warning"
              />
            )}
            {warnings.warnings.incompleteCallFlow && (
              <WarningBadge
                type="incomplete-call-flow"
                variant="warning"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
