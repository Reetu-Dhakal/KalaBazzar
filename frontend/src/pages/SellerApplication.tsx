import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Instagram,
  Upload,
  Store,
  Share2,
  Building2,
  MapPin,
  Camera,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/lib/api';
import type { SellerProfile, Region, Craft } from '@/types';

const stepSchema = z.object({
  storeName: z.string().min(2, 'Store name must be at least 2 characters'),
  description: z.string().optional(),
  region: z.string().min(1, 'Please select a region'),
  crafts: z.array(z.string()).min(1, 'Select at least one craft'),
  verificationPath: z.enum(['social', 'marketplace', 'offline']),
  socialLinks: z.object({
    instagram: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    facebook: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    tiktok: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    youtube: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  }).optional(),
  marketplaceLinks: z.object({
    website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  }).optional(),
  verificationDocuments: z.object({
    district: z.string().min(1, 'District is required'),
    yearsOfExperience: z.number().min(0, 'Must be at least 0'),
    specialization: z.array(z.string()).min(1, 'Add at least one specialization'),
    craftStory: z.string().optional(),
    workshopPhotos: z.array(z.any()).optional(),
  }),
});

type StepFormData = z.infer<typeof stepSchema>;

const STEPS = [
  { id: 1, title: 'Store Info', description: 'Basic store details' },
  { id: 2, title: 'Craft Details', description: 'Your craft and region' },
  { id: 3, title: 'Verification', description: 'How to verify your craft' },
  { id: 4, title: 'Review & Submit', description: 'Confirm your application' },
];

