import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  MapPin,
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
import type { Region } from '@/types';

interface RegionFormData {
  name: string;
  province: string;
  shortDescription: string;
  description: string;
  image: string;
  mapImage: string;
  districts: string;
  isActive: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
}

const emptyForm: RegionFormData = {
  name: '',
  province: '',
  shortDescription: '',
  description: '',
  image: '',
  mapImage: '',
  districts: '',
  isActive: true,
  sortOrder: 0,
  seoTitle: '',
  seoDescription: '',
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

export default function AdminRegions() {
  usePageTitle('Manage Regions — KalaBazzar', 'Create and manage artisan regions.');
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RegionFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchRegions = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/regions', {
        params: { isActive: 'all', includeProductCount: 'true' },
      });
      setRegions(data.data || []);
    } catch {
      toast.error('Failed to load regions');
      setRegions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (region: Region) => {
    setEditingId(region._id);
    setForm({
      name: region.name,
      province: region.province || '',
      shortDescription: region.shortDescription || '',
      description: region.description || '',
      image: region.image || '',
      mapImage: region.mapImage || '',
      districts: (region.districts || []).join(', '),
      isActive: region.isActive,
      sortOrder: region.sortOrder || 0,
      seoTitle: region.seo?.title || '',
      seoDescription: region.seo?.description || '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setActionLoading('form');
    try {
      const payload = {
        name: form.name.trim(),
        province: form.province || undefined,
        shortDescription: form.shortDescription || undefined,
        description: form.description || undefined,
        image: form.image || undefined,
        mapImage: form.mapImage || undefined,
        districts: form.districts
          ? form.districts.split(',').map((d) => d.trim()).filter(Boolean)
          : [],
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder) || 0,
        seo: form.seoTitle || form.seoDescription
          ? { title: form.seoTitle || undefined, description: form.seoDescription || undefined }
          : undefined,
      };

      if (editingId) {
        await api.put(`/regions/${editingId}`, payload);
        toast.success('Region updated');
      } else {
        await api.post('/regions', { ...payload, isActive: undefined, sortOrder: undefined });
        toast.success('Region created');
      }
      setModalOpen(false);
      fetchRegions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save region');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggle = async (region: Region) => {
    setActionLoading(region._id);
    try {
      await api.put(`/regions/${region._id}`, { isActive: !region.isActive });
      toast.success(`Region ${region.isActive ? 'deactivated' : 'activated'}`);
      fetchRegions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update region');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this region?')) return;
    setActionLoading(id);
    try {
      await api.delete(`/regions/${id}`);
      toast.success('Region deleted');
      fetchRegions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete region');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRegions = regions.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading text-foreground">Manage Regions</h1>
          <p className="text-muted-foreground mt-1">Create and manage artisan regions.</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Create Region
        </Button>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search regions..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          />
        </div>
      </form>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6"><TableSkeleton /></div>
          ) : filteredRegions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No regions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Region</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Province</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Districts</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Created</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegions.map((region) => (
                    <tr key={region._id} className="border-b border-border last:border-0">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {region.image ? (
                            <img src={region.image} alt={region.name} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <MapPin className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <span className="text-sm font-medium text-foreground">{region.name}</span>
                            {region.shortDescription && (
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-md">{region.shortDescription}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{region.province || '—'}</td>
                      <td className="p-4 text-sm text-muted-foreground">{(region.districts || []).length}</td>
                      <td className="p-4 text-sm text-muted-foreground">{formatDate(region.createdAt)}</td>
                      <td className="p-4">
                        <Badge variant={region.isActive ? 'success' : 'destructive'}>
                          {region.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleToggle(region)}
                            disabled={actionLoading === region._id}
                            title={region.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {region.isActive ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => openEditModal(region)} title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(region._id)}
                            disabled={actionLoading === region._id}
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
              <CardTitle>{editingId ? 'Edit Region' : 'Create Region'}</CardTitle>
              <Button variant="ghost" size="icon-sm" onClick={() => setModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    error={formErrors.name}
                    required
                  />
                  <Input
                    label="Province"
                    value={form.province}
                    onChange={(e) => setForm({ ...form, province: e.target.value })}
                    placeholder="e.g. Bagmati Province"
                  />
                </div>

                <Input
                  label="Short Description"
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                />
                <Input
                  label="Full Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />

                <Input
                  label="Districts (comma separated)"
                  value={form.districts}
                  onChange={(e) => setForm({ ...form, districts: e.target.value })}
                  placeholder="Kathmandu, Lalitpur, Bhaktapur"
                />

                <div className="grid grid-cols-2 gap-4">
                  <ImageField
                    label="Image"
                    value={form.image}
                    onChange={(url) => setForm({ ...form, image: url })}
                  />
                  <ImageField
                    label="Map Image"
                    value={form.mapImage}
                    onChange={(url) => setForm({ ...form, mapImage: url })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Sort Order"
                    type="number"
                    value={form.sortOrder || ''}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  />
                  <div className="flex items-center gap-2 pt-6">
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

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="SEO Title"
                    value={form.seoTitle}
                    onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                  />
                  <Input
                    label="SEO Description"
                    value={form.seoDescription}
                    onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
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