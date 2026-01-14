'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { OnboardingStep } from '@/lib/services/types';
import { BasicDetailsStep } from './steps/BasicDetailsStep';
import { PhoneSystemStep } from './steps/PhoneSystemStep';
import { DevicesStep } from './steps/DevicesStep';
import { WorkingHoursStep } from './steps/WorkingHoursStep';
import { CallFlowStep } from './steps/CallFlowStep';
import { ReviewStep } from './steps/ReviewStep';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Loader2, Menu, X, LogOut } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { mockDataService } from '@/lib/mock-data/service';
import { useAuth } from '@/context/AuthContext';

interface OnboardingWizardProps {
  locationId: string;
  initialSession: any;
  locationName: string;
}

const steps: { key: OnboardingStep; label: string }[] = [
  { key: OnboardingStep.BASIC_DETAILS, label: 'Basic Details' },
  { key: OnboardingStep.PHONE_SYSTEM, label: 'Phone System' },
  { key: OnboardingStep.DEVICES, label: 'Devices' },
  { key: OnboardingStep.WORKING_HOURS, label: 'Working Hours' },
  { key: OnboardingStep.CALL_FLOW, label: 'Call Flow' },
  { key: OnboardingStep.REVIEW, label: 'Review' },
];

export function OnboardingWizard({ locationId, initialSession, locationName }: OnboardingWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>([]);
  const [session, setSession] = useState(initialSession);
  const [skipRules, setSkipRules] = useState<any[]>([]);
  const [stepIssues, setStepIssues] = useState<Record<OnboardingStep, { warnings: number; errors: number }>>({} as any);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { signOut } = useAuth();

  useEffect(() => {
    // Fetch skip rules
    fetch(`/api/onboarding/skip-rules?locationId=${locationId}`)
      .then(res => res.json())
      .then(data => setSkipRules(data.skipRules || []))
      .catch(() => setSkipRules([]));
  }, [locationId]);

  useEffect(() => {
    // Check if can submit (including approval checks)
    const checkCanSubmit = async () => {
      try {
        const response = await fetch(`/api/onboarding/session?locationId=${locationId}`);
        const sessionData = await response.json();
        
        if (sessionData) {
          // Check for pending approvals
          const approvalsResponse = await fetch(`/api/approvals?locationId=${locationId}`);
          const approvalsData = await approvalsResponse.json();
          const hasPendingApprovals = approvalsData.pendingApprovals?.length > 0 || false;
          
          // Check validation
          const validationResponse = await fetch('/api/validation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locationId, type: 'onboarding' }),
          });
          const validationData = await validationResponse.json();
          
          const phones = mockDataService.phones.getByLocationId(locationId);
          const unsupportedPhones = phones.filter(p => p.isUnsupported);
          
          setCanSubmit(
            !hasPendingApprovals &&
            validationData?.isValid &&
            unsupportedPhones.length === 0 &&
            !sessionData.isLocked
          );
        } else {
          setCanSubmit(false);
        }
      } catch (error) {
        setCanSubmit(false);
      }
    };

    if (currentStep.key === OnboardingStep.REVIEW) {
      checkCanSubmit();
    }

    // Check for issues in each step
    const checkStepIssues = async () => {
      const issues: Record<OnboardingStep, { warnings: number; errors: number }> = {} as any;

      // Check Devices step for unsupported phones
      try {
        const phones = mockDataService.phones.getByLocationId(locationId);
        const unsupportedPhones = phones.filter(p => p.isUnsupported);
        if (unsupportedPhones.length > 0) {
          issues[OnboardingStep.DEVICES] = {
            warnings: unsupportedPhones.length,
            errors: 0,
          };
        }
      } catch (error) {
        // Silently fail
      }

      // Check Review step for validation errors/warnings
      try {
        const response = await fetch('/api/validation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            locationId,
            type: 'onboarding',
          }),
        });
        const data = await response.json();
        if (data && (data.errors?.length > 0 || data.warnings?.length > 0)) {
          issues[OnboardingStep.REVIEW] = {
            warnings: data.warnings?.length || 0,
            errors: data.errors?.length || 0,
          };
        }
      } catch (error) {
        // Silently fail
      }

      setStepIssues(prev => ({ ...prev, ...issues }));
    };

    checkStepIssues();
    // Re-check periodically or when step changes
    const interval = setInterval(checkStepIssues, 3000);
    return () => clearInterval(interval);
  }, [locationId, currentStepIndex]);

  useEffect(() => {
    // Check if can submit (only on Review step)
    const currentStepKey = steps[currentStepIndex]?.key;
    const isReviewStep = currentStepKey === OnboardingStep.REVIEW;
    
    if (isReviewStep) {
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
        fetch(`/api/onboarding/session?locationId=${locationId}`).then(res => res.json()).catch(() => ({ isLocked: false })),
      ])
        .then(([validationData, approvalsData, sessionData]) => {
          const phones = mockDataService.phones.getByLocationId(locationId);
          const unsupportedPhones = phones.filter(p => p.isUnsupported);
          const hasPendingApprovals = approvalsData.pendingApprovals?.length > 0 || false;
          
          setCanSubmit(
            validationData?.isValid &&
            unsupportedPhones.length === 0 &&
            !hasPendingApprovals &&
            !sessionData.isLocked
          );
        })
        .catch(() => setCanSubmit(false));
    } else {
      setCanSubmit(false);
    }
  }, [locationId, currentStepIndex]);

  // Define currentStep after all useEffect hooks
  const currentStep = steps[currentStepIndex] || steps[0];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

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
      // Mark review as completed and move to next state
      if (!completedSteps.includes(OnboardingStep.REVIEW)) {
        setCompletedSteps([...completedSteps, OnboardingStep.REVIEW]);
      }
    } catch (error: any) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      
      // Mark current step as completed
      if (!completedSteps.includes(currentStep.key)) {
        setCompletedSteps([...completedSteps, currentStep.key]);
      }

      // Update session via API
      updateSessionStep(steps[nextIndex].key);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleStepClick = (index: number) => {
    // Allow navigation to completed steps or next step
    if (index <= currentStepIndex || completedSteps.includes(steps[index].key)) {
      setCurrentStepIndex(index);
    }
  };

  const updateSessionStep = async (step: OnboardingStep) => {
    try {
      const response = await fetch('/api/onboarding/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId,
          step,
        }),
      });
      const data = await response.json();
      setSession(data);
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep.key) {
      case OnboardingStep.BASIC_DETAILS:
        return (
          <BasicDetailsStep
            locationId={locationId}
            onComplete={handleNext}
            skipRules={skipRules}
          />
        );
      case OnboardingStep.PHONE_SYSTEM:
        return (
          <PhoneSystemStep
            locationId={locationId}
            onComplete={handleNext}
            skipRules={skipRules}
          />
        );
      case OnboardingStep.DEVICES:
        return (
          <DevicesStep
            locationId={locationId}
            onComplete={handleNext}
            skipRules={skipRules}
          />
        );
      case OnboardingStep.WORKING_HOURS:
        return (
          <WorkingHoursStep
            locationId={locationId}
            onComplete={handleNext}
            skipRules={skipRules}
          />
        );
      case OnboardingStep.CALL_FLOW:
        return (
          <CallFlowStep
            locationId={locationId}
            onComplete={handleNext}
            skipRules={skipRules}
          />
        );
      case OnboardingStep.REVIEW:
        return (
          <ReviewStep
            locationId={locationId}
            onComplete={() => {}}
            skipRules={skipRules}
            onSubmit={handleSubmit}
            canSubmit={canSubmit}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="h-10 w-10"
        >
          {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Left Sidebar - Progress & Steps */}
      <aside className={cn(
        "h-full w-64 shrink-0 border-r border-border pr-6 transition-transform duration-300 flex flex-col",
        showMobileMenu ? "fixed left-0 top-0 bottom-0 z-50 bg-background shadow-lg" : "hidden lg:flex"
      )}>
        <div className="flex flex-col flex-1 space-y-6 py-4 sm:py-2 pl-1.5 lg:pl-1.5 overflow-y-auto">
          {/* Logo & Close Button */}
          <div className="h-[68px] pb-[42px] sm:pb-[42px] border-b border-border flex items-center justify-between mb-6">
            <img
              src="https://voicestack.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fvoicestack-logo.91a9d9aa.svg&w=384&q=75&dpl=dpl_6YQQQr5c5yUDQKfyirHUrb7KDZfE"
              alt="VoiceStack"
              className="h-7 w-[145px]"
              loading="eager"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileMenu(false)}
              className="lg:hidden h-9 w-9"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress Header */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Progress
              </span>
              <span className="text-sm font-semibold text-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step List */}
          <nav className="space-y-1.5">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.key);
              const isCurrent = index === currentStepIndex;
              const isAccessible = index <= currentStepIndex || isCompleted;
              const stepNumber = index + 1;
              const issues = stepIssues[step.key];
              const hasIssues = issues && (issues.warnings > 0 || issues.errors > 0);

              return (
                <button
                  key={step.key}
                  onClick={() => {
                    handleStepClick(index);
                    setShowMobileMenu(false);
                  }}
                  disabled={!isAccessible}
                  className={cn(
                    "w-full flex items-center justify-start gap-3.5 py-3.5 sm:py-2.5 rounded-lg text-left transition-colors min-h-[48px] sm:min-h-0",
                    isCurrent
                      ? "bg-muted text-foreground"
                      : isCompleted
                      ? "hover:bg-muted/50 text-foreground"
                      : isAccessible
                      ? "hover:bg-muted/50 text-muted-foreground"
                      : "opacity-50 cursor-not-allowed text-muted-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 sm:w-7 sm:h-7 rounded-full flex-shrink-0 text-xs font-semibold transition-colors",
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : isCompleted
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <span className="text-sm font-medium flex-1 leading-snug">{step.label}</span>
                  {hasIssues && (
                    <div className="flex items-center gap-2 shrink-0">
                      <AlertTriangle className={cn(
                        "h-4 w-4 sm:h-3.5 sm:w-3.5 shrink-0",
                        issues.errors > 0 ? "text-destructive" : "text-amber-500"
                      )} />
                      <Badge 
                        variant={issues.errors > 0 ? "destructive" : "secondary"}
                        className="h-5 min-w-[1.5rem] px-1.5 text-[11px] sm:text-[10px] font-semibold leading-none flex items-center justify-center"
                      >
                        {issues.errors > 0 ? issues.errors : issues.warnings}
                      </Badge>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout Button - Bottom */}
        <div className="pt-6 pb-6 mb-0 mt-auto flex-shrink-0">
          <Button
            variant="secondary"
            className="w-full justify-start gap-2"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Sign out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-w-0 flex-1 flex flex-col overflow-hidden">
        {/* Mobile Step Indicator */}
        <div className="lg:hidden mb-5 sm:mb-4 pt-14 sm:pt-12 pb-3 sm:pb-2">
          <div className="flex items-center justify-between mb-3 sm:mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span className="text-xs font-semibold text-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2 mb-4 sm:mb-3" />
          <h2 className="text-base font-semibold tracking-tight text-foreground leading-tight">
            {currentStep.label}
          </h2>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto overscroll-contain" data-scroll-container>
          {/* Page Header */}
          <div className="mb-4 sm:mb-5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-1.5 sm:mb-1 leading-tight">
              {locationName}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Complete your setup to get started with VoiceStack
            </p>
          </div>
          <Separator className="mb-4 sm:mb-5" />

          {/* Step Header - Desktop Only */}
          <div className="hidden lg:block mb-5">
            <h2 className="text-lg font-semibold tracking-tight text-foreground leading-tight">
              Step {currentStepIndex + 1} of {steps.length}: {currentStep.label}
            </h2>
          </div>
          <Separator className="hidden lg:block mb-6" />

          {/* Step Content */}
          <div className="overflow-visible">
            {renderStep()}
          </div>

          {/* Spacer for navigation buttons */}
          {(currentStep.key !== OnboardingStep.REVIEW) && (
            <div className="h-20" />
          )}
          {currentStep.key === OnboardingStep.REVIEW && (
            <div className="h-20" />
          )}
        </div>

        {/* Navigation Buttons - Fixed at bottom */}
        {currentStep.key !== OnboardingStep.REVIEW ? (
          <div className="flex items-center justify-between gap-2 sm:gap-3 pt-4 sm:pt-4 pb-2 sm:pb-4 px-3 sm:px-0 border-t shrink-0 bg-background">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              size="default"
              className="flex-1 sm:flex-initial min-h-[44px] text-sm sm:text-xs"
            >
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Go to Previous Step</span>
              <span className="sm:hidden">Previous</span>
            </Button>
            <Button onClick={handleNext} size="default" className="flex-1 sm:flex-initial min-h-[44px] text-sm sm:text-xs border border-[rgba(0,0,0,0.1)]">
              <span className="hidden sm:inline">Continue to Next Step</span>
              <span className="sm:hidden">Next</span>
              <ArrowRight className="h-4 w-4 ml-1 sm:ml-2" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2 sm:gap-3 pt-4 sm:pt-4 pb-2 sm:pb-4 px-3 sm:px-0 border-t shrink-0 bg-background">
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
              <DialogTrigger asChild>
                <Button 
                  disabled={!canSubmit || isSubmitting} 
                  size="default" 
                  className="w-full sm:w-auto min-h-[44px]"
                  title={!canSubmit ? 'Cannot submit: Please resolve all blockers first' : undefined}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting for Review...
                    </>
                  ) : (
                    'Submit for Review'
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
                  <Button variant="outline" size="sm" onClick={() => setShowConfirmDialog(false)} className="w-full sm:w-auto">
                    Cancel Submission
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting} size="sm" className="w-full sm:w-auto">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Confirm and Submit'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </main>
    </>
  );
}
