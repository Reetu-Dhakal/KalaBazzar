import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import usePageTitle from '../hooks/usePageTitle';
import { DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const statusVariant = { pending: 'warning', confirmed: 'info', processing: 'info', shipped: 'info', delivered: 'success', cancelled: 'danger' };

export default function SellerEarnings() {
  usePageTitle('Earnings');
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({ totalEarnings: 0, totalOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchEarnings = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/sellers/earnings?page=${p}&limit=15`);
      setOrders(data.data.orders);
      setSummary(data.data.summary);
      setPagination(data.data.pagination);
    } catch { toast.error('Failed to load earnings'); }
    setLoading(false);
  };

  useEffect(() => { fetchEarnings(); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-heading font-bold">Earnings</h1>
        <Link to="/seller/dashboard"><Button variant="outline" size="sm">Back to Dashboard</Button></Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="bg-green-100 p-3 rounded-full"><DollarSign size={24} className="text-green-600" /></div>
            <div>
              <p className="text-sm text-text-muted">Total Earnings</p>
              <p className="text-2xl font-bold">Rs. {summary.totalEarnings.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="bg-blue-100 p-3 rounded-full"><ShoppingBag size={24} className="text-blue-600" /></div>
            <div>
              <p className="text-sm text-text-muted">Total Orders</p>
              <p className="text-2xl font-bold">{summary.totalOrders}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="bg-purple-100 p-3 rounded-full"><TrendingUp size={24} className="text-purple-600" /></div>
            <div>
              <p className="text-sm text-text-muted">Avg per Order</p>
              <p className="text-2xl font-bold">Rs. {summary.totalOrders ? (summary.totalEarnings / summary.totalOrders).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Order History</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center"><Spinner /></div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-text-muted">No earnings yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Order</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Items</th>
                    <th className="px-4 py-3 font-semibold">Earnings</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">#{o._id.slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-3 text-sm">{o.user?.name || 'N/A'}</td>
                      <td className="px-4 py-3">{o.sellerItems.length} item(s)</td>
                      <td className="px-4 py-3 font-semibold text-green-700">Rs. {o.earnings.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3"><Badge variant={statusVariant[o.status] || 'default'}>{o.status}</Badge></td>
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
            <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => { setPage(p); fetchEarnings(p); }}>{p}</Button>
          ))}
        </div>
      )}
    </div>
  );
}
