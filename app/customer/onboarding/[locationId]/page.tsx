'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const location = mockDataService.locations.getById(locationId);
  if (!location) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Location not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-7xl">
        {/* Header Section - VoiceStack Style */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
                {location.name}
              </h1>
              <p className="text-lg text-muted-foreground">
                Complete your setup to get started with VoiceStack
              </p>
            </div>
          </div>
        </div>

        {/* Wizard with Sidebar Layout */}
        <OnboardingWizard locationId={locationId} initialSession={session} />
      </div>
    </div>
  );
}
