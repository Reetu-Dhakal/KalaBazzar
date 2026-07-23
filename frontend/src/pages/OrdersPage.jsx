import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Package, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const statusVariant = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
  returned: 'danger',
};

export default function OrdersPage() {
  usePageTitle('My Orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = (status = statusFilter) => {
    setLoading(true);
    const url = status ? `/orders/my-orders?status=${status}` : '/orders/my-orders';
    api.get(url)
      .then(({ data }) => setOrders(data.data.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(''); }, []);

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    fetchOrders(status);
  };

  const statuses = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading font-bold mb-6">My Orders</h1>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2 items-center">
          <SlidersHorizontal size={16} className="text-text-muted" />
          {statuses.map((s) => (
            <button key={s} onClick={() => handleFilterChange(s)} className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${statusFilter === s ? 'bg-primary text-white border-primary' : 'bg-white border-gray-300 hover:border-primary'}`}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
          {statusFilter && (
            <button onClick={() => handleFilterChange('')} className="text-xs text-text-muted hover:text-primary flex items-center gap-1 ml-2">
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-heading font-semibold mb-2">No orders yet</h2>
          <p className="text-text-secondary mb-6">Start shopping to see your orders here</p>
          <Link to="/shop"><Button>Browse Products</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-xs text-text-muted">#{order._id.slice(-8).toUpperCase()}</span>
                      <Badge variant={statusVariant[order.status] || 'default'}>{order.status}</Badge>
                    </div>
                    <p className="text-sm text-text-secondary mb-1">
                      {order.createdAt && new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.product?._id || item._id} className="flex items-center gap-2 bg-gray-50 rounded-md px-2 py-1">
                          {item.image && <img loading="lazy" src={item.image} alt="" className="w-8 h-8 rounded object-cover" />}
                          <span className="text-xs truncate max-w-[120px]">{item.name}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && <span className="text-xs text-text-muted self-center">+{order.items.length - 3} more</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-primary">Rs. {order.total?.toLocaleString()}</p>
                    <p className="text-xs text-text-muted">{order.paymentMethod.toUpperCase()}</p>
                    <Link to={`/orders/${order._id}`} className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-2">
                      View Details <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
