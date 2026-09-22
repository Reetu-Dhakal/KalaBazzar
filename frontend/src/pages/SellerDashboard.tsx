import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, DollarSign, Star, Plus, AlertTriangle } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import api from '@/lib/api';
import type { Product, Order } from '@/types';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  recentOrders: Order[];
  lowStockProducts: Product[];
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-primary" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className="mt-3 font-heading text-3xl text-foreground">{value}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 lg:col-span-1" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}

export default function SellerDashboard() {
  usePageTitle('Seller Dashboard — कलाbazzar', 'Manage your products, orders, and store.');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/sellers/dashboard/stats');
        setStats(data.data);
      } catch {
        // error handled by empty state
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading text-foreground">Seller Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your store at a glance.</p>
        </div>
        <Button asChild>
          <Link to="/seller/products/new">
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Package} label="Total Products" value={stats?.totalProducts ?? 0} />
        <StatCard icon={ShoppingCart} label="Total Orders" value={stats?.totalOrders ?? 0} />
        <StatCard icon={DollarSign} label="Total Revenue" value={formatCurrency(stats?.totalRevenue ?? 0)} />
        <StatCard icon={Star} label="Average Rating" value={stats?.averageRating?.toFixed(1) ?? '0.0'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-secondary" />
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
              <div className="divide-y divide-border border-t border-border">
                {stats.lowStockProducts.map((product) => {
                  const stock = product.variants?.[0]?.inventory ?? 0;
                  return (
                    <div key={product._id} className="flex items-center justify-between py-3">
                      <div className="min-w-0 pr-4">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {stock === 0 ? 'Out of stock' : `${stock} left`}
                        </p>
                      </div>
                      <Badge variant={stock === 0 ? 'destructive' : 'warning'}>
                        {stock === 0 ? 'OOS' : stock}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                All products are well-stocked
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/seller/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-medium text-muted-foreground pb-3">Order #</th>
                      <th className="text-left text-xs font-medium text-muted-foreground pb-3">Customer</th>
                      <th className="text-left text-xs font-medium text-muted-foreground pb-3">Total</th>
                      <th className="text-left text-xs font-medium text-muted-foreground pb-3">Status</th>
                      <th className="text-left text-xs font-medium text-muted-foreground pb-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => (
                      <tr key={order._id} className="border-b border-border last:border-0">
                        <td className="py-3">
                          <Link
                            to="/seller/orders"
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3 text-sm text-foreground">
                          {typeof order.customer === 'object' && order.customer
                            ? `${order.customer.firstName} ${order.customer.lastName}`
                            : 'Customer'}
                        </td>
                        <td className="py-3 text-sm font-medium">{formatCurrency(order.totalAmount)}</td>
                        <td className="py-3">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No orders yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}