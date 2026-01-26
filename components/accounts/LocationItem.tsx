'use client';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { OnboardingStatus } from '@/lib/mock-data/types';
import { LocationWarnings } from '@/lib/services/account-warnings.service';
import { LocationProgress } from '@/lib/services/progress.service';
import { MapPin, CheckCircle2, Clock, AlertCircle, AlertTriangle, PlayCircle, ChevronRight, Info, Phone, FileText } from 'lucide-react';
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
  const isComplete = location.status === OnboardingStatus.COMPLETED;
  const isBlocked = location.status === OnboardingStatus.BLOCKED || hasBlockers;

  return (
    <div
      className={cn(
        'group rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-sm p-5',
        'transition-all duration-300',
        onClick && 'cursor-pointer hover:bg-white hover:border-blue-300/50 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5',
        isBlocked && 'border-red-200/50 bg-red-50/30',
        isComplete && 'border-emerald-200/50 bg-emerald-50/30',
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
      <div className="flex items-start gap-4">
        {/* Left: Location Info */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Location Name & Address */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <MapPin className="h-4 w-4 text-slate-500 shrink-0" />
              <h4 className="font-bold text-base text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                {location.name}
              </h4>
            </div>
            <p className="text-xs text-slate-600 ml-6">
              {location.addressLine1}, {location.city}, {location.state}
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge 
              variant={statusInfo.variant} 
              className={cn(
                "flex items-center gap-1.5 text-xs font-semibold px-3 py-1",
                isComplete && "bg-emerald-100 text-emerald-700 border-emerald-200",
                isBlocked && "bg-red-100 text-red-700 border-red-200"
              )}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {statusInfo.label}
            </Badge>
          </div>

          {/* Single Progress Bar - Clear and Simple */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-700">Setup Progress</span>
                <div className="relative group/tooltip">
                  <Info className="h-3 w-3 text-slate-400 cursor-help" />
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover/tooltip:block z-50 w-52">
                    <div className="bg-slate-900 text-white text-xs rounded-lg px-2.5 py-2 shadow-xl">
                      Completion status of onboarding steps for this location
                      <div className="absolute left-2.5 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-900">{progress.percentage}%</span>
            </div>
            <div className="relative w-full bg-slate-200/60 rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden",
                  isComplete
                    ? "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 shadow-lg shadow-emerald-500/30"
                    : isBlocked
                    ? "bg-gradient-to-r from-red-500 via-rose-500 to-red-600 shadow-lg shadow-red-500/30"
                    : "bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 shadow-lg shadow-blue-500/30"
                )}
                style={{ width: `${progress.percentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              {progress.completed} of {progress.total} steps completed
            </div>
          </div>

          {/* Issues - Clear Visual Hierarchy */}
          {(hasBlockers || hasWarnings) && (
            <div className="pt-3 border-t border-slate-200/60 space-y-2">
              {/* Blockers First - Most Important */}
              {warnings.blockers.pendingApprovals > 0 && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-200/50">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-red-700">
                      {warnings.blockers.pendingApprovals} Pending Approval{warnings.blockers.pendingApprovals > 1 ? 's' : ''}
                    </div>
                    <div className="text-[10px] text-red-600">Action required to continue</div>
                  </div>
                </div>
              )}
              {warnings.blockers.hasUnsupportedPhones && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-200/50">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-red-700">Unsupported Phones</div>
                    <div className="text-[10px] text-red-600">Device replacement needed</div>
                  </div>
                </div>
              )}

              {/* Warnings Second - Less Critical */}
              {warnings.warnings.missingDevices && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#FFFDEB] border-2 border-[#F0C94F]">
                  <AlertTriangle className="h-4 w-4 text-[#F0C94F] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#92400E]">Missing Devices</div>
                    <div className="text-[10px] text-[#92400E]">Review needed</div>
                  </div>
                </div>
              )}
              {warnings.warnings.incompleteCallFlow && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#FFFDEB] border-2 border-[#F0C94F]">
                  <AlertTriangle className="h-4 w-4 text-[#F0C94F] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#92400E]">Incomplete Call Flow</div>
                    <div className="text-[10px] text-[#92400E]">Configuration needed</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Success State */}
          {isComplete && !hasBlockers && !hasWarnings && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200/50">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <div className="text-xs font-bold text-emerald-700">All steps completed successfully</div>
            </div>
          )}
        </div>

        {/* Right: Action Indicator */}
        {onClick && (
          <div className="flex items-center shrink-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-100 transition-all">
              <ChevronRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
