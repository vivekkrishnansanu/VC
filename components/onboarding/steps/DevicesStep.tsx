'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { PhoneBrand, DeviceOwnership, PhoneAssignmentType, DeviceType } from '@/lib/mock-data/types';
import { mockDataService } from '@/lib/mock-data/service';
import { Plus, Edit2, X, AlertTriangle, Info, Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const deviceOwnershipSchema = z.object({
  deviceOwnership: z.nativeEnum(DeviceOwnership, {
    required_error: 'Please select an option',
  }),
  hasYealinkOrPolycom: z.boolean().optional(),
  buyPhonesThroughVoiceStack: z.boolean().optional(),
});

type DeviceOwnershipFormData = z.infer<typeof deviceOwnershipSchema>;

interface Device {
  id: string;
  brand: PhoneBrand;
  model: string;
  deviceTypes?: DeviceType[];
  assignmentType: PhoneAssignmentType;
  assignedUserId?: string;
  userFirstName?: string;
  userLastName?: string;
  userEmail?: string;
  macAddress?: string;
  serialNumber?: string;
  extension?: string;
  isUnsupported: boolean;
  enableUserDetection?: boolean;
  hasWarnings?: boolean;
  warningReason?: string;
}

interface DevicesStepProps {
  locationId: string;
  onComplete: () => void;
  skipRules: any[];
}

export function DevicesStep({ locationId, onComplete, skipRules }: DevicesStepProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceOwnership, setDeviceOwnership] = useState<DeviceOwnership | undefined>(undefined);
  const [hasYealinkOrPolycom, setHasYealinkOrPolycom] = useState<boolean | undefined>(undefined);
  const [buyPhonesThroughVoiceStack, setBuyPhonesThroughVoiceStack] = useState<boolean | undefined>(undefined);
  const [deviceCatalogSelections, setDeviceCatalogSelections] = useState<any[]>([]);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [supportedModels, setSupportedModels] = useState<Record<PhoneBrand, string[]>>({} as any);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DeviceOwnershipFormData>({
    resolver: zodResolver(deviceOwnershipSchema),
    defaultValues: {
      deviceOwnership: undefined,
      hasYealinkOrPolycom: undefined,
      buyPhonesThroughVoiceStack: undefined,
    },
  });

  const onboarding = mockDataService.onboarding.getByLocationId(locationId);

  useEffect(() => {
    // Load existing onboarding data
    if (onboarding) {
      setDeviceOwnership(onboarding.deviceOwnership);
      setHasYealinkOrPolycom(onboarding.hasYealinkOrPolycom);
      setBuyPhonesThroughVoiceStack(onboarding.buyPhonesThroughVoiceStack);
      setDeviceCatalogSelections(onboarding.deviceCatalogSelections || []);
      if (onboarding.deviceOwnership) {
        setValue('deviceOwnership', onboarding.deviceOwnership);
      }
      if (onboarding.hasYealinkOrPolycom !== undefined) {
        setValue('hasYealinkOrPolycom', onboarding.hasYealinkOrPolycom);
      }
      if (onboarding.buyPhonesThroughVoiceStack !== undefined) {
        setValue('buyPhonesThroughVoiceStack', onboarding.buyPhonesThroughVoiceStack);
      }
    }

    // Load existing devices
    const existingPhones = mockDataService.phones.getByLocationId(locationId);
    if (existingPhones.length > 0) {
      setDevices(existingPhones.map(phone => ({
        id: phone.id,
        brand: phone.brand,
        model: phone.model,
        deviceTypes: phone.deviceTypes || [],
        assignmentType: phone.assignmentType,
        assignedUserId: phone.assignedUserId,
        macAddress: phone.macAddress || '',
        serialNumber: phone.serialNumber || '',
        extension: phone.extension || '',
        isUnsupported: phone.isUnsupported,
        enableUserDetection: phone.enableUserDetection || false,
        hasWarnings: phone.hasWarnings,
        warningReason: phone.warningReason,
      })));
    }

    // Load supported models
    Object.values(PhoneBrand).forEach(brand => {
      if (brand === PhoneBrand.YEALINK || brand === PhoneBrand.POLYCOM) {
        fetch(`/api/devices/validate?brand=${brand}`)
          .then(res => res.json())
          .then(data => {
            setSupportedModels(prev => ({
              ...prev,
              [brand]: data.models?.map((m: any) => m.model) || [],
            }));
          })
          .catch(() => {});
      }
    });
  }, [locationId, setValue]);

  // Determine if device section should be shown
  const showDeviceSection = 
    deviceOwnership === DeviceOwnership.OWNED && hasYealinkOrPolycom === true;

  // Determine if manual device entry is allowed
  const allowManualEntry = 
    (deviceOwnership === DeviceOwnership.OWNED && hasYealinkOrPolycom === true) ||
    (deviceOwnership === DeviceOwnership.NOT_OWNED && buyPhonesThroughVoiceStack === false) ||
    (deviceOwnership === DeviceOwnership.OWNED && hasYealinkOrPolycom === false && buyPhonesThroughVoiceStack === false);

  // Determine if devices are VoiceStack-managed (disabled)
  const isVoiceStackManaged = buyPhonesThroughVoiceStack === true;

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

  const handleSaveDeviceOwnership = async (data: DeviceOwnershipFormData) => {
    await fetch('/api/onboarding/data', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locationId,
        patch: {
          deviceOwnership: data.deviceOwnership,
          hasYealinkOrPolycom: data.hasYealinkOrPolycom,
          buyPhonesThroughVoiceStack: data.buyPhonesThroughVoiceStack,
        },
      }),
    });

    // If buying through VoiceStack, trigger catalog approval
    if (data.buyPhonesThroughVoiceStack === true) {
      // This would trigger approval workflow
      // For now, just save the catalog selections
    }
  };

  const handleAddDevice = async (deviceData: Partial<Device>) => {
    if (!deviceData.brand || !deviceData.model) return;

    const validation = await validateDevice(deviceData.brand, deviceData.model);
    const isSupported = Boolean(validation?.isSupported);

    const device: Device = {
      id: editingDevice?.id || `device-${Date.now()}`,
      brand: deviceData.brand,
      model: deviceData.model,
      deviceTypes: deviceData.deviceTypes || [],
      assignmentType: deviceData.assignmentType || PhoneAssignmentType.ASSIGNED_TO_USER,
      assignedUserId: deviceData.assignedUserId,
      macAddress: deviceData.macAddress || '',
      serialNumber: deviceData.serialNumber || '',
      extension: deviceData.extension || '',
      isUnsupported: !isSupported,
      enableUserDetection: deviceData.enableUserDetection || false,
      hasWarnings: false,
      warningReason: undefined,
    };

    // Check for warnings
    const warnings: string[] = [];
    if (!device.deviceTypes || device.deviceTypes.length === 0) {
      warnings.push('Device type(s) not selected');
    }
    if (device.assignmentType === PhoneAssignmentType.ASSIGNED_TO_USER && !device.assignedUserId) {
      warnings.push('User assignment missing');
    }
    if (device.assignmentType === PhoneAssignmentType.ASSIGNED_TO_EXTENSION && !device.extension) {
      warnings.push('Extension assignment missing');
    }
    if (warnings.length > 0) {
      device.hasWarnings = true;
      device.warningReason = warnings.join('; ');
    }

    if (editingDevice) {
      setDevices(devices.map(d => d.id === editingDevice.id ? device : d));
    } else {
      setDevices([...devices, device]);
    }

    setEditingDevice(null);
    setShowAddDevice(false);
  };

  const handleRemoveDevice = (id: string) => {
    setDevices(devices.filter(d => d.id !== id));
  };

  const onSubmit = async (data: DeviceOwnershipFormData) => {
    await handleSaveDeviceOwnership(data);
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 overflow-visible">
      {/* Device Ownership Section */}
      <Card className="bg-gradient-to-br from-card to-card/50 border-border/60">
        <CardContent className="p-6 space-y-5">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">Device Ownership</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Do you own the devices for this location?
            </p>
          </div>
        <div className="space-y-4">
          <RadioGroup
            value={deviceOwnership || ''}
            onValueChange={(value) => {
              const ownership = value as DeviceOwnership;
              setDeviceOwnership(ownership);
              setValue('deviceOwnership', ownership, { shouldValidate: true });
              // Reset dependent fields
              if (ownership === DeviceOwnership.NOT_OWNED) {
                setHasYealinkOrPolycom(undefined);
                setValue('hasYealinkOrPolycom', undefined);
              }
            }}
            className="grid gap-3 pt-1"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem id="ownership-owned" value={DeviceOwnership.OWNED} />
              <Label htmlFor="ownership-owned" className="font-normal text-sm">
                Yes, I own the devices
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="ownership-not-owned" value={DeviceOwnership.NOT_OWNED} />
              <Label htmlFor="ownership-not-owned" className="font-normal text-sm">
                No, I do not own the devices
              </Label>
            </div>
          </RadioGroup>
          {errors.deviceOwnership && (
            <p className="text-xs text-destructive mt-1 font-medium">{errors.deviceOwnership.message}</p>
          )}
        </div>
        </CardContent>
      </Card>

      {/* Yealink/Polycom Question (if owned) */}
      {deviceOwnership === DeviceOwnership.OWNED && (
        <Card className="bg-gradient-to-br from-card to-card/50 border-border/60">
          <CardContent className="p-6 space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">Device Brand</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Do you have Yealink or Polycom phones?
              </p>
            </div>
          <div className="space-y-4">
            <RadioGroup
              value={hasYealinkOrPolycom === true ? 'yes' : hasYealinkOrPolycom === false ? 'no' : ''}
              onValueChange={(value) => {
                const has = value === 'yes';
                setHasYealinkOrPolycom(has);
                setValue('hasYealinkOrPolycom', has, { shouldValidate: true });
                if (!has) {
                  // Force purchase decision
                  setBuyPhonesThroughVoiceStack(undefined);
                  setValue('buyPhonesThroughVoiceStack', undefined);
                }
              }}
              className="grid gap-3 pt-1"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem id="has-yealink-yes" value="yes" />
                <Label htmlFor="has-yealink-yes" className="font-normal text-sm">
                  Yes
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem id="has-yealink-no" value="no" />
                <Label htmlFor="has-yealink-no" className="font-normal text-sm">
                  No
                </Label>
              </div>
            </RadioGroup>
            {errors.hasYealinkOrPolycom && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.hasYealinkOrPolycom.message}</p>
            )}
          </div>
          </CardContent>
        </Card>
      )}

      {/* Purchase Decision (if not owned OR no Yealink/Polycom) */}
      {(deviceOwnership === DeviceOwnership.NOT_OWNED || 
        (deviceOwnership === DeviceOwnership.OWNED && hasYealinkOrPolycom === false)) && (
        <Card className="bg-gradient-to-br from-card to-card/50 border-border/60">
          <CardContent className="p-6 space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">Purchase Decision</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Do you want to buy phones through VoiceStack?
              </p>
            </div>
          <div className="space-y-4">
            <RadioGroup
              value={buyPhonesThroughVoiceStack === true ? 'yes' : buyPhonesThroughVoiceStack === false ? 'no' : ''}
              onValueChange={(value) => {
                const buy = value === 'yes';
                setBuyPhonesThroughVoiceStack(buy);
                setValue('buyPhonesThroughVoiceStack', buy, { shouldValidate: true });
                if (buy) {
                  // Clear manual devices when switching to catalog
                  setDevices([]);
                }
              }}
              className="grid gap-3 pt-1"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem id="buy-yes" value="yes" />
                <Label htmlFor="buy-yes" className="font-normal text-sm">
                  Yes
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem id="buy-no" value="no" />
                <Label htmlFor="buy-no" className="font-normal text-sm">
                  No
                </Label>
              </div>
            </RadioGroup>
            {errors.buyPhonesThroughVoiceStack && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.buyPhonesThroughVoiceStack.message}</p>
            )}

            {buyPhonesThroughVoiceStack === true && (
              <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  VoiceStack team will add device details. You cannot edit devices when purchasing through VoiceStack.
                </AlertDescription>
              </Alert>
            )}
          </div>
          </CardContent>
        </Card>
      )}

      {/* Warning if devices not owned */}
      {deviceOwnership === DeviceOwnership.NOT_OWNED && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-sm font-medium text-amber-900 dark:text-amber-100">
            Devices will be provided or purchased. You will not be able to add device details manually.
          </AlertDescription>
        </Alert>
      )}

      {/* Device Section (only if manual entry allowed) */}
      {allowManualEntry && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">Devices</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {devices.length} device{devices.length !== 1 ? 's' : ''} added
              </p>
            </div>
            {!isVoiceStackManaged && (
              <Button 
                type="button" 
                size="default"
                onClick={() => {
                  setEditingDevice(null);
                  setShowAddDevice(true);
                }}
                className="shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Device
              </Button>
            )}
          </div>

          {devices.length === 0 ? (
            <div className="p-8 text-center border rounded-lg">
              <p className="text-sm text-muted-foreground">
                No devices added yet. Click &quot;Add Device&quot; to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {devices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onEdit={() => {
                    setEditingDevice(device);
                    setShowAddDevice(true);
                  }}
                  onRemove={() => handleRemoveDevice(device.id)}
                  disabled={isVoiceStackManaged}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Device Dialog */}
      <DeviceDialog
        open={showAddDevice}
        onOpenChange={(open) => {
          setShowAddDevice(open);
          if (!open) {
            setEditingDevice(null);
          }
        }}
        device={editingDevice}
        supportedModels={supportedModels}
        onSave={handleAddDevice}
      />
    </form>
  );
}

// Device Card Component
interface DeviceCardProps {
  device: Device;
  onEdit: () => void;
  onRemove: () => void;
  disabled?: boolean;
}

function DeviceCard({ device, onEdit, onRemove, disabled }: DeviceCardProps) {
  const isUnsupported = device.brand !== PhoneBrand.YEALINK && device.brand !== PhoneBrand.POLYCOM;

  return (
    <Card className={cn(
      'relative transition-all duration-200',
      'bg-gradient-to-br from-card to-card/50 backdrop-blur-sm',
      'border-border/60 hover:border-primary/30 hover:shadow-lg',
      device.isUnsupported && 'border-red-500/50 bg-red-50/50 dark:bg-red-900/10',
      device.hasWarnings && 'border-[#F0C94F] bg-[#FFFDEB]',
      disabled && 'opacity-60 cursor-not-allowed'
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold flex items-center gap-2 mb-2">
              <span className="truncate">{device.brand} {device.model}</span>
              {device.isUnsupported && (
                <Badge variant="destructive" className="text-xs font-semibold shrink-0">
                  Unsupported
                </Badge>
              )}
              {device.hasWarnings && !device.isUnsupported && (
                <Badge className="text-xs font-semibold shrink-0 bg-[#FFFDEB] text-[#92400E] border-2 border-[#F0C94F]">
                  Warning
                </Badge>
              )}
            </CardTitle>
            {device.warningReason && (
              <Alert variant="warning" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <p className="text-xs font-medium">{device.warningReason}</p>
                </AlertDescription>
              </Alert>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {disabled && (
              <div className="p-2 rounded-lg bg-muted">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            {!disabled && (
              <>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={onEdit}
                  className="h-8 w-8 p-0 hover:bg-primary/10"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={onRemove}
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {device.deviceTypes && device.deviceTypes.length > 0 && (
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-2 block">Device Types</Label>
            <div className="flex flex-wrap gap-2">
              {device.deviceTypes.map(type => (
                <Badge key={type} variant="outline" className="text-xs font-medium bg-primary/5 border-primary/20">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Assignment</Label>
            <p className="text-sm font-medium text-foreground">
              {device.assignmentType === PhoneAssignmentType.ASSIGNED_TO_USER ? 'Assign to User' : 'Assign to Extension'}
            </p>
          </div>
          {device.extension && (
            <div className="p-3 rounded-lg bg-muted/50">
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Extension</Label>
              <p className="text-sm font-medium text-foreground">{device.extension}</p>
            </div>
          )}
          {device.enableUserDetection && (
            <div className="p-3 rounded-lg bg-muted/50">
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">User Detection</Label>
              <p className="text-sm font-medium text-foreground">Enabled</p>
            </div>
          )}
          {device.macAddress && (
            <div className="p-3 rounded-lg bg-muted/50">
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">MAC Address</Label>
              <p className="text-sm font-medium text-foreground font-mono">{device.macAddress}</p>
            </div>
          )}
        </div>
        {isUnsupported && (
          <Alert variant="destructive" className="mt-2 border-red-500/50 bg-red-50 dark:bg-red-900/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs font-medium">
              {device.brand} is not a supported brand. Only Yealink and Polycom are supported.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// Device Dialog Component
interface DeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: Device | null;
  supportedModels: Record<PhoneBrand, string[]>;
  onSave: (device: Partial<Device>) => void;
}

function DeviceDialog({ open, onOpenChange, device, supportedModels, onSave }: DeviceDialogProps) {
  const [brand, setBrand] = useState<PhoneBrand>(device?.brand || PhoneBrand.YEALINK);
  const [model, setModel] = useState<string>(device?.model || '');
  const [modelText, setModelText] = useState<string>('');
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>(device?.deviceTypes || []);
  const [assignmentType, setAssignmentType] = useState<PhoneAssignmentType>(
    device?.assignmentType || PhoneAssignmentType.ASSIGNED_TO_USER
  );
  const [userFirstName, setUserFirstName] = useState<string>(device?.userFirstName || '');
  const [userLastName, setUserLastName] = useState<string>(device?.userLastName || '');
  const [userEmail, setUserEmail] = useState<string>(device?.userEmail || '');
  const [extension, setExtension] = useState<string>(device?.extension || '');
  const [enableUserDetection, setEnableUserDetection] = useState<boolean>(device?.enableUserDetection || false);
  const [macAddress, setMacAddress] = useState<string>(device?.macAddress || '');
  const [serialNumber, setSerialNumber] = useState<string>(device?.serialNumber || '');

  const isOtherBrand = brand === PhoneBrand.OTHER;
  const isSupportedBrand = brand === PhoneBrand.YEALINK || brand === PhoneBrand.POLYCOM;

  useEffect(() => {
    if (device) {
      setBrand(device.brand);
      setModel(device.model);
      setModelText(device.model);
      setDeviceTypes(device.deviceTypes || []);
      setAssignmentType(device.assignmentType);
      setUserFirstName(device.userFirstName || '');
      setUserLastName(device.userLastName || '');
      setUserEmail(device.userEmail || '');
      setExtension(device.extension || '');
      setEnableUserDetection(device.enableUserDetection || false);
      setMacAddress(device.macAddress || '');
      setSerialNumber(device.serialNumber || '');
    } else {
      // Reset form
      setBrand(PhoneBrand.YEALINK);
      setModel('');
      setModelText('');
      setDeviceTypes([]);
      setAssignmentType(PhoneAssignmentType.ASSIGNED_TO_USER);
      setUserFirstName('');
      setUserLastName('');
      setUserEmail('');
      setExtension('');
      setEnableUserDetection(false);
      setMacAddress('');
      setSerialNumber('');
    }
  }, [device, open]);

  const handleSave = () => {
    const finalModel = isOtherBrand ? modelText : model;
    if (!brand || !finalModel) return;

    onSave({
      brand,
      model: finalModel,
      deviceTypes,
      assignmentType,
      assignedUserId: assignmentType === PhoneAssignmentType.ASSIGNED_TO_USER ? 'user-id' : undefined,
      userFirstName: assignmentType === PhoneAssignmentType.ASSIGNED_TO_USER ? userFirstName : undefined,
      userLastName: assignmentType === PhoneAssignmentType.ASSIGNED_TO_USER ? userLastName : undefined,
      userEmail: assignmentType === PhoneAssignmentType.ASSIGNED_TO_USER ? userEmail : undefined,
      extension: assignmentType === PhoneAssignmentType.ASSIGNED_TO_EXTENSION ? extension : undefined,
      enableUserDetection: assignmentType === PhoneAssignmentType.ASSIGNED_TO_EXTENSION ? enableUserDetection : undefined,
      macAddress,
      serialNumber,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{device ? 'Edit Device' : 'Add New Device'}</DialogTitle>
          <DialogDescription>
            Fill in the device information below
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Brand */}
          <div className="space-y-2">
            <Label>Brand *</Label>
            <Select value={brand} onValueChange={(value) => {
              setBrand(value as PhoneBrand);
              setModel('');
              setModelText('');
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PhoneBrand.YEALINK}>Yealink</SelectItem>
                <SelectItem value={PhoneBrand.POLYCOM}>Polycom</SelectItem>
                <SelectItem value={PhoneBrand.OTHER}>Other</SelectItem>
              </SelectContent>
            </Select>
            {!isSupportedBrand && (
              <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {brand} is not a supported brand. Only Yealink and Polycom are supported.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Model */}
          <div className="space-y-2">
            <Label>Model *</Label>
            {isOtherBrand ? (
              <Input
                value={modelText}
                onChange={(e) => setModelText(e.target.value)}
                placeholder="Enter model name"
              />
            ) : (
              <Select value={model} onValueChange={setModel} disabled={!brand}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {supportedModels[brand]?.map(modelOption => (
                    <SelectItem key={modelOption} value={modelOption}>
                      {modelOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Device Types */}
          {isSupportedBrand && (
            <div className="space-y-2">
              <Label>Device Type(s) *</Label>
              <div className="space-y-2">
                {Object.values(DeviceType).map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`device-type-${type}`}
                      checked={deviceTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setDeviceTypes([...deviceTypes, type]);
                        } else {
                          setDeviceTypes(deviceTypes.filter(t => t !== type));
                        }
                      }}
                    />
                    <Label htmlFor={`device-type-${type}`} className="font-normal text-sm">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assignment Type */}
          {isSupportedBrand && (
            <div className="space-y-2">
              <Label>Assignment Type *</Label>
              <RadioGroup
                value={assignmentType}
                onValueChange={(value) => setAssignmentType(value as PhoneAssignmentType)}
                className="grid gap-3 pt-1"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="assign-user" value={PhoneAssignmentType.ASSIGNED_TO_USER} />
                  <Label htmlFor="assign-user" className="font-normal text-sm">
                    Assign to User
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="assign-extension" value={PhoneAssignmentType.ASSIGNED_TO_EXTENSION} />
                  <Label htmlFor="assign-extension" className="font-normal text-sm">
                    Assign to Extension
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* User Information (if assigned to user) */}
          {isSupportedBrand && assignmentType === PhoneAssignmentType.ASSIGNED_TO_USER && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="text-sm font-semibold">User Information</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={userFirstName}
                    onChange={(e) => setUserFirstName(e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={userLastName}
                    onChange={(e) => setUserLastName(e.target.value)}
                    placeholder="Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Extension</Label>
                <Input
                  value={extension}
                  onChange={(e) => setExtension(e.target.value)}
                  placeholder="1001"
                />
              </div>
            </div>
          )}

          {/* Extension (if assigned to extension) */}
          {isSupportedBrand && assignmentType === PhoneAssignmentType.ASSIGNED_TO_EXTENSION && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Extension *</Label>
                <Input
                  value={extension}
                  onChange={(e) => setExtension(e.target.value)}
                  placeholder="1001"
                />
              </div>
              {/* Enable User Detection - only show when extension is provided */}
              {extension && extension.trim() !== '' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enable-user-detection"
                    checked={enableUserDetection}
                    onCheckedChange={(checked) => setEnableUserDetection(checked === true)}
                  />
                  <Label htmlFor="enable-user-detection" className="font-normal text-sm cursor-pointer">
                    Enable user detection
                  </Label>
                </div>
              )}
            </div>
          )}

          {/* Device Details */}
          {isSupportedBrand && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="text-sm font-semibold">Device Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>MAC Address</Label>
                  <Input
                    value={macAddress}
                    onChange={(e) => setMacAddress(e.target.value)}
                    placeholder="00:15:5D:01:01:01"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Serial Number</Label>
                  <Input
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={!brand || (!model && !modelText)}>
              {device ? 'Save Changes' : 'Add Device'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
