import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  DollarSign,
  Star,
  Plus,
  Eye,
  Settings,
  AlertTriangle,
  TrendingUp,
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
  revenueData: { date: string; revenue: number }[];
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
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

export default function SellerDashboard() {
  usePageTitle('Seller Dashboard — KalaBazzar', 'Manage your products, orders, and store.');
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
          <p className="text-muted-foreground mt-1">Welcome back! Here's your store overview.</p>
        </div>
        <Button asChild>
          <Link to="/seller/products/new">
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Package}
          label="Total Products"
          value={stats?.totalProducts ?? 0}
          color="bg-blue-100 text-blue-700"
        />
        <StatCard
          icon={ShoppingCart}
          label="Total Orders"
          value={stats?.totalOrders ?? 0}
          color="bg-purple-100 text-purple-700"
        />
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          color="bg-green-100 text-green-700"
        />
        <StatCard
          icon={Star}
          label="Average Rating"
          value={stats?.averageRating?.toFixed(1) ?? '0.0'}
          color="bg-amber-100 text-amber-700"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Revenue (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.revenueData && stats.revenueData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v: string) => {
                        const d = new Date(v);
                        return `${d.getMonth() + 1}/${d.getDate()}`;
                      }}
                    />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `Rs ${v}`} />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                      labelFormatter={(label: string) => new Date(label).toLocaleDateString()}
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

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {stats.lowStockProducts.map((product) => {
                  const stock = product.variants?.[0]?.inventory ?? 0;
                  return (
                    <div
                      key={product._id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                      <div className="min-w-0">
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
      </div>

      {/* Recent Orders */}
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
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3">
                      Order #
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3">
                      Customer
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3">
                      Total
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id} className="border-b border-border last:border-0">
                      <td className="py-3">
                        <Link
                          to={`/seller/orders`}
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
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No orders yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <Button asChild variant="outline" className="h-auto py-4 justify-start gap-3">
          <Link to="/seller/products/new">
            <Plus className="h-5 w-5 text-primary" />
            <div className="text-left">
              <p className="font-medium">Add Product</p>
              <p className="text-xs text-muted-foreground">Create a new listing</p>
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 justify-start gap-3">
          <Link to="/seller/orders">
            <Eye className="h-5 w-5 text-primary" />
            <div className="text-left">
              <p className="font-medium">View Orders</p>
              <p className="text-xs text-muted-foreground">Manage customer orders</p>
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 justify-start gap-3">
          <Link to="/seller/settings">
            <Settings className="h-5 w-5 text-primary" />
            <div className="text-left">
              <p className="font-medium">Edit Store</p>
              <p className="text-xs text-muted-foreground">Update your store settings</p>
            </div>
          </Link>
        </Button>
      </div>
    </div>
  );
}
