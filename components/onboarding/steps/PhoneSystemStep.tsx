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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PhoneSystemType } from '@/lib/mock-data/types';
import { mockDataService } from '@/lib/mock-data/service';
import { Info, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  usesFax: z.boolean({
    required_error: 'Select Yes or No',
    invalid_type_error: 'Select Yes or No',
  }),
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
).superRefine((data, ctx) => {
  if (data.usesFax === true) {
    if (!data.faxNumber || data.faxNumber.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['faxNumber'],
        message: 'FAX number is required when you use fax',
      });
    }
  }

  if (data.usesFax === false) {
    if (data.wantsFaxInVoiceStack === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['wantsFaxInVoiceStack'],
        message: 'Select Yes or No',
      });
    }
  }
});

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
    <form onSubmit={handleSubmit(onSubmit)} className="overflow-visible">
      {/* Form Sections - Untitled UI Style */}
      <div className="space-y-0">
        {/* Phone System Type Section */}
        <div className="space-y-5 pb-8 sm:pb-10">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">System Type</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Select the type of phone system you currently use
            </p>
          </div>
          <div className="space-y-4">
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select phone system type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PhoneSystemType.TRADITIONAL}>Traditional</SelectItem>
                    <SelectItem value={PhoneSystemType.VOIP}>VoIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.phoneSystemType && (
                <p className="text-xs text-destructive mt-1">{errors.phoneSystemType.message}</p>
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
                />
                {errors.phoneSystemDetails && (
                  <p className="text-xs text-destructive mt-1">{errors.phoneSystemDetails.message}</p>
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
                    <SelectTrigger>
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
                      className="mt-2"
                    />
                  )}
                  {errors.phoneSystemVoipType && (
                    <p className="text-xs text-destructive mt-1">{errors.phoneSystemVoipType.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Separator */}
        {phoneSystemType && !shouldSkipCallForwarding && <Separator className="my-8" />}

        {/* Call Forwarding Section */}
        {phoneSystemType && !shouldSkipCallForwarding && (
          <div className="space-y-5 pt-0 pb-8 sm:pb-10">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1.5">Call Forwarding</h3>
              <p className="text-sm text-muted-foreground">
                Information about call forwarding capabilities
              </p>
            </div>
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
        )}

        {shouldSkipCallForwarding && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Call forwarding support is known for this phone system. This question has been skipped.
            </AlertDescription>
          </Alert>
        )}

        {/* Separator */}
        <Separator className="my-8" />

        {/* FAX Section */}
        <div className="space-y-4 pt-0">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1.5">FAX Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Information about your FAX requirements
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Do you currently use fax? <span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                value={usesFax === true ? 'yes' : usesFax === false ? 'no' : ''}
                onValueChange={(v) => {
                  const value = v === 'yes';
                  setValue('usesFax', value, { shouldValidate: true, shouldDirty: true });
                  if (value) {
                    // If they use fax, clear the VoiceStack fax follow-up
                    setValue('wantsFaxInVoiceStack', undefined, { shouldValidate: true });
                  } else {
                    // If they don't use fax, clear fax number
                    setValue('faxNumber', '', { shouldValidate: true });
                  }
                }}
                className="grid gap-3 pt-1"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="usesFax-yes" value="yes" />
                  <Label htmlFor="usesFax-yes" className="font-normal text-sm">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="usesFax-no" value="no" />
                  <Label htmlFor="usesFax-no" className="font-normal text-sm">
                    No
                  </Label>
                </div>
              </RadioGroup>
              {errors.usesFax && (
                <p className="text-xs text-destructive mt-1">{errors.usesFax.message}</p>
              )}
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
                />
                {errors.faxNumber && (
                  <p className="text-xs text-destructive mt-1">{errors.faxNumber.message}</p>
                )}
              </div>
            )}

            {usesFax === false && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Do you want to use fax in VoiceStack? <span className="text-destructive">*</span>
                </Label>
                <RadioGroup
                  value={
                    watch('wantsFaxInVoiceStack') === true
                      ? 'yes'
                      : watch('wantsFaxInVoiceStack') === false
                        ? 'no'
                        : ''
                  }
                  onValueChange={(v) => {
                    setValue('wantsFaxInVoiceStack', v === 'yes', {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                  className="grid gap-3 pt-1"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="vsFax-yes" value="yes" />
                    <Label htmlFor="vsFax-yes" className="font-normal text-sm">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="vsFax-no" value="no" />
                    <Label htmlFor="vsFax-no" className="font-normal text-sm">
                      No
                    </Label>
                  </div>
                </RadioGroup>
                {errors.wantsFaxInVoiceStack && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.wantsFaxInVoiceStack.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
