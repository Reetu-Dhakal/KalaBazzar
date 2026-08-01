import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Shield,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
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
  recentOrders: Order[];
  ordersByStatus: Record<string, number>;
  revenueByMonth: { year: number; month: number; revenue: number; orders: number }[];
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
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  processing: 'bg-indigo-500',
  shipped: 'bg-purple-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
  refunded: 'bg-gray-500',
};

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  href?: string;
}) {
  const content = (
    <CardContent className="p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground truncate">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </CardContent>
  );

  if (href) {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <Link to={href}>{content}</Link>
      </Card>
    );
  }
  return <Card>{content}</Card>;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminDashboard() {
  usePageTitle('Admin Dashboard — KalaBazzar', 'Admin panel for managing the KalaBazzar platform.');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
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

  const revenueData = (stats?.revenueByMonth || []).map((item) => ({
    name: `${monthNames[item.month - 1]}`,
    revenue: item.revenue,
    orders: item.orders,
  }));

  const statusEntries = Object.entries(stats?.ordersByStatus || {}).filter(([, count]) => count > 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your marketplace overview.</p>
        </div>
        <div className="flex items-center gap-2">
          {(stats?.pendingSellers ?? 0) > 0 && (
            <Button asChild variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50">
              <Link to="/admin/sellers">
                <Clock className="h-4 w-4" />
                {stats?.pendingSellers} Pending
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats?.totalUsers ?? 0}
          color="bg-blue-100 text-blue-700"
          href="/admin/users"
        />
        <StatCard
          icon={Shield}
          label="Total Sellers"
          value={stats?.totalSellers ?? 0}
          color="bg-purple-100 text-purple-700"
          href="/admin/sellers"
        />
        <StatCard
          icon={Package}
          label="Total Products"
          value={stats?.totalProducts ?? 0}
          color="bg-indigo-100 text-indigo-700"
          href="/admin/orders"
        />
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          color="bg-green-100 text-green-700"
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Revenue (Last 12 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {revenueData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `Rs ${v}`} />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#8B4513" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">
                No revenue data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Orders by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusEntries.length > 0 ? (
              <div className="space-y-3">
                {statusEntries.map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${STATUS_DOT[status] || 'bg-gray-400'}`} />
                      <p className="text-sm font-medium truncate">{STATUS_LABELS[status] || status}</p>
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No orders yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Sellers Alert */}
      {(stats?.pendingSellers ?? 0) > 0 && (
        <Card className="border-amber-200 bg-amber-50 mb-8">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    {stats?.pendingSellers} pending seller {stats?.pendingSellers === 1 ? 'application' : 'applications'}
                  </p>
                  <p className="text-xs text-amber-600">Review and approve artisan applications</p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/sellers">Review</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/orders">View All</Link>
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
                        <span className="text-sm font-medium text-primary">{order.orderNumber}</span>
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
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No orders yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