export default function SellerApplication() {
  usePageTitle();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<SellerProfile | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [regions, setRegions] = useState<Region[]>([]);
  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [specializationInput, setSpecializationInput] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<StepFormData>({
    resolver: zodResolver(stepSchema),
    defaultValues: {
      storeName: user ? `${user.firstName}'s Store` : '',
      description: '',
      region: '',
      crafts: [],
      verificationPath: 'social',
      socialLinks: { instagram: '', facebook: '', tiktok: '', youtube: '', website: '' },
      marketplaceLinks: { website: '' },
      verificationDocuments: {
        district: '',
        yearsOfExperience: 0,
        specialization: [],
        craftStory: '',
        workshopPhotos: [],
      },
    },
  });

  const verificationPath = watch('verificationPath');
  const selectedCrafts = watch('crafts');
  const specializations = watch('verificationDocuments.specialization');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [regionsRes, craftsRes, statusRes] = await Promise.allSettled([
          api.get('/regions'),
          api.get('/crafts'),
          api.get('/sellers/application/status'),
        ]);
        if (regionsRes.status === 'fulfilled') setRegions(regionsRes.value.data.data || []);
        if (craftsRes.status === 'fulfilled') setCrafts(craftsRes.value.data.data || []);
        if (statusRes.status === 'fulfilled') setApplicationStatus(statusRes.value.data.data);
      } catch {
        // handled by individual checks
      } finally {
        setIsLoadingStatus(false);
      }
    };
    fetchData();
  }, []);

  const toggleCraft = (craftId: string) => {
    const current = selectedCrafts || [];
    if (current.includes(craftId)) {
      setValue('crafts', current.filter((id) => id !== craftId), { shouldValidate: true });
    } else {
      setValue('crafts', [...current, craftId], { shouldValidate: true });
    }
  };

  const addSpecialization = () => {
    if (specializationInput.trim()) {
      const current = specializations || [];
      if (!current.includes(specializationInput.trim())) {
        setValue('verificationDocuments.specialization', [...current, specializationInput.trim()], {
          shouldValidate: true,
        });
      }
      setSpecializationInput('');
    }
  };

  const removeSpecialization = (spec: string) => {
    const current = specializations || [];
    setValue(
      'verificationDocuments.specialization',
      current.filter((s) => s !== spec),
      { shouldValidate: true },
    );
  };

  const validateStep = async () => {
    let fieldsToValidate: (keyof StepFormData)[] = [];
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['storeName'];
        break;
      case 2:
        fieldsToValidate = ['region', 'crafts'];
        break;
      case 3:
        fieldsToValidate = ['verificationPath', 'verificationDocuments'];
        break;
      case 4:
        return true;
    }
    return await trigger(fieldsToValidate);
  };

  const handleNext = async () => {
    const isValid = await validateStep();
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      const values = watch();
      const payload: Record<string, unknown> = {
        storeName: values.storeName,
        region: values.region,
        crafts: values.crafts,
        verificationPath: values.verificationPath,
      };
      if (values.description) payload.description = values.description;

      if (values.verificationPath === 'social' && values.socialLinks) {
        const socialLinks: Record<string, string> = {};
        Object.entries(values.socialLinks).forEach(([key, val]) => {
          if (val) socialLinks[key] = val;
        });
        if (Object.keys(socialLinks).length > 0) payload.socialLinks = socialLinks;
      }

      if (values.verificationPath === 'marketplace' && values.marketplaceLinks?.website) {
        payload.socialLinks = { website: values.marketplaceLinks.website };
      }

      if (values.verificationDocuments) {
        const docs = values.verificationDocuments;
        payload.verificationDocuments = {
          district: docs.district,
          yearsOfExperience: docs.yearsOfExperience,
          specialization: docs.specialization,
        };
        if (docs.craftStory) {
          (payload.verificationDocuments as Record<string, unknown>).craftStory = docs.craftStory;
        }
      }

      await api.post('/sellers/apply', payload);

      toast.success('Application submitted successfully!');
      navigate('/seller/dashboard');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to submit application';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingStatus) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (applicationStatus) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Status:</span>
              <Badge
                variant={
                  applicationStatus.status === 'approved'
                    ? 'success'
                    : applicationStatus.status === 'rejected'
                      ? 'destructive'
                      : 'warning'
                }
              >
                {applicationStatus.status.charAt(0).toUpperCase() + applicationStatus.status.slice(1)}
              </Badge>
            </div>
            {applicationStatus.status === 'pending' && (
              <p className="text-sm text-muted-foreground">
                Your application is under review. We'll notify you once a decision is made.
              </p>
            )}
            {applicationStatus.status === 'rejected' && applicationStatus.adminNotes && (
              <div className="p-3 rounded-lg bg-destructive/10 text-sm">
                <p className="font-medium text-destructive mb-1">Rejection Reason:</p>
                <p>{applicationStatus.adminNotes}</p>
              </div>
            )}
            {applicationStatus.status === 'approved' && (
              <div className="p-3 rounded-lg bg-green-50 text-sm">
                <p className="font-medium text-green-700">
                  Congratulations! Your store "{applicationStatus.storeName}" is now live.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-heading text-primary mb-2">Become a Seller</h1>
      <p className="text-muted-foreground mb-8">
        Join KalaBazzar and share your craft with the world.
      </p>

      {/* Step Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  currentStep > step.id
                    ? 'bg-primary text-primary-foreground'
                    : currentStep === step.id
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-12 sm:w-20 mx-2 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {STEPS.map((step) => (
            <span
              key={step.id}
              className={`text-xs hidden sm:block ${
                currentStep >= step.id ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              {step.title}
            </span>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Step {currentStep}: {STEPS[currentStep - 1].title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Step 1: Store Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground flex items-center gap-2">
                <Store className="h-4 w-4" />
                Your store name will be visible to customers.
              </div>
              <Input
                label="Store Name"
                placeholder="e.g. Himalayan Crafts"
                error={errors.storeName?.message}
                {...register('storeName')}
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Store Description (optional)
                </label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                  placeholder="Tell customers about your store..."
                  {...register('description')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Your Name
                </label>
                <Input
                  value={user ? `${user.firstName} ${user.lastName}` : ''}
                  disabled
                  helperText="Auto-filled from your profile"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Email
                </label>
                <Input value={user?.email || ''} disabled helperText="Auto-filled from your profile" />
              </div>
            </div>
          )}

          {/* Step 2: Craft Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Region <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {regions.map((region) => (
                    <button
                      key={region._id}
                      type="button"
                      onClick={() => setValue('region', region._id, { shouldValidate: true })}
                      className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                        watch('region') === region._id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <MapPin className="h-4 w-4 mb-1" />
                      {region.name}
                    </button>
                  ))}
                </div>
                {errors.region && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.region.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Crafts <span className="text-destructive">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {crafts.map((craft) => (
                    <button
                      key={craft._id}
                      type="button"
                      onClick={() => toggleCraft(craft._id)}
                      className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                        selectedCrafts?.includes(craft._id)
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {craft.name}
                    </button>
                  ))}
                </div>
                {errors.crafts && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.crafts.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Verification */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  How would you like to verify your craft?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      value: 'social' as const,
                      label: 'Social Media',
                      icon: Share2,
                      desc: 'Show your craft on social platforms',
                    },
                    {
                      value: 'marketplace' as const,
                      label: 'Marketplace',
                      icon: Store,
                      desc: 'Existing online store profile',
                    },
                    {
                      value: 'offline' as const,
                      label: 'Offline Artisan',
                      icon: Building2,
                      desc: 'Workshop photos & craft story',
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setValue('verificationPath', option.value, { shouldValidate: true })
                      }
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        verificationPath === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <option.icon
                        className={`h-5 w-5 mb-2 ${
                          verificationPath === option.value ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      />
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Social Media Links */}
              {verificationPath === 'social' && (
                <div className="space-y-3 p-4 rounded-lg border border-border">
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Instagram className="h-4 w-4" /> Social Media Links
                  </p>
                  <Input
                    label="Instagram URL"
                    placeholder="https://instagram.com/yourprofile"
                    error={errors.socialLinks?.instagram?.message}
                    {...register('socialLinks.instagram')}
                  />
                  <Input
                    label="Facebook URL"
                    placeholder="https://facebook.com/yourpage"
                    error={errors.socialLinks?.facebook?.message}
                    {...register('socialLinks.facebook')}
                  />
                  <Input
                    label="TikTok URL"
                    placeholder="https://tiktok.com/@yourprofile"
                    error={errors.socialLinks?.tiktok?.message}
                    {...register('socialLinks.tiktok')}
                  />
                </div>
              )}

              {/* Marketplace Links */}
              {verificationPath === 'marketplace' && (
                <div className="space-y-3 p-4 rounded-lg border border-border">
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Store className="h-4 w-4" /> Marketplace Profile
                  </p>
                  <Input
                    label="Existing Store/Profile URL"
                    placeholder="https://your-marketplace.com/store"
                    error={errors.marketplaceLinks?.website?.message}
                    {...register('marketplaceLinks.website')}
                  />
                </div>
              )}

              {/* Offline Artisan */}
              {verificationPath === 'offline' && (
                <div className="space-y-4 p-4 rounded-lg border border-border">
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Camera className="h-4 w-4" /> Workshop Details
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Craft Story
                    </label>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                      placeholder="Tell us about your craft, how you learned, and what makes it special..."
                      {...register('verificationDocuments.craftStory')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Workshop Photos
                    </label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Drag and drop or click to upload
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload photos of your workshop
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Common fields */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Additional Information
                </p>
                <Input
                  label="District"
                  placeholder="e.g. Kathmandu"
                  error={errors.verificationDocuments?.district?.message}
                  {...register('verificationDocuments.district')}
                />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Years of Experience
                  </label>
                  <Input
                    type="number"
                    min={0}
                    {...register('verificationDocuments.yearsOfExperience', { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Specialization
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. Pottery, Weaving"
                      value={specializationInput}
                      onChange={(e) => setSpecializationInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSpecialization();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addSpecialization}>
                      Add
                    </Button>
                  </div>
                  {specializations && specializations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {specializations.map((spec) => (
                        <Badge key={spec} variant="secondary" className="gap-1">
                          {spec}
                          <button
                            type="button"
                            onClick={() => removeSpecialization(spec)}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  {errors.verificationDocuments?.specialization && (
                    <p className="mt-1.5 text-xs text-destructive">
                      {errors.verificationDocuments.specialization.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Store Name</span>
                  <span className="text-sm font-medium">{watch('storeName')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Region</span>
                  <span className="text-sm font-medium">
                    {regions.find((r) => r._id === watch('region'))?.name || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Crafts</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                    {selectedCrafts?.map((craftId) => {
                      const craft = crafts.find((c) => c._id === craftId);
                      return craft ? (
                        <Badge key={craftId} variant="outline" className="text-xs">
                          {craft.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Verification Path</span>
                  <span className="text-sm font-medium capitalize">{verificationPath}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">District</span>
                  <span className="text-sm font-medium">
                    {watch('verificationDocuments.district') || '-'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {currentStep < STEPS.length ? (
              <Button type="button" onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
                <Check className="h-4 w-4" />
                Submit Application
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
