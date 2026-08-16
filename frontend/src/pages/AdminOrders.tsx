import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  RefreshCcw,
  Check,
  X,
} from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { Order, OrderStatus, PaginationMeta } from '@/types';

const statusFilters: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Refund Requests', value: 'requested' },
];

const allStatuses: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-lg" />
      ))}
    </div>
  );
}

export default function AdminOrders() {
  usePageTitle('Manage Orders — KalaBazzar', 'View and manage all customer orders.');
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Refund review modal state
  const [reviewing, setReviewing] = useState<Order | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (statusFilter === 'requested') {
        params.refundStatus = 'requested';
      } else if (statusFilter) {
        params.status = statusFilter;
      }
      if (search.trim()) params.search = search.trim();
      const { data } = await api.get('/admin/orders', { params });
      setOrders(data.data || []);
      setPagination(data.meta?.pagination);
    } catch {
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const openReviewRefund = (order: Order) => {
    setReviewing(order);
    setRefundAmount(order.totalAmount);
    setReviewNote('');
  };

  const handleReviewRefund = async (action: 'approve' | 'reject') => {
    if (!reviewing) return;
    setReviewLoading(true);
    try {
      const body: Record<string, string | number> = { action, note: reviewNote };
      if (action === 'approve') body.amount = Number(refundAmount) || reviewing.totalAmount;
      await api.put(`/admin/orders/${reviewing._id}/refund`, body);
      toast.success(action === 'approve' ? 'Refund approved' : 'Refund request rejected');
      setReviewing(null);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to review refund');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading text-foreground">Manage Orders</h1>
        <p className="text-muted-foreground mt-1">View and manage all customer orders.</p>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((s) => (
          <Button
            key={s.value}
            variant={statusFilter === s.value ? 'primary' : 'outline'}
            size="sm"
            onClick={() => { setStatusFilter(s.value); setPage(1); }}
          >
            {s.label}
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
            placeholder="Search by order # or customer..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          />
        </div>
        <Button type="submit" variant="outline">Search</Button>
      </form>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6"><TableSkeleton /></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Order #</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Customer</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Items</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Total</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Refund</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Date</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const customer = typeof order.customer === 'object' ? order.customer : null;
                    return (
                      <tr key={order._id} className="border-b border-border last:border-0">
                        <td className="p-4">
                          <span className="text-sm font-medium text-primary">{order.orderNumber}</span>
                        </td>
                        <td className="p-4 text-sm">
                          {customer ? `${customer.firstName} ${customer.lastName}` : '—'}
                          <br />
                          <span className="text-xs text-muted-foreground">{customer?.email}</span>
                        </td>
                        <td className="p-4 text-sm">{order.items?.length ?? 0}</td>
                        <td className="p-4 text-sm font-medium">{formatCurrency(order.totalAmount)}</td>
                        <td className="p-4">
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </td>
                        <td className="p-4">
                          {order.refundStatus && order.refundStatus !== 'none' ? (
                            <Badge
                              className={
                                order.refundStatus === 'approved'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                  : order.refundStatus === 'rejected'
                                  ? 'bg-red-50 text-red-700 border border-red-200/60'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                              }
                            >
                              {order.refundStatus}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            {order.refundStatus === 'requested' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openReviewRefund(order)}
                                title="Review refund request"
                              >
                                <RefreshCcw className="h-3.5 w-3.5" />
                                Review
                              </Button>
                            )}
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                              disabled={updatingId === order._id}
                              className="text-xs border border-border rounded-md px-2 py-1 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                              {allStatuses.map((s) => (
                                <option key={s} value={s}>
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </option>
                              ))}
                            </select>
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

      {/* Refund review modal */}
      {reviewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Review Refund Request</CardTitle>
              <Button variant="ghost" size="icon-sm" onClick={() => setReviewing(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground">
                Order <span className="font-medium text-primary">{reviewing.orderNumber}</span>
              </p>
              {reviewing.refundReason && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Customer reason</p>
                  <p className="text-sm text-foreground bg-muted/40 rounded-lg p-3">{reviewing.refundReason}</p>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order total</span>
                <span className="font-medium">{formatCurrency(reviewing.totalAmount)}</span>
              </div>
              <Input
                label="Refund amount (NPR)"
                type="number"
                min="0"
                max={reviewing.totalAmount}
                value={refundAmount || ''}
                onChange={(e) => setRefundAmount(Number(e.target.value))}
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Review note (optional)</label>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  rows={3}
                  placeholder="Visible to the customer (set when rejecting)"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="destructive"
                  onClick={() => handleReviewRefund('reject')}
                  isLoading={reviewLoading}
                >
                  <X className="h-4 w-4" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleReviewRefund('approve')}
                  isLoading={reviewLoading}
                >
                  <Check className="h-4 w-4" />
                  Approve Refund
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
