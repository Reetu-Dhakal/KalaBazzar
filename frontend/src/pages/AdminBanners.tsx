import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Image,
  ToggleLeft,
  ToggleRight,
  X,
} from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import ImageField from '@/components/ui/ImageField';
import { formatDate } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { Banner } from '@/types';

const POSITIONS = [
  'hero',
  'hero_secondary',
  'category_banner',
  'collection_banner',
  'artisan_spotlight',
  'footer',
  'sidebar',
] as const;

const LINK_TYPES = [
  'none',
  'url',
  'product',
  'collection',
  'artisan',
  'category',
  'region',
  'craft',
] as const;

const BUTTON_STYLES = ['primary', 'secondary', 'outline', 'ghost'] as const;
const ALIGNMENTS = ['left', 'center', 'right'] as const;
const TARGET_AUDIENCES = ['all', 'guests', 'customers', 'sellers', 'admins'] as const;

interface BannerFormData {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  mobileImage: string;
  position: string;
  linkType: string;
  linkValue: string;
  buttonText: string;
  buttonStyle: string;
  alignment: string;
  overlayOpacity: number;
  textColor: string;
  backgroundColor: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  sortOrder: number;
  targetAudience: string;
}

const emptyForm: BannerFormData = {
  title: '',
  subtitle: '',
  description: '',
  image: '',
  mobileImage: '',
  position: 'hero',
  linkType: 'none',
  linkValue: '',
  buttonText: '',
  buttonStyle: 'primary',
  alignment: 'center',
  overlayOpacity: 0.4,
  textColor: '#FFFFFF',
  backgroundColor: '',
  isActive: true,
  startDate: '',
  endDate: '',
  sortOrder: 0,
  targetAudience: 'all',
};

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-lg" />
      ))}
    </div>
  );
}

const POSITION_LABELS: Record<string, string> = {
  hero: 'Hero',
  hero_secondary: 'Hero Secondary',
  category_banner: 'Category Banner',
  collection_banner: 'Collection Banner',
  artisan_spotlight: 'Artisan Spotlight',
  footer: 'Footer',
  sidebar: 'Sidebar',
};

