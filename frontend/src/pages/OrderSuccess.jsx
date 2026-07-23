import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { CheckCircle, Package, Home } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  usePageTitle('Order Placed');
  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!order) return <div className="text-center py-20 text-text-secondary">Order not found</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-green-600" />
      </div>
      <h1 className="text-3xl font-heading font-bold mb-2">Order Placed Successfully!</h1>
      <p className="text-text-secondary mb-6">Thank you for your purchase. Your order has been confirmed.</p>

      <Card className="text-left mb-6">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-muted">Order #{order._id.slice(-8).toUpperCase()}</span>
            <span className="font-semibold">Rs. {order.totalAmount?.toLocaleString()}</span>
          </div>
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-2">Items</h3>
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm text-text-secondary">
                <span>{item.product?.name || item.name} x{item.quantity}</span>
                <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-1">Shipping Address</h3>
            <p className="text-sm text-text-secondary">
              {order.shippingAddress?.fullName}, {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.district}
            </p>
          </div>
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-1">Payment Method</h3>
            <p className="text-sm text-text-secondary capitalize">{order.paymentMethod}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-center gap-4">
        <Link to="/orders"><Button variant="secondary"><Package size={16} className="mr-2" /> View My Orders</Button></Link>
        <Link to="/"><Button><Home size={16} className="mr-2" /> Continue Shopping</Button></Link>
      </div>
    </div>
  );
}
