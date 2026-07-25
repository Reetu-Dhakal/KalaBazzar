import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Printer, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import api from '@/lib/api';
import type { Order } from '@/types';

function InvoiceSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function OrderInvoice() {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${id}`);
      return data.data.order as Order;
    },
    enabled: !!id,
  });

  if (isLoading) return <InvoiceSkeleton />;

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-heading text-foreground mb-4">Order not found</h1>
        <Button asChild>
          <Link to="/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="no-print container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/orders/${id}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to Order
            </Link>
          </Button>
          <Button onClick={() => window.print()} size="sm">
            <Printer className="h-4 w-4" />
            Print Invoice
          </Button>
        </div>
      </div>

      <div className="print-invoice max-w-3xl mx-auto bg-white p-8 shadow-lg print:shadow-none print:p-0">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                <span className="w-2 h-5 rounded-sm bg-blue-600" />
                <span className="w-2 h-5 rounded-sm bg-red-600 -ml-0.5" />
                <span className="w-2 h-5 rounded-sm bg-white border border-gray-300 -ml-0.5" />
              </div>
              <span className="text-xl font-bold text-gray-900">Kala Bazaar</span>
            </div>
            <p className="text-sm text-gray-500">Authentic Handmade Crafts from Nepal</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">Invoice</h2>
            <p className="text-sm text-gray-500 mt-1">
              Invoice #: <span className="font-mono">{order.orderNumber}</span>
            </p>
            <p className="text-sm text-gray-500">
              Date: {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Bill To
            </h3>
            <p className="text-sm font-medium text-gray-900">{order.shippingAddress.recipientName}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress.street}</p>
            <p className="text-sm text-gray-600">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
            </p>
            <p className="text-sm text-gray-600">{order.shippingAddress.country}</p>
            {order.shippingAddress.phone && (
              <p className="text-sm text-gray-600 mt-1">Phone: {order.shippingAddress.phone}</p>
            )}
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Payment Details
            </h3>
            <p className="text-sm text-gray-600">
              Method: <span className="font-medium capitalize">{order.paymentMethod}</span>
            </p>
            <p className="text-sm text-gray-600">
              Status: <span className="font-medium capitalize">{order.paymentStatus}</span>
            </p>
            <p className="text-sm text-gray-600">
              Order Status: <span className="font-medium capitalize">{order.status}</span>
            </p>
          </div>
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3">
                Item
              </th>
              <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider py-3">
                Qty
              </th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider py-3">
                Price
              </th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider py-3">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items.map((item, index) => {
              const snapshot = item.productSnapshot;
              return (
                <tr key={index}>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      {snapshot.images?.[0] && (
                        <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0 print:w-8 print:h-8">
                          <img
                            src={snapshot.images[0]}
                            alt={snapshot.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{snapshot.name}</p>
                        {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                          <p className="text-xs text-gray-500">
                            {Object.entries(item.selectedVariants)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' | ')}
                          </p>
                        )}
                        {snapshot.sku && (
                          <p className="text-xs text-gray-400 font-mono">SKU: {snapshot.sku}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-center text-sm text-gray-600">{item.quantity}</td>
                  <td className="py-4 text-right text-sm text-gray-600">{formatCurrency(item.price)}</td>
                  <td className="py-4 text-right text-sm font-medium text-gray-900">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span className="text-gray-900">
                {order.shippingCost === 0 ? 'Free' : formatCurrency(order.shippingCost)}
              </span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="text-green-600">-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            {order.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-900">{formatCurrency(order.taxAmount)}</span>
              </div>
            )}
            <div className="border-t-2 border-gray-200 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-base font-semibold text-gray-900">Total</span>
                <span className="text-base font-bold text-gray-900">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">Thank you for shopping with Kala Bazaar!</p>
          <p className="text-xs text-gray-400 mt-1">
            For questions about this order, please contact support@kalabazaar.com
          </p>
        </div>
      </div>
    </>
  );
}
