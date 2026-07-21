import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineUsers,
  HiOutlineCube,
  HiOutlineShoppingBag,
  HiOutlineCurrencyDollar,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineTruck,
  HiOutlineXCircle,
  HiOutlineCog,
  HiOutlineOfficeBuilding,
  HiOutlineArrowRight,
} from 'react-icons/hi';
import API from '../../utils/axios';
import { Container, LoadingSkeleton } from '../../components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: res } = await API.get('/admin/dashboard');
        setData(res.data);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const chartData = data?.revenueByMonth?.map((item) => ({
    name: monthNames[item._id.month - 1],
    revenue: item.revenue,
    orders: item.orders,
  })) || [];

  const statCards = data?.stats
    ? [
        { label: 'Total Users', value: data.stats.totalUsers, icon: HiOutlineUsers, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Sellers', value: data.stats.totalSellers, icon: HiOutlineOfficeBuilding, color: 'text-primary', bg: 'bg-primary/5' },
        { label: 'Products', value: data.stats.totalProducts, icon: HiOutlineCube, color: 'text-secondary', bg: 'bg-amber-50' },
        { label: 'Total Orders', value: data.stats.totalOrders, icon: HiOutlineShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Revenue', value: `Rs. ${data.stats.totalRevenue.toLocaleString()}`, icon: HiOutlineCurrencyDollar, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Pending Sellers', value: data.stats.pendingSellers, icon: HiOutlineClock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Pending Orders', value: data.stats.pendingOrders, icon: HiOutlineTruck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      ]
    : [];

  return (
    <div className="min-h-screen pt-24">
      <Container>
        <div className="py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="font-heading text-4xl md:text-5xl font-semibold text-text mb-2">
              Admin Dashboard
            </h1>
            <p className="text-text-muted">Platform overview and management</p>
          </motion.div>

          {loading ? (
            <LoadingSkeleton variant="card" count={4} />
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
                {statCards.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl border border-border/50 p-5"
                  >
                    <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <p className="text-xl font-heading font-semibold text-text mb-0.5">{stat.value}</p>
                    <p className="text-xs text-text-muted">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Revenue Chart */}
              {chartData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl border border-border/50 p-6 md:p-8 mb-8"
                >
                  <h2 className="font-heading text-2xl font-semibold text-text mb-6">Revenue (Last 6 Months)</h2>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8DDD0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip
                          formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'Revenue']}
                          contentStyle={{ borderRadius: '12px', border: '1px solid #E8DDD0' }}
                        />
                        <Bar dataKey="revenue" fill="#6E1E1E" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Orders */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl border border-border/50 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading text-xl font-semibold text-text">Recent Orders</h2>
                    <Link to="/admin/orders" className="text-sm text-primary flex items-center gap-1 hover:underline">
                      View all <HiOutlineArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {data?.recentOrders?.slice(0, 5).map((order) => {
                      const StatusIcon = {
                        pending: HiOutlineClock,
                        confirmed: HiOutlineCheckCircle,
                        processing: HiOutlineCog,
                        shipped: HiOutlineTruck,
                        delivered: HiOutlineCheckCircle,
                        cancelled: HiOutlineXCircle,
                      }[order.orderStatus] || HiOutlineClock;

                      return (
                        <div key={order._id} className="flex items-center gap-3 p-3 bg-background rounded-xl">
                          <StatusIcon className="w-5 h-5 text-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text truncate">
                              #{order.invoiceNumber || order._id.slice(-6)}
                            </p>
                            <p className="text-xs text-text-muted">{order.user?.name}</p>
                          </div>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${statusColors[order.orderStatus] || ''}`}>
                            {order.orderStatus}
                          </span>
                          <p className="text-sm font-heading font-semibold text-primary shrink-0">
                            Rs. {order.totalPrice?.toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                    {(!data?.recentOrders || data.recentOrders.length === 0) && (
                      <p className="text-text-muted text-sm text-center py-4">No orders yet</p>
                    )}
                  </div>
                </motion.div>

                {/* Top Products */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-white rounded-2xl border border-border/50 p-6"
                >
                  <h2 className="font-heading text-xl font-semibold text-text mb-4">Top Products</h2>
                  <div className="space-y-3">
                    {data?.topProducts?.map((product, idx) => (
                      <div key={product._id} className="flex items-center gap-3 p-3 bg-background rounded-xl">
                        <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {idx + 1}
                        </span>
                        <img
                          src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=100'}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text truncate">{product.name}</p>
                          <p className="text-xs text-text-muted">{product.category?.name || 'Uncategorized'}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium text-primary">Rs. {product.price?.toLocaleString()}</p>
                          <p className="text-xs text-text-muted">{product.sold} sold</p>
                        </div>
                      </div>
                    ))}
                    {(!data?.topProducts || data.topProducts.length === 0) && (
                      <p className="text-text-muted text-sm text-center py-4">No products yet</p>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Quick Links */}
              <div className="grid sm:grid-cols-4 gap-4 mt-8">
                {[
                  { to: '/admin/users', label: 'Manage Users', icon: HiOutlineUsers },
                  { to: '/admin/products', label: 'All Products', icon: HiOutlineCube },
                  { to: '/admin/orders', label: 'All Orders', icon: HiOutlineShoppingBag },
                  { to: '/admin/categories', label: 'Categories', icon: HiOutlineOfficeBuilding },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="bg-white rounded-2xl border border-border/50 p-5 hover:shadow-lg hover:border-border transition-all group text-center"
                  >
                    <link.icon className="w-7 h-7 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium text-text">{link.label}</p>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </Container>
    </div>
  );
};

export default AdminDashboard;
