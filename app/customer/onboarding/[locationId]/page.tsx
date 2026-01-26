'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { mockDataService } from '@/lib/mock-data/service';
import { PortalShell } from '@/components/layouts/PortalShell';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutDashboard, FileText } from 'lucide-react';
import Link from 'next/link';

export default function CustomerOnboardingPage() {
  const params = useParams();
  const router = useRouter();
  const locationId = params.locationId as string;
  const [session, setSession] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);

  useEffect(() => {
    const loc = mockDataService.locations.getById(locationId);
    setLocation(loc);

    // Fetch session from API
    fetch(`/api/onboarding/session?locationId=${locationId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setSession(data))
      .catch((error) => {
        console.warn('Failed to fetch session from API, using fallback:', error);
        // Fallback to mock data
        if (loc) {
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

  if (!session || !location) {
    return (
      <PortalShell title="Loading..." description="" nav={[]}>
        <p className="text-center text-sm text-muted-foreground">
          {!location ? 'Location not found' : 'Loading onboarding session...'}
        </p>
      </PortalShell>
    );
  }

  // Get account ID for back navigation
  const accountId = location.accountId;
  const account = mockDataService.accounts.getById(accountId);

  return (
    <PortalShell
      title={`Onboarding: ${location.name}`}
      description={account ? `Account: ${account.name}` : 'Complete the onboarding process'}
      nav={[
        { title: 'Dashboard', href: '/customer/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
        { title: 'Onboarding', href: `/customer/onboarding/${locationId}`, icon: <FileText className="h-4 w-4" /> },
      ]}
    >
      <OnboardingWizard locationId={locationId} initialSession={session} locationName={location.name} />
    </PortalShell>
  );
}
