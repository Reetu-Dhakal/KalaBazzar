import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineShoppingBag,
  HiOutlineCube,
  HiOutlineCurrencyDollar,
  HiOutlineStar,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineTruck,
  HiOutlineXCircle,
  HiOutlineCog,
  HiOutlineOfficeBuilding,
  HiOutlinePlus,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/axios';
import { Button, Container, LoadingSkeleton } from '../../components/ui';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const SellerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, avgRating: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const isVerified = user?.isSellerVerified;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.allSettled([
          API.get('/products/seller/me?limit=100'),
          API.get('/orders/seller/me?limit=100'),
        ]);

        const products = productsRes.status === 'fulfilled' ? productsRes.value.data.data : [];
        const orders = ordersRes.status === 'fulfilled' ? ordersRes.value.data.data : [];

        const revenue = orders
          .filter((o) => o.isPaid)
          .reduce((sum, o) => {
            const sellerItems = o.orderItems.filter(
              (item) => item.seller === user?._id
            );
            return sum + sellerItems.reduce((s, item) => s + item.price * item.quantity, 0);
          }, 0);

        const ratings = products.filter((p) => p.rating > 0);
        const avgRating = ratings.length
          ? ratings.reduce((s, p) => s + p.rating, 0) / ratings.length
          : 0;

        setStats({
          products: products.length,
          orders: orders.length,
          revenue,
          avgRating: avgRating.toFixed(1),
        });
        setRecentOrders(orders.slice(0, 5));
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    if (isVerified) fetchDashboard();
    else setLoading(false);
  }, [user, isVerified]);

  if (!isVerified) {
    return (
      <div className="min-h-screen pt-24">
        <Container>
          <div className="py-16 text-center max-w-lg mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <HiOutlineOfficeBuilding className="w-20 h-20 text-primary mx-auto mb-6" />
              <h1 className="font-heading text-4xl font-semibold text-text mb-4">
                Seller Dashboard
              </h1>
              <p className="text-text-muted mb-2">
                Your seller account is pending verification.
              </p>
              <p className="text-text-muted mb-8">
                You&apos;ll receive access to the full dashboard once an admin verifies your store.
              </p>
              <Link to="/become-seller">
                <Button variant="outline">View Application</Button>
              </Link>
            </motion.div>
          </div>
        </Container>
      </div>
    );
  }

  const statCards = [
    { label: 'Products', value: stats.products, icon: HiOutlineCube, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Orders', value: stats.orders, icon: HiOutlineShoppingBag, color: 'text-primary', bg: 'bg-primary/5' },
    { label: 'Revenue', value: `Rs. ${stats.revenue.toLocaleString()}`, icon: HiOutlineCurrencyDollar, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Avg Rating', value: stats.avgRating || '—', icon: HiOutlineStar, color: 'text-secondary', bg: 'bg-amber-50' },
  ];

  return (
    <div className="min-h-screen pt-24">
      <Container>
        <div className="py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10"
          >
            <div>
              <h1 className="font-heading text-4xl md:text-5xl font-semibold text-text mb-2">
                Seller Dashboard
              </h1>
              <p className="text-text-muted">
                Welcome back, {user?.sellerProfile?.storeName || user?.name}
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/seller/products/new">
                <Button icon={HiOutlinePlus}>Add Product</Button>
              </Link>
              <Link to="/seller/store">
                <Button variant="outline" icon={HiOutlineCog}>Store Settings</Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-border/50 p-6"
              >
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-2xl font-heading font-semibold text-text mb-1">{stat.value}</p>
                <p className="text-sm text-text-muted">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {[
              { to: '/seller/products', label: 'Manage Products', icon: HiOutlineCube },
              { to: '/seller/orders', label: 'View Orders', icon: HiOutlineShoppingBag },
              { to: '/seller/store', label: 'Store Profile', icon: HiOutlineOfficeBuilding },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="bg-white rounded-2xl border border-border/50 p-6 hover:shadow-lg hover:border-border transition-all group"
              >
                <link.icon className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-heading text-lg font-semibold text-text">{link.label}</p>
              </Link>
            ))}
          </div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-border/50 p-6 md:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl font-semibold text-text">Recent Orders</h2>
              <Link to="/seller/orders" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>

            {loading ? (
              <LoadingSkeleton variant="list" count={3} />
            ) : recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const StatusIcon = {
                    pending: HiOutlineClock,
                    confirmed: HiOutlineCheckCircle,
                    processing: HiOutlineCog,
                    shipped: HiOutlineTruck,
                    delivered: HiOutlineCheckCircle,
                    cancelled: HiOutlineXCircle,
                  }[order.orderStatus] || HiOutlineClock;

                  return (
                    <div key={order._id} className="flex items-center gap-4 p-4 bg-background rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <StatusIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-text text-sm">
                            #{order.invoiceNumber || order._id.slice(-6)}
                          </p>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${statusColors[order.orderStatus] || ''}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted mt-0.5">
                          {order.user?.name} · {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <p className="font-heading font-semibold text-primary text-sm shrink-0">
                        Rs. {order.totalPrice?.toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <HiOutlineShoppingBag className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <p className="text-text-muted">No orders yet</p>
              </div>
            )}
          </motion.div>
        </div>
      </Container>
    </div>
  );
};

export default SellerDashboard;
