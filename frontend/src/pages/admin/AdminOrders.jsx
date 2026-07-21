import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineCog,
  HiOutlineTruck,
  HiOutlineXCircle,
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

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await API.get(`/admin/orders?${params}`);
      setOrders(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter((o) =>
    o.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o._id.toLowerCase().includes(search.toLowerCase())
  );

  const statuses = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="min-h-screen pt-24">
      <Container>
        <div className="py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-heading text-4xl font-semibold text-text">Orders</h1>
            <p className="text-text-muted mt-1">Manage all platform orders</p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s === 'all' ? '' : s); setPage(1); }}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors capitalize ${
                    (s === 'all' && !statusFilter) || statusFilter === s
                      ? 'bg-primary text-white'
                      : 'bg-white border border-border text-text-muted hover:text-text'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-border/50 overflow-hidden"
          >
            {loading ? (
              <div className="p-6"><LoadingSkeleton variant="list" count={5} /></div>
            ) : filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-background/50">
                      <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">Order</th>
                      <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">Customer</th>
                      <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">Items</th>
                      <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">Total</th>
                      <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">Payment</th>
                      <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">Status</th>
                      <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((order) => {
                      const StatusIcon = statusIcons[order.orderStatus] || HiOutlineClock;
                      return (
                        <tr key={order._id} className="border-b border-border last:border-0 hover:bg-background/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-medium text-text text-sm">#{order.invoiceNumber || order._id.slice(-6)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-text">{order.user?.name || '—'}</p>
                            <p className="text-xs text-text-muted">{order.user?.email}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-text-muted">{order.orderItems?.length || 0}</td>
                          <td className="px-6 py-4 text-sm font-medium text-primary">Rs. {order.totalPrice?.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <span className={`w-2 h-2 rounded-full ${order.isPaid ? 'bg-green-500' : 'bg-amber-500'}`} />
                              <span className="text-xs text-text-muted capitalize">{order.paymentMethod}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full capitalize ${statusColors[order.orderStatus] || ''}`}>
                              <StatusIcon className="w-3 h-3" />
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-text-muted">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-text-muted">No orders found</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPage(p); }}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      page === p ? 'bg-primary text-white' : 'text-text-muted hover:bg-background'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </Container>
    </div>
  );
};

export default AdminOrders;
