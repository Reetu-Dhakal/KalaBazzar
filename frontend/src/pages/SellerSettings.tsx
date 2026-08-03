import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Save,
  Upload,
  Store,
  CreditCard,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/lib/api';
import type { SellerProfile } from '@/types';

const settingsSchema = z.object({
  storeName: z.string().min(2, 'Store name must be at least 2 characters'),
  description: z.string().optional(),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
  isStoreOpen: z.boolean().default(true),
  payoutDetails: z.object({
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    accountHolderName: z.string().optional(),
    branch: z.string().optional(),
    swiftCode: z.string().optional(),
    panNumber: z.string().optional(),
    khaltiId: z.string().optional(),
    esewaId: z.string().optional(),
  }).optional(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export default function SellerSettings() {
  usePageTitle('Store Settings — KalaBazzar', 'Manage your store settings and payout details.');
  const [, setProfile] = useState<SellerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      storeName: '',
      description: '',
      isStoreOpen: true,
      payoutDetails: {
        bankName: '',
        accountNumber: '',
        accountHolderName: '',
        branch: '',
        swiftCode: '',
        panNumber: '',
        khaltiId: '',
        esewaId: '',
      },
    },
  });

  const isStoreOpen = watch('isStoreOpen');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/sellers/application/status');
        const p = data.data;
        setProfile(p);
        reset({
          storeName: p.storeName || '',
          description: p.description || '',
          logo: p.logo || '',
          coverImage: p.coverImage || '',
          isStoreOpen: p.isStoreOpen,
          payoutDetails: {
            bankName: p.payoutDetails?.bankName || '',
            accountNumber: p.payoutDetails?.accountNumber || '',
            accountHolderName: p.payoutDetails?.accountHolderName || '',
            branch: p.payoutDetails?.branch || '',
            swiftCode: p.payoutDetails?.swiftCode || '',
            panNumber: p.payoutDetails?.panNumber || '',
            khaltiId: p.payoutDetails?.khaltiId || '',
            esewaId: p.payoutDetails?.esewaId || '',
          },
        });
      } catch {
        toast.error('Failed to load store settings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  const handleImageUpload = async (file: File, type: 'logo' | 'coverImage') => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = data.data.url || data.data.file?.url;
      if (url) {
        setValue(type, url);
      }
    } catch {
      toast.error('Failed to upload image');
    }
  };

  const onSubmit = async (data: SettingsForm) => {
    setIsSaving(true);
    try {
      const { payoutDetails, ...profileData } = data;
      await api.put('/sellers/profile', profileData);
      if (payoutDetails) {
        await api.put('/sellers/payout', payoutDetails);
      }
      toast.success('Settings saved successfully');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save settings';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-heading text-foreground mb-2">Store Settings</h1>
      <p className="text-muted-foreground mb-8">Manage your store details and payout information.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Store Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Store Name"
              error={errors.storeName?.message}
              {...register('storeName')}
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Store Description
              </label>
              <textarea
                className="flex min-h-25 w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                placeholder="Describe your store and what you sell..."
                {...register('description')}
              />
            </div>

            {/* Store Status */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-medium text-sm">Store Status</p>
                <p className="text-xs text-muted-foreground">
                  {isStoreOpen ? 'Your store is open for orders' : 'Your store is currently closed'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  {...register('isStoreOpen')}
                />
                <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Store Images */}
        <Card>
          <CardHeader>
            <CardTitle>Store Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Store Logo
              </label>
              <div
                className="relative w-24 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer overflow-hidden"
                onClick={() => logoInputRef.current?.click()}
              >
                {watch('logo') ? (
                  <img src={watch('logo')} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Upload className="h-6 w-6" />
                  </div>
                )}
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, 'logo');
                }}
              />
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Cover Image
              </label>
              <div
                className="relative w-full h-40 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer overflow-hidden"
                onClick={() => coverInputRef.current?.click()}
              >
                {watch('coverImage') ? (
                  <img src={watch('coverImage')} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Click to upload cover image</p>
                    </div>
                  </div>
                )}
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, 'coverImage');
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Recommended: 1200x400px
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payout Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payout Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Bank Name"
                placeholder="e.g. Nabil Bank"
                {...register('payoutDetails.bankName')}
              />
              <Input
                label="Branch"
                placeholder="e.g. New Baneshwor"
                {...register('payoutDetails.branch')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Account Number"
                placeholder="Account number"
                {...register('payoutDetails.accountNumber')}
              />
              <Input
                label="Account Holder Name"
                placeholder="Full name on account"
                {...register('payoutDetails.accountHolderName')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Swift Code"
                placeholder="Swift code"
                {...register('payoutDetails.swiftCode')}
              />
              <Input
                label="PAN Number"
                placeholder="PAN number"
                {...register('payoutDetails.panNumber')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Khalti ID"
                placeholder="Khalti ID"
                {...register('payoutDetails.khaltiId')}
              />
              <Input
                label="eSewa ID"
                placeholder="eSewa ID"
                {...register('payoutDetails.esewaId')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end">
          <Button type="submit" isLoading={isSaving}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
