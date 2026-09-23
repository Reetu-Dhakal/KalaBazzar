import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { usePageTitle } from '@/hooks/usePageTitle';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { PaymentMethod, ShippingAddress } from '@/types';

const PAYMENT_METHODS: { value: PaymentMethod; label: string; description: string; image: string }[] = [
  { value: 'card', label: 'Credit/Debit Card', description: 'Credit/Debit Card', image: '/payment-card.svg' },
  { value: 'esewa', label: 'eSewa Mobile Wallet', description: 'eSewa Mobile Wallet', image: '/payment-esewa.svg' },
  { value: 'khalti', label: 'Khalti by IME', description: 'Mobile Wallet', image: '/payment-khalti.svg' },
  { value: 'cod', label: 'Cash on Delivery', description: 'Cash on Delivery', image: '/payment-cod.svg' },
];

type PaymentState = {
  shippingAddress: ShippingAddress;
  couponCode?: string;
  discountAmount?: number;
};

export default function PaymentSelection() {
  usePageTitle('Select Payment Method');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { items, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const state = location.state as PaymentState | null;
  const selectedIds = searchParams.get('selected')?.split(',').filter(Boolean) || [];
  const selectedItems = selectedIds.length > 0
    ? items.filter((item) => {
      const productId = typeof item.product === 'string' ? item.product : item.product._id;
      return selectedIds.includes(productId);
    })
    : items;
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const destination = state?.shippingAddress ? `${state.shippingAddress.city} ${state.shippingAddress.state}`.toLowerCase() : '';
  const shippingCost = ['kathmandu', 'lalitpur', 'bhaktapur', 'kirtipur', 'madhyapur thimi'].some((place) => destination.includes(place)) ? 100
    : ['kavrepalanchok', 'kavre', 'dhading', 'nuwakot', 'makwanpur'].some((place) => destination.includes(place)) ? 200 : 300;
  const discountAmount = state?.discountAmount || 0;
  const taxAmount = Math.round((subtotal * 13) / 100);
  const total = Math.max(0, subtotal + shippingCost + taxAmount - discountAmount);

  if (!state?.shippingAddress || selectedItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-3 font-heading text-3xl text-foreground">Payment details expired</h1>
        <p className="mb-8 text-muted-foreground">Return to checkout and confirm your delivery address.</p>
        <Button asChild><Link to="/cart">Back to cart</Link></Button>
      </div>
    );
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data } = await api.post('/orders', {
        shippingAddress: state.shippingAddress,
        paymentMethod,
        notes: notes.trim() || undefined,
        couponCode: state.couponCode,
        selectedProductIds: selectedIds,
      });
      const orderId = data.data._id || data.data.order?._id || data.data.orderId;

      if (paymentMethod === 'khalti' || paymentMethod === 'esewa') {
        const paymentData = await api.post('/payment/initiate', { orderId, paymentMethod });
        const payment = paymentData.data?.data;
        if (payment?.offline) {
          await clearCart(selectedIds);
          toast.success('Order placed successfully!');
          navigate(`/order-success/${orderId}`);
          return;
        }
        if (payment?.alreadyPaid) {
          await clearCart(selectedIds);
          navigate(`/order-success/${orderId}`);
          return;
        }
        if (payment?.redirectUrl) {
          window.location.href = payment.redirectUrl;
          return;
        }
      }

      await clearCart(selectedIds);
      toast.success('Order placed successfully!');
      navigate(`/order-success/${orderId}`);
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { message?: string } } };
      toast.error(
        axiosErr.response?.data?.message ||
        (error instanceof Error ? error.message : 'Failed to place order'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto px-4 py-7 sm:px-6">
        <nav className="mb-5 flex items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/checkout" className="hover:text-foreground">Checkout</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">Payment</span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,0.9fr)]">
          <section>
            <h1 className="mb-5 font-sans text-2xl font-medium text-foreground sm:text-3xl">Select Payment Method</h1>
            <div className="grid grid-cols-2 gap-1 bg-border sm:grid-cols-4">
              {PAYMENT_METHODS.map((method, index) => {
                const isSelected = paymentMethod === method.value;
                return (
                  <button
                    key={`${method.label}-${index}`}
                    type="button"
                    onClick={() => setPaymentMethod(method.value)}
                    className={`min-h-40 bg-card p-5 text-center transition-colors ${isSelected ? 'bg-sky-50 ring-2 ring-inset ring-sky-500' : 'hover:bg-surface-hover'}`}
                  >
                    <div className="mb-4 flex h-12 items-center justify-center">
                      <img src={method.image} alt={`${method.label} logo`} className="max-h-12 max-w-28 object-contain" />
                    </div>
                    <p className="text-sm font-semibold leading-5 text-foreground">{method.label}</p>
                    <p className="mt-1 text-xs leading-4 text-muted-foreground">{method.description}</p>
                  </button>
                );
              })}
            </div>

            <Card className="mt-5 rounded-none border-0 shadow-sm">
              <CardContent className="p-5">
                <label htmlFor="order-notes" className="mb-2 block text-sm font-medium text-foreground">Order notes</label>
                <textarea
                  id="order-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  placeholder="Delivery instructions (optional)"
                  className="w-full resize-none border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </CardContent>
            </Card>
          </section>

          <Card className="rounded-none border-0 shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <h2 className="mb-6 font-sans text-xl font-medium text-foreground">Order Summary</h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Subtotal ({selectedItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">{formatCurrency(shippingCost)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Tax (13%)</span>
                  <span className="font-medium">{formatCurrency(taxAmount)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium text-green-600">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-border pt-5">
                  <div className="flex justify-between gap-4">
                    <span className="text-lg font-medium text-foreground">Total Amount</span>
                    <span className="text-2xl font-semibold text-primary">{formatCurrency(total)}</span>
                  </div>
                  {paymentMethod === 'cod' && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Pay <strong className="text-foreground">{formatCurrency(total)}</strong> in cash when your order is delivered.
                    </p>
                  )}
                </div>
              </div>
              <Button
                type="button"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="mt-7 w-full rounded-none bg-primary text-base font-semibold hover:bg-primary/90"
                size="lg"
              >
                {isSubmitting ? 'Processing...' : 'Proceed to Pay'}
              </Button>
              <Link to={`/checkout?selected=${selectedIds.join(',')}`} state={state} className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to checkout
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
