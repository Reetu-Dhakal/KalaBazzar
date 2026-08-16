import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useCart } from '@/context/CartContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function PaymentReturn() {
  usePageTitle('Payment Status');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [checking, setChecking] = useState(true);
  const [status, setStatus] = useState<'checking' | 'success' | 'failed' | 'error'>('checking');

  const method = searchParams.get('method') || '';
  const orderId = searchParams.get('orderId') || '';
  const pidx = searchParams.get('pidx') || '';
  const redirectStatus = searchParams.get('status') || '';

  useEffect(() => {
    const verify = async () => {
      if (!orderId) {
        setStatus('error');
        setChecking(false);
        return;
      }

      try {
        const { data } = await api.post('/payment/verify', {
          orderId,
          paymentMethod: method || undefined,
          ...(pidx ? { pidx } : {}),
          result: redirectStatus === 'success' || redirectStatus === 'Completed' ? 'success' : undefined,
        });
        const paid = data?.data?.paid;
        if (paid) {
          setStatus('success');
          await clearCart().catch(() => {});
          toast.success('Payment successful!');
          setTimeout(() => navigate(`/order-success/${orderId}`, { replace: true }), 800);
        } else {
          setStatus('failed');
        }
      } catch {
        setStatus('error');
      } finally {
        setChecking(false);
      }
    };

    verify();
  }, [orderId, method, pidx, redirectStatus, navigate]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <Card>
        <CardContent className="p-8 text-center">
          {checking ? (
            <>
              <div className="flex items-center justify-center mb-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              <h1 className="text-2xl font-heading text-foreground mb-2">Confirming payment...</h1>
              <p className="text-sm text-muted-foreground">Please wait a moment.</p>
            </>
          ) : status === 'success' ? (
            <>
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-14 w-14 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-heading text-foreground mb-2">Payment successful!</h1>
              <p className="text-sm text-muted-foreground mb-6">Redirecting to your order...</p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center mb-4">
                <XCircle className="h-14 w-14 text-red-600" />
              </div>
              <h1 className="text-2xl font-heading text-foreground mb-2">Payment not completed</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Your payment could not be completed. Please try again or choose a different method.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link to="/checkout">
                    Return to Checkout
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/cart">
                    View Cart
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}