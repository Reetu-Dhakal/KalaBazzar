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
  Eye,
  ChevronRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
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

const PIE_COLORS: Record<string, string> = {
  pending: '#EAB308',
  confirmed: '#3B82F6',
  processing: '#6366F1',
  shipped: '#A855F7',
  delivered: '#22C55E',
  cancelled: '#EF4444',
  refunded: '#6B7280',
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
        {href && <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
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

const quickActions = [
  { to: '/admin/sellers', label: 'Manage Sellers', icon: Shield, description: 'Review applications' },
  { to: '/admin/orders', label: 'Manage Orders', icon: ShoppingCart, description: 'View all orders' },
  { to: '/admin/users', label: 'Manage Users', icon: Users, description: 'User administration' },
  { to: '/admin/coupons', label: 'Manage Coupons', icon: Package, description: 'Create & edit coupons' },
];

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
    name: `${monthNames[item.month - 1]} ${item.year}`,
    revenue: item.revenue,
    orders: item.orders,
  }));

  const pieData = Object.entries(stats?.ordersByStatus || {}).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    status,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your marketplace.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
        />
        <StatCard
          icon={ShoppingCart}
          label="Total Orders"
          value={stats?.totalOrders ?? 0}
          color="bg-amber-100 text-amber-700"
          href="/admin/orders"
        />
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          color="bg-green-100 text-green-700"
        />
      </div>

      {/* Pending Sellers */}
      {(stats?.pendingSellers ?? 0) > 0 && (
        <Card className="border-amber-200 bg-amber-50">
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

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
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
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `Rs ${v}`} />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#7C2D12" radius={[4, 4, 0, 0]} />
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

        {/* Orders by Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Orders by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={PIE_COLORS[entry.status] || '#6B7280'}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      formatter={(value: string) => value}
                      wrapperStyle={{ fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">
                No orders yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3">Action</th>
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
                      <td className="py-3">
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`/admin/orders`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Button
            key={action.to}
            asChild
            variant="outline"
            className="h-auto py-4 justify-start gap-3"
          >
            <Link to={action.to}>
              <action.icon className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
