import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, Package, DollarSign, Clock } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import api from '@/lib/api';
import type { Order } from '@/types';

interface DashboardStats {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingSellers: number;
  pendingSellerApplications: number;
  recentOrders: Order[];
  ordersByStatus: Record<string, number>;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

const STATUS_DOT: Record<string, string> = {
  pending: 'bg-amber-500',
  confirmed: 'bg-red-600',
  processing: 'bg-gold-500',
  shipped: 'bg-red-400',
  delivered: 'bg-green-500',
  cancelled: 'bg-gray-500',
  refunded: 'bg-gray-400',
};

function StatCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  href?: string;
}) {
  const content = (
    <div className="border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-primary" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className="mt-3 font-heading text-3xl text-foreground">{value}</p>
    </div>
  );

  if (href) {
    return <Link to={href} className="block hover:border-primary">{content}</Link>;
  }
  return content;
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
      <div className="grid lg:grid-cols-3 gap-6">
        <Skeleton className="h-72 lg:col-span-1" />
        <Skeleton className="h-72 lg:col-span-2" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

export default function AdminDashboard() {
  usePageTitle('Admin Dashboard — कलाbazzar', 'Admin panel for managing the कलाbazzar platform.');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get('/admin/dashboard');
        setStats(data.data);
      } catch {
        // handled by empty state
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  const statusEntries = Object.entries(stats?.ordersByStatus || {}).filter(([, count]) => count > 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform overview.</p>
        </div>
        {(stats?.pendingSellers ?? 0) > 0 && (
          <Button asChild variant="outline" size="sm" className="border-gold-500 text-gold-700">
            <Link to="/admin/sellers">
              <Clock className="h-4 w-4" />
              {stats?.pendingSellers} Pending Sellers
            </Link>
          </Button>
        )}
        {(stats?.pendingSellerApplications ?? 0) > 0 && (
          <Button asChild variant="outline" size="sm" className="border-gold-500 text-gold-700">
            <Link to="/admin/seller-applications">
              <Clock className="h-4 w-4" />
              {stats?.pendingSellerApplications} New Applications
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers ?? 0} href="/admin/users" />
        <StatCard icon={Shield} label="Total Sellers" value={stats?.totalSellers ?? 0} href="/admin/sellers" />
        <StatCard icon={Package} label="Total Products" value={stats?.totalProducts ?? 0} href="/admin/orders" />
        <StatCard icon={DollarSign} label="Total Revenue" value={formatCurrency(stats?.totalRevenue ?? 0)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusEntries.length > 0 ? (
              <div className="divide-y divide-border border-t border-border">
                {statusEntries.map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 ${STATUS_DOT[status] || 'bg-gray-400'}`} />
                      <p className="text-sm">{STATUS_LABELS[status] || status}</p>
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                No orders yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="overflow-x-auto px-6 pb-6">
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
                          <Link to="/admin/orders" className="text-sm font-medium text-primary hover:underline">
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
                <p>No orders yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}