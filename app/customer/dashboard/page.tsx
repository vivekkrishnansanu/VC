'use client';

import { useEffect, useState } from 'react';
import { mockDataService } from '@/lib/mock-data/service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OnboardingStatus } from '@/lib/mock-data/types';
import Link from 'next/link';
import { MapPin, CheckCircle2, Clock, AlertCircle, PlayCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function CustomerDashboard() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In real app, get from auth context
    const customerId = 'user-3'; // Mock customer
    const customerLocations = mockDataService.locations.getByCustomerId(customerId);
    setLocations(customerLocations);
    setLoading(false);
  }, []);

  const getStatusBadge = (status: OnboardingStatus) => {
    const variants: Record<OnboardingStatus, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      [OnboardingStatus.NOT_STARTED]: { variant: "outline", icon: Clock },
      [OnboardingStatus.IN_PROGRESS]: { variant: "secondary", icon: PlayCircle },
      [OnboardingStatus.PENDING_APPROVAL]: { variant: "secondary", icon: Clock },
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

  if (locations.length === 0) {
    return (
      <div className="h-screen bg-background overflow-hidden">
        <div className="flex h-full w-full gap-6 px-4 py-4 sm:px-6 sm:py-6">
          <div className="min-w-0 flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <p className="text-center text-sm text-muted-foreground">
                No locations assigned. Please contact your Implementation Lead.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background overflow-hidden">
      <div className="flex h-full w-full gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4 md:gap-6 md:px-6 md:py-6">
        {/* Left Sidebar - Navigation */}
        <aside className="hidden h-full w-64 shrink-0 lg:block border-r border-border pr-6 overflow-y-auto">
          <div className="space-y-6 py-2">
            {/* Logo */}
            <div className="pb-4 border-b border-border">
              <img
                src="https://voicestack.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fvoicestack-logo.91a9d9aa.svg&w=384&q=75&dpl=dpl_6YQQQr5c5yUDQKfyirHUrb7KDZfE"
                alt="VoiceStack"
                className="h-6 w-auto"
                loading="eager"
              />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {/* Page Header */}
            <div className="mb-3 sm:mb-4">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-1">
                My locations
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Complete onboarding for your assigned locations.
              </p>
            </div>
            <Separator className="mb-4 sm:mb-6" />

            {/* Locations List */}
            <div className="space-y-4">
              {locations.map((location) => {
                const onboarding = mockDataService.onboarding.getByLocationId(location.id);
                const status = onboarding?.status || OnboardingStatus.NOT_STARTED;
                const canContinue = status === OnboardingStatus.NOT_STARTED || status === OnboardingStatus.IN_PROGRESS;

                return (
                  <div
                    key={location.id}
                    className="rounded-lg border border-border bg-background p-4 sm:p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                      <div className="min-w-0 flex-1 space-y-2 sm:space-y-3">
                        <div>
                          <h3 className="text-base font-semibold text-foreground mb-1.5">{location.name}</h3>
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="break-words">{location.addressLine1}, {location.city}, {location.state}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          {getStatusBadge(status)}
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {status === OnboardingStatus.COMPLETED
                              ? "Onboarding completed"
                              : status === OnboardingStatus.PENDING_APPROVAL
                              ? "Waiting for approval"
                              : "Continue where you left off"}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 w-full sm:w-auto">
                        {canContinue ? (
                          <Link href={`/customer/onboarding/${location.id}`} className="block">
                            <Button size="default" className="w-full sm:w-auto min-h-[44px]">
                              {status === OnboardingStatus.NOT_STARTED ? "Start Onboarding" : "Continue Onboarding"}
                            </Button>
                          </Link>
                        ) : (
                          <Button size="default" variant="outline" disabled className="w-full sm:w-auto min-h-[44px]">
                            View Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Spacer */}
            <div className="h-20" />
          </div>
        </main>
      </div>
    </div>
  );
}
