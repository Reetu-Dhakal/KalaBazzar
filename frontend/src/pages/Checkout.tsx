import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CreditCard,
  Truck,
  MapPin,
  Tag,
  X,
  ChevronRight,
  Banknote,
  Smartphone,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { usePageTitle } from '@/hooks/usePageTitle';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { PaymentMethod, ShippingAddress } from '@/types';

const checkoutSchema = z.object({
  recipientName: z.string().min(2, 'Name must be at least 2 characters'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(4, 'Zip code is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const SHIPPING_THRESHOLD = 5000;
const SHIPPING_COST = 250;

const PAYMENT_METHODS: { value: PaymentMethod; label: string; description: string; icon: typeof Banknote }[] = [
  {
    value: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay when your order arrives at your doorstep',
    icon: Banknote,
  },
  {
    value: 'khalti',
    label: 'Khalti',
    description: 'Pay instantly using Khalti digital wallet',
    icon: Smartphone,
  },
  {
    value: 'esewa',
    label: 'eSewa',
    description: 'Pay instantly using eSewa digital wallet',
    icon: Smartphone,
  },
];

export default function Checkout() {
  usePageTitle('Checkout');
  const navigate = useNavigate();
  const { items, subtotal, appliedCoupon, clearCart } = useCart();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [localCoupon, setLocalCoupon] = useState<{
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    discountAmount: number;
  } | null>(null);

  const activeCoupon = appliedCoupon || localCoupon;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      recipientName: user ? `${user.firstName} ${user.lastName}` : '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      phone: user?.phone || '',
      notes: '',
    },
  });

  const shippingCost = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const discountAmount = activeCoupon?.discountAmount || 0;
  const grandTotal = Math.max(0, subtotal + shippingCost - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const { data } = await api.get(`/coupons/validate/${couponCode.trim()}`);
      setLocalCoupon(data.data);
      setCouponCode('');
      toast.success('Coupon applied!');
    } catch {
      toast.error('Invalid or expired coupon');
    }
  };

  const onSubmit = async (formData: CheckoutFormData) => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const shippingAddress: ShippingAddress = {
      recipientName: formData.recipientName,
      street: formData.street,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      country: 'Nepal',
      phone: formData.phone,
    };

    setIsPlacingOrder(true);
    try {
      const payload = {
        shippingAddress,
        paymentMethod,
        notes: formData.notes || undefined,
        couponCode: activeCoupon?.code || undefined,
      };

      const { data } = await api.post('/orders', payload);
      const orderId = data.data._id || data.data.order?._id || data.data.orderId;

      if (paymentMethod === 'khalti' || paymentMethod === 'esewa') {
        const paymentData = await api.post('/payment/initiate', {
          orderId,
          paymentMethod,
        });
        const redirectUrl = paymentData.data.redirectUrl;
        if (redirectUrl) {
          window.location.href = redirectUrl;
          return;
        }
      }

      await clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-success/${orderId}`);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to place order';
      toast.error(message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-heading text-foreground mb-3">Cart is empty</h1>
        <p className="text-muted-foreground mb-8">Add items to your cart before checking out.</p>
        <Button asChild>
          <Link to="/shop">Browse Shop</Link>
        </Button>
      </div>
    );
  }

  const savedAddresses = user?.addresses || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/cart" className="hover:text-foreground transition-colors">Cart</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">Checkout</span>
      </nav>

      <h1 className="text-3xl font-heading text-foreground mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {savedAddresses.length > 0 && !showManualEntry && (
                  <div className="space-y-3">
                    {savedAddresses.map((addr, index) => (
                      <label
                        key={index}
                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                          selectedAddressIndex === index
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressIndex === index}
                          onChange={() => {
                            setSelectedAddressIndex(index);
                            reset({
                              recipientName: user ? `${user.firstName} ${user.lastName}` : '',
                              street: addr.street,
                              city: addr.city,
                              state: addr.state,
                              zipCode: addr.zipCode,
                              phone: user?.phone || '',
                            });
                          }}
                          className="mt-1 accent-primary"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-foreground capitalize">
                              {addr.label}
                            </span>
                            {addr.isDefault && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                          </p>
                        </div>
                      </label>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowManualEntry(true);
                        setSelectedAddressIndex(null);
                      }}
                    >
                      Use a different address
                    </Button>
                  </div>
                )}

                {(savedAddresses.length === 0 || showManualEntry) && (
                  <div className="space-y-4">
                    {savedAddresses.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowManualEntry(false);
                          setSelectedAddressIndex(0);
                        }}
                      >
                        ← Back to saved addresses
                      </Button>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Recipient Name"
                        placeholder="Full name"
                        error={errors.recipientName?.message}
                        {...register('recipientName')}
                      />
                      <Input
                        label="Phone Number"
                        placeholder="98XXXXXXXX"
                        error={errors.phone?.message}
                        {...register('phone')}
                      />
                    </div>
                    <Input
                      label="Street Address"
                      placeholder="Street address, apartment, suite, etc."
                      error={errors.street?.message}
                      {...register('street')}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input
                        label="City"
                        placeholder="City"
                        error={errors.city?.message}
                        {...register('city')}
                      />
                      <Input
                        label="State / Province"
                        placeholder="State"
                        error={errors.state?.message}
                        {...register('state')}
                      />
                      <Input
                        label="Zip Code"
                        placeholder="Zip code"
                        error={errors.zipCode?.message}
                        {...register('zipCode')}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Coupon Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeCoupon ? (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        {activeCoupon.code} —{' '}
                        {activeCoupon.discountType === 'percentage'
                          ? `${activeCoupon.discountValue}% off`
                          : `${formatCurrency(activeCoupon.discountValue)} off`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLocalCoupon(null)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim()}
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    return (
                      <label
                        key={method.value}
                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                          paymentMethod === method.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === method.value}
                          onChange={() => setPaymentMethod(method.value)}
                          className="accent-primary"
                        />
                        <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{method.label}</p>
                          <p className="text-xs text-muted-foreground">{method.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  placeholder="Delivery instructions (optional)"
                  rows={3}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 resize-none"
                  {...register('notes')}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => {
                    const product = typeof item.product === 'string' ? null : item.product;
                    if (!product) return null;
                    const imageUrl = product.variants?.[0]?.images?.[0] || '';
                    return (
                      <div key={product._id} className="flex gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-accent flex-shrink-0">
                          {imageUrl ? (
                            <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-foreground flex-shrink-0">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatCurrency(shippingCost)
                      )}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-green-600">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="font-bold text-lg text-foreground">
                        {formatCurrency(grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isPlacingOrder}
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Truck className="h-5 w-5" />
                      Place Order
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By placing this order, you agree to our terms and conditions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
