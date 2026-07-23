import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';

const statusVariant = {
  pending: 'warning', confirmed: 'info', processing: 'info',
  shipped: 'info', delivered: 'success', cancelled: 'danger', returned: 'danger',
};

const statuses = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  usePageTitle('Manage Orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter((o) =>
      o._id.toLowerCase().includes(q) ||
      o.user?.name?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q)
    );
  }, [orders, search]);

  const fetchOrders = async (p = 1, status = statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 15 });
      if (status) params.set('status', status);
      const { data } = await api.get(`/admin/orders?${params}`);
      setOrders(data.data.orders);
      setPagination(data.data.pagination);
    } catch { toast.error('Failed to load orders'); }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(1, ''); }, []);

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setPage(1);
    fetchOrders(1, status);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order ${newStatus}`);
      fetchOrders(page);
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-heading font-bold mb-6">Manage Orders</h1>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order ID, name, email..." className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm" />
        </div>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <button key={s} onClick={() => handleStatusChange(s)} className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${statusFilter === s ? 'bg-primary text-white border-primary' : 'bg-white border-gray-300 hover:border-primary'}`}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>{statusFilter ? `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Orders` : 'All Orders'} ({pagination?.total || 0})</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center"><Spinner /></div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-text-muted">No orders found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Order</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Items</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((o) => (
                    <tr key={o._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">#{o._id.slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-3 text-sm">{o.user?.name || 'N/A'}<br /><span className="text-xs text-text-muted">{o.user?.email}</span></td>
                      <td className="px-4 py-3">{o.items?.length} item(s)</td>
                      <td className="px-4 py-3 font-semibold">Rs. {o.total?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3"><Badge variant={statusVariant[o.status] || 'default'}>{o.status}</Badge></td>
                      <td className="px-4 py-3">
                        {['pending', 'confirmed', 'processing', 'shipped'].includes(o.status) ? (
                          <select value={o.status} onChange={(e) => handleUpdateStatus(o._id, e.target.value)} className="text-xs border rounded px-2 py-1 bg-white">
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirm</option>
                            <option value="processing">Process</option>
                            <option value="shipped">Ship</option>
                            <option value="delivered">Deliver</option>
                          </select>
                        ) : (
                          <span className="text-xs text-text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => { setPage(p); fetchOrders(p); }}>{p}</Button>
          ))}
        </div>
      )}
    </div>
  );
}
