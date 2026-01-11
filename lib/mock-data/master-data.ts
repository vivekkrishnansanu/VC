import { SupportedPhoneModel, PhoneSystemKnowledge, PhoneBrand, PhoneSystemType } from './types';

export const mockSupportedPhoneModels: SupportedPhoneModel[] = [
  // Yealink models
  {
    id: 'model-1',
    brand: PhoneBrand.YEALINK,
    model: 'T46S',
    isActive: true,
    description: '12-line IP phone with color display',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'model-2',
    brand: PhoneBrand.YEALINK,
    model: 'T48S',
    isActive: true,
    description: '16-line IP phone with color display',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'model-3',
    brand: PhoneBrand.YEALINK,
    model: 'T54W',
    isActive: true,
    description: '12-line WiFi IP phone',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'model-4',
    brand: PhoneBrand.YEALINK,
    model: 'T57W',
    isActive: true,
    description: '16-line WiFi IP phone',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // Polycom models
  {
    id: 'model-5',
    brand: PhoneBrand.POLYCOM,
    model: 'VVX 350',
    isActive: true,
    description: '12-line business media phone',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'model-6',
    brand: PhoneBrand.POLYCOM,
    model: 'VVX 450',
    isActive: true,
    description: '16-line business media phone',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'model-7',
    brand: PhoneBrand.POLYCOM,
    model: 'VVX 601',
    isActive: true,
    description: '24-line business media phone',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

export const mockPhoneSystemKnowledge: PhoneSystemKnowledge[] = [
  {
    id: 'knowledge-1',
    phoneSystemType: PhoneSystemType.VOIP,
    phoneSystemName: 'RingCentral',
    phoneSystemDetails: 'Cloud-based VoIP platform',
    supportsCallForwarding: true,
    notes: 'Full call forwarding support including conditional forwarding',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'knowledge-2',
    phoneSystemType: PhoneSystemType.VOIP,
    phoneSystemName: '8x8',
    phoneSystemDetails: 'Cloud-based unified communications',
    supportsCallForwarding: true,
    notes: 'Supports call forwarding and voicemail forwarding',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'knowledge-3',
    phoneSystemType: PhoneSystemType.VOIP,
    phoneSystemName: 'Nextiva',
    phoneSystemDetails: 'Business VoIP solution',
    supportsCallForwarding: true,
    notes: 'Full call forwarding capabilities',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'knowledge-4',
    phoneSystemType: PhoneSystemType.TRADITIONAL,
    phoneSystemName: 'Avaya IP Office',
    phoneSystemDetails: 'On-premise IP PBX system',
    supportsCallForwarding: true,
    notes: 'Supports call forwarding with proper configuration',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'knowledge-5',
    phoneSystemType: PhoneSystemType.TRADITIONAL,
    phoneSystemName: 'Cisco CallManager',
    phoneSystemDetails: 'Enterprise IP telephony system',
    supportsCallForwarding: true,
    notes: 'Full call forwarding support',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'knowledge-6',
    phoneSystemType: PhoneSystemType.TRADITIONAL,
    phoneSystemName: 'Panasonic KX-TDE',
    phoneSystemDetails: 'Traditional PBX system',
    supportsCallForwarding: false,
    notes: 'Limited call forwarding capabilities',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

export function getSupportedPhoneModels(brand?: PhoneBrand): SupportedPhoneModel[] {
  if (brand) {
    return mockSupportedPhoneModels.filter(m => m.brand === brand && m.isActive);
  }
  return mockSupportedPhoneModels.filter(m => m.isActive);
}

export function isPhoneModelSupported(brand: PhoneBrand, model: string): boolean {
  return mockSupportedPhoneModels.some(
    m => m.brand === brand && m.model === model && m.isActive
  );
}

export function getPhoneSystemKnowledge(
  phoneSystemType: PhoneSystemType,
  phoneSystemName: string
): PhoneSystemKnowledge | undefined {
  return mockPhoneSystemKnowledge.find(
    k => k.phoneSystemType === phoneSystemType && 
         k.phoneSystemName.toLowerCase() === phoneSystemName.toLowerCase()
  );
}

export function getAllPhoneSystemKnowledge(): PhoneSystemKnowledge[] {
  return mockPhoneSystemKnowledge;
}
