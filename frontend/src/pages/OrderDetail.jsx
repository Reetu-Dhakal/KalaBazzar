import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import usePageTitle from '../hooks/usePageTitle';
import { ArrowLeft, MapPin, CreditCard, Truck, Check, Circle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import CancelOrderModal from '../components/layout/CancelOrderModal';

const statusVariant = {
  pending: 'warning', confirmed: 'info', processing: 'info',
  shipped: 'info', delivered: 'success', cancelled: 'danger', returned: 'danger',
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  usePageTitle('Order Details');
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.data))
      .catch(() => toast.error('Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async (reason) => {
    setCancelling(true);
    try {
      await api.put(`/orders/${id}/cancel`, { reason });
      toast.success('Order cancelled');
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data.data);
      setShowCancelModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!order) return <div className="text-center py-20 text-text-secondary">Order not found</div>;

  const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);

  const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentIdx = statusSteps.indexOf(order.status);
  const cancelledOrReturned = ['cancelled', 'returned'].includes(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-4">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-1">Order Details</h1>
          <p className="text-sm text-text-muted font-mono">#{order._id}</p>
        </div>
        <Badge variant={statusVariant[order.status] || 'default'} className="text-sm px-4 py-1.5">{order.status.toUpperCase()}</Badge>
      </div>

      {cancelledOrReturned ? (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4 text-center">
            <p className="font-semibold text-red-600 capitalize">{order.status}</p>
            {order.cancellationReason && <p className="text-sm text-red-500 mt-1">Reason: {order.cancellationReason}</p>}
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, idx) => (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${idx <= currentIdx ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
                      {idx < currentIdx ? <Check size={18} /> : <Circle size={18} />}
                    </div>
                    <p className={`text-xs mt-2 font-medium capitalize ${idx <= currentIdx ? 'text-primary' : 'text-text-muted'}`}>{step}</p>
                  </div>
                  {idx < statusSteps.length - 1 && (
                    <div className={`w-12 sm:w-20 h-0.5 mx-2 ${idx < currentIdx ? 'bg-primary' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Items ({totalItems})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                    {item.image && <img loading="lazy" src={item.image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product}`} className="font-medium hover:text-primary line-clamp-1">{item.name}</Link>
                    <p className="text-sm text-text-muted">Qty: {item.quantity} × Rs. {item.price?.toLocaleString()}</p>
                  </div>
                  <p className="font-semibold text-right">Rs. {item.subtotal?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-text-secondary">Subtotal</span><span>Rs. {order.subtotal?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Shipping</span><span>{order.shippingCost === 0 ? 'Free' : `Rs. ${order.shippingCost}`}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-Rs. {order.discount}</span></div>}
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span><span className="text-primary">Rs. {order.total?.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-text-muted mt-0.5" />
                <div>
                  <p className="font-medium">{order.shippingAddress?.fullName}</p>
                  <p className="text-text-secondary">{order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
                  <p className="text-text-secondary">{order.shippingAddress?.district}, {order.shippingAddress?.province}</p>
                  <p className="text-text-secondary">{order.shippingAddress?.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-text-muted" />
                <span className="capitalize">{order.paymentMethod}</span>
                <Badge variant={order.paymentStatus === 'completed' ? 'success' : 'warning'} size="sm">{order.paymentStatus}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-text-muted" />
                <span className="text-text-secondary">{order.createdAt && new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              {order.trackingNumber && <div className="flex items-center gap-2"><Truck size={16} className="text-text-muted" /><span className="font-medium">Tracking: {order.trackingNumber}</span></div>}
            </CardContent>
          </Card>

          <Link to={`/orders/${id}/invoice`} className="w-full"><Button variant="outline" className="w-full"><FileText size={16} className="mr-1" /> View Invoice</Button></Link>

          {['pending', 'confirmed'].includes(order.status) && (
            <Button variant="danger" className="w-full" onClick={() => setShowCancelModal(true)} disabled={cancelling}>
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          )}
        </div>
      </div>

      <CancelOrderModal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} onConfirm={handleCancel} />
    </div>
  );
}
