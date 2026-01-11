'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContactMedium } from '@/lib/mock-data/types';
import { mockDataService } from '@/lib/mock-data/service';
import { Copy, Info } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const basicDetailsSchema = z.object({
  pocName: z.string().min(2, 'Name must be at least 2 characters'),
  pocEmail: z.string().email('Valid email is required'),
  pocPhone: z.string().min(10, 'Valid phone number is required'),
  preferredContactMedium: z.nativeEnum(ContactMedium).optional(),
  practiceManagementSoftware: z.string().optional(),
});

type BasicDetailsFormData = z.infer<typeof basicDetailsSchema>;

interface BasicDetailsStepProps {
  locationId: string;
  onComplete: () => void;
  skipRules: any[];
}

export function BasicDetailsStep({ locationId, onComplete, skipRules }: BasicDetailsStepProps) {
  const [availableLocations, setAvailableLocations] = useState<any[]>([]);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [selectedSourceLocation, setSelectedSourceLocation] = useState<string>('');

  const onboarding = mockDataService.onboarding.getByLocationId(locationId);
  const location = mockDataService.locations.getById(locationId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<BasicDetailsFormData>({
    resolver: zodResolver(basicDetailsSchema),
    defaultValues: {
      pocName: onboarding?.pocName || '',
      pocEmail: onboarding?.pocEmail || '',
      pocPhone: onboarding?.pocPhone || '',
      preferredContactMedium: onboarding?.preferredContactMedium,
      practiceManagementSoftware: onboarding?.practiceManagementSoftware || '',
    },
  });

  useEffect(() => {
    // Load persisted onboarding (demo: Supabase) and hydrate the form.
    fetch(`/api/onboarding/data?locationId=${locationId}`)
      .then((res) => res.json())
      .then((payload) => {
        const persisted = payload?.onboarding;
        if (!persisted) return;
        reset({
          pocName: persisted.pocName || '',
          pocEmail: persisted.pocEmail || '',
          pocPhone: persisted.pocPhone || '',
          preferredContactMedium: persisted.preferredContactMedium,
          practiceManagementSoftware: persisted.practiceManagementSoftware || '',
        });
      })
      .catch(() => {
        // Ignore; fallback to mock defaults.
      });
  }, [locationId, reset]);

  useEffect(() => {
    // Fetch available locations for copying
    fetch(`/api/onboarding/copy?locationId=${locationId}`)
      .then(res => res.json())
      .then(data => setAvailableLocations(data))
      .catch(() => {
        // Fallback to mock data
        if (location) {
          const accountLocations = mockDataService.locations.getByAccountId(location.accountId);
          setAvailableLocations(
            accountLocations
              .filter(loc => loc.id !== locationId)
              .map(loc => ({
                id: loc.id,
                name: loc.name,
                hasOnboarding: !!mockDataService.onboarding.getByLocationId(loc.id),
                copyableFields: {},
              }))
          );
        }
      });
  }, [locationId, location]);

  const onSubmit = async (data: BasicDetailsFormData) => {
    try {
      await fetch('/api/onboarding/data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId,
          patch: {
            pocName: data.pocName,
            pocEmail: data.pocEmail,
            pocPhone: data.pocPhone,
            preferredContactMedium: data.preferredContactMedium,
            practiceManagementSoftware: data.practiceManagementSoftware,
          },
        }),
      });

      onComplete();
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const handleCopyFromLocation = async () => {
    if (!selectedSourceLocation) return;

    try {
      const response = await fetch('/api/onboarding/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromLocationId: selectedSourceLocation,
          toLocationId: locationId,
          fieldsToCopy: ['pocName', 'pocEmail', 'pocPhone', 'preferredContactMedium'],
          userId: 'current-user', // Get from auth context
        }),
      });

      const copiedData = await response.json();
      
      // Update form with copied values
      if (copiedData.pocName) setValue('pocName', copiedData.pocName);
      if (copiedData.pocEmail) setValue('pocEmail', copiedData.pocEmail);
      if (copiedData.pocPhone) setValue('pocPhone', copiedData.pocPhone);
      if (copiedData.preferredContactMedium) {
        setValue('preferredContactMedium', copiedData.preferredContactMedium);
      }

      setShowCopyDialog(false);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const canCopy = availableLocations.some(loc => loc.hasOnboarding);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="overflow-visible">
      {/* Action Button - Top Right */}
      {canCopy && (
        <div className="flex justify-end mb-6">
          <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="shrink-0">
                <Copy className="h-4 w-4 mr-2" />
                Copy from Previous Location
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Copy from Previous Location</DialogTitle>
                <DialogDescription>
                  Select a location to copy answers from. Copied fields can be edited.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 overflow-visible">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Source Location</Label>
                  <div className="relative z-0">
                  <Select value={selectedSourceLocation} onValueChange={setSelectedSourceLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLocations
                        .filter(loc => loc.hasOnboarding)
                        .map(loc => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Fields that will be copied:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>POC Name</li>
                    <li>POC Email</li>
                    <li>POC Phone</li>
                    <li>Preferred Contact Medium</li>
                  </ul>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowCopyDialog(false)}>
                    Cancel Copy
                  </Button>
                  <Button type="button" onClick={handleCopyFromLocation}>
                    Copy Selected Data
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Form Sections - Untitled UI Style */}
      <div className="space-y-0">
        {/* Contact Information Section */}
        <div className="space-y-4 pb-8">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1.5">Contact Information</h3>
            <p className="text-sm text-muted-foreground">
              Primary point of contact for this location
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2.5">
              <Label htmlFor="pocName" className="text-sm font-medium">
                Point of Contact Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pocName"
                {...register('pocName')}
                placeholder="Dr. Sarah Miller"
              />
              {errors.pocName && (
                <p className="text-xs text-destructive mt-1">{errors.pocName.message}</p>
              )}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="pocEmail" className="text-sm font-medium">
                POC Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pocEmail"
                type="email"
                {...register('pocEmail')}
                placeholder="sarah.miller@example.com"
              />
              {errors.pocEmail && (
                <p className="text-xs text-destructive mt-1">{errors.pocEmail.message}</p>
              )}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="pocPhone" className="text-sm font-medium">
                POC Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pocPhone"
                {...register('pocPhone')}
                placeholder="+1-555-0101"
              />
              {errors.pocPhone && (
                <p className="text-xs text-destructive mt-1">{errors.pocPhone.message}</p>
              )}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="preferredContactMedium" className="text-sm font-medium">
                Preferred Contact Medium
              </Label>
              <div className="relative z-0">
                <Select
                  value={watch('preferredContactMedium') || ''}
                  onValueChange={(value) => setValue('preferredContactMedium', value as ContactMedium)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred contact method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ContactMedium.EMAIL}>Email</SelectItem>
                    <SelectItem value={ContactMedium.PHONE}>Phone</SelectItem>
                    <SelectItem value={ContactMedium.SMS}>SMS</SelectItem>
                    <SelectItem value={ContactMedium.PREFERRED_EMAIL}>Preferred Email</SelectItem>
                    <SelectItem value={ContactMedium.PREFERRED_PHONE}>Preferred Phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <Separator className="my-8" />

        {/* Practice Details Section */}
        <div className="space-y-4 pt-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-foreground">Practice Details</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="h-4 w-4">
                    <Info className="h-3.5 w-3.5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Practice Management Software</DialogTitle>
                    <DialogDescription>
                      This field is location-level (LL) and cannot be copied from other locations.
                      Enter the name of your current practice management software.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-sm text-muted-foreground">
              Information about your practice management system
            </p>
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="practiceManagementSoftware" className="text-sm font-medium">
              Existing Practice Management Software
            </Label>
            <Input
              id="practiceManagementSoftware"
              {...register('practiceManagementSoftware')}
              placeholder="Epic, Cerner, Dentrix, etc."
            />
          </div>
        </div>
      </div>
    </form>
  );
}
