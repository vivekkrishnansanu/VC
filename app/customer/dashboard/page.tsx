'use client';

import { useEffect, useState } from 'react';
import { mockDataService } from '@/lib/mock-data/service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OnboardingStatus } from '@/lib/mock-data/types';
import Link from 'next/link';
import { MapPin, CheckCircle2, Clock, AlertCircle, PlayCircle, LayoutDashboard } from 'lucide-react';
import { PortalShell } from '@/components/layouts/PortalShell';

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
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <PortalShell
        title="My locations"
        description="Complete onboarding for your assigned locations."
        nav={[
          { title: "Dashboard", href: "/customer/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
        ]}
      >
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-sm text-muted-foreground">
              No locations assigned. Please contact your Implementation Lead.
            </p>
          </CardContent>
        </Card>
      </PortalShell>
    );
  }

  return (
    <PortalShell
      title="My locations"
      description="Complete onboarding for your assigned locations."
      nav={[
        { title: "My locations", href: "/customer/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
      ]}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => {
          const onboarding = mockDataService.onboarding.getByLocationId(location.id);
          const status = onboarding?.status || OnboardingStatus.NOT_STARTED;
          const canContinue = status === OnboardingStatus.NOT_STARTED || status === OnboardingStatus.IN_PROGRESS;

          return (
            <Card key={location.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="truncate text-base">{location.name}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2 text-xs">
                      {location.addressLine1}, {location.city}, {location.state}
                    </CardDescription>
                  </div>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  {getStatusBadge(status)}
                  {status === OnboardingStatus.PENDING_APPROVAL ? (
                    <span className="text-xs text-muted-foreground">Approval required</span>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-muted-foreground">
                    {status === OnboardingStatus.COMPLETED
                      ? "Onboarding completed"
                      : status === OnboardingStatus.PENDING_APPROVAL
                      ? "Waiting for approval"
                      : "Continue where you left off"}
                  </div>

                  {canContinue ? (
                    <Link href={`/customer/onboarding/${location.id}`}>
                      <Button size="sm">
                        {status === OnboardingStatus.NOT_STARTED ? "Start" : "Continue"}
                      </Button>
                    </Link>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      View
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PortalShell>
  );
}
