'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingStep } from '@/lib/services/types';
import { BasicDetailsStep } from './steps/BasicDetailsStep';
import { PhoneSystemStep } from './steps/PhoneSystemStep';
import { DevicesStep } from './steps/DevicesStep';
import { WorkingHoursStep } from './steps/WorkingHoursStep';
import { CallFlowStep } from './steps/CallFlowStep';
import { ReviewStep } from './steps/ReviewStep';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Circle } from 'lucide-react';

interface OnboardingWizardProps {
  locationId: string;
  initialSession: any;
}

const steps: { key: OnboardingStep; label: string }[] = [
  { key: OnboardingStep.BASIC_DETAILS, label: 'Basic Details' },
  { key: OnboardingStep.PHONE_SYSTEM, label: 'Phone System' },
  { key: OnboardingStep.DEVICES, label: 'Devices' },
  { key: OnboardingStep.WORKING_HOURS, label: 'Working Hours' },
  { key: OnboardingStep.CALL_FLOW, label: 'Call Flow' },
  { key: OnboardingStep.REVIEW, label: 'Review' },
];

export function OnboardingWizard({ locationId, initialSession }: OnboardingWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>([]);
  const [session, setSession] = useState(initialSession);
  const [skipRules, setSkipRules] = useState<any[]>([]);

  useEffect(() => {
    // Fetch skip rules
    fetch(`/api/onboarding/skip-rules?locationId=${locationId}`)
      .then(res => res.json())
      .then(data => setSkipRules(data.skipRules || []))
      .catch(() => setSkipRules([]));
  }, [locationId]);

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

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
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6 overflow-visible">
      {/* Sidebar - Step Navigation */}
      <div className="lg:col-span-3">
        <Card className="sticky top-6 border-2 shadow-lg bg-gradient-to-br from-card to-card/95">
          <CardContent className="p-6">
            <div className="space-y-1 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Progress
                </span>
                <span className="text-sm font-bold text-primary">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2 mt-2" />
            </div>

            <nav className="space-y-2">
              {steps.map((step, index) => {
                const isCompleted = completedSteps.includes(step.key);
                const isCurrent = index === currentStepIndex;
                const isAccessible = index <= currentStepIndex || isCompleted;
                const stepNumber = index + 1;

                return (
                  <button
                    key={step.key}
                    onClick={() => handleStepClick(index)}
                    disabled={!isAccessible}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left
                      transition-all duration-200 group
                      ${isCurrent
                        ? 'bg-primary/10 border-2 border-primary shadow-md'
                        : isCompleted
                        ? 'bg-secondary/50 hover:bg-secondary/70 border border-border'
                        : isAccessible
                        ? 'bg-muted/50 hover:bg-muted border border-border/50'
                        : 'bg-muted/30 border border-border/30 cursor-not-allowed opacity-50'
                      }
                    `}
                  >
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0
                      transition-all
                      ${isCurrent
                        ? 'bg-primary text-primary-foreground shadow-lg scale-110'
                        : isCompleted
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                      }
                    `}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-bold">{stepNumber}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`
                        text-sm font-semibold
                        ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}
                      `}>
                        {step.label}
                      </div>
                      {isCurrent && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Current step
                        </div>
                      )}
                    </div>
                    {isCurrent && (
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-9">
        <Card className="border-2 shadow-lg bg-gradient-to-br from-card to-card/95">
          <CardContent className="p-8 lg:p-10">
            {/* Step Header */}
            <div className="mb-8 pb-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                      {currentStepIndex + 1}
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      {currentStep.label}
                    </h2>
                  </div>
                  <p className="text-muted-foreground ml-[52px] text-sm">
                    Step {currentStepIndex + 1} of {steps.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Step Content */}
            <div className="overflow-visible">
              {renderStep()}
            </div>

            {/* Navigation Buttons */}
            {currentStep.key !== OnboardingStep.REVIEW && (
              <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-8 mt-8 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStepIndex === 0}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button 
                  onClick={handleNext} 
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-md"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
