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
  revenueData: { date?: string; year?: number; month?: number; revenue: number; orders: number }[];
}

interface RevenuePoint {
  name: string;
  revenue: number;
  orders: number;
  fullDate?: Date;
  meta?: { monthKey: string; weekIndex: number };
}

interface DayDetail {
  date: string;
  summary: {
    receivedOrders: number;
    totalIncome: number;
    completedOrders: number;
    pendingOrders: number;
  };
  orders: Order[];
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

const monthNamesArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminDashboard() {
  usePageTitle('Admin Dashboard — कलाbazzar', 'Admin panel for managing the कलाbazzar platform.');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [monthKey, setMonthKey] = useState<string | null>(null);
  const [weekIndex, setWeekIndex] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayDetail, setDayDetail] = useState<DayDetail | null>(null);
  const [isLoadingDay, setIsLoadingDay] = useState(false);

  useEffect(() => {
    if (!selectedDate) {
      setDayDetail(null);
      return;
    }
    setIsLoadingDay(true);
    setDayDetail(null);
    api
      .get('/admin/dashboard/day', { params: { date: selectedDate } })
      .then(({ data }) => setDayDetail(data.data))
      .catch(() => setDayDetail(null))
      .finally(() => setIsLoadingDay(false));
  }, [selectedDate]);

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

  const dailyBuckets = new Map<string, { revenue: number; orders: number }>();
  (stats?.revenueData || []).forEach((item) => {
    if (item.date) {
      dailyBuckets.set(item.date, { revenue: item.revenue, orders: item.orders });
    }
  });

  const months: RevenuePoint[] = (() => {
    const now = new Date();
    const out: RevenuePoint[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const month = stats?.revenueByMonth?.find((m) => m.year === d.getFullYear() && m.month === d.getMonth() + 1);
      out.push({
        name: `${monthNamesArr[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`,
        revenue: month?.revenue || 0,
        orders: month?.orders || 0,
        meta: { monthKey: key, weekIndex: -1 },
      });
    }
    return out;
  })();

  const getWeeksForMonth = (key: string): RevenuePoint[] => {
    const [year, month] = key.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const weeks: RevenuePoint[] = [];
    for (let start = 1; start <= daysInMonth; start += 7) {
      const end = Math.min(start + 6, daysInMonth);
      let revenue = 0;
      let orders = 0;
      for (let day = start; day <= end; day++) {
        const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const b = dailyBuckets.get(dateKey);
        revenue += b?.revenue || 0;
        orders += b?.orders || 0;
      }
      weeks.push({
        name: `Week ${weeks.length + 1} (${start}-${end})`,
        revenue,
        orders,
        meta: { monthKey: key, weekIndex: weeks.length },
      });
    }
    return weeks;
  };

  const getDaysForWeek = (key: string, wkIndex: number): RevenuePoint[] => {
    const [year, month] = key.split('-').map(Number);
    const start = wkIndex * 7 + 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    const out: RevenuePoint[] = [];
    for (let day = start; day <= Math.min(start + 6, daysInMonth); day++) {
      const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const b = dailyBuckets.get(dateKey);
      const full = new Date(year, month - 1, day);
      out.push({
        name: `${monthNamesArr[month - 1]} ${day}`,
        revenue: b?.revenue || 0,
        orders: b?.orders || 0,
        fullDate: full,
      });
    }
    return out;
  };

  const currentMonth = months.find((m) => m.meta?.monthKey === monthKey) || null;
  const weeks = monthKey ? getWeeksForMonth(monthKey) : [];
  const currentWeek = weekIndex !== null ? weeks.find((w) => w.meta?.weekIndex === weekIndex) || null : null;
  const days = monthKey && weekIndex !== null ? getDaysForWeek(monthKey, weekIndex) : [];

  const chartData: RevenuePoint[] =
    weekIndex !== null ? days : monthKey ? weeks : months;
  const chartTitle =
    weekIndex !== null && currentWeek
      ? `${currentMonth?.name || monthKey} — ${currentWeek.name}`
      : monthKey
        ? `Revenue — ${currentMonth?.name || monthKey}`
        : 'Revenue (Last 12 Months)';

