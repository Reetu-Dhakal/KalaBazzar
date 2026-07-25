import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Store,
} from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, getStatusColor } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { SellerProfile, PaginationMeta } from '@/types';

const statusFilters = ['pending', 'approved', 'rejected'] as const;

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-lg" />
      ))}
    </div>
  );
}

export default function AdminSellers() {
  usePageTitle('Manage Sellers — KalaBazzar', 'Review and manage seller applications.');
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Reject modal
  const [rejectModal, setRejectModal] = useState<{ open: boolean; sellerId: string; storeName: string }>({
    open: false,
    sellerId: '',
    storeName: '',
  });
  const [rejectReason, setRejectReason] = useState('');

  const fetchSellers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      const { data } = await api.get('/admin/sellers', { params });
      setSellers(data.data.sellers || data.data || []);
      setPagination(data.pagination);
    } catch {
      setSellers([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await api.put(`/admin/sellers/${id}/approve`);
      toast.success('Seller approved successfully');
      fetchSellers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve seller');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please enter a rejection reason');
      return;
    }
    setActionLoading(rejectModal.sellerId);
    try {
      await api.put(`/admin/sellers/${rejectModal.sellerId}/reject`, { reason: rejectReason });
      toast.success('Seller application rejected');
      setRejectModal({ open: false, sellerId: '', storeName: '' });
      setRejectReason('');
      fetchSellers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject seller');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSellers();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading text-foreground">Manage Sellers</h1>
        <p className="text-muted-foreground mt-1">Review seller applications and manage artisans.</p>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? 'primary' : 'outline'}
            size="sm"
            onClick={() => { setStatusFilter(s); setPage(1); }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by store name..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          />
        </div>
        <Button type="submit" variant="outline" size="md">Search</Button>
      </form>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6"><TableSkeleton /></div>
          ) : sellers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Store className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No seller applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Store Name</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Owner</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Region</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Crafts</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Applied</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map((seller) => {
                    const user = typeof seller.user === 'object' ? seller.user : null;
                    return (
                      <tr key={seller._id} className="border-b border-border last:border-0">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {seller.logo ? (
                              <img src={seller.logo} alt="" className="h-8 w-8 rounded-lg object-cover" />
                            ) : (
                              <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                                <Store className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            <span className="text-sm font-medium">{seller.storeName}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm">
                          {user ? `${user.firstName} ${user.lastName}` : '—'}
                          <br />
                          <span className="text-xs text-muted-foreground">{user?.email}</span>
                        </td>
                        <td className="p-4 text-sm">
                          {typeof seller.region === 'object' ? seller.region.name : '—'}
                        </td>
                        <td className="p-4 text-sm">
                          {(seller.crafts || []).map((c) =>
                            typeof c === 'object' ? c.name : ''
                          ).filter(Boolean).join(', ') || '—'}
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(seller.status)}>{seller.status}</Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {formatDate(seller.createdAt)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            {seller.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => handleApprove(seller._id)}
                                  disabled={actionLoading === seller._id}
                                  title="Approve"
                                >
                                  <Check className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => setRejectModal({
                                    open: true,
                                    sellerId: seller._id,
                                    storeName: seller.storeName,
                                  })}
                                  disabled={actionLoading === seller._id}
                                  title="Reject"
                                >
                                  <X className="h-4 w-4 text-red-600" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Reject {rejectModal.storeName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Rejection Reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectModal({ open: false, sellerId: '', storeName: '' });
                    setRejectReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  isLoading={actionLoading === rejectModal.sellerId}
                >
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
