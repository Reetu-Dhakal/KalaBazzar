import { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  CreditCard,
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
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import api from '@/lib/api';
import type { Order, PaginationMeta } from '@/types';

interface EarningsData {
  totalEarnings: number;
  averageOrderValue: number;
  totalOrders: number;
  pendingPayout: number;
  earningsData: { date: string; earnings: number }[];
  recentOrders: Order[];
  pagination: PaginationMeta;
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

export default function SellerEarnings() {
  usePageTitle('Earnings — KalaBazzar', 'View your earnings and payout information.');
  const [data, setData] = useState<EarningsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const { data: res } = await api.get('/sellers/dashboard/stats');
        setData({
          totalEarnings: res.data.totalRevenue || 0,
          averageOrderValue: res.data.averageOrderValue || 0,
          totalOrders: res.data.totalOrders || 0,
          pendingPayout: res.data.pendingPayout || 0,
          earningsData: res.data.revenueData || [],
          recentOrders: res.data.recentOrders || [],
          pagination: res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
        });
      } catch {
        // handled
      } finally {
        setIsLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl mb-8" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading text-foreground mb-2">Earnings</h1>
      <p className="text-muted-foreground mb-8">Track your revenue and payouts.</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={DollarSign}
          label="Total Earnings"
          value={formatCurrency(data?.totalEarnings ?? 0)}
          color="bg-green-100 text-green-700"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg. Order Value"
          value={formatCurrency(data?.averageOrderValue ?? 0)}
          color="bg-blue-100 text-blue-700"
        />
        <StatCard
          icon={ShoppingCart}
          label="Total Orders"
          value={data?.totalOrders ?? 0}
          color="bg-purple-100 text-purple-700"
        />
        <StatCard
          icon={CreditCard}
          label="Pending Payout"
          value={formatCurrency(data?.pendingPayout ?? 0)}
          color="bg-amber-100 text-amber-700"
        />
      </div>

      {/* Earnings Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Earnings (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.earningsData && data.earningsData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.earningsData}>
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
                    formatter={(value: number) => [formatCurrency(value), 'Earnings']}
                    labelFormatter={(label: string) => new Date(label).toLocaleDateString()}
                  />
                  <Bar dataKey="earnings" fill="#C89B3C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">
              No earnings data yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Payout Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pending Payout</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(data?.pendingPayout ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Payouts are processed weekly on Mondays.
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Commission Rate</p>
              <p className="text-2xl font-bold text-foreground">10%</p>
              <p className="text-xs text-muted-foreground mt-1">
                Platform commission on each sale.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recentOrders && data.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Order</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Customer</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Amount</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => {
                    const customerName =
                      typeof order.customer === 'object' && order.customer
                        ? `${order.customer.firstName} ${order.customer.lastName}`
                        : 'Customer';
                    return (
                      <tr key={order._id} className="border-b border-border last:border-0">
                        <td className="p-3 text-sm font-medium text-primary">{order.orderNumber}</td>
                        <td className="p-3 text-sm text-foreground">{customerName}</td>
                        <td className="p-3 text-sm font-medium">{formatCurrency(order.totalAmount)}</td>
                        <td className="p-3">
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{formatDate(order.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No earnings yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
