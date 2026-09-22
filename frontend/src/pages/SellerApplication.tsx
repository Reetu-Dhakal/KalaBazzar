import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Check,
  Clock,
  XCircle,
  CheckCircle2,
  MapPin,
  Link2,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import ImageField from '@/components/ui/ImageField';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/lib/api';
import type { Craft, SellerApplication as SellerApplicationType, SellerApplicationFormData } from '@/types';

const applicationSchema = z.object({
  shopName: z.string().min(3, 'Shop name must be at least 3 characters').max(150),
  craftCategory: z.string().min(1, 'Please select a craft category'),
  workshopLocation: z.string().min(1, 'Workshop/Studio location is required').max(200),
  bio: z.string().max(2000).optional(),
  portfolioLink: z
    .string()
    .min(1, 'Portfolio/Store link is required')
    .url('Must be a valid URL'),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN format (e.g., ABCDE1234F)')
    .optional()
    .or(z.literal('')),
  photo1: z.string().optional(),
  photo2: z.string().optional(),
  photo3: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function StatusScreen({
  application,
  onReapply,
}: {
  application: SellerApplicationType;
  onReapply: () => void;
}) {
  const navigate = useNavigate();
  const { refreshToken } = useAuth();

  useEffect(() => {
    if (application.status === 'approved') {
      refreshToken().catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application.status]);

  if (application.status === 'approved') {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-4">
          <CheckCircle2 className="h-14 w-14 mx-auto text-green-600" />
          <h2 className="text-2xl font-heading text-foreground">Application Approved!</h2>
          <p className="text-sm text-muted-foreground">
            Congratulations! Your shop <span className="font-medium text-foreground">"{application.shopName}"</span> is
            now live on कलाbazzar.
          </p>
          <Button onClick={() => navigate('/seller/dashboard')}>
            Go to Seller Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (application.status === 'rejected') {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-4">
          <XCircle className="h-14 w-14 mx-auto text-destructive" />
          <h2 className="text-2xl font-heading text-foreground">Application Not Approved</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            We're sorry, but your application for "{application.shopName}" was not approved.
          </p>
          {application.adminNote && (
            <div className="p-3 rounded-lg bg-destructive/10 text-sm mx-auto max-w-md text-left">
              <p className="font-medium text-destructive mb-1">Reason:</p>
              <p>{application.adminNote}</p>
            </div>
          )}
          <Button onClick={onReapply}>
            Apply Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-10 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
          <Clock className="h-7 w-7 text-amber-600" />
        </div>
        <h2 className="text-2xl font-heading text-foreground">Application Under Review</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Thank you! Your application for <span className="font-medium text-foreground">"{application.shopName}"</span>{' '}
          is currently under review. Our team typically responds within a few days, and you'll be notified once a
          decision is made.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Badge variant="warning">Pending Review</Badge>
          <span>·</span>
          <span>Submitted {new Date(application.createdAt).toLocaleDateString()}</span>
        </div>
        <Link to="/" className="inline-block text-sm font-medium text-primary hover:underline">
          Continue shopping
        </Link>
      </CardContent>
    </Card>
  );
}

export default function SellerApplication() {
  usePageTitle();
  const [application, setApplication] = useState<SellerApplicationType | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      shopName: '',
      craftCategory: '',
      workshopLocation: '',
      bio: '',
      portfolioLink: '',
      panNumber: '',
      photo1: '',
      photo2: '',
      photo3: '',
    },
  });

  const photo1 = watch('photo1');
  const photo2 = watch('photo2');
  const photo3 = watch('photo3');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [craftsRes, appRes] = await Promise.allSettled([
          api.get('/crafts'),
          api.get('/sellers/application'),
        ]);
        if (craftsRes.status === 'fulfilled') setCrafts(craftsRes.value.data.data || []);
        if (appRes.status === 'fulfilled') {
          setApplication(appRes.value.data.data);
        } else {
          setApplication(null);
        }
      } catch {
        // handled below
      } finally {
        setIsLoadingStatus(false);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    try {
      const payload: SellerApplicationFormData = {
        shopName: data.shopName.trim(),
        craftCategory: data.craftCategory,
        workshopLocation: data.workshopLocation.trim(),
        portfolioLink: normalizeUrl(data.portfolioLink),
      };
      if (data.bio?.trim()) payload.bio = data.bio.trim();
      if (data.panNumber?.trim()) payload.panNumber = data.panNumber.trim().toUpperCase();
      const photos = [data.photo1, data.photo2, data.photo3]
        .filter((p): p is string => !!p && !!p.trim())
        .map((p) => normalizeUrl(p));
      if (photos.length > 0) payload.samplePhotos = photos as string[];

      const res = await api.post('/sellers/application', payload);
      setApplication(res.data?.data);
      toast.success('Application submitted successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: { field: string; message: string }[] } } };
      const validationErrors = axiosErr.response?.data?.errors;
      if (validationErrors?.length) {
        toast.error(validationErrors.map((e) => e.message).join('. '));
      } else {
        const message =
          axiosErr.response?.data?.message ||
          (err instanceof Error ? err.message : 'Failed to submit application');
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingStatus) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Skeleton className="h-8 w-56 mb-6" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (application && !showForm) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-heading text-primary mb-8 text-center">Become a Seller</h1>
        <StatusScreen
          application={application}
          onReapply={() => setShowForm(true)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-heading text-primary mb-2">Become a Seller</h1>
      <p className="text-muted-foreground mb-8">
        Step 2 of 2 — tell us about your shop and craft. Our team will review your application.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Shop Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Shop / Brand Name"
              placeholder="e.g. Himalayan Crafts"
              error={errors.shopName?.message}
              {...register('shopName')}
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Craft Category <span className="text-destructive">*</span>
              </label>
              <select
                className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                value={crafts.length > 0 ? watch('craftCategory') : ''}
                disabled={crafts.length === 0}
                onChange={(e) => setValue('craftCategory', e.target.value, { shouldValidate: true })}
              >
                <option value="">{crafts.length > 0 ? 'Select a craft category...' : 'Loading crafts...'}</option>
                {crafts.map((craft) => (
                  <option key={craft._id} value={craft.name}>
                    {craft.name}
                  </option>
                ))}
              </select>
              {errors.craftCategory && (
                <p className="mt-1.5 text-xs text-destructive">{errors.craftCategory.message}</p>
              )}
            </div>

            <Input
              label="Workshop / Studio Location"
              placeholder="e.g. Patan, Lalitpur"
              leftIcon={<MapPin className="h-4 w-4" />}
              error={errors.workshopLocation?.message}
              {...register('workshopLocation')}
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Short Bio <span className="text-xs text-muted-foreground">(optional)</span>
              </label>
              <textarea
                className="flex min-h-24 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                placeholder="Tell customers briefly about your craft and journey..."
                {...register('bio')}
              />
              {errors.bio && <p className="mt-1.5 text-xs text-destructive">{errors.bio.message}</p>}
            </div>

            <Input
              label="Portfolio / Store Link"
              placeholder="https://instagram.com/yourprofile or your store URL"
              leftIcon={<Link2 className="h-4 w-4" />}
              error={errors.portfolioLink?.message}
              {...register('portfolioLink')}
            />

            <Input
              label="PAN Number"
              placeholder="ABCDE1234F"
              leftIcon={<CreditCard className="h-4 w-4" />}
              error={errors.panNumber?.message}
              helperText="Optional — enter your PAN if you have one."
              {...register('panNumber')}
            />

            <div>
              <p className="block text-sm font-medium text-foreground mb-1.5">
                Sample Product Photos <span className="text-xs text-muted-foreground">(optional, 2–3)</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ImageField
                  label="Product Photo 1"
                  value={photo1 || ''}
                  onChange={(v) => setValue('photo1', v)}
                />
                <ImageField
                  label="Product Photo 2"
                  value={photo2 || ''}
                  onChange={(v) => setValue('photo2', v)}
                />
                <ImageField
                  label="Product Photo 3"
                  value={photo3 || ''}
                  onChange={(v) => setValue('photo3', v)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
              <Check className="h-4 w-4" />
              Submit Application
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}