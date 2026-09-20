import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  MapPin,
  Star,
  Pencil,
  Camera,
  Facebook,
  Instagram,
  Youtube,
  Globe,
  Save,
  X,
  Package,
  ShoppingCart,
  DollarSign,
  Calendar,
  ExternalLink,
  Heart,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import api from '@/lib/api';
import type { SellerProfile } from '@/types';

const defaultCover =
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=80';

function StatItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-accent/50">
      <Icon className="h-4 w-4 text-primary" />
      <div>
        <p className="text-sm font-semibold text-foreground leading-tight">{value}</p>
        <p className="text-xs text-muted-foreground leading-tight">{label}</p>
      </div>
    </div>
  );
}

export default function ShopProfile() {
  usePageTitle('Shop Profile — कलाbazzar', 'Your shop profile.');
  const [store, setStore] = useState<SellerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ storeName: '', description: '', isStoreOpen: true });
  const [social, setSocial] = useState({
    facebook: '',
    instagram: '',
    tiktok: '',
    youtube: '',
    website: '',
  });
  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/sellers/application/status');
      const p = data.data as SellerProfile;
      setStore(p);
      setForm({ storeName: p.storeName || '', description: p.description || '', isStoreOpen: !!p.isStoreOpen });
      setSocial({
        facebook: p.socialLinks?.facebook || '',
        instagram: p.socialLinks?.instagram || '',
        tiktok: p.socialLinks?.tiktok || '',
        youtube: p.socialLinks?.youtube || '',
        website: p.socialLinks?.website || '',
      });
    } catch {
      toast.error('Failed to load shop profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageUpload = async (file: File, type: 'logo' | 'coverImage') => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = data.data.url || data.data.file?.url;
      if (url) {
        await api.put('/sellers/profile', { [type]: url });
        toast.success(type === 'logo' ? 'Logo updated' : 'Cover updated');
        fetchProfile();
      }
    } catch {
      toast.error('Failed to upload image');
    }
  };

  const handleSave = async () => {
    if (form.storeName.trim().length < 3) {
      toast.error('Store name must be at least 3 characters');
      return;
    }
    setIsSaving(true);
    try {
      await api.put('/sellers/profile', {
        storeName: form.storeName.trim(),
        description: form.description.trim(),
        isStoreOpen: form.isStoreOpen,
        socialLinks: {
          facebook: social.facebook.trim() || undefined,
          instagram: social.instagram.trim() || undefined,
          tiktok: social.tiktok.trim() || undefined,
          youtube: social.youtube.trim() || undefined,
          website: social.website.trim() || undefined,
        },
      });
      toast.success('Profile saved');
      setIsEditing(false);
      fetchProfile();
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const socialIcon = (type: string) => {
    switch (type) {
      case 'facebook': return <Facebook className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'youtube': return <Youtube className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Skeleton className="h-56 w-full rounded-none" />
        <Skeleton className="h-40 w-full -mt-12 mx-4 rounded-xl" />
        <div className="p-4 grid gap-6 sm:grid-cols-3 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h2 className="text-2xl font-heading text-foreground mb-2">Store not found</h2>
        <p className="text-muted-foreground mb-6">Your seller profile could not be loaded.</p>
        <Button asChild>
          <Link to="/seller/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const regionName = typeof store.region === 'object' && store.region ? store.region.name : '';
  const crafts = (store.crafts || [])
    .map((c) => (typeof c === 'object' && c ? c.name : c))
    .filter(Boolean);
  const socialEntries = Object.entries(store.socialLinks || {}).filter(([, v]) => !!v) as [string, string][];

  return (
    <div className="bg-accent/40">
      {/* Cover */}
      <div className="relative h-56 sm:h-72 bg-linear-to-br from-primary/20 to-secondary/20">
        <img
          src={store.coverImage || defaultCover}
          alt={store.storeName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
        <button
          onClick={() => coverInputRef.current?.click()}
          className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs font-medium hover:bg-black/70 transition-colors"
        >
          <Camera className="h-4 w-4" />
          Change Cover
        </button>
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
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-16">
        {/* Profile header */}
        <div className="relative -mt-16 mb-6">
          <Card className="overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                <div className="relative -mt-20 sm:-mt-24">
                  <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden ring-4 ring-card bg-accent shrink-0">
                    {store.logo ? (
                      <img src={store.logo} alt={store.storeName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-primary/10 to-secondary/10">
                        <span className="font-heading text-4xl text-primary">{store.storeName.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                    aria-label="Change profile picture"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
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

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-heading text-foreground">{store.storeName}</h1>
                    {store.status === 'approved' && <Badge variant="success">Verified Artisan</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {regionName || 'Nepal'} • {formatDate(store.createdAt)}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(!isEditing)}>
                      {isEditing ? (
                        <>
                          <X className="h-4 w-4" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Pencil className="h-4 w-4" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/store/${store.slug}`}>
                        <ExternalLink className="h-4 w-4" />
                        View Store
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {form.description ? (
                <p className="mt-4 text-sm text-foreground leading-relaxed">{form.description}</p>
              ) : (
                store.description && (
                  <p className="mt-4 text-sm text-foreground leading-relaxed">{store.description}</p>
                )
              )}
            </CardContent>
          </Card>
        </div>

        {/* Edit pane */}
        {isEditing && (
          <Card className="mb-6">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-semibold">Edit Shop Info</h2>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  Store open
                  <input
                    type="checkbox"
                    checked={form.isStoreOpen}
                    onChange={(e) => setForm({ ...form, isStoreOpen: e.target.checked })}
                    className="h-4 w-4 accent-primary"
                  />
                </label>
              </div>
              <div className="grid gap-4">
                <Input
                  label="Store Name"
                  value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Bio / About</label>
                  <textarea
                    className="w-full min-h-24 rounded-lg border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Tell customers the story behind your crafts..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Social Links</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="Facebook" value={social.facebook} onChange={(e) => setSocial({ ...social, facebook: e.target.value })} />
                  <Input label="Instagram" value={social.instagram} onChange={(e) => setSocial({ ...social, instagram: e.target.value })} />
                  <Input label="TikTok" value={social.tiktok} onChange={(e) => setSocial({ ...social, tiktok: e.target.value })} />
                  <Input label="YouTube" value={social.youtube} onChange={(e) => setSocial({ ...social, youtube: e.target.value })} />
                  <Input label="Website" value={social.website} onChange={(e) => setSocial({ ...social, website: e.target.value })} className="sm:col-span-2" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave} isLoading={isSaving}>
                  <Save className="h-4 w-4" />
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <StatItem icon={Package} label="Products" value={store.totalProducts || 0} />
          <StatItem icon={ShoppingCart} label="Orders" value={store.totalOrders || 0} />
          <StatItem icon={DollarSign} label="Sales" value={formatCurrency(store.totalSales || 0)} />
          <StatItem icon={Star} label={`${store.rating?.toFixed(1) || '0.0'} rating`} value={store.reviewCount || 0} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Intro */}
          <Card>
            <CardContent className="p-5">
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold mb-4">
                <Heart className="h-4 w-4 text-primary" />
                Intro
              </h2>
              {store.description && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{store.description}</p>
              )}
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  Based in {regionName || 'Nepal'}
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary shrink-0" />
                  Store is {store.isStoreOpen ? 'open' : 'closed'} for orders
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  Member since {formatDate(store.createdAt)}
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardContent className="p-5">
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold mb-4">
                <Store className="h-4 w-4 text-primary" />
                About
              </h2>
              {crafts.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Crafts</p>
                  <div className="flex flex-wrap gap-1.5">
                    {crafts.map((c) => (
                      <Badge key={c} variant="outline">{c}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-1.5 text-sm">
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Store name</span>
                  <span className="font-medium text-foreground">{store.storeName}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={store.isStoreOpen ? 'success' : 'destructive'}>
                    {store.isStoreOpen ? 'Open' : 'Closed'}
                  </Badge>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Commission</span>
                  <span className="font-medium text-foreground">{store.commissionRate || 0}%</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact / social */}
        <Card className="mt-6">
          <CardContent className="p-5">
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold mb-4">
              <Globe className="h-4 w-4 text-primary" />
              Contact & Social
            </h2>
            {socialEntries.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {socialEntries.map(([type, url]) => (
                  <a
                    key={type}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors capitalize"
                  >
                    {socialIcon(type)}
                    {type}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No social links yet.{' '}
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-primary underline-offset-2 hover:underline"
                >
                  Add your links
                </button>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}