import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Smartphone, CheckCircle, XCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePageTitle } from '@/hooks/usePageTitle';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { Order } from '@/types';

const METHOD_LABEL: Record<string, string> = {
  khalti: 'Khalti',
  esewa: 'eSewa',
};

export default function PaymentMock() {
  usePageTitle('Simulated Payment');
  const { method, orderId } = useParams<{ method: string; orderId: string }>();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [processing, setProcessing] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${orderId}`);
      return data.data as Order;
    },
    enabled: !!orderId,
  });

  const settle = async (result: 'success' | 'failed') => {
    if (!orderId) return;
    setProcessing(true);
    try {
      await api.post('/payment/verify', {
        orderId,
        paymentMethod: method,
        result,
      });
      if (result === 'success') {
        const selectedProductIds = order?.items.map((item) =>
          typeof item.product === 'string' ? item.product : item.product._id,
        );
        await clearCart(selectedProductIds).catch(() => {});
        toast.success('Payment successful!');
        navigate(`/order-success/${orderId}`);
      } else {
        toast.error('Payment cancelled');
        navigate('/checkout');
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Payment verification failed');
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center mb-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Smartphone className="h-7 w-7 text-primary" />
            </div>
          </div>

          <h1 className="text-2xl font-heading text-foreground text-center mb-1">
            {METHOD_LABEL[method || ''] || 'Online'} Payment
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Development sandbox — simulate a successful or cancelled payment.
          </p>

          <div className="rounded-lg border border-border/60 bg-surface p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Amount due</span>
              {isLoading ? (
                <Skeleton className="h-5 w-20" />
              ) : (
                <span className="font-semibold text-foreground">
                  {formatCurrency(order?.totalAmount ?? 0)}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full"
              size="lg"
              disabled={processing || isLoading}
              onClick={() => settle('success')}
            >
              <CheckCircle className="h-5 w-5" />
              {processing ? 'Verifying...' : 'Pay Successfully'}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              disabled={processing || isLoading}
              onClick={() => settle('failed')}
            >
              <XCircle className="h-5 w-5" />
              Cancel Payment
            </Button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-secondary" />
            This page only appears in mock payment mode
          </div>

          <div className="mt-4 text-center">
            <Link to="/checkout" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to checkout
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}