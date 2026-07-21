import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineShoppingBag, HiOutlineHeart, HiOutlineMapPin, HiOutlineStar, HiOutlineClock, HiOutlineCheckCircle } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import API from '../utils/axios';
import { Button, Container } from '../components/ui';

const Dashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get('/orders/my-orders');
        setOrders(data.data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: HiOutlineShoppingBag },
    { label: 'Completed', value: orders.filter(o => o.status === 'delivered').length, icon: HiOutlineCheckCircle },
  ];

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
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-text-muted">Manage your orders and account</p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-border/50 p-6"
              >
                <stat.icon className="w-8 h-8 text-primary mb-3" />
                <p className="text-3xl font-heading font-semibold text-text mb-1">{stat.value}</p>
                <p className="text-sm text-text-muted">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-border/50 p-6 md:p-8"
          >
            <h2 className="font-heading text-2xl font-semibold text-text mb-6">
              Recent Orders
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <Link
                    key={order._id}
                    to={`/orders/${order._id}`}
                    className="flex items-center gap-4 p-4 bg-background rounded-xl hover:bg-background/80 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-text mb-1">Order #{order._id.slice(-6)}</p>
                      <p className="text-sm text-text-muted">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading font-semibold text-primary">
                        Rs. {order.total?.toLocaleString()}
                      </p>
                      <p className="text-sm text-text-muted capitalize">{order.status}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <HiOutlineShoppingBag className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <p className="text-text-muted mb-4">No orders yet</p>
                <Link to="/shop">
                  <Button>Start Shopping</Button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </Container>
    </div>
  );
};

export default Dashboard;