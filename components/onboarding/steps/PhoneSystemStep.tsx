'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PhoneSystemType } from '@/lib/mock-data/types';
import { mockDataService } from '@/lib/mock-data/service';
import { Info, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const phoneSystemSchema = z.object({
  phoneSystemType: z.nativeEnum(PhoneSystemType).optional(),
  phoneSystemDetails: z.string().optional(),
  phoneSystemVoipType: z.string().optional(),
  callForwardingSupported: z.boolean().optional(),
  usesFax: z.boolean().optional(),
  faxNumber: z.string().optional(),
  wantsFaxInVoiceStack: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.phoneSystemType === PhoneSystemType.TRADITIONAL && !data.phoneSystemDetails) {
      return false;
    }
    if (data.phoneSystemType === PhoneSystemType.VOIP && !data.phoneSystemVoipType) {
      return false;
    }
    return true;
  },
  {
    message: 'Phone system details are required',
  }
);

type PhoneSystemFormData = z.infer<typeof phoneSystemSchema>;

interface PhoneSystemStepProps {
  locationId: string;
  onComplete: () => void;
  skipRules: any[];
}

export function PhoneSystemStep({ locationId, onComplete, skipRules }: PhoneSystemStepProps) {
  const [autoFilledCallForwarding, setAutoFilledCallForwarding] = useState<boolean | null>(null);
  const onboarding = mockDataService.onboarding.getByLocationId(locationId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PhoneSystemFormData>({
    resolver: zodResolver(phoneSystemSchema),
    defaultValues: {
      phoneSystemType: onboarding?.phoneSystemType,
      phoneSystemDetails: onboarding?.phoneSystemDetails || '',
      phoneSystemVoipType: onboarding?.phoneSystemVoipType || '',
      callForwardingSupported: onboarding?.callForwardingSupported,
      usesFax: onboarding?.usesFax,
      faxNumber: onboarding?.faxNumber || '',
      wantsFaxInVoiceStack: onboarding?.wantsFaxInVoiceStack,
    },
  });

  const phoneSystemType = watch('phoneSystemType');
  const usesFax = watch('usesFax');
  const shouldSkipCallForwarding = skipRules.some(rule => rule.field === 'callForwardingSupported' && rule.shouldSkip);

  useEffect(() => {
    // Load persisted onboarding (demo: Supabase) and hydrate the form.
    fetch(`/api/onboarding/data?locationId=${locationId}`)
      .then((res) => res.json())
      .then((payload) => {
        const persisted = payload?.onboarding;
        if (!persisted) return;
        reset({
          phoneSystemType: persisted.phoneSystemType,
          phoneSystemDetails: persisted.phoneSystemDetails || '',
          phoneSystemVoipType: persisted.phoneSystemVoipType || '',
          callForwardingSupported: persisted.callForwardingSupported,
          usesFax: persisted.usesFax,
          faxNumber: persisted.faxNumber || '',
          wantsFaxInVoiceStack: persisted.wantsFaxInVoiceStack,
        });
      })
      .catch(() => {
        // Ignore; fallback to mock defaults.
      });
  }, [locationId, reset]);

  useEffect(() => {
    // Auto-fill call forwarding if known from master data
    if (phoneSystemType && watch('phoneSystemVoipType')) {
      fetch(`/api/onboarding/skip-rules?locationId=${locationId}`)
        .then(res => res.json())
        .then(data => {
          const skipRule = data.skipRules?.find((r: any) => r.field === 'callForwardingSupported');
          if (skipRule?.shouldSkip && phoneSystemType === PhoneSystemType.VOIP) {
            // Get value from master data
            const knowledge = mockDataService.masterData.getPhoneSystemKnowledge(
              phoneSystemType,
              watch('phoneSystemVoipType') || ''
            );
            if (knowledge?.supportsCallForwarding !== undefined) {
              setAutoFilledCallForwarding(knowledge.supportsCallForwarding);
              setValue('callForwardingSupported', knowledge.supportsCallForwarding);
            }
          }
        });
    }
  }, [phoneSystemType, watch('phoneSystemVoipType'), locationId, setValue]);

  const onSubmit = async (data: PhoneSystemFormData) => {
    await fetch('/api/onboarding/data', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locationId,
        patch: {
          phoneSystemType: data.phoneSystemType,
          phoneSystemDetails: data.phoneSystemDetails,
          phoneSystemVoipType: data.phoneSystemVoipType,
          callForwardingSupported: data.callForwardingSupported,
          usesFax: data.usesFax,
          faxNumber: data.faxNumber,
          wantsFaxInVoiceStack: data.wantsFaxInVoiceStack,
        },
      }),
    });

    onComplete();
  };

  // Get VoIP options from master data
  const voipSystems = mockDataService.masterData.getAllPhoneSystemKnowledge()
    .filter(k => k.phoneSystemType === PhoneSystemType.VOIP)
    .map(k => k.phoneSystemName);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 overflow-visible">
      {/* Form Sections */}
      <div className="space-y-6">
        {/* Phone System Type Section */}
        <Card className="border-2 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">System Type</CardTitle>
            <CardDescription>
              Select the type of phone system you currently use
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 overflow-visible">
            <div className="space-y-2">
              <Label htmlFor="phoneSystemType" className="text-sm font-medium">
                Phone System Type <span className="text-destructive">*</span>
              </Label>
              <div className="relative z-0">
                <Select
                value={phoneSystemType || ''}
                onValueChange={(value) => {
                  setValue('phoneSystemType', value as PhoneSystemType);
                  // Clear dependent fields
                  setValue('phoneSystemDetails', '');
                  setValue('phoneSystemVoipType', '');
                  setValue('callForwardingSupported', undefined);
                }}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select phone system type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PhoneSystemType.TRADITIONAL}>Traditional</SelectItem>
                  <SelectItem value={PhoneSystemType.VOIP}>VoIP</SelectItem>
                </SelectContent>
              </Select>
              </div>
              {errors.phoneSystemType && (
                <p className="text-sm text-destructive mt-1">{errors.phoneSystemType.message}</p>
              )}
            </div>

            {phoneSystemType === PhoneSystemType.TRADITIONAL && (
              <div className="space-y-2">
                <Label htmlFor="phoneSystemDetails" className="text-sm font-medium">
                  Phone System Details <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phoneSystemDetails"
                  {...register('phoneSystemDetails')}
                  placeholder="e.g., Avaya IP Office, Panasonic KX-TDE"
                  className="h-10"
                />
                {errors.phoneSystemDetails && (
                  <p className="text-sm text-destructive mt-1">{errors.phoneSystemDetails.message}</p>
                )}
              </div>
            )}

            {phoneSystemType === PhoneSystemType.VOIP && (
              <div className="space-y-2">
                <Label htmlFor="phoneSystemVoipType" className="text-sm font-medium">
                  VoIP Provider <span className="text-destructive">*</span>
                </Label>
                <div className="relative z-0">
                  <Select
                  value={watch('phoneSystemVoipType') || ''}
                  onValueChange={(value) => {
                    setValue('phoneSystemVoipType', value);
                    // Auto-fill call forwarding if known
                    const knowledge = mockDataService.masterData.getPhoneSystemKnowledge(
                      PhoneSystemType.VOIP,
                      value
                    );
                    if (knowledge?.supportsCallForwarding !== undefined) {
                      setAutoFilledCallForwarding(knowledge.supportsCallForwarding);
                      setValue('callForwardingSupported', knowledge.supportsCallForwarding);
                    }
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select VoIP provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {voipSystems.map(system => (
                      <SelectItem key={system} value={system}>
                        {system}
                      </SelectItem>
                    ))}
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {watch('phoneSystemVoipType') === 'Other' && (
                  <Input
                    placeholder="Enter VoIP provider name"
                    {...register('phoneSystemVoipType')}
                    className="h-10 mt-2"
                  />
                )}
                {errors.phoneSystemVoipType && (
                  <p className="text-sm text-destructive mt-1">{errors.phoneSystemVoipType.message}</p>
                )}
                </div>
              </div>
            )}
            </div>
          </CardContent>
        </Card>

        {/* Divider */}
        {phoneSystemType && <div className="border-t border-border my-4"></div>}

        {/* Call Forwarding Section */}
        {phoneSystemType && !shouldSkipCallForwarding && (
          <Card className="border-2 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Call Forwarding</CardTitle>
              <CardDescription>
                Information about call forwarding capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="callForwardingSupported" className="text-sm font-medium">
                      Does your phone system support call forwarding?
                    </Label>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" className="h-5 w-5">
                          <Info className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Call Forwarding Support</DialogTitle>
                          <DialogDescription>
                            This question may be skipped if we already know the capabilities of your phone system.
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {autoFilledCallForwarding !== null && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        This value was automatically filled from our knowledge base.
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="flex items-center space-x-2 pt-1">
                    <Checkbox
                      id="callForwardingSupported"
                      checked={watch('callForwardingSupported') || false}
                      onCheckedChange={(checked) => setValue('callForwardingSupported', checked as boolean)}
                    />
                    <Label htmlFor="callForwardingSupported" className="font-normal text-sm">
                      Yes, call forwarding is supported
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {shouldSkipCallForwarding && (
          <Alert className="border-2">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Call forwarding support is known for this phone system. This question has been skipped.
            </AlertDescription>
          </Alert>
        )}

        {/* FAX Section */}
        <Card className="border-2 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">FAX Configuration</CardTitle>
            <CardDescription>
              Information about your FAX requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="usesFax" className="text-sm font-medium">Do you currently use FAX?</Label>
              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="usesFax"
                  checked={watch('usesFax') || false}
                  onCheckedChange={(checked) => {
                    setValue('usesFax', checked as boolean);
                    if (!checked) {
                      setValue('faxNumber', '');
                    }
                  }}
                />
                <Label htmlFor="usesFax" className="font-normal text-sm">
                  Yes, we use FAX
                </Label>
              </div>
            </div>

            {usesFax && (
              <div className="space-y-2">
                <Label htmlFor="faxNumber" className="text-sm font-medium">
                  FAX Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="faxNumber"
                  {...register('faxNumber')}
                  placeholder="+1-555-0101"
                  className="h-10"
                />
                {errors.faxNumber && (
                  <p className="text-sm text-destructive mt-1">{errors.faxNumber.message}</p>
                )}
              </div>
            )}

            {usesFax === false && (
              <div className="space-y-2">
                <Label htmlFor="wantsFaxInVoiceStack" className="text-sm font-medium">
                  Would you like FAX capability in VoiceStack?
                </Label>
                <div className="flex items-center space-x-2 pt-1">
                  <Checkbox
                    id="wantsFaxInVoiceStack"
                    checked={watch('wantsFaxInVoiceStack') || false}
                    onCheckedChange={(checked) => setValue('wantsFaxInVoiceStack', checked as boolean)}
                  />
                  <Label htmlFor="wantsFaxInVoiceStack" className="font-normal text-sm">
                    Yes, I want FAX in VoiceStack
                  </Label>
                </div>
              </div>
            )}
          </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
