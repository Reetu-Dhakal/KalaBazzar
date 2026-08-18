import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  FolderTree,
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
import type { Category } from '@/types';

interface CategoryFormData {
  name: string;
  description: string;
  image: string;
  icon: string;
  parent: string;
  sortOrder: number;
  isActive: boolean;
  seoTitle: string;
  seoDescription: string;
}

const emptyForm: CategoryFormData = {
  name: '',
  description: '',
  image: '',
  icon: '',
  parent: '',
  sortOrder: 0,
  isActive: true,
  seoTitle: '',
  seoDescription: '',
};

interface FlatRow {
  category: Category;
  depth: number;
}

function flattenTree(tree: Category[], depth = 0): FlatRow[] {
  const rows: FlatRow[] = [];
  for (const node of tree) {
    rows.push({ category: node, depth });
    if (node.children) {
      rows.push(...flattenTree(node.children, depth + 1));
    }
  }
  return rows;
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-lg" />
      ))}
    </div>
  );
}

export default function AdminCategories() {
  usePageTitle('Manage Categories — कलाbazzar', 'Create and manage product categories.');
  const [rows, setRows] = useState<FlatRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/categories', {
        params: { isActive: 'all', includeProductCount: 'true' },
      });
      const tree: Category[] = data.data || [];
      setRows(flattenTree(tree));
    } catch {
      toast.error('Failed to load categories');
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingId(cat._id);
    setForm({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
      icon: cat.icon || '',
      parent: typeof cat.parent === 'string' ? cat.parent : cat.parent?._id || '',
      sortOrder: cat.sortOrder || 0,
      isActive: cat.isActive,
      seoTitle: cat.seo?.title || '',
      seoDescription: cat.seo?.description || '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const parentOptions = rows
    .filter((r) => r.category._id !== editingId)
    .map((r) => ({
      id: r.category._id,
      label: `${'— '.repeat(r.depth)}${r.category.name}`,
    }));

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
        description: form.description || undefined,
        image: form.image || undefined,
        icon: form.icon || undefined,
        parent: form.parent || null,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
        seo: form.seoTitle || form.seoDescription
          ? { title: form.seoTitle || undefined, description: form.seoDescription || undefined }
          : undefined,
      };

      if (editingId) {
        await api.put(`/categories/${editingId}`, payload);
        toast.success('Category updated');
      } else {
        await api.post('/categories', { ...payload, isActive: undefined });
        toast.success('Category created');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggle = async (cat: Category) => {
    setActionLoading(cat._id);
    try {
      await api.put(`/categories/${cat._id}`, { isActive: !cat.isActive });
      toast.success(`Category ${cat.isActive ? 'deactivated' : 'activated'}`);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update category');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    setActionLoading(id);
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRows = rows.filter((r) =>
    r.category.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading text-foreground">Manage Categories</h1>
          <p className="text-muted-foreground mt-1">Create and manage product categories.</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Create Category
        </Button>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          />
        </div>
      </form>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6"><TableSkeleton /></div>
          ) : filteredRows.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FolderTree className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No categories found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Category</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Products</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Created</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map(({ category, depth }) => (
                    <tr key={category._id} className="border-b border-border last:border-0">
                      <td className="p-4">
                        <div className="flex items-center gap-3" style={{ paddingLeft: depth * 20 }}>
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="h-10 w-10 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <FolderTree className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <span className="text-sm font-medium text-foreground">
                              {depth > 0 && <span className="text-muted-foreground mr-1">↳</span>}
                              {category.name}
                            </span>
                            {category.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-md">{category.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{category.productCount || 0}</td>
                      <td className="p-4 text-sm text-muted-foreground">{formatDate(category.createdAt)}</td>
                      <td className="p-4">
                        <Badge variant={category.isActive ? 'success' : 'destructive'}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleToggle(category)}
                            disabled={actionLoading === category._id}
                            title={category.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {category.isActive ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openEditModal(category)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(category._id)}
                            disabled={actionLoading === category._id}
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
              <CardTitle>{editingId ? 'Edit Category' : 'Create Category'}</CardTitle>
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
                  label="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Shown on category pages"
                />

                <div className="grid grid-cols-2 gap-4">
                  <ImageField
                    label="Image"
                    value={form.image}
                    onChange={(url) => setForm({ ...form, image: url })}
                  />
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Parent Category</label>
                      <select
                        value={form.parent}
                        onChange={(e) => setForm({ ...form, parent: e.target.value })}
                        className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">None (top level)</option>
                        {parentOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>{opt.label}</option>
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