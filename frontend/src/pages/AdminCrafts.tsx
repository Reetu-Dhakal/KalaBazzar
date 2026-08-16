import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Hammer,
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
import type { Craft, Region } from '@/types';

interface CraftFormData {
  name: string;
  shortDescription: string;
  description: string;
  image: string;
  icon: string;
  region: string;
  techniques: string;
  materials: string;
  history: string;
  culturalSignificance: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
}

const emptyForm: CraftFormData = {
  name: '',
  shortDescription: '',
  description: '',
  image: '',
  icon: '',
  region: '',
  techniques: '',
  materials: '',
  history: '',
  culturalSignificance: '',
  isActive: true,
  isFeatured: false,
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

export default function AdminCrafts() {
  usePageTitle('Manage Crafts — KalaBazzar', 'Create and manage craft types.');
  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CraftFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchCrafts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/crafts', {
        params: { isActive: 'all', includeProductCount: 'true' },
      });
      setCrafts(data.data || []);
    } catch {
      toast.error('Failed to load crafts');
      setCrafts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCrafts();
  }, [fetchCrafts]);

  useEffect(() => {
    if (!modalOpen) return;
    api
      .get('/regions', { params: { isActive: 'all' } })
      .then(({ data }) => setRegions(data.data || []))
      .catch(() => setRegions([]));
  }, [modalOpen]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (craft: Craft) => {
    setEditingId(craft._id);
    setForm({
      name: craft.name,
      shortDescription: craft.shortDescription || '',
      description: craft.description || '',
      image: craft.image || '',
      icon: craft.icon || '',
      region: craft.region || '',
      techniques: (craft.techniques || []).join(', '),
      materials: (craft.materials || []).join(', '),
      history: craft.history || '',
      culturalSignificance: craft.culturalSignificance || '',
      isActive: craft.isActive,
      isFeatured: craft.isFeatured,
      sortOrder: craft.sortOrder || 0,
      seoTitle: craft.seo?.title || '',
      seoDescription: craft.seo?.description || '',
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
        shortDescription: form.shortDescription || undefined,
        description: form.description || undefined,
        image: form.image || undefined,
        icon: form.icon || undefined,
        region: form.region || undefined,
        techniques: form.techniques
          ? form.techniques.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        materials: form.materials
          ? form.materials.split(',').map((m) => m.trim()).filter(Boolean)
          : [],
        history: form.history || undefined,
        culturalSignificance: form.culturalSignificance || undefined,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        sortOrder: Number(form.sortOrder) || 0,
        seo: form.seoTitle || form.seoDescription
          ? { title: form.seoTitle || undefined, description: form.seoDescription || undefined }
          : undefined,
      };

      if (editingId) {
        await api.put(`/crafts/${editingId}`, payload);
        toast.success('Craft updated');
      } else {
        await api.post('/crafts', { ...payload, isActive: undefined, isFeatured: undefined, sortOrder: undefined });
        toast.success('Craft created');
      }
      setModalOpen(false);
      fetchCrafts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save craft');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggle = async (craft: Craft) => {
    setActionLoading(craft._id);
    try {
      await api.put(`/crafts/${craft._id}`, { isActive: !craft.isActive });
      toast.success(`Craft ${craft.isActive ? 'deactivated' : 'activated'}`);
      fetchCrafts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update craft');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this craft?')) return;
    setActionLoading(id);
    try {
      await api.delete(`/crafts/${id}`);
      toast.success('Craft deleted');
      fetchCrafts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete craft');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCrafts = crafts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading text-foreground">Manage Crafts</h1>
          <p className="text-muted-foreground mt-1">Create and manage craft types.</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Create Craft
        </Button>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crafts..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          />
        </div>
      </form>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6"><TableSkeleton /></div>
          ) : filteredCrafts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Hammer className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No crafts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Craft</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Region</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Products</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Created</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCrafts.map((craft) => (
                    <tr key={craft._id} className="border-b border-border last:border-0">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {craft.image ? (
                            <img src={craft.image} alt={craft.name} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <Hammer className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <span className="text-sm font-medium text-foreground">{craft.name}</span>
                            {craft.shortDescription && (
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-md">{craft.shortDescription}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{craft.region ? 'Linked' : '—'}</td>
                      <td className="p-4 text-sm text-muted-foreground">{craft.productCount || 0}</td>
                      <td className="p-4 text-sm text-muted-foreground">{formatDate(craft.createdAt)}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <Badge variant={craft.isActive ? 'success' : 'destructive'} className="w-fit">
                            {craft.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {craft.isFeatured && (
                            <Badge variant="secondary" className="w-fit">Featured</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleToggle(craft)}
                            disabled={actionLoading === craft._id}
                            title={craft.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {craft.isActive ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => openEditModal(craft)} title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(craft._id)}
                            disabled={actionLoading === craft._id}
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
              <CardTitle>{editingId ? 'Edit Craft' : 'Create Craft'}</CardTitle>
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
                    label="Sort Order"
                    type="number"
                    value={form.sortOrder || ''}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Region</label>
                    <select
                      value={form.region}
                      onChange={(e) => setForm({ ...form, region: e.target.value })}
                      className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">None</option>
                      {regions.map((r) => (
                        <option key={r._id} value={r._id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="Icon"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="Icon name or URL"
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

                <ImageField
                  label="Image"
                  value={form.image}
                  onChange={(url) => setForm({ ...form, image: url })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Techniques (comma separated)"
                    value={form.techniques}
                    onChange={(e) => setForm({ ...form, techniques: e.target.value })}
                    placeholder="Hand carving, Lacquer, Painting"
                  />
                  <Input
                    label="Materials (comma separated)"
                    value={form.materials}
                    onChange={(e) => setForm({ ...form, materials: e.target.value })}
                    placeholder="Wood, Clay, Cotton"
                  />
                </div>

                <Input
                  label="History"
                  value={form.history}
                  onChange={(e) => setForm({ ...form, history: e.target.value })}
                />
                <Input
                  label="Cultural Significance"
                  value={form.culturalSignificance}
                  onChange={(e) => setForm({ ...form, culturalSignificance: e.target.value })}
                />

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

                <div className="flex items-center gap-4">
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
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={form.isFeatured}
                      onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                      className="h-4 w-4 rounded border-border"
                    />
                    <label htmlFor="isFeatured" className="text-sm font-medium">Featured</label>
                  </div>
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