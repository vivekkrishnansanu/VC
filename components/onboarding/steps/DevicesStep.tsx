'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PhoneBrand, PhoneOwnership, PhoneAssignmentType } from '@/lib/mock-data/types';
import { mockDataService } from '@/lib/mock-data/service';
import { Plus, X, AlertTriangle, Info, HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const deviceSchema = z.object({
  totalDevices: z.number().min(1, 'At least one device is required'),
  assignmentStrategy: z.nativeEnum(PhoneAssignmentType).optional(),
});

type DeviceFormData = z.infer<typeof deviceSchema>;

interface Device {
  id: string;
  brand: PhoneBrand;
  model: string;
  ownership: PhoneOwnership;
  assignmentType: PhoneAssignmentType;
  assignedUserId?: string;
  userFirstName?: string;
  userLastName?: string;
  userEmail?: string;
  macAddress?: string;
  serialNumber?: string;
  extension?: string;
  isUnsupported: boolean;
}

interface DevicesStepProps {
  locationId: string;
  onComplete: () => void;
  skipRules: any[];
}

export function DevicesStep({ locationId, onComplete, skipRules }: DevicesStepProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [supportedModels, setSupportedModels] = useState<Record<PhoneBrand, string[]>>({} as any);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [newDevice, setNewDevice] = useState<Partial<Device>>({
    brand: PhoneBrand.YEALINK,
    ownership: PhoneOwnership.OWNED,
    assignmentType: PhoneAssignmentType.ASSIGNED_TO_USER,
    isUnsupported: false,
  });
  const [deviceValidation, setDeviceValidation] = useState<{ isSupported: boolean; message?: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      totalDevices: 1,
      assignmentStrategy: undefined,
    },
  });

  useEffect(() => {
    // Load existing devices and onboarding data
    const existingPhones = mockDataService.phones.getByLocationId(locationId);
    const onboarding = mockDataService.onboarding.getByLocationId(locationId);

    // Set form defaults
    if (onboarding?.totalDevices) {
      setValue('totalDevices', onboarding.totalDevices);
    } else if (existingPhones.length > 0) {
      setValue('totalDevices', existingPhones.length);
    }

    if (onboarding?.assignmentStrategy) {
      setValue('assignmentStrategy', onboarding.assignmentStrategy);
    }

    // Load existing devices
    if (existingPhones.length > 0) {
      setDevices(existingPhones.map(phone => ({
        id: phone.id,
        brand: phone.brand,
        model: phone.model,
        ownership: phone.ownership,
        assignmentType: phone.assignmentType,
        assignedUserId: phone.assignedUserId,
        macAddress: phone.macAddress || '',
        serialNumber: phone.serialNumber || '',
        extension: phone.extension || '',
        isUnsupported: phone.isUnsupported,
      })));
    }

    // Load supported models
    Object.values(PhoneBrand).forEach(brand => {
      fetch(`/api/devices/validate?brand=${brand}`)
        .then(res => res.json())
        .then(data => {
          setSupportedModels(prev => ({
            ...prev,
            [brand]: data.models?.map((m: any) => m.model) || [],
          }));
        })
        .catch(() => {
          // Silently fail - supported models will be empty
        });
    });
  }, [locationId, setValue]);

  const assignmentStrategy = watch('assignmentStrategy');
  const shouldSkipUserDetails = skipRules.some(rule => 
    rule.field === 'userDetails' && rule.shouldSkip
  );

  const validateDevice = async (brand: PhoneBrand, model: string) => {
    try {
      const response = await fetch('/api/devices/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, model }),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      return { isValid: false, isSupported: false };
    }
  };

  const handleAddDevice = async () => {
    if (!newDevice.brand || !newDevice.model || newDevice.model === 'Other') return;

    // Use existing validation if available, otherwise validate
    const validation =
      deviceValidation ?? (await validateDevice(newDevice.brand, newDevice.model));
    const isSupported = Boolean(validation?.isSupported);
    
    const device: Device = {
      id: `device-${Date.now()}`,
      brand: newDevice.brand,
      model: newDevice.model,
      ownership: newDevice.ownership || PhoneOwnership.OWNED,
      assignmentType: newDevice.assignmentType || PhoneAssignmentType.ASSIGNED_TO_USER,
      userFirstName: newDevice.userFirstName,
      userLastName: newDevice.userLastName,
      userEmail: newDevice.userEmail,
      macAddress: newDevice.macAddress,
      serialNumber: newDevice.serialNumber,
      extension: newDevice.extension,
      isUnsupported: !isSupported,
    };

    setDevices([...devices, device]);
    setValue('totalDevices', devices.length + 1);
    
    // Reset form
    setNewDevice({
      brand: PhoneBrand.YEALINK,
      ownership: PhoneOwnership.OWNED,
      assignmentType: PhoneAssignmentType.ASSIGNED_TO_USER,
      isUnsupported: false,
    });
    setDeviceValidation(null);
    setShowAddDevice(false);
  };

  const handleRemoveDevice = (id: string) => {
    setDevices(devices.filter(d => d.id !== id));
    setValue('totalDevices', devices.length - 1);
  };

  const onSubmit = async (data: DeviceFormData) => {
    console.log('Saving devices:', { ...data, devices });
    onComplete();
  };

  const unsupportedDevices = devices.filter(d => d.isUnsupported);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 overflow-visible">
      {unsupportedDevices.length > 0 && (
        <Alert variant="destructive" className="border-2 border-destructive/50 shadow-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            {unsupportedDevices.length} unsupported device(s) detected. These require approval before submission.
          </AlertDescription>
        </Alert>
      )}

      {/* Form Sections */}
      <div className="space-y-6">
        {/* Device Overview Section */}
        <Card className="border-2 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Device Overview</CardTitle>
            <CardDescription>
              Configure the total number of devices and assignment strategy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="totalDevices" className="text-sm font-medium">
                Total Number of Devices <span className="text-destructive">*</span>
              </Label>
              <Input
                id="totalDevices"
                type="number"
                min="1"
                {...register('totalDevices', { valueAsNumber: true })}
                className="h-10"
              />
              {errors.totalDevices && (
                <p className="text-sm text-destructive mt-1">{errors.totalDevices.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="assignmentStrategy" className="text-sm font-medium">
                  Assignment Strategy
                </Label>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="h-5 w-5">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assignment Strategy</DialogTitle>
                      <DialogDescription>
                        <div className="space-y-2 mt-4">
                          <div>
                            <strong>Assigned to User:</strong> Phone is tied to a specific user. Benefits include personal voicemail, call history, and user-specific settings.
                          </div>
                          <div>
                            <strong>Assigned to Extension:</strong> Phone is tied to an extension number. Limitations include shared voicemail and less personalization.
                          </div>
                          <div>
                            <strong>Common Phone:</strong> Shared phone not assigned to a specific user or extension.
                          </div>
                        </div>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="relative z-0">
                <Select
                value={assignmentStrategy || ''}
                onValueChange={(value) => setValue('assignmentStrategy', value as PhoneAssignmentType)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select assignment strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PhoneAssignmentType.ASSIGNED_TO_USER}>
                    Assigned to User (Recommended)
                  </SelectItem>
                  <SelectItem value={PhoneAssignmentType.ASSIGNED_TO_EXTENSION}>
                    Assigned to Extension
                  </SelectItem>
                  <SelectItem value={PhoneAssignmentType.COMMON}>
                    Common Phone
                  </SelectItem>
                </SelectContent>
              </Select>
              </div>
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Devices List Section */}
        <Card className="border-2 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Devices</CardTitle>
                <CardDescription>
                  {devices.length} device{devices.length !== 1 ? 's' : ''} added
                </CardDescription>
              </div>
              <Button type="button" onClick={() => setShowAddDevice(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Device
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">

          {devices.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No devices added yet. Click &quot;Add Device&quot; to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {devices.map((device, index) => (
                <Card key={device.id} className={device.isUnsupported ? 'border-destructive' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Device {index + 1}
                        {device.isUnsupported && (
                          <Badge variant="destructive" className="ml-2">
                            Unsupported
                          </Badge>
                        )}
                      </CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDevice(device.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Brand</Label>
                        <p className="font-medium">{device.brand}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Model</Label>
                        <p className="font-medium">{device.model}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Ownership</Label>
                        <p className="font-medium">{device.ownership}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Assignment</Label>
                        <p className="font-medium">{device.assignmentType.replace('_', ' ')}</p>
                      </div>
                      {device.macAddress && (
                        <div>
                          <Label className="text-xs text-muted-foreground">MAC Address</Label>
                          <p className="font-medium">{device.macAddress}</p>
                        </div>
                      )}
                      {device.extension && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Extension</Label>
                          <p className="font-medium">{device.extension}</p>
                        </div>
                      )}
                    </div>
                    {device.isUnsupported && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          This device model is not supported. You can either purchase a supported device through us or choose a different model.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
          </CardContent>
        </Card>

        {/* Add Device Dialog */}
        <Dialog open={showAddDevice} onOpenChange={(open) => {
          setShowAddDevice(open);
          if (!open) {
            // Reset form when closing
            setNewDevice({
              brand: PhoneBrand.YEALINK,
              ownership: PhoneOwnership.OWNED,
              assignmentType: PhoneAssignmentType.ASSIGNED_TO_USER,
              isUnsupported: false,
            });
            setDeviceValidation(null);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Add New Device</DialogTitle>
              <DialogDescription>
                Fill in the device information below
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 overflow-visible">
              {/* Basic Device Information */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-3">Device Information</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Brand *</Label>
                  <div className="relative z-0">
                    <Select
                    value={newDevice.brand || ''}
                    onValueChange={(value) => {
                      setNewDevice({ ...newDevice, brand: value as PhoneBrand, model: '' });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(PhoneBrand).map(brand => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Model *</Label>
                  <div className="relative z-0">
                    <Select
                    value={newDevice.model || ''}
                    onValueChange={async (value) => {
                      setNewDevice({ ...newDevice, model: value });
                      // Validate device in real-time
                      if (newDevice.brand && value && value !== 'Other') {
                        const validation = await validateDevice(newDevice.brand, value);
                        setDeviceValidation(validation);
                      } else {
                        setDeviceValidation(null);
                      }
                    }}
                    disabled={!newDevice.brand}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {newDevice.brand && supportedModels[newDevice.brand]?.map(model => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {deviceValidation && !deviceValidation.isSupported && (
                    <Alert variant="destructive" className="mt-2 border-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="font-medium">
                        This device model is not supported. You can either purchase a supported device through us or choose a different model.
                      </AlertDescription>
                    </Alert>
                  )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Ownership *</Label>
                  <div className="relative z-0">
                    <Select
                    value={newDevice.ownership || ''}
                    onValueChange={(value) => setNewDevice({ ...newDevice, ownership: value as PhoneOwnership })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PhoneOwnership.OWNED}>Owned</SelectItem>
                      <SelectItem value={PhoneOwnership.LEASED}>Leased</SelectItem>
                    </SelectContent>
                  </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Assignment Type *</Label>
                  <div className="relative z-0">
                    <Select
                    value={newDevice.assignmentType || ''}
                    onValueChange={(value) => setNewDevice({ ...newDevice, assignmentType: value as PhoneAssignmentType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PhoneAssignmentType.ASSIGNED_TO_USER}>
                        Assigned to User
                      </SelectItem>
                      <SelectItem value={PhoneAssignmentType.ASSIGNED_TO_EXTENSION}>
                        Assigned to Extension
                      </SelectItem>
                      <SelectItem value={PhoneAssignmentType.COMMON}>
                        Common Phone
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  </div>
                </div>
                </div>
              </div>

              {/* User Information - Only show if assigned to user */}
              {newDevice.assignmentType === PhoneAssignmentType.ASSIGNED_TO_USER && (
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-3">User Information</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input
                        value={newDevice.userFirstName || ''}
                        onChange={(e) => setNewDevice({ ...newDevice, userFirstName: e.target.value })}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        value={newDevice.userLastName || ''}
                        onChange={(e) => setNewDevice({ ...newDevice, userLastName: e.target.value })}
                        placeholder="Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={newDevice.userEmail || ''}
                        onChange={(e) => setNewDevice({ ...newDevice, userEmail: e.target.value })}
                        placeholder="john.doe@example.com"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Device Details */}
              <div className="space-y-4 border-t pt-4">
                <div>
                  <h4 className="text-sm font-semibold mb-3">Device Details</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>MAC Address</Label>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6">
                            <Info className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>MAC Address</DialogTitle>
                            <DialogDescription>
                              The MAC (Media Access Control) address is a unique identifier for your device.
                              It&apos;s usually found on a label on the device or in the device settings.
                              Format: XX:XX:XX:XX:XX:XX
                            </DialogDescription>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Input
                      value={newDevice.macAddress || ''}
                      onChange={(e) => setNewDevice({ ...newDevice, macAddress: e.target.value })}
                      placeholder="00:15:5D:01:01:01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Serial Number</Label>
                    <Input
                      value={newDevice.serialNumber || ''}
                      onChange={(e) => setNewDevice({ ...newDevice, serialNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Extension</Label>
                    <Input
                      value={newDevice.extension || ''}
                      onChange={(e) => setNewDevice({ ...newDevice, extension: e.target.value })}
                      placeholder="1001"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddDevice(false)} 
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={handleAddDevice} 
                  className="w-full sm:w-auto"
                  disabled={!newDevice.brand || !newDevice.model || newDevice.model === 'Other'}
                >
                  Add Device
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </form>
  );
}
