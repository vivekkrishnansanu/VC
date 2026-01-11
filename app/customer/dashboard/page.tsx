'use client';

import { useEffect, useState } from 'react';
import { mockDataService } from '@/lib/mock-data/service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OnboardingStatus } from '@/lib/mock-data/types';
import Link from 'next/link';
import { MapPin, CheckCircle2, Clock, AlertCircle, PlayCircle } from 'lucide-react';

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
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No locations assigned. Please contact your Implementation Lead.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Locations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete onboarding for your locations
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => {
          const onboarding = mockDataService.onboarding.getByLocationId(location.id);
          const status = onboarding?.status || OnboardingStatus.NOT_STARTED;
          const canContinue = status === OnboardingStatus.NOT_STARTED || 
                             status === OnboardingStatus.IN_PROGRESS;

          return (
            <Card key={location.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{location.name}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {location.addressLine1}, {location.city}, {location.state}
                    </CardDescription>
                  </div>
                  <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <div>
                  {getStatusBadge(status)}
                </div>
                
                {canContinue && (
                  <Link href={`/customer/onboarding/${location.id}`} className="mt-auto">
                    <Button className="w-full">
                      {status === OnboardingStatus.NOT_STARTED ? 'Start Onboarding' : 'Continue Onboarding'}
                    </Button>
                  </Link>
                )}

                {status === OnboardingStatus.PENDING_APPROVAL && (
                  <p className="text-sm text-muted-foreground text-center mt-auto">
                    Waiting for approval
                  </p>
                )}

                {status === OnboardingStatus.COMPLETED && (
                  <p className="text-sm text-muted-foreground text-center mt-auto">
                    Onboarding completed
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
