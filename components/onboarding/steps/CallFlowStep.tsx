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
  optionNumber: string;
  script: string;
  ringType: 'users' | 'extensions';
  targets: Array<{ userId?: string; extension?: string }>;
  retryAttempts: number;
  waitTime: number;
  invalidSelectionScript: string;
  afterRetriesTarget: string;
  voicemailScript: string;
}

interface CallFlowStepProps {
  locationId: string;
  onComplete: () => void;
  skipRules: any[];
}

export function CallFlowStep({ locationId, onComplete, skipRules }: CallFlowStepProps) {
  const [hasIVR, setHasIVR] = useState(false);
  const [greetingMessage, setGreetingMessage] = useState('');
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
      setVoicemailScript(onboarding.voicemailScript || onboarding.greetingMessage || '');
    }
  }, [locationId]);

  const addIVROption = () => {
    const optionNumber = String(ivrOptions.length + 1);
    setIvrOptions([
      ...ivrOptions,
      {
        id: `ivr-${Date.now()}`,
        optionNumber,
        script: '',
        ringType: 'users',
        targets: [],
        retryAttempts: 0,
        waitTime: 30,
        invalidSelectionScript: '',
        afterRetriesTarget: 'voicemail',
        voicemailScript: '',
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
    console.log('Saving call flow:', {
      hasIVR,
      greetingMessage,
      directRingType,
      directTargets,
      ivrOptions,
      voicemailScript,
      sharedVoicemailUsers,
    });
    onComplete();
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
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">IVR Options</h3>
              <Button type="button" size="sm" onClick={addIVROption}>
                <Plus className="h-4 w-4 mr-2" />
                Add IVR Option
              </Button>
            </div>

            {ivrOptions.map((option, index) => (
              <div key={option.id} className="p-3 sm:p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">Option {option.optionNumber}</h4>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => removeIVROption(option.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Option Script</Label>
                    <Textarea
                      value={option.script}
                      onChange={(e) => updateIVROption(option.id, 'script', e.target.value)}
                      placeholder="Press 1 for sales, Press 2 for support..."
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Ring Type</Label>
                      <div className="relative z-0">
                        <Select
                        value={option.ringType}
                        onValueChange={(value) => updateIVROption(option.id, 'ringType', value)}
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

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Retry Attempts</Label>
                      <Input
                        type="number"
                        min="0"
                        value={option.retryAttempts}
                        onChange={(e) => updateIVROption(option.id, 'retryAttempts', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Wait Time (seconds)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={option.waitTime}
                      onChange={(e) => updateIVROption(option.id, 'waitTime', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Targets to Ring</Label>
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
                            />
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeIVRTarget(option.id, targetIndex)}
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
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Ring Target
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Invalid Selection Script</Label>
                    <Textarea
                      value={option.invalidSelectionScript}
                      onChange={(e) => updateIVROption(option.id, 'invalidSelectionScript', e.target.value)}
                      placeholder="Invalid selection. Please try again..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">After Retries</Label>
                    <div className="relative z-0">
                      <Select
                        value={option.afterRetriesTarget}
                        onValueChange={(value) => updateIVROption(option.id, 'afterRetriesTarget', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="voicemail">Go to Voicemail</SelectItem>
                          <SelectItem value="operator">Operator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Voicemail Script</Label>
                    <Textarea
                      value={option.voicemailScript}
                      onChange={(e) => updateIVROption(option.id, 'voicemailScript', e.target.value)}
                      placeholder="Please leave a message after the tone..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
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
