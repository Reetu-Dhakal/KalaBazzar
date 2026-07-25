import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import api from '@/lib/api';
import type { Order, OrderStatus, PaginationMeta } from '@/types';

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
];

export default function SellerOrders() {
  usePageTitle('My Orders — KalaBazzar', 'Manage and fulfill customer orders.');
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  const page = parseInt(searchParams.get('page') || '1', 10);
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(search);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');
      if (status) params.set('status', status);
      if (search) params.set('search', search);

      const { data } = await api.get(`/orders?${params.toString()}`);
      setOrders(data.data.orders || []);
      setPagination(data.data.pagination || null);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateParams = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  const handleSearch = () => {
    updateParams('search', searchInput);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated');
      fetchOrders();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTrackingUpdate = async (orderId: string) => {
    const trackingNumber = trackingInputs[orderId];
    if (!trackingNumber?.trim()) return;
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/tracking`, { trackingNumber: trackingNumber.trim() });
      toast.success('Tracking number updated');
      setTrackingInputs((prev) => ({ ...prev, [orderId]: '' }));
      fetchOrders();
    } catch {
      toast.error('Failed to update tracking');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-heading text-foreground">My Orders</h1>
        <p className="text-muted-foreground mt-1">Manage and fulfill customer orders.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by order number or customer..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <select
          value={status}
          onChange={(e) => updateParams('status', e.target.value)}
          className="h-10 rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {STATUS_FILTERS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">No orders found</h3>
            <p className="text-muted-foreground">
              {search || status ? 'Try adjusting your filters.' : 'Orders will appear here when customers place them.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Order #</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Customer</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Items</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Total</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Date</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const customerName =
                      typeof order.customer === 'object' && order.customer
                        ? `${order.customer.firstName} ${order.customer.lastName}`
                        : 'Customer';
                    const itemCount = order.items?.length ?? 0;
                    return (
                      <tr key={order._id} className="border-b border-border last:border-0">
                        <td className="p-4">
                          <span className="text-sm font-medium text-primary">{order.orderNumber}</span>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-foreground">{customerName}</p>
                          {typeof order.customer === 'object' && order.customer && (
                            <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                          )}
                        </td>
                        <td className="p-4 text-sm text-foreground">
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </td>
                        <td className="p-4 text-sm font-medium">{formatCurrency(order.totalAmount)}</td>
                        <td className="p-4">
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{formatDate(order.createdAt)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleStatusUpdate(order._id, e.target.value as OrderStatus)
                              }
                              disabled={updatingId === order._id}
                              className="h-8 text-xs rounded border bg-card px-2 focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                              {ORDER_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                            {order.status === 'shipped' && (
                              <div className="flex items-center gap-1">
                                <Input
                                  placeholder="Tracking #"
                                  value={trackingInputs[order._id] || ''}
                                  onChange={(e) =>
                                    setTrackingInputs((prev) => ({
                                      ...prev,
                                      [order._id]: e.target.value,
                                    }))
                                  }
                                  className="h-8 w-28 text-xs"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => handleTrackingUpdate(order._id)}
                                  disabled={!trackingInputs[order._id]?.trim()}
                                >
                                  <Truck className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} orders
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrev}
                  onClick={() => updateParams('page', String(page - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNext}
                  onClick={() => updateParams('page', String(page + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
