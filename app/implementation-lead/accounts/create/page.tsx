'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ProductType } from '@/lib/mock-data/types';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';

const accountSchema = z.object({
  name: z.string().min(2, 'Account name must be at least 2 characters'),
  productType: z.nativeEnum(ProductType),
  totalLocations: z.number().min(1, 'At least one location is required'),
  accountId: z.string().optional(),
  primaryPOC: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
  }),
  additionalContacts: z.array(z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
  })).optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

export default function CreateAccountPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [additionalContacts, setAdditionalContacts] = useState<Array<{ name: string; email: string; phone: string }>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      productType: ProductType.VOICESTACK,
      totalLocations: 1,
      additionalContacts: [],
    },
  });

  const productType = watch('productType');

  const onSubmit = async (data: AccountFormData) => {
    // In real implementation, call API to create account
    console.log('Creating account:', { ...data, additionalContacts });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Redirect to account detail page
    router.push('/implementation-lead/dashboard');
  };

  const addContact = () => {
    setAdditionalContacts([...additionalContacts, { name: '', email: '', phone: '' }]);
  };

  const removeContact = (index: number) => {
    setAdditionalContacts(additionalContacts.filter((_, i) => i !== index));
  };

  const updateContact = (index: number, field: string, value: string) => {
    const updated = [...additionalContacts];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalContacts(updated);
    setValue('additionalContacts', updated);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-7xl gap-4 sm:gap-8 px-3 sm:px-4 py-4 sm:py-8 lg:px-8">
        <main className="min-w-0 flex-1">
          <Link href="/implementation-lead/dashboard">
            <Button variant="secondary" size="sm" className="mb-6 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Create New Account</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Step {step} of 2: {step === 1 ? 'Account Details' : 'Contacts'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">Account Information</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter the basic account details
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Account Name *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Acme Medical Group"
                  />
                      {errors.name && (
                        <p className="text-xs text-destructive">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="productType">Product Type *</Label>
                  <div className="relative z-0">
                    <Select
                      value={productType}
                      onValueChange={(value) => setValue('productType', value as ProductType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ProductType.CS_VOICESTACK}>CS VoiceStack</SelectItem>
                        <SelectItem value={ProductType.VOICESTACK}>VoiceStack</SelectItem>
                      </SelectContent>
                      </Select>
                    </div>
                    </div>

                    {productType === ProductType.CS_VOICESTACK && (
                      <div className="space-y-2">
                        <Label htmlFor="accountId">Account ID</Label>
                    <Input
                      id="accountId"
                      {...register('accountId')}
                      placeholder="CS-ACME-001"
                    />
                        <p className="text-xs text-muted-foreground">
                          CS VoiceStack account identifier (dropdown will be available in future)
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="totalLocations">Total Number of Locations *</Label>
                  <Input
                    id="totalLocations"
                    type="number"
                    min="1"
                    {...register('totalLocations', { valueAsNumber: true })}
                  />
                      {errors.totalLocations && (
                        <p className="text-xs text-destructive">{errors.totalLocations.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-6 border-t">
                  <Button type="button" size="sm" onClick={() => setStep(2)}>
                    Continue to Contacts
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">Primary Point of Contact (POC) *</h3>
                    <p className="text-sm text-muted-foreground">
                      Main contact person for this account
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="primaryPOC.name">Name *</Label>
                    <Input
                      id="primaryPOC.name"
                      {...register('primaryPOC.name')}
                      placeholder="Dr. Sarah Miller"
                    />
                      {errors.primaryPOC?.name && (
                        <p className="text-xs text-destructive">{errors.primaryPOC.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="primaryPOC.email">Email *</Label>
                    <Input
                      id="primaryPOC.email"
                      type="email"
                      {...register('primaryPOC.email')}
                      placeholder="sarah.miller@acme.com"
                    />
                      {errors.primaryPOC?.email && (
                        <p className="text-xs text-destructive">{errors.primaryPOC.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="primaryPOC.phone">Phone *</Label>
                    <Input
                      id="primaryPOC.phone"
                      {...register('primaryPOC.phone')}
                      placeholder="+1-555-0101"
                    />
                      {errors.primaryPOC?.phone && (
                        <p className="text-xs text-destructive">{errors.primaryPOC.phone.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-1">Additional Contacts</h3>
                      <p className="text-sm text-muted-foreground">
                        Add any additional contact persons
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addContact}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Additional Contact
                    </Button>
                  </div>

                  {additionalContacts.map((contact, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium">Contact {index + 1}</h4>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => removeContact(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                              value={contact.name}
                              onChange={(e) => updateContact(index, 'name', e.target.value)}
                              placeholder="Name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                              type="email"
                              value={contact.email}
                              onChange={(e) => updateContact(index, 'email', e.target.value)}
                              placeholder="email@example.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                              value={contact.phone}
                              onChange={(e) => updateContact(index, 'phone', e.target.value)}
                              placeholder="+1-555-0101"
                            />
                          </div>
                        </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 pt-6 border-t">
                  <Button type="button" variant="outline" size="sm" onClick={() => setStep(1)} className="w-full sm:w-auto">
                    Back to Account Details
                  </Button>
                  <Button type="submit" size="sm" className="w-full sm:w-auto">Create New Account</Button>
                </div>
              </div>
            )}
          </form>
        </main>
      </div>
    </div>
  );
}
