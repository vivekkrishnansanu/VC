'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { mockDataService } from '@/lib/mock-data/service';
import { Plus, X, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface IVROption {
  id: string;
  optionNumber: string; // DTMF digit
  label?: string; // Optional label
  ringType: 'users' | 'extensions';
  targets: Array<{ userId?: string; extension?: string }>;
}

interface CallFlowStepProps {
  locationId: string;
  onComplete: () => void;
  skipRules: any[];
}

export function CallFlowStep({ locationId, onComplete, skipRules }: CallFlowStepProps) {
  const [hasIVR, setHasIVR] = useState(false);
  const [greetingMessage, setGreetingMessage] = useState('');
  const [ivrScript, setIvrScript] = useState('');
  const [ivrRetryAttempts, setIvrRetryAttempts] = useState<number>(0);
  const [ivrWaitTime, setIvrWaitTime] = useState<number>(30);
  const [ivrInvalidSelectionScript, setIvrInvalidSelectionScript] = useState('');
  const [ivrAfterRetriesTarget, setIvrAfterRetriesTarget] = useState<string>('');
  const [directRingType, setDirectRingType] = useState<'users' | 'extensions'>('users');
  const [directTargets, setDirectTargets] = useState<Array<{ userId?: string; extension?: string }>>([]);
  const [ivrOptions, setIvrOptions] = useState<IVROption[]>([]);
  const [voicemailScript, setVoicemailScript] = useState('');
  const [sharedVoicemailUsers, setSharedVoicemailUsers] = useState<string[]>([]);

  const shouldSkipIVR = skipRules.some(rule => rule.field === 'ivrOptions' && rule.shouldSkip);

  useEffect(() => {
    const onboarding = mockDataService.onboarding.getByLocationId(locationId);
    if (onboarding) {
      setHasIVR(onboarding.hasIVR || false);
      setGreetingMessage(onboarding.greetingMessage || '');
      setIvrScript(onboarding.ivrScript || onboarding.greetingMessage || '');
      setIvrRetryAttempts(onboarding.ivrRetryAttempts || 0);
      setIvrWaitTime(onboarding.ivrWaitTime || 30);
      setIvrInvalidSelectionScript(onboarding.ivrInvalidSelectionScript || '');
      setIvrAfterRetriesTarget(onboarding.ivrAfterRetriesTarget || '');
      setVoicemailScript(onboarding.voicemailScript || onboarding.greetingMessage || '');
      
      // Load IVR options (simplified)
      if (onboarding.ivrOptions) {
        setIvrOptions(onboarding.ivrOptions.map(opt => ({
          id: opt.id || `opt-${Date.now()}`,
          optionNumber: opt.optionNumber,
          label: opt.label || opt.script,
          ringType: opt.ringType,
          targets: opt.targets || [],
        })));
      }
    }
  }, [locationId]);

  const addIVROption = () => {
    const optionNumber = String(ivrOptions.length + 1);
    setIvrOptions([
      ...ivrOptions,
      {
        id: `ivr-${Date.now()}`,
        optionNumber,
        label: '',
        ringType: 'users',
        targets: [],
      },
    ]);
  };

  const removeIVROption = (id: string) => {
    setIvrOptions(ivrOptions.filter(opt => opt.id !== id));
  };

  const updateIVROption = (id: string, field: keyof IVROption, value: any) => {
    setIvrOptions(ivrOptions.map(opt => 
      opt.id === id ? { ...opt, [field]: value } : opt
    ));
  };

  const handleSave = async () => {
    await fetch('/api/onboarding/data', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locationId,
        patch: {
          hasIVR,
          greetingMessage,
          ivrScript: hasIVR ? ivrScript : undefined,
          ivrRetryAttempts: hasIVR ? ivrRetryAttempts : undefined,
          ivrWaitTime: hasIVR ? ivrWaitTime : undefined,
          ivrInvalidSelectionScript: hasIVR ? ivrInvalidSelectionScript : undefined,
          ivrAfterRetriesTarget: hasIVR ? ivrAfterRetriesTarget : undefined,
          ivrOptions: hasIVR ? ivrOptions : undefined,
          voicemailScript,
          sharedVoicemailUsers,
        },
      }),
    });
    onComplete();
  };

  const addIVRTarget = (optionId: string) => {
    updateIVROption(optionId, 'targets', [
      ...ivrOptions.find(o => o.id === optionId)?.targets || [],
      {},
    ]);
  };

  const removeIVRTarget = (optionId: string, targetIndex: number) => {
    const option = ivrOptions.find(o => o.id === optionId);
    if (option) {
      updateIVROption(optionId, 'targets', 
        option.targets.filter((_, i) => i !== targetIndex)
      );
    }
  };

  const addDirectTarget = () => {
    setDirectTargets([...directTargets, {}]);
  };

  const removeDirectTarget = (index: number) => {
    setDirectTargets(directTargets.filter((_, i) => i !== index));
  };

  const onSubmit = async () => {
    await handleSave();
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-8 overflow-visible">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">Call Flow Configuration</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Configure how calls are routed and handled
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="greetingMessage" className="text-sm font-medium">Greeting Message</Label>
          <Textarea
            id="greetingMessage"
            value={greetingMessage}
            onChange={(e) => setGreetingMessage(e.target.value)}
            placeholder="Thank you for calling. Please listen to the following options..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasIVR"
              checked={hasIVR}
              onCheckedChange={(checked) => {
                setHasIVR(checked as boolean);
                if (!checked) {
                  setIvrOptions([]);
                }
              }}
              disabled={shouldSkipIVR}
            />
            <Label htmlFor="hasIVR" className="text-sm font-normal">
              Use IVR (Interactive Voice Response)
            </Label>
          </div>
          {shouldSkipIVR && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                IVR is disabled. This section has been skipped.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {hasIVR && !shouldSkipIVR ? (
          <div className="space-y-6">
            {/* IVR Script at Top */}
            <div className="space-y-2">
              <Label htmlFor="ivrScript" className="text-sm font-medium">
                IVR Script <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="ivrScript"
                value={ivrScript}
                onChange={(e) => setIvrScript(e.target.value)}
                placeholder="Thank you for calling. Please listen to the following options..."
                rows={3}
              />
            </div>

            {/* Add Option Button */}
            <div className="flex justify-end">
              <Button type="button" size="sm" onClick={addIVROption}>
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>

            {/* IVR Options List */}
            {ivrOptions.length > 0 && (
              <div className="space-y-4">
                {ivrOptions.map((option) => (
                  <Card key={option.id} className="bg-gradient-to-br from-card to-card/50 border-border/60">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-base font-bold text-foreground">
                          Option {option.optionNumber}
                        </h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIVROption(option.id)}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Option Label (Optional)</Label>
                          <Input
                            value={option.label || ''}
                            onChange={(e) => updateIVROption(option.id, 'label', e.target.value)}
                            placeholder="Press 1 for sales"
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Ring Type</Label>
                          <Select
                            value={option.ringType}
                            onValueChange={(value) => updateIVROption(option.id, 'ringType', value as 'users' | 'extensions')}
                          >
                            <SelectTrigger className="bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="users">Users</SelectItem>
                              <SelectItem value="extensions">Extensions</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold">Routing Targets</Label>
                          <div className="space-y-2">
                            {option.targets.map((target, targetIndex) => (
                              <div key={targetIndex} className="flex gap-2">
                                {option.ringType === 'users' ? (
                                  <Input
                                    placeholder="User ID or Email"
                                    value={target.userId || ''}
                                    onChange={(e) => {
                                      const updated = [...option.targets];
                                      updated[targetIndex] = { ...target, userId: e.target.value };
                                      updateIVROption(option.id, 'targets', updated);
                                    }}
                                    className="bg-background"
                                  />
                                ) : (
                                  <Input
                                    placeholder="Extension"
                                    value={target.extension || ''}
                                    onChange={(e) => {
                                      const updated = [...option.targets];
                                      updated[targetIndex] = { ...target, extension: e.target.value };
                                      updateIVROption(option.id, 'targets', updated);
                                    }}
                                    className="bg-background"
                                  />
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeIVRTarget(option.id, targetIndex)}
                                  className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addIVRTarget(option.id)}
                            className="w-full sm:w-auto"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Target
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Global IVR Settings (shown below options) */}
            <Card className="bg-gradient-to-br from-muted/30 to-muted/10 border-border/60">
              <CardContent className="p-6 space-y-5">
                <h4 className="text-base font-bold text-foreground">Global IVR Settings</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Retry Attempts</Label>
                    <Input
                      type="number"
                      min="0"
                      value={ivrRetryAttempts}
                      onChange={(e) => setIvrRetryAttempts(parseInt(e.target.value) || 0)}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Wait Time (seconds)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={ivrWaitTime}
                      onChange={(e) => setIvrWaitTime(parseInt(e.target.value) || 0)}
                      className="bg-background"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Invalid Selection Script</Label>
                  <Textarea
                    value={ivrInvalidSelectionScript}
                    onChange={(e) => setIvrInvalidSelectionScript(e.target.value)}
                    placeholder="Invalid selection. Please try again..."
                    rows={2}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">After Retry Routing</Label>
                  <Select
                    value={ivrAfterRetriesTarget}
                    onValueChange={setIvrAfterRetriesTarget}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select routing target" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="voicemail">Go to Voicemail</SelectItem>
                      <SelectItem value="operator">Operator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-4 overflow-visible">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Direct Ring Type</Label>
              <div className="relative z-0">
                <Select
                  value={directRingType}
                  onValueChange={(value) => setDirectRingType(value as 'users' | 'extensions')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="extensions">Extensions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Targets to Ring</Label>
              <div className="space-y-2">
                {directTargets.map((target, index) => (
                  <div key={index} className="flex gap-2">
                    {directRingType === 'users' ? (
                      <Input
                        placeholder="User ID or Email"
                        value={target.userId || ''}
                        onChange={(e) => {
                          const updated = [...directTargets];
                          updated[index] = { ...target, userId: e.target.value };
                          setDirectTargets(updated);
                        }}
                      />
                    ) : (
                      <Input
                        placeholder="Extension"
                        value={target.extension || ''}
                        onChange={(e) => {
                          const updated = [...directTargets];
                          updated[index] = { ...target, extension: e.target.value };
                          setDirectTargets(updated);
                        }}
                      />
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDirectTarget(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addDirectTarget}>
                <Plus className="h-4 w-4 mr-2" />
                Add Ring Target
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="voicemailScript" className="text-sm font-medium">Voicemail Script</Label>
          <Textarea
            id="voicemailScript"
            value={voicemailScript}
            onChange={(e) => setVoicemailScript(e.target.value)}
            placeholder="Please leave a message after the tone..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Shared Voicemail Users</Label>
          <Input
            placeholder="Enter user emails separated by commas"
            value={sharedVoicemailUsers.join(', ')}
            onChange={(e) => setSharedVoicemailUsers(e.target.value.split(',').map(s => s.trim()))}
          />
        </div>
      </div>

    </form>
  );
}
