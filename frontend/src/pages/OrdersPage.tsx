import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import api from '@/lib/api';
import type { Order, OrderStatus, PaginationMeta } from '@/types';

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const LIMIT = 10;

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-xl" />
      ))}
    </div>
  );
}

export default function OrdersPage() {
  usePageTitle('My Orders');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', statusFilter, page],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(LIMIT),
      };
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/orders', { params });
      return {
        orders: data.data.orders || [],
        pagination: data.data.pagination as PaginationMeta,
      };
    },
  });

  const orders = data?.orders || [];
  const pagination = data?.pagination;

  const getStatusLabel = (status: OrderStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">My Orders</span>
      </nav>

      <h1 className="text-3xl font-heading text-foreground mb-6">My Orders</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => {
              setStatusFilter(filter.value);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === filter.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-accent text-muted-foreground hover:text-foreground hover:bg-accent/80'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <OrdersSkeleton />
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-heading text-foreground mb-2">No orders found</h2>
          <p className="text-muted-foreground mb-6">
            {statusFilter
              ? `You don't have any ${statusFilter} orders.`
              : "You haven't placed any orders yet."}
          </p>
          <Button asChild>
            <Link to="/shop">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: Order) => (
            <Link key={order._id} to={`/orders/${order._id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Package className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Order #{order.orderNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {order.items.slice(0, 3).map((item, i) => {
                          const snapshot = item.productSnapshot;
                          return (
                            <div key={i} className="flex items-center gap-1.5">
                              {snapshot.images?.[0] && (
                                <div className="w-8 h-8 rounded overflow-hidden bg-accent flex-shrink-0">
                                  <img
                                    src={snapshot.images[0]}
                                    alt={snapshot.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                                {snapshot.name}
                                {item.quantity > 1 && ` ×${item.quantity}`}
                              </span>
                            </div>
                          );
                        })}
                        {order.items.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:flex-shrink-0">
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrev}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNext}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
