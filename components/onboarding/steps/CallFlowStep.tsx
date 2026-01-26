'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel, SelectSeparator } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { mockDataService } from '@/lib/mock-data/service';
import { Plus, X, Info } from 'lucide-react';

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
  const [newlyAddedOptionId, setNewlyAddedOptionId] = useState<string | null>(null);
  const optionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: string; name: string; email: string; extension?: string }>>([]);
  const [availableExtensions, setAvailableExtensions] = useState<string[]>([]);
  const [extensionsWithoutUsers, setExtensionsWithoutUsers] = useState<string[]>([]);

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
      
      // Load direct routing data (when IVR is disabled)
      if (!onboarding.hasIVR) {
        // Try to infer ring type from existing data
        if (onboarding.directRingUsers && onboarding.directRingUsers.length > 0) {
          setDirectRingType('users');
          setDirectTargets(onboarding.directRingUsers.map(userId => ({ userId })));
        } else if (onboarding.directRingExtensions && onboarding.directRingExtensions.length > 0) {
          setDirectRingType('extensions');
          setDirectTargets(onboarding.directRingExtensions.map(ext => ({ extension: ext })));
        }
      }
    }

    // Load available users with their extensions
    const users = mockDataService.users.getAll();
    const phones = mockDataService.phones.getByLocationId(locationId);
    
    // Create a map of userId to extension
    const userExtensionMap = new Map<string, string>();
    phones.forEach(phone => {
      if (phone.assignedUserId && phone.extension) {
        userExtensionMap.set(phone.assignedUserId, phone.extension);
      }
    });
    
    setAvailableUsers(users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      extension: userExtensionMap.get(user.id),
    })));

    // Load all available extensions from phones for this location
    const allExtensions = phones
      .map(phone => phone.extension)
      .filter((ext): ext is string => ext !== undefined && ext !== null)
      .filter((ext, index, self) => self.indexOf(ext) === index) // Remove duplicates
      .sort();
    setAvailableExtensions(allExtensions);
    
    // Find extensions that are not assigned to any user
    const extensionsWithUsers = new Set(Array.from(userExtensionMap.values()));
    const extensionsOnly = allExtensions.filter(ext => !extensionsWithUsers.has(ext));
    setExtensionsWithoutUsers(extensionsOnly);
  }, [locationId]);

  // Scroll to newly added option
  useEffect(() => {
    if (newlyAddedOptionId && optionRefs.current[newlyAddedOptionId]) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        optionRefs.current[newlyAddedOptionId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        setNewlyAddedOptionId(null);
      }, 100);
    }
  }, [newlyAddedOptionId, ivrOptions]);

  const getTargetDisplayValue = (target: { userId?: string; extension?: string }) => {
    if (target.userId) {
      const user = availableUsers.find(u => u.id === target.userId);
      if (user) {
        return `${user.name} (${user.email})${user.extension ? ` - ${user.extension}` : ''}`;
      }
    }
    if (target.extension) {
      return target.extension;
    }
    return '';
  };

  const addIVROption = () => {
    const optionNumber = String(ivrOptions.length + 1);
    const newOptionId = `ivr-${Date.now()}`;
    setIvrOptions([
      ...ivrOptions,
      {
        id: newOptionId,
        optionNumber,
        label: '',
        ringType: 'users',
        targets: [],
      },
    ]);
    setNewlyAddedOptionId(newOptionId);
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
    // Prepare direct routing data
    const directRingUsers = !hasIVR && directRingType === 'users' 
      ? directTargets.map(t => t.userId).filter(Boolean) 
      : undefined;
    const directRingExtensions = !hasIVR && directRingType === 'extensions'
      ? directTargets.map(t => t.extension).filter(Boolean)
      : undefined;

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
          directRingUsers,
          directRingExtensions,
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
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6 overflow-visible lg:space-y-8">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-900 lg:text-base">Call Flow Configuration</h3>
        <p className="text-xs text-slate-600 leading-relaxed lg:text-sm">
          Configure how calls are routed and handled
        </p>
      </div>

      <div className="space-y-5 lg:space-y-6">
        <div className="space-y-2">
          <Label htmlFor="greetingMessage" className="text-xs font-semibold text-slate-700 lg:text-sm">Greeting Message</Label>
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
              <Label htmlFor="ivrScript" className="text-xs font-semibold text-slate-700 lg:text-sm">
                IVR Script <span className="text-red-500">*</span>
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
                  <div
                    key={option.id}
                    ref={(el) => {
                      optionRefs.current[option.id] = el;
                    }}
                  >
                    <Card className="bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 shadow-sm rounded-xl lg:rounded-2xl">
                    <CardContent className="p-4 space-y-3 lg:p-5 lg:space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-slate-900 lg:text-base">Option {option.optionNumber}</h4>
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
                          <Label className="text-xs font-semibold text-slate-700 lg:text-sm">
                            Ring Type <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={option.ringType}
                            onValueChange={(value) =>
                              updateIVROption(option.id, 'ringType', value as 'users' | 'extensions')
                            }
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
                          <Label className="text-xs font-semibold text-slate-700 lg:text-sm">
                            Routing Targets <span className="text-red-500">*</span>
                          </Label>
                          <div className="space-y-2">
                            {option.targets.map((target, targetIndex) => (
                              <div key={targetIndex} className="flex gap-2">
                                {option.ringType === 'users' ? (
                                  <Select
                                    value={target.userId || target.extension || ''}
                                    onValueChange={(value) => {
                                      const updated = [...option.targets];
                                      // Check if it's a user ID or extension
                                      if (availableUsers.some(u => u.id === value)) {
                                        updated[targetIndex] = { userId: value };
                                      } else {
                                        updated[targetIndex] = { extension: value };
                                      }
                                      updateIVROption(option.id, 'targets', updated);
                                    }}
                                  >
                                    <SelectTrigger className="bg-background flex-1">
                                      <SelectValue placeholder="Select a user or extension">
                                        {getTargetDisplayValue(target)}
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectGroup>
                                        <SelectLabel>Users</SelectLabel>
                                        {availableUsers.map((user) => (
                                          <SelectItem key={user.id} value={user.id}>
                                            {user.name} ({user.email}){user.extension ? ` - ${user.extension}` : ''}
                                          </SelectItem>
                                        ))}
                                      </SelectGroup>
                                      {extensionsWithoutUsers.length > 0 && (
                                        <>
                                          <SelectSeparator />
                                          <SelectGroup>
                                            <SelectLabel>Extensions Only</SelectLabel>
                                            {extensionsWithoutUsers.map((ext) => (
                                              <SelectItem key={ext} value={ext}>
                                                {ext}
                                              </SelectItem>
                                            ))}
                                          </SelectGroup>
                                        </>
                                      )}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Select
                                    value={target.extension || ''}
                                    onValueChange={(value) => {
                                      const updated = [...option.targets];
                                      updated[targetIndex] = { ...target, extension: value };
                                      updateIVROption(option.id, 'targets', updated);
                                    }}
                                  >
                                    <SelectTrigger className="bg-background flex-1">
                                      <SelectValue placeholder="Select an extension" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableExtensions.map((ext) => (
                                        <SelectItem key={ext} value={ext}>
                                          {ext}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
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
                  </div>
                ))}
              </div>
            )}

            {/* Global IVR Settings (shown when IVR is enabled; outside options) */}
            <Card className="bg-gradient-to-br from-slate-50/50 to-slate-50/30 border border-slate-200/60 shadow-sm rounded-xl lg:rounded-2xl">
              <CardContent className="p-5 space-y-4 lg:p-6 lg:space-y-5">
                <h4 className="text-sm font-bold text-slate-900 lg:text-base">Global IVR Settings</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700 lg:text-sm">Retry Attempts</Label>
                    <Input
                      type="number"
                      min="0"
                      value={ivrRetryAttempts}
                      onChange={(e) => setIvrRetryAttempts(parseInt(e.target.value) || 0)}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700 lg:text-sm">Wait Time (seconds)</Label>
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
                  <Label className="text-xs font-semibold text-slate-700 lg:text-sm">Invalid Selection Script</Label>
                  <Textarea
                    value={ivrInvalidSelectionScript}
                    onChange={(e) => setIvrInvalidSelectionScript(e.target.value)}
                    placeholder="Invalid selection. Please try again..."
                    rows={2}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700 lg:text-sm">After Retry Routing</Label>
                  <Select value={ivrAfterRetriesTarget} onValueChange={setIvrAfterRetriesTarget}>
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
              <Label className="text-xs font-semibold text-slate-700 lg:text-sm">
                Direct Ring Type <span className="text-red-500">*</span>
              </Label>
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
              <Label className="text-xs font-semibold text-slate-700 lg:text-sm">
                Targets to Ring <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-2">
                {directTargets.map((target, index) => (
                  <div key={index} className="flex gap-2">
                    {directRingType === 'users' ? (
                      <Select
                        value={target.userId || target.extension || ''}
                        onValueChange={(value) => {
                          const updated = [...directTargets];
                          // Check if it's a user ID or extension
                          if (availableUsers.some(u => u.id === value)) {
                            updated[index] = { userId: value };
                          } else {
                            updated[index] = { extension: value };
                          }
                          setDirectTargets(updated);
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select a user or extension">
                            {getTargetDisplayValue(target)}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Users</SelectLabel>
                            {availableUsers.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name} ({user.email}){user.extension ? ` - ${user.extension}` : ''}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                          {extensionsWithoutUsers.length > 0 && (
                            <>
                              <SelectSeparator />
                              <SelectGroup>
                                <SelectLabel>Extensions Only</SelectLabel>
                                {extensionsWithoutUsers.map((ext) => (
                                  <SelectItem key={ext} value={ext}>
                                    {ext}
                                  </SelectItem>
                                ))}
                          </SelectGroup>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select
                        value={target.extension || ''}
                        onValueChange={(value) => {
                          const updated = [...directTargets];
                          updated[index] = { ...target, extension: value };
                          setDirectTargets(updated);
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select an extension" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableExtensions.map((ext) => (
                            <SelectItem key={ext} value={ext}>
                              {ext}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
          <Label htmlFor="voicemailScript" className="text-xs font-semibold text-slate-700 lg:text-sm">Voicemail Script</Label>
          <Textarea
            id="voicemailScript"
            value={voicemailScript}
            onChange={(e) => setVoicemailScript(e.target.value)}
            placeholder="Please leave a message after the tone..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-700 lg:text-sm">Shared Voicemail Users</Label>
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
