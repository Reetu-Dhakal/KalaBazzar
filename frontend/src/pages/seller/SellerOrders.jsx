import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineCog,
  HiOutlineTruck,
  HiOutlineXCircle,
  HiOutlineSearch,
  HiOutlineChevronDown,
} from 'react-icons/hi';
import API from '../../utils/axios';
import { Container, LoadingSkeleton } from '../../components/ui';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusIcons = {
  pending: HiOutlineClock,
  confirmed: HiOutlineCheckCircle,
  processing: HiOutlineCog,
  shipped: HiOutlineTruck,
  delivered: HiOutlineCheckCircle,
  cancelled: HiOutlineXCircle,
};

const nextStatus = {
  pending: 'confirmed',
  confirmed: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
};

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/orders/seller/me?limit=100');
      setOrders(data.data || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      toast.success(`Order marked as ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o._id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen pt-24">
      <Container>
        <div className="py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-heading text-4xl font-semibold text-text">Orders</h1>
            <p className="text-text-muted mt-1">{orders.length} total orders</p>
          </motion.div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
                  statusFilter === status
                    ? 'bg-primary text-white'
                    : 'bg-white border border-border text-text-muted hover:text-text'
                }`}
              >
                {status} ({status === 'all' ? orders.length : (statusCounts[status] || 0)})
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by invoice, customer name, or order ID..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>

          {/* Orders List */}
          {loading ? (
            <LoadingSkeleton variant="list" count={5} />
          ) : filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map((order) => {
                const StatusIcon = statusIcons[order.orderStatus] || HiOutlineClock;
                const next = nextStatus[order.orderStatus];
                const sellerItems = order.orderItems || [];
                const sellerTotal = sellerItems.reduce((s, item) => s + item.price * item.quantity, 0);

                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-border/50 p-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Order Info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <StatusIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-text">
                              #{order.invoiceNumber || order._id.slice(-6)}
                            </p>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${statusColors[order.orderStatus] || ''}`}>
                              {order.orderStatus}
                            </span>
                          </div>
                          <p className="text-sm text-text-muted mt-0.5">
                            {order.user?.name} · {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'short', day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="flex items-center gap-2">
                        {sellerItems.slice(0, 3).map((item, idx) => (
                          <img
                            key={idx}
                            src={item.image || item.product?.images?.[0]?.url}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ))}
                        {sellerItems.length > 3 && (
                          <span className="text-xs text-text-muted">+{sellerItems.length - 3}</span>
                        )}
                      </div>

                      {/* Total */}
                      <p className="font-heading font-semibold text-primary shrink-0">
                        Rs. {sellerTotal.toLocaleString()}
                      </p>

                      {/* Action */}
                      {next && (
                        <div className="relative shrink-0">
                          <button
                            onClick={() => handleStatusUpdate(order._id, next)}
                            disabled={updatingId === order._id}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                              updatingId === order._id
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-primary text-white hover:bg-primary-light'
                            }`}
                          >
                            {updatingId === order._id ? (
                              'Updating...'
                            ) : (
                              <>
                                Mark as {next}
                                <HiOutlineChevronDown className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                      <div className="mt-4 pt-4 border-t border-border text-sm text-text-muted">
                        <span className="font-medium text-text">Ship to:</span>{' '}
                        {order.shippingAddress.fullName}, {order.shippingAddress.street},{' '}
                        {order.shippingAddress.city}, {order.shippingAddress.district}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-border/50">
              <HiOutlineClock className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-muted">
                {search || statusFilter !== 'all' ? 'No orders match your filters' : 'No orders yet'}
              </p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default SellerOrders;
