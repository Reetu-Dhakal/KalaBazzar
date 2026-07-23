import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import usePageTitle from '../hooks/usePageTitle';
import { ArrowLeft, Printer } from 'lucide-react';

export default function OrderInvoice() {
  usePageTitle('Invoice');
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="py-20 text-center"><Spinner /></div>;
  if (!order) return <div className="py-20 text-center text-text-muted">Order not found</div>;

  const handlePrint = () => { window.print(); };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6 no-print">
        <Link to={`/orders/${id}`}><Button variant="outline" size="sm"><ArrowLeft size={16} className="mr-1" /> Back</Button></Link>
        <Button onClick={handlePrint}><Printer size={16} className="mr-1" /> Print</Button>
      </div>

      <div ref={printRef} className="bg-white border rounded-lg p-8 shadow-sm">
        <div className="text-center border-b pb-6 mb-6">
          <h1 className="text-2xl font-heading font-bold">Kala Bazaar Nepal</h1>
          <p className="text-text-muted text-sm">Handcrafted Marketplace</p>
          <h2 className="text-lg font-semibold mt-4">Order Invoice</h2>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-6 text-sm">
          <div>
            <p className="font-semibold mb-1">Bill To:</p>
            <p>{order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.address}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.district}</p>
            <p>{order.shippingAddress?.province} {order.shippingAddress?.zipCode}</p>
            <p>Phone: {order.shippingAddress?.phone}</p>
          </div>
          <div className="text-right">
            <p><span className="font-semibold">Order #:</span> {order._id.slice(-8).toUpperCase()}</p>
            <p><span className="font-semibold">Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
            <p><span className="font-semibold">Status:</span> {order.status}</p>
            <p><span className="font-semibold">Payment:</span> {order.paymentMethod?.toUpperCase()} ({order.paymentStatus})</p>
          </div>
        </div>

        <table className="w-full text-sm mb-6">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2 font-semibold">Item</th>
              <th className="text-left px-3 py-2 font-semibold">Qty</th>
              <th className="text-right px-3 py-2 font-semibold">Price</th>
              <th className="text-right px-3 py-2 font-semibold">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {order.items?.map((item, i) => (
              <tr key={i}>
                <td className="px-3 py-2">{item.name}</td>
                <td className="px-3 py-2">{item.quantity}</td>
                <td className="px-3 py-2 text-right">Rs. {item.price?.toLocaleString()}</td>
                <td className="px-3 py-2 text-right">Rs. {(item.subtotal || item.price * item.quantity).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t pt-4 text-sm space-y-1 text-right">
          <p>Subtotal: <span className="font-semibold">Rs. {order.subtotal?.toLocaleString()}</span></p>
          {order.shippingCost > 0 && <p>Shipping: <span className="font-semibold">Rs. {order.shippingCost?.toLocaleString()}</span></p>}
          {order.discount > 0 && <p className="text-green-600">Discount: <span className="font-semibold">-Rs. {order.discount?.toLocaleString()}</span></p>}
          <p className="text-lg font-bold border-t pt-2">Total: Rs. {order.total?.toLocaleString()}</p>
        </div>

        {order.cancellationReason && (
          <div className="mt-6 p-3 bg-red-50 rounded text-sm">
            <span className="font-semibold">Cancellation Reason:</span> {order.cancellationReason}
          </div>
        )}

        <div className="mt-8 text-center text-xs text-text-muted border-t pt-4">
          <p>Thank you for supporting Nepali artisans!</p>
          {order.paymentInfo?.transactionId && <p>Transaction ID: {order.paymentInfo.transactionId}</p>}
        </div>
      </div>

      <style>{`@media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; } }`}</style>
    </div>
  );
}
