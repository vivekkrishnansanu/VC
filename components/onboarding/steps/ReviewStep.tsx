'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
  onSubmit?: () => void;
  canSubmit?: boolean;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export function ReviewStep({ locationId, onComplete, skipRules, onSubmit, canSubmit, isSubmitting, submitError }: ReviewStepProps) {
  const [validation, setValidation] = useState<any>(null);
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);
  const [internalSubmitError, setInternalSubmitError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const submitting = isSubmitting !== undefined ? isSubmitting : internalIsSubmitting;
  const error = submitError !== undefined ? submitError : internalSubmitError;

  const location = mockDataService.locations.getById(locationId);
  const onboarding = mockDataService.onboarding.getByLocationId(locationId);
  const phones = mockDataService.phones.getByLocationId(locationId);
  const unsupportedPhones = phones.filter(p => p.isUnsupported);

  useEffect(() => {
    // Validate onboarding before showing review
    Promise.all([
      fetch('/api/validation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId,
          type: 'onboarding',
        }),
      }).then(res => res.json()),
      fetch(`/api/approvals?locationId=${locationId}`).then(res => res.json()).catch(() => ({ pendingApprovals: [] })),
    ]).then(([validationData, approvalsData]) => {
      setValidation(validationData);
      // Store pending approvals info for display
      if (approvalsData.pendingApprovals?.length > 0) {
        setValidation((prev: any) => ({
          ...prev,
          hasPendingApprovals: true,
          pendingApprovalsCount: approvalsData.pendingApprovals.length,
        }));
      }
    }).catch(() => setValidation({ isValid: false, errors: [], warnings: [] }));
  }, [locationId]);

  const handleSubmit = async () => {
    if (onSubmit) {
      onSubmit();
      return;
    }

    setInternalIsSubmitting(true);
    setInternalSubmitError(null);

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
      setInternalSubmitError(error.message);
    } finally {
      setInternalIsSubmitting(false);
    }
  };

  // Block submission if:
  // 1. Validation errors exist
  // 2. Unsupported devices exist
  // 3. Pending approvals exist
  const hasPendingApprovals = validation?.hasPendingApprovals === true;
  const pendingApprovalsCount = validation?.pendingApprovalsCount || 0;
  
  const submitAllowed = canSubmit !== undefined 
    ? canSubmit && !hasPendingApprovals
    : (validation?.isValid && unsupportedPhones.length === 0 && !hasPendingApprovals);
  
  const blockReason = hasPendingApprovals 
    ? `Submission blocked: ${pendingApprovalsCount} pending approval(s) must be resolved`
    : !validation?.isValid
      ? 'Please fix validation errors'
      : unsupportedPhones.length > 0
        ? 'Unsupported devices must be resolved'
        : null;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">Review & Submit</h3>
        <p className="text-sm text-muted-foreground">
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
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1.5">
              <p className="font-semibold">Warnings:</p>
              <ul className="list-disc list-inside space-y-1">
                {validation.warnings.map((warning: string, index: number) => (
                  <li key={index} className="font-medium">{warning}</li>
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

      {validation?.hasPendingApprovals && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Submission Blocked: Pending Approvals</p>
              <p>You have {validation.pendingApprovalsCount} pending approval(s) that must be resolved before you can submit this onboarding.</p>
              <p className="text-sm mt-2">Please wait for approval or contact your implementation lead for assistance.</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Basic Details */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground">Basic Details</h4>
          <div className="space-y-2">
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
          </div>
        </div>

        {/* Phone System */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground">Phone System</h4>
          <div className="space-y-2">
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
          </div>
        </div>

        {/* Devices */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground">Devices ({phones.length})</h4>
          <div>
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
          </div>
        </div>

        {/* Call Flow */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground">Call Flow</h4>
          <div className="space-y-2">
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
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Submission Block Message */}
      {!submitAllowed && blockReason && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium">{blockReason}</p>
            {hasPendingApprovals && (
              <p className="text-sm mt-1">
                You cannot submit until all pending approvals are resolved. Please contact your implementation lead if you need assistance.
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Spacer for sticky submit button */}
      <div className="h-20" />
    </div>
  );
}
