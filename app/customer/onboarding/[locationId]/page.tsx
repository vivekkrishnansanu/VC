'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { mockDataService } from '@/lib/mock-data/service';

export default function CustomerOnboardingPage() {
  const params = useParams();
  const locationId = params.locationId as string;
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Fetch session from API
    fetch(`/api/onboarding/session?locationId=${locationId}`)
      .then(res => res.json())
      .then(data => setSession(data))
      .catch(() => {
        // Fallback to mock data
        const location = mockDataService.locations.getById(locationId);
        if (location) {
          setSession({
            id: `session-${locationId}`,
            locationId,
            currentStep: 'BASIC_DETAILS',
            completedSteps: [],
            status: 'NOT_STARTED',
            isLocked: false,
          });
        }
      });
  }, [locationId]);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const location = mockDataService.locations.getById(locationId);
  if (!location) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Location not found</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background overflow-hidden">
      <div className="flex h-full w-full gap-6 px-4 py-4 sm:px-6 sm:py-6">
        <OnboardingWizard locationId={locationId} initialSession={session} locationName={location.name} />
      </div>
    </div>
  );
}