  const resetDrill = () => {
    setMonthKey(null);
    setWeekIndex(null);
    setSelectedDate(null);
  };

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
          color="bg-blue-50 text-blue-600"
          href="/admin/users"
        />
        <StatCard
          icon={Shield}
          label="Total Sellers"
          value={stats?.totalSellers ?? 0}
          color="bg-purple-50 text-purple-600"
          href="/admin/sellers"
        />
        <StatCard
          icon={Package}
          label="Total Products"
          value={stats?.totalProducts ?? 0}
          color="bg-amber-50 text-amber-600"
          href="/admin/orders"
        />
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          color="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {chartTitle}
            </CardTitle>
            <div className="flex items-center gap-2">
              {(monthKey || weekIndex !== null) && (
                <Button variant="outline" size="sm" onClick={resetDrill}>
                  All Months
                </Button>
              )}
              {monthKey && weekIndex !== null && (
                <Button variant="ghost" size="sm" onClick={() => { setWeekIndex(null); setSelectedDate(null); }}>
                  Back to Weeks
                </Button>
              )}
              {selectedDate && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedDate(null)}>
                  Back to Days
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    onClick={(state: any) => {
                      if (!state || !state.activePayload || state.activePayload.length === 0) return;
                      const entry = state.activePayload[0]?.payload as RevenuePoint | undefined;
                      if (!entry) return;
                      if (!monthKey) {
                        if (entry.meta?.monthKey) {
                          setMonthKey(entry.meta.monthKey);
                          setWeekIndex(null);
                        }
                      } else if (weekIndex === null) {
                        if (entry.meta?.weekIndex !== undefined && entry.meta.weekIndex >= 0) {
                          setWeekIndex(entry.meta.weekIndex);
                        }
                      } else {
                        if (entry.fullDate) {
                          const key = `${entry.fullDate.getFullYear()}-${String(entry.fullDate.getMonth() + 1).padStart(2, '0')}-${String(entry.fullDate.getDate()).padStart(2, '0')}`;
                          setSelectedDate(key);
                        }
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      interval={weekIndex !== null ? 0 : 'preserveStartEnd'}
                    />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `Rs ${v}`} />
                    <Tooltip
                      cursor={{ fill: 'rgba(139, 69, 19, 0.08)' }}
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                      labelFormatter={(label: string) => {
                        const p = chartData.find((d) => d.name === label);
                        if (!p) return label;
                        const weekday = p.fullDate
                          ? ` ${p.fullDate.toLocaleDateString(undefined, { weekday: 'short' })}`
                          : '';
                        return `${label}${weekday} — ${p.orders} order${p.orders === 1 ? '' : 's'} (click to drill down)`;
                      }}
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
            <p className="mt-3 text-xs text-muted-foreground">
              Click a month to view its weeks, then click a week to see each day&apos;s revenue. Click a day for full details.
            </p>

            {isLoadingDay && (
              <div className="mt-4 h-40 flex items-center justify-center text-muted-foreground text-sm">
                Loading day details...
              </div>
            )}

            {!isLoadingDay && dayDetail && (
              <div className="mt-6 border-t border-border pt-5">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  <h3 className="text-lg font-heading font-semibold text-foreground">
                    {(() => {
                      const [y, m, d] = dayDetail.date.split('-').map(Number);
                      return new Date(y, m - 1, d).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      });
                    })()} — Day Details
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {dayDetail.summary.receivedOrders} order{dayDetail.summary.receivedOrders === 1 ? '' : 's'} received
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Received Orders</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{dayDetail.summary.receivedOrders}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-4">
                    <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Total Income</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-700">{formatCurrency(dayDetail.summary.totalIncome)}</p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-4">
                    <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Completed Orders</p>
                    <p className="mt-1 text-2xl font-bold text-green-700">{dayDetail.summary.completedOrders}</p>
                  </div>
                </div>

                {dayDetail.orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Order #</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Customer</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Total</th>
                          <th className="text-left text-xs font-medium text-muted-foreground pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dayDetail.orders.map((order) => (
                          <tr key={order._id} className="border-b border-border last:border-0">
                            <td className="py-3">
                              <Link to={`/admin/orders`} className="text-sm font-medium text-primary hover:underline">
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>No orders received on this day</p>
                  </div>
                )}
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
