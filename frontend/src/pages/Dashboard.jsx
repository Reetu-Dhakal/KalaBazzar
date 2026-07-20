import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineShoppingBag, HiOutlineHeart, HiOutlineUser, HiOutlineLocationMarker, HiOutlineLogout } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import API from '../utils/axios';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get('/orders/me');
        setOrders(data.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-heading font-bold mb-2">Please Sign In</h2>
          <p className="text-text-muted mb-6">You need to be logged in to view your dashboard.</p>
          <Link to="/login" className="px-6 py-3 bg-primary text-white rounded-xl">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container-custom py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <HiOutlineUser className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-heading font-bold">{user.name}</h1>
              <p className="text-sm text-text-muted">{user.email}</p>
              {user.role === 'seller' && (
                <span className="inline-block mt-1 px-3 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full">
                  Seller
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {user.role === 'seller' && (
                <Link to="/dashboard" className="px-4 py-2 bg-primary text-white text-sm rounded-xl">
                  Seller Dashboard
                </Link>
              )}
              <button onClick={logout} className="p-2 text-text-muted hover:text-error transition-colors">
                <HiOutlineLogout className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'orders', label: 'Orders', icon: HiOutlineShoppingBag },
            { id: 'profile', label: 'Profile', icon: HiOutlineUser },
            { id: 'wishlist', label: 'Wishlist', icon: HiOutlineHeart },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-white text-text-muted hover:bg-background'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-xl p-10 text-center">
                <HiOutlineShoppingBag className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <p className="text-text-muted">No orders yet</p>
                <Link to="/shop" className="inline-block mt-3 text-primary font-medium text-sm">
                  Start Shopping
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-text-muted">Order #{order.invoiceNumber}</p>
                      <p className="text-xs text-text-muted">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                      order.orderStatus === 'delivered' ? 'bg-success/10 text-success' :
                      order.orderStatus === 'cancelled' ? 'bg-error/10 text-error' :
                      'bg-warning/10 text-warning'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {order.orderItems?.slice(0, 3).map((item) => (
                      <div key={item._id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-background">
                          {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{item.name}</p>
                          <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium">Rs. {(item.price * item.quantity)?.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <p className="text-sm font-medium">Total: Rs. {order.totalPrice?.toLocaleString()}</p>
                    <button className="text-sm text-primary hover:underline">
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl p-6">
            <h2 className="font-heading font-semibold text-lg mb-4">Profile Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-text-muted">Name</span>
                <span className="font-medium">{user.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-text-muted">Email</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-text-muted">Phone</span>
                <span>{user.phone || 'Not set'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-text-muted">Role</span>
                <span className="capitalize">{user.role}</span>
              </div>
            </div>
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div className="bg-white rounded-xl p-10 text-center">
            <HiOutlineHeart className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted">Your wishlist is empty</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;