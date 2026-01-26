'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Info, Play } from 'lucide-react';
import { mockDataService } from '@/lib/mock-data/service';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CallQueueStepProps {
  locationId: string;
  onComplete: () => void;
  skipRules: any[];
}

export function CallQueueStep({ locationId, onComplete, skipRules }: CallQueueStepProps) {
  // Queue Settings
  const [maxDurationInQueue, setMaxDurationInQueue] = useState<string>('');
  const [enableQueueLimit, setEnableQueueLimit] = useState(false);
  const [enableQueueAnnouncement, setEnableQueueAnnouncement] = useState(true);
  const [announcePosition, setAnnouncePosition] = useState(true);
  const [announceWaitTime, setAnnounceWaitTime] = useState(true);
  const [enableQueueExitType, setEnableQueueExitType] = useState(true);
  const [queueExitType, setQueueExitType] = useState<'voicemail' | 'callback'>('voicemail');

  // Voicemail Settings
  const [enableVoicemail, setEnableVoicemail] = useState(true);
  const [voicemailKey, setVoicemailKey] = useState<string>('2');
  const [playDefaultVoicemailAudio, setPlayDefaultVoicemailAudio] = useState(false);
  const [voicemailAudio, setVoicemailAudio] = useState<string>('');
  const [voicemailSendTo, setVoicemailSendTo] = useState<string>('');

  // Callback Settings
  const [enableCallback, setEnableCallback] = useState(true);
  const [callbackKey, setCallbackKey] = useState<string>('3');
  const [playDefaultCallbackAudio, setPlayDefaultCallbackAudio] = useState(false);
  const [callbackMenuPrompt, setCallbackMenuPrompt] = useState<string>('');

  // Load existing data if available
  useEffect(() => {
    try {
      if (!mockDataService?.onboarding?.getByLocationId) {
        return;
      }
      
      const onboarding = mockDataService.onboarding.getByLocationId(locationId);
      if (!onboarding) {
        return;
      }
      
      const queue = (onboarding as any)?.callQueue;
      if (queue && typeof queue === 'object') {
        if (queue.maxDurationInQueue !== undefined) {
          setMaxDurationInQueue(String(queue.maxDurationInQueue));
        }
        if (queue.enableQueueLimit !== undefined) {
          setEnableQueueLimit(Boolean(queue.enableQueueLimit));
        }
        if (queue.enableQueueAnnouncement !== undefined) {
          setEnableQueueAnnouncement(Boolean(queue.enableQueueAnnouncement));
        }
        if (queue.announcePosition !== undefined) {
          setAnnouncePosition(Boolean(queue.announcePosition));
        }
        if (queue.announceWaitTime !== undefined) {
          setAnnounceWaitTime(Boolean(queue.announceWaitTime));
        }
        if (queue.enableQueueExitType !== undefined) {
          setEnableQueueExitType(Boolean(queue.enableQueueExitType));
        }
        if (queue.queueExitType) {
          setQueueExitType(queue.queueExitType);
        }
        
        if (queue.voicemail && typeof queue.voicemail === 'object') {
          if (queue.voicemail.enableVoicemail !== undefined) {
            setEnableVoicemail(Boolean(queue.voicemail.enableVoicemail));
          }
          if (queue.voicemail.key) {
            setVoicemailKey(String(queue.voicemail.key));
          }
          if (queue.voicemail.playDefaultAudio !== undefined) {
            setPlayDefaultVoicemailAudio(Boolean(queue.voicemail.playDefaultAudio));
          }
          if (queue.voicemail.audio) {
            setVoicemailAudio(String(queue.voicemail.audio));
          }
          if (queue.voicemail.sendTo) {
            setVoicemailSendTo(String(queue.voicemail.sendTo));
          }
        }
        
        if (queue.callback && typeof queue.callback === 'object') {
          if (queue.callback.enableCallback !== undefined) {
            setEnableCallback(Boolean(queue.callback.enableCallback));
          }
          if (queue.callback.key) {
            setCallbackKey(String(queue.callback.key));
          }
          if (queue.callback.playDefaultAudio !== undefined) {
            setPlayDefaultCallbackAudio(Boolean(queue.callback.playDefaultAudio));
          }
          if (queue.callback.menuPrompt) {
            setCallbackMenuPrompt(String(queue.callback.menuPrompt));
          }
        }
      }
    } catch (error) {
      console.warn('Error loading call queue data:', error);
    }
  }, [locationId]);

  const handleContinue = () => {
    // Build call queue configuration - only include enabled features
    const callQueueConfig: any = {
      maxDurationInQueue: maxDurationInQueue ? parseInt(maxDurationInQueue) : undefined,
      enableQueueLimit: enableQueueLimit,
    };

    // Only include announcement details if enabled
    if (enableQueueAnnouncement) {
      callQueueConfig.enableQueueAnnouncement = true;
      callQueueConfig.announcePosition = announcePosition;
      callQueueConfig.announceWaitTime = announceWaitTime;
    } else {
      callQueueConfig.enableQueueAnnouncement = false;
    }

    // Queue Exit Type Configuration - only include if enabled
    callQueueConfig.enableQueueExitType = enableQueueExitType;
    
    if (enableQueueExitType) {
      callQueueConfig.queueExitType = queueExitType;

      // Only include exit type details if the selected exit type's toggle is enabled
      if (queueExitType === 'voicemail') {
        if (enableVoicemail) {
          callQueueConfig.voicemail = {
            enableVoicemail: true,
            key: voicemailKey,
            playDefaultAudio: playDefaultVoicemailAudio,
            // Only include audio if not using default audio
            audio: playDefaultVoicemailAudio ? undefined : (voicemailAudio || undefined),
            sendTo: voicemailSendTo || undefined,
          };
        } else {
          callQueueConfig.voicemail = {
            enableVoicemail: false,
          };
        }
      } else if (queueExitType === 'callback') {
        if (enableCallback) {
          callQueueConfig.callback = {
            enableCallback: true,
            key: callbackKey,
            playDefaultAudio: playDefaultCallbackAudio,
            // Only include menu prompt if not using default audio
            menuPrompt: playDefaultCallbackAudio ? undefined : (callbackMenuPrompt || undefined),
          };
        } else {
          callQueueConfig.callback = {
            enableCallback: false,
          };
        }
      }
    } else {
      // If Queue Exit Type is disabled, don't include any exit type details
      callQueueConfig.queueExitType = undefined;
    }

    // Save call queue configuration
    console.log('Call Queue Config:', callQueueConfig);
    onComplete();
  };

  const dtmfKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '#'];
  
  // Mock audio files for selection
  const audioFiles = [
    { value: 'cellphone-ringing-64', label: 'cellphone-ringing-64...' },
    { value: 'default-greeting', label: 'Default Greeting' },
    { value: 'custom-audio-1', label: 'Custom Audio 1' },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Call Queue</h3>
          <p className="text-sm text-muted-foreground">
            Configure call queue settings including announcements and exit options
          </p>
        </div>

        {/* Queue Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Queue Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Max Duration in Queue */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Max Duration in Queue:</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={maxDurationInQueue}
                  onChange={(e) => setMaxDurationInQueue(e.target.value)}
                  placeholder="300"
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">Sec</span>
              </div>
            </div>

            {/* Enable Queue Limit */}
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Enable Queue Limit:</Label>
              <Switch
                checked={enableQueueLimit}
                onCheckedChange={setEnableQueueLimit}
                disabled={!maxDurationInQueue}
                className="shrink-0"
              />
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Limit the maximum number of callers that can be in the queue</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Enable Queue Announcement Options */}
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Enable Queue Announcement Options:</Label>
              <Switch
                checked={enableQueueAnnouncement}
                onCheckedChange={setEnableQueueAnnouncement}
                className="shrink-0"
              />
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enable announcements to callers about their position and wait time</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Announcement Type - Only shown and captured if enabled */}
            {enableQueueAnnouncement && (
              <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                <Label className="text-sm font-medium">Announcement Type:</Label>
                <div className="flex items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="announce-position"
                      checked={announcePosition}
                      onCheckedChange={(checked) => setAnnouncePosition(checked === true)}
                    />
                    <Label htmlFor="announce-position" className="font-normal text-sm cursor-pointer">
                      Position
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="announce-wait-time"
                      checked={announceWaitTime}
                      onCheckedChange={(checked) => setAnnounceWaitTime(checked === true)}
                    />
                    <Label htmlFor="announce-wait-time" className="font-normal text-sm cursor-pointer">
                      Wait Time
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Queue Exit Type configuration */}
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Queue Exit Type configuration:</Label>
              <Switch
                checked={enableQueueExitType}
                onCheckedChange={setEnableQueueExitType}
                className="shrink-0"
              />
            </div>

            {/* Queue Exit Type Tabs - Only shown if enabled */}
            {enableQueueExitType && (
              <div className="pl-4 border-l-2 border-primary/20">
                <Tabs value={queueExitType} onValueChange={(value) => setQueueExitType(value as 'voicemail' | 'callback')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="voicemail">Voicemail</TabsTrigger>
                    <TabsTrigger value="callback">Call Back</TabsTrigger>
                  </TabsList>

                  {/* Voicemail Tab */}
                  <TabsContent value="voicemail" className="space-y-6 mt-6">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Enable Voicemail:</Label>
                      <Switch
                        checked={enableVoicemail}
                        onCheckedChange={setEnableVoicemail}
                        className="shrink-0"
                      />
                    </div>

                    {enableVoicemail && (
                      <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Key to activate Voicemail:</Label>
                          <Select value={voicemailKey} onValueChange={setVoicemailKey}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {dtmfKeys.map((key) => (
                                <SelectItem key={key} value={key}>
                                  {key}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="play-default-voicemail"
                            checked={playDefaultVoicemailAudio}
                            onCheckedChange={(checked) => setPlayDefaultVoicemailAudio(checked === true)}
                          />
                          <Label htmlFor="play-default-voicemail" className="font-normal text-sm cursor-pointer">
                            Play default audio
                          </Label>
                        </div>

                        {!playDefaultVoicemailAudio && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">
                                Voicemail Audio <span className="text-destructive">*</span>:
                              </Label>
                              <Select value={voicemailAudio} onValueChange={setVoicemailAudio}>
                                <SelectTrigger className="w-64">
                                  <SelectValue placeholder="Select audio" />
                                </SelectTrigger>
                                <SelectContent>
                                  {audioFiles.map((file) => (
                                    <SelectItem key={file.value} value={file.value}>
                                      {file.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {voicemailAudio && (
                              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                                  <div className="h-full bg-primary w-0" />
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Play className="h-3 w-3" />
                                </Button>
                                <span className="text-xs text-muted-foreground">0m 0s</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Send To:</Label>
                          <Input
                            value={voicemailSendTo}
                            onChange={(e) => setVoicemailSendTo(e.target.value)}
                            placeholder="Email address or extension"
                            className="w-64"
                          />
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Call Back Tab */}
                  <TabsContent value="callback" className="space-y-6 mt-6">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Enable Call Back:</Label>
                      <Switch
                        checked={enableCallback}
                        onCheckedChange={setEnableCallback}
                        className="shrink-0"
                      />
                    </div>

                    {enableCallback && (
                      <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Key to activate Callback:</Label>
                          <Select value={callbackKey} onValueChange={setCallbackKey}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {dtmfKeys.map((key) => (
                                <SelectItem key={key} value={key}>
                                  {key}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="play-default-callback"
                            checked={playDefaultCallbackAudio}
                            onCheckedChange={(checked) => setPlayDefaultCallbackAudio(checked === true)}
                          />
                          <Label htmlFor="play-default-callback" className="font-normal text-sm cursor-pointer">
                            Play default audio
                          </Label>
                        </div>

                        {!playDefaultCallbackAudio && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">
                                Callback Menu Prompt <span className="text-destructive">*</span>:
                              </Label>
                              <Select value={callbackMenuPrompt} onValueChange={setCallbackMenuPrompt}>
                                <SelectTrigger className="w-64">
                                  <SelectValue placeholder="Select audio" />
                                </SelectTrigger>
                                <SelectContent>
                                  {audioFiles.map((file) => (
                                    <SelectItem key={file.value} value={file.value}>
                                      {file.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {callbackMenuPrompt && (
                              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                                  <div className="h-full bg-primary w-0" />
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Play className="h-3 w-3" />
                                </Button>
                                <span className="text-xs text-muted-foreground">0m 0s</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
