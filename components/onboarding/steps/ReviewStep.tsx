'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { mockDataService } from '@/lib/mock-data/service';
import { CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ReviewStepProps {
  locationId: string;
  onComplete: () => void;
  skipRules: any[];
}

export function ReviewStep({ locationId, onComplete, skipRules }: ReviewStepProps) {
  const [validation, setValidation] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const location = mockDataService.locations.getById(locationId);
  const onboarding = mockDataService.onboarding.getByLocationId(locationId);
  const phones = mockDataService.phones.getByLocationId(locationId);
  const unsupportedPhones = phones.filter(p => p.isUnsupported);

  useEffect(() => {
    // Validate onboarding before showing review
    fetch('/api/validation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locationId,
        type: 'onboarding',
      }),
    })
      .then(res => res.json())
      .then(data => setValidation(data))
      .catch(() => setValidation({ isValid: false, errors: [], warnings: [] }));
  }, [locationId]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId,
          userId: 'current-user', // Get from auth context
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit onboarding');
      }

      setShowConfirmDialog(false);
      onComplete();
    } catch (error: any) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = validation?.isValid && unsupportedPhones.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Review & Submit</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review all your answers before submitting
        </p>
      </div>

      {validation && !validation.isValid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Please fix the following errors before submitting:</p>
              <ul className="list-disc list-inside">
                {validation.errors.map((error: string, index: number) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {validation?.warnings && validation.warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Warnings:</p>
              <ul className="list-disc list-inside">
                {validation.warnings.map((warning: string, index: number) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {unsupportedPhones.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Unsupported Devices Detected:</p>
              <p>You have {unsupportedPhones.length} unsupported device(s). Please resolve approval requests before submitting.</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {/* Basic Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">POC Name</p>
                <p className="font-medium">{onboarding?.pocName || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">POC Email</p>
                <p className="font-medium">{onboarding?.pocEmail || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">POC Phone</p>
                <p className="font-medium">{onboarding?.pocPhone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Medium</p>
                <p className="font-medium">{onboarding?.preferredContactMedium || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Practice Management Software</p>
                <p className="font-medium">{onboarding?.practiceManagementSoftware || 'Not provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phone System */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Phone System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">System Type</p>
                <p className="font-medium">{onboarding?.phoneSystemType || 'Not provided'}</p>
              </div>
              {onboarding?.phoneSystemType === 'TRADITIONAL' && (
                <div>
                  <p className="text-sm text-muted-foreground">System Details</p>
                  <p className="font-medium">{onboarding?.phoneSystemDetails || 'Not provided'}</p>
                </div>
              )}
              {onboarding?.phoneSystemType === 'VOIP' && (
                <div>
                  <p className="text-sm text-muted-foreground">VoIP Provider</p>
                  <p className="font-medium">{onboarding?.phoneSystemVoipType || 'Not provided'}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Call Forwarding</p>
                <p className="font-medium">
                  {onboarding?.callForwardingSupported !== undefined
                    ? onboarding.callForwardingSupported ? 'Yes' : 'No'
                    : 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Uses FAX</p>
                <p className="font-medium">
                  {onboarding?.usesFax !== undefined
                    ? onboarding.usesFax ? 'Yes' : 'No'
                    : 'Not provided'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Devices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Devices ({phones.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {phones.map((phone, index) => (
                <div
                  key={phone.id}
                  className={`p-3 rounded-md border ${
                    phone.isUnsupported ? 'border-destructive bg-destructive/10' : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        Device {index + 1}: {phone.brand} {phone.model}
                      </p>
                      {phone.isUnsupported && (
                        <Badge variant="destructive" className="mt-1">
                          Unsupported
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call Flow */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Call Flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Has IVR</p>
              <p className="font-medium">{onboarding?.hasIVR ? 'Yes' : 'No'}</p>
            </div>
            {onboarding?.greetingMessage && (
              <div>
                <p className="text-sm text-muted-foreground">Greeting Message</p>
                <p className="font-medium">{onboarding.greetingMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {submitError && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogTrigger asChild>
            <Button disabled={!canSubmit || isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Onboarding'
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Submission</DialogTitle>
              <DialogDescription>
                Are you sure you want to submit this onboarding? Once submitted, you won&apos;t be able to make changes without approval.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Confirm Submit'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