export default function AdminBanners() {
  usePageTitle('Manage Banners — KalaBazzar', 'Create and manage homepage banners.');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchBanners = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/banners', { params: { isActive: 'all' } });
      setBanners(data.data || []);
    } catch {
      toast.error('Failed to load banners');
      setBanners([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingId(banner._id);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      image: banner.image,
      mobileImage: banner.mobileImage || '',
      position: banner.position,
      linkType: banner.linkType,
      linkValue: banner.linkValue || '',
      buttonText: banner.buttonText || '',
      buttonStyle: banner.buttonStyle,
      alignment: banner.alignment,
      overlayOpacity: banner.overlayOpacity ?? 0.4,
      textColor: banner.textColor || '#FFFFFF',
      backgroundColor: banner.backgroundColor || '',
      isActive: banner.isActive,
      startDate: banner.startDate ? banner.startDate.split('T')[0] : '',
      endDate: banner.endDate ? banner.endDate.split('T')[0] : '',
      sortOrder: banner.sortOrder || 0,
      targetAudience: banner.targetAudience,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.image.trim()) errors.image = 'Image is required';
    if (!form.position) errors.position = 'Position is required';
    if (form.linkType !== 'none' && !form.linkValue.trim()) {
      errors.linkValue = 'Link value required for this link type';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setActionLoading('form');
    try {
      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle || undefined,
        description: form.description || undefined,
        image: form.image,
        mobileImage: form.mobileImage || undefined,
        position: form.position,
        linkType: form.linkType,
        linkValue: form.linkType === 'none' ? undefined : form.linkValue.trim() || undefined,
        buttonText: form.buttonText || undefined,
        buttonStyle: form.buttonStyle,
        alignment: form.alignment,
        overlayOpacity: Number(form.overlayOpacity) || 0,
        textColor: form.textColor || '#FFFFFF',
        backgroundColor: form.backgroundColor || undefined,
        isActive: form.isActive,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
        sortOrder: Number(form.sortOrder) || 0,
        targetAudience: form.targetAudience,
      };

      if (editingId) {
        await api.put(`/banners/${editingId}`, payload);
        toast.success('Banner updated');
      } else {
        await api.post('/banners', payload);
        toast.success('Banner created');
      }
      setModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save banner');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggle = async (banner: Banner) => {
    setActionLoading(banner._id);
    try {
      await api.put(`/banners/${banner._id}`, { isActive: !banner.isActive });
      toast.success(`Banner ${banner.isActive ? 'deactivated' : 'activated'}`);
      fetchBanners();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update banner');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    setActionLoading(id);
    try {
      await api.delete(`/banners/${id}`);
      toast.success('Banner deleted');
      fetchBanners();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete banner');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBanners = banners.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.position.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading text-foreground">Manage Banners</h1>
          <p className="text-muted-foreground mt-1">Create and manage homepage banners.</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Create Banner
        </Button>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search banners..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          />
        </div>
      </form>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6"><TableSkeleton /></div>
          ) : filteredBanners.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Image className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No banners found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Banner</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Position</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Link</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Created</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBanners.map((banner) => (
                    <tr key={banner._id} className="border-b border-border last:border-0">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={banner.image} alt={banner.title} className="h-10 w-16 rounded-lg object-cover shrink-0" />
                          <div>
                            <span className="text-sm font-medium text-foreground">{banner.title}</span>
                            {banner.subtitle && (
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{banner.subtitle}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{POSITION_LABELS[banner.position] || banner.position}</Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {banner.linkType === 'none' ? '—' : `${banner.linkType}: ${banner.linkValue || ''}`}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{formatDate(banner.createdAt)}</td>
                      <td className="p-4">
                        <Badge variant={banner.isActive ? 'success' : 'destructive'}>
                          {banner.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleToggle(banner)}
                            disabled={actionLoading === banner._id}
                            title={banner.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {banner.isActive ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => openEditModal(banner)} title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(banner._id)}
                            disabled={actionLoading === banner._id}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingId ? 'Edit Banner' : 'Create Banner'}</CardTitle>
              <Button variant="ghost" size="icon-sm" onClick={() => setModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    error={formErrors.title}
                    required
                  />
                  <Input
                    label="Subtitle"
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  />
                </div>

                <Input
                  label="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Position</label>
                    <select
                      value={form.position}
                      onChange={(e) => setForm({ ...form, position: e.target.value })}
                      className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {POSITIONS.map((p) => (
                        <option key={p} value={p}>{POSITION_LABELS[p]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Target Audience</label>
                    <select
                      value={form.targetAudience}
                      onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                      className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {TARGET_AUDIENCES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <ImageField
                  label="Image (required)"
                  value={form.image}
                  onChange={(url) => setForm({ ...form, image: url })}
                  error={formErrors.image}
                />
                <ImageField
                  label="Mobile Image (optional)"
                  value={form.mobileImage}
                  onChange={(url) => setForm({ ...form, mobileImage: url })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Link Type</label>
                    <select
                      value={form.linkType}
                      onChange={(e) => setForm({ ...form, linkType: e.target.value })}
                      className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {LINK_TYPES.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="Link Value"
                    value={form.linkValue}
                    onChange={(e) => setForm({ ...form, linkValue: e.target.value })}
                    error={formErrors.linkValue}
                    placeholder="URL, slug, or product ID"
                    helperText="Required unless link type is 'none'"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Button Text"
                    value={form.buttonText}
                    onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                    placeholder="e.g. Shop Now"
                  />
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Button Style</label>
                    <select
                      value={form.buttonStyle}
                      onChange={(e) => setForm({ ...form, buttonStyle: e.target.value })}
                      className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {BUTTON_STYLES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Alignment</label>
                    <select
                      value={form.alignment}
                      onChange={(e) => setForm({ ...form, alignment: e.target.value })}
                      className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {ALIGNMENTS.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="Overlay Opacity"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={form.overlayOpacity}
                    onChange={(e) => setForm({ ...form, overlayOpacity: Number(e.target.value) })}
                  />
                  <Input
                    label="Sort Order"
                    type="number"
                    value={form.sortOrder || ''}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Text Color"
                    type="color"
                    value={form.textColor}
                    onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                  />
                  <Input
                    label="Background Color"
                    type="color"
                    value={form.backgroundColor}
                    onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
                  />
                  <div className="flex items-end pb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        className="h-4 w-4 rounded border-border"
                      />
                      <label htmlFor="isActive" className="text-sm font-medium">Active</label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Start Date"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                  <Input
                    label="End Date"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={actionLoading === 'form'}>
                    {editingId ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}