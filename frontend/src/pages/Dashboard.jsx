import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineUser,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineTruck,
  HiOutlineCog,
  HiOutlinePencil,
  HiOutlineSave,
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import API from '../utils/axios';
import { Button, Container, LoadingSkeleton } from '../components/ui';
import ProductCard from '../components/product/ProductCard';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'orders', label: 'Orders', icon: HiOutlineShoppingBag },
  { id: 'wishlist', label: 'Wishlist', icon: HiOutlineHeart },
  { id: 'profile', label: 'Profile', icon: HiOutlineUser },
];

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  returned: 'bg-gray-100 text-gray-700',
};

const statusIcons = {
  pending: HiOutlineClock,
  confirmed: HiOutlineCheckCircle,
  processing: HiOutlineCog,
  shipped: HiOutlineTruck,
  delivered: HiOutlineCheckCircle,
  cancelled: HiOutlineXCircle,
};

const Dashboard = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    'address.street': user?.address?.street || '',
    'address.city': user?.address?.city || '',
    'address.district': user?.address?.district || '',
    'address.province': user?.address?.province || '',
    'address.zipCode': user?.address?.zipCode || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, wishlistRes] = await Promise.allSettled([
          API.get('/orders/me'),
          API.get('/wishlist'),
        ]);
        if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data.data || []);
        if (wishlistRes.status === 'fulfilled') setWishlist(wishlistRes.value.data.data?.products || []);
      } catch {
        // errors handled silently
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {
        name: profileForm.name,
        phone: profileForm.phone,
        address: {
          street: profileForm['address.street'],
          city: profileForm['address.city'],
          district: profileForm['address.district'],
          province: profileForm['address.province'],
          zipCode: profileForm['address.zipCode'],
        },
      };
      await updateProfile(payload);
      setEditingProfile(false);
    } catch {
      // toast already shown by context
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRemoveWishlist = async (productId) => {
    try {
      await API.delete(`/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((p) => (p._id || p) !== productId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove from wishlist');
    }
  };

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: HiOutlineShoppingBag, color: 'text-primary' },
    { label: 'Delivered', value: orders.filter((o) => o.orderStatus === 'delivered').length, icon: HiOutlineCheckCircle, color: 'text-green-600' },
    { label: 'In Progress', value: orders.filter((o) => !['delivered', 'cancelled'].includes(o.orderStatus)).length, icon: HiOutlineTruck, color: 'text-purple-600' },
    { label: 'Wishlist', value: wishlist.length, icon: HiOutlineHeart, color: 'text-pink-600' },
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
            <p className="text-text-muted">Manage your orders, wishlist, and account</p>
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
                <stat.icon className={`w-8 h-8 ${stat.color} mb-3`} />
                <p className="text-3xl font-heading font-semibold text-text mb-1">{stat.value}</p>
                <p className="text-sm text-text-muted">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'text-primary border-primary'
                    : 'text-text-muted border-transparent hover:text-text'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.id === 'wishlist' && wishlist.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                    {wishlist.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-border/50 p-6 md:p-8"
            >
              <h2 className="font-heading text-2xl font-semibold text-text mb-6">Order History</h2>
              {loading ? (
                <LoadingSkeleton variant="list" count={3} />
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const StatusIcon = statusIcons[order.orderStatus] || HiOutlineClock;
                    return (
                      <Link
                        key={order._id}
                        to={`/orders/${order._id}`}
                        className="flex items-center gap-4 p-4 bg-background rounded-xl hover:bg-background/80 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <StatusIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-text">Order #{order.invoiceNumber || order._id.slice(-6)}</p>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${statusColors[order.orderStatus] || ''}`}>
                              {order.orderStatus}
                            </span>
                          </div>
                          <p className="text-sm text-text-muted">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                            {' · '}
                            {order.orderItems?.length || 0} item{(order.orderItems?.length || 0) !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-heading font-semibold text-primary">
                            Rs. {order.totalPrice?.toLocaleString()}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
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
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {loading ? (
                <LoadingSkeleton variant="card" count={4} />
              ) : wishlist.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {wishlist.map((product, idx) => (
                    <div key={product._id} className="relative group">
                      <ProductCard product={product} index={idx} />
                      <button
                        onClick={() => handleRemoveWishlist(product._id)}
                        className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
                        aria-label="Remove from wishlist"
                      >
                        <HiOutlineXCircle className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-border/50">
                  <HiOutlineHeart className="w-16 h-16 text-text-muted mx-auto mb-4" />
                  <p className="text-text-muted mb-4">Your wishlist is empty</p>
                  <Link to="/shop">
                    <Button>Discover Products</Button>
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-border/50 p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-2xl font-semibold text-text">Profile</h2>
                {!editingProfile ? (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={HiOutlinePencil}
                    onClick={() => setEditingProfile(true)}
                  >
                    Edit
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingProfile(false)}
                  >
                    Cancel
                  </Button>
                )}
              </div>

              {editingProfile ? (
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="+977-98XXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Street Address</label>
                    <input
                      type="text"
                      value={profileForm['address.street']}
                      onChange={(e) => setProfileForm({ ...profileForm, 'address.street': e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">City</label>
                      <input
                        type="text"
                        value={profileForm['address.city']}
                        onChange={(e) => setProfileForm({ ...profileForm, 'address.city': e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">District</label>
                      <input
                        type="text"
                        value={profileForm['address.district']}
                        onChange={(e) => setProfileForm({ ...profileForm, 'address.district': e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">Province</label>
                      <input
                        type="text"
                        value={profileForm['address.province']}
                        onChange={(e) => setProfileForm({ ...profileForm, 'address.province': e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">ZIP Code</label>
                      <input
                        type="text"
                        value={profileForm['address.zipCode']}
                        onChange={(e) => setProfileForm({ ...profileForm, 'address.zipCode': e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button type="submit" icon={HiOutlineSave} loading={savingProfile} disabled={savingProfile}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 pb-6 border-b border-border">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      {user?.avatar?.url ? (
                        <img src={user.avatar.url} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
                      ) : (
                        <span className="text-3xl font-heading font-semibold text-primary">
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-semibold text-text">{user?.name}</h3>
                      <p className="text-text-muted">{user?.email}</p>
                      <p className="text-xs text-text-muted capitalize mt-1">Role: {user?.role}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Phone</p>
                      <p className="text-text font-medium">{user?.phone || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Email Verified</p>
                      <p className={`font-medium ${user?.isVerified ? 'text-green-600' : 'text-amber-600'}`}>
                        {user?.isVerified ? 'Verified' : 'Not verified'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Address</p>
                    {user?.address?.street ? (
                      <div className="text-text">
                        <p>{user.address.street}</p>
                        <p>{[user.address.city, user.address.district].filter(Boolean).join(', ')}</p>
                        <p>{[user.address.province, user.address.zipCode].filter(Boolean).join(' ')}</p>
                      </div>
                    ) : (
                      <p className="text-text-muted italic">No address on file</p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default Dashboard;
