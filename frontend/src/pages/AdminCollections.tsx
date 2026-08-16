import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Layers,
  ToggleLeft,
  ToggleRight,
  X,
  ChevronLeft,
  ChevronRight,
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
import type { Collection, PaginationMeta } from '@/types';

interface CollectionFormData {
  name: string;
  shortDescription: string;
  description: string;
  image: string;
  banner: string;
  productIds: string;
  artisanIds: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

const emptyForm: CollectionFormData = {
  name: '',
  shortDescription: '',
  description: '',
  image: '',
  banner: '',
  productIds: '',
  artisanIds: '',
  isActive: true,
  isFeatured: false,
  sortOrder: 0,
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
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

function toIds(csv: string): string[] {
  return csv
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AdminCollections() {
  usePageTitle('Manage Collections — KalaBazzar', 'Create and manage product collections.');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CollectionFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchCollections = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (search.trim()) params.search = search.trim();
      const { data } = await api.get('/collections', { params });
      setCollections(data.data || []);
      setPagination(data.meta?.pagination);
    } catch {
      toast.error('Failed to load collections');
      setCollections([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (collection: Collection) => {
    setEditingId(collection._id);
    const productIds = (collection.products || []).map((p) =>
      typeof p === 'string' ? p : p._id,
    );
    const artisanIds = (collection.artisans || []).map((a) =>
      typeof a === 'string' ? a : a._id,
    );
    setForm({
      name: collection.name,
      shortDescription: collection.shortDescription || '',
      description: collection.description || '',
      image: collection.image || '',
      banner: collection.banner || '',
      productIds: productIds.join(', '),
      artisanIds: artisanIds.join(', '),
      isActive: collection.isActive,
      isFeatured: collection.isFeatured,
      sortOrder: collection.sortOrder || 0,
      seoTitle: collection.seo?.title || '',
      seoDescription: collection.seo?.description || '',
      seoKeywords: (collection.seo?.keywords || []).join(', '),
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
        banner: form.banner || undefined,
        products: toIds(form.productIds),
        artisans: toIds(form.artisanIds),
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        sortOrder: Number(form.sortOrder) || 0,
        seo: form.seoTitle || form.seoDescription || form.seoKeywords
          ? {
              title: form.seoTitle || undefined,
              description: form.seoDescription || undefined,
              keywords: form.seoKeywords
                ? form.seoKeywords.split(',').map((k) => k.trim()).filter(Boolean)
                : undefined,
            }
          : undefined,
      };

      if (editingId) {
        await api.put(`/collections/${editingId}`, payload);
        toast.success('Collection updated');
      } else {
        await api.post('/collections', payload);
        toast.success('Collection created');
      }
      setModalOpen(false);
      fetchCollections();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save collection');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggle = async (collection: Collection) => {
    setActionLoading(collection._id);
    try {
      await api.put(`/collections/${collection._id}`, { isActive: !collection.isActive });
      toast.success(`Collection ${collection.isActive ? 'deactivated' : 'activated'}`);
      fetchCollections();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update collection');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;
    setActionLoading(id);
    try {
      await api.delete(`/collections/${id}`);
      toast.success('Collection deleted');
      fetchCollections();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete collection');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const filteredCount = (ids: Array<string | object>) =>
    Array.isArray(ids) ? ids.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading text-foreground">Manage Collections</h1>
          <p className="text-muted-foreground mt-1">Create and manage product collections.</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Create Collection
        </Button>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search collections..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          />
        </div>
        <Button type="submit" variant="outline">Search</Button>
      </form>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6"><TableSkeleton /></div>
          ) : collections.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No collections found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Collection</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Products</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Artisans</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Created</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {collections.map((collection) => (
                    <tr key={collection._id} className="border-b border-border last:border-0">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {collection.image ? (
                            <img src={collection.image} alt={collection.name} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <Layers className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <span className="text-sm font-medium text-foreground">{collection.name}</span>
                            {collection.shortDescription && (
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-md">{collection.shortDescription}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{filteredCount(collection.products)}</td>
                      <td className="p-4 text-sm text-muted-foreground">{filteredCount(collection.artisans)}</td>
                      <td className="p-4 text-sm text-muted-foreground">{formatDate(collection.createdAt)}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <Badge variant={collection.isActive ? 'success' : 'destructive'} className="w-fit">
                            {collection.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {collection.isFeatured && (
                            <Badge variant="secondary" className="w-fit">Featured</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleToggle(collection)}
                            disabled={actionLoading === collection._id}
                            title={collection.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {collection.isActive ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => openEditModal(collection)} title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(collection._id)}
                            disabled={actionLoading === collection._id}
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

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={!pagination.hasNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingId ? 'Edit Collection' : 'Create Collection'}</CardTitle>
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

                <div className="grid grid-cols-2 gap-4">
                  <ImageField
                    label="Image"
                    value={form.image}
                    onChange={(url) => setForm({ ...form, image: url })}
                  />
                  <ImageField
                    label="Banner"
                    value={form.banner}
                    onChange={(url) => setForm({ ...form, banner: url })}
                  />
                </div>

                <Input
                  label="Product IDs (comma separated)"
                  value={form.productIds}
                  onChange={(e) => setForm({ ...form, productIds: e.target.value })}
                  placeholder="e.g. 5f8a..., 5f8b..."
                  helperText="Paste product IDs to add to this collection"
                />
                <Input
                  label="Artisan IDs (comma separated)"
                  value={form.artisanIds}
                  onChange={(e) => setForm({ ...form, artisanIds: e.target.value })}
                  placeholder="e.g. 5f8c..., 5f8d..."
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
                <Input
                  label="SEO Keywords (comma separated)"
                  value={form.seoKeywords}
                  onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
                />

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