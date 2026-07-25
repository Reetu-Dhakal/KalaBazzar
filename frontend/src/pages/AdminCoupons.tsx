import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Tag,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, formatCurrency } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { Coupon, PaginationMeta } from '@/types';

interface CouponFormData {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  maxDiscount: number;
  usageLimit: number;
  expiresAt: string;
  isActive: boolean;
}

const emptyForm: CouponFormData = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: 0,
  minPurchase: 0,
  maxDiscount: 0,
  usageLimit: 0,
  expiresAt: '',
  isActive: true,
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

export default function AdminCoupons() {
  usePageTitle('Manage Coupons — KalaBazzar', 'Create and manage discount coupons.');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (search.trim()) params.search = search.trim();
      const { data } = await api.get('/admin/coupons', { params });
      setCoupons(data.data.coupons || data.data || []);
      setPagination(data.pagination);
    } catch {
      setCoupons([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchase: coupon.minPurchase || 0,
      maxDiscount: coupon.maxDiscount || 0,
      usageLimit: coupon.usageLimit || 0,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split('T')[0] : '',
      isActive: coupon.isActive,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.code.trim()) errors.code = 'Code is required';
    if (form.discountValue <= 0) errors.discountValue = 'Discount must be > 0';
    if (form.discountType === 'percentage' && form.discountValue > 100) {
      errors.discountValue = 'Percentage cannot exceed 100';
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
        ...form,
        code: form.code.toUpperCase(),
        expiresAt: form.expiresAt || undefined,
      };

      if (editingId) {
        await api.put(`/admin/coupons/${editingId}`, payload);
        toast.success('Coupon updated');
      } else {
        await api.post('/admin/coupons', payload);
        toast.success('Coupon created');
      }
      setModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggle = async (coupon: Coupon) => {
    setActionLoading(coupon._id);
    try {
      await api.put(`/admin/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      toast.success(`Coupon ${coupon.isActive ? 'deactivated' : 'activated'}`);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update coupon');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    setActionLoading(id);
    try {
      await api.delete(`/admin/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete coupon');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading text-foreground">Manage Coupons</h1>
          <p className="text-muted-foreground mt-1">Create and manage discount coupons.</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Create Coupon
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          />
        </div>
        <Button type="submit" variant="outline">Search</Button>
      </form>

      {/* Coupons Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6"><TableSkeleton /></div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No coupons found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Code</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Discount</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Min Purchase</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Usage</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Expires</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon._id} className="border-b border-border last:border-0">
                      <td className="p-4">
                        <div>
                          <span className="text-sm font-mono font-bold text-primary">{coupon.code}</span>
                          {coupon.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{coupon.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}%`
                          : formatCurrency(coupon.discountValue)}
                      </td>
                      <td className="p-4 text-sm">
                        {coupon.minPurchase > 0 ? formatCurrency(coupon.minPurchase) : '—'}
                      </td>
                      <td className="p-4 text-sm">
                        {coupon.usedCount}
                        {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {coupon.expiresAt ? formatDate(coupon.expiresAt) : 'Never'}
                      </td>
                      <td className="p-4">
                        <Badge variant={coupon.isActive ? 'success' : 'destructive'}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleToggle(coupon)}
                            disabled={actionLoading === coupon._id}
                            title={coupon.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {coupon.isActive ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openEditModal(coupon)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(coupon._id)}
                            disabled={actionLoading === coupon._id}
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

      {/* Pagination */}
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

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Coupon' : 'Create Coupon'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Coupon Code"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SUMMER20"
                  error={formErrors.code}
                />
                <Input
                  label="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Discount Type</label>
                    <select
                      value={form.discountType}
                      onChange={(e) => setForm({ ...form, discountType: e.target.value as 'percentage' | 'fixed' })}
                      className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (NPR)</option>
                    </select>
                  </div>
                  <Input
                    label="Discount Value"
                    type="number"
                    value={form.discountValue || ''}
                    onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                    error={formErrors.discountValue}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Min Purchase (NPR)"
                    type="number"
                    value={form.minPurchase || ''}
                    onChange={(e) => setForm({ ...form, minPurchase: Number(e.target.value) })}
                  />
                  <Input
                    label="Max Discount (NPR)"
                    type="number"
                    value={form.maxDiscount || ''}
                    onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Usage Limit"
                    type="number"
                    value={form.usageLimit || ''}
                    onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
                    helperText="0 = unlimited"
                  />
                  <Input
                    label="Expires At"
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={actionLoading === 'form'}
                  >
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
