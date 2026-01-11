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
      <div className="flex h-full w-full gap-6 px-4 py-4 sm:px-6 sm:py-6">
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
            <div className="mb-4">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1">
                My locations
              </h1>
              <p className="text-sm text-muted-foreground">
                Complete onboarding for your assigned locations.
              </p>
            </div>
            <Separator className="mb-6" />

            {/* Locations List */}
            <div className="space-y-4">
              {locations.map((location) => {
                const onboarding = mockDataService.onboarding.getByLocationId(location.id);
                const status = onboarding?.status || OnboardingStatus.NOT_STARTED;
                const canContinue = status === OnboardingStatus.NOT_STARTED || status === OnboardingStatus.IN_PROGRESS;

                return (
                  <div
                    key={location.id}
                    className="rounded-lg border border-border bg-background p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-3">
                        <div>
                          <h3 className="text-base font-semibold text-foreground mb-1.5">{location.name}</h3>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span>{location.addressLine1}, {location.city}, {location.state}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {getStatusBadge(status)}
                          <span className="text-sm text-muted-foreground">
                            {status === OnboardingStatus.COMPLETED
                              ? "Onboarding completed"
                              : status === OnboardingStatus.PENDING_APPROVAL
                              ? "Waiting for approval"
                              : "Continue where you left off"}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {canContinue ? (
                          <Link href={`/customer/onboarding/${location.id}`}>
                            <Button size="sm">
                              {status === OnboardingStatus.NOT_STARTED ? "Start Onboarding" : "Continue Onboarding"}
                            </Button>
                          </Link>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
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
