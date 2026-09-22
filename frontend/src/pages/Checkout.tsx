import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Truck,
  MapPin,
  ChevronRight,
  User,
  ShoppingBag,
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
import type { ShippingAddress } from '@/types';

const checkoutSchema = z.object({
  recipientName: z.string().min(2, 'Name must be at least 2 characters'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(4, 'Zip code is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const VALLEY_CITIES = ['kathmandu', 'lalitpur', 'bhaktapur', 'kirtipur', 'madhyapur thimi'];
const NEARBY_DISTRICTS = ['kavrepalanchok', 'kavre', 'dhading', 'nuwakot', 'makwanpur'];

function getShippingCost(city: string, state: string): number {
  const destination = `${city} ${state}`.toLowerCase().trim();
  if (VALLEY_CITIES.some((place) => destination.includes(place))) return 100;
  if (NEARBY_DISTRICTS.some((place) => destination.includes(place))) return 200;
  return 300;
}

export default function Checkout() {
  usePageTitle('Checkout');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items, appliedCoupon } = useCart();
  const { user } = useAuth();
  const savedAddresses = user?.addresses || [];

  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [localCoupon, setLocalCoupon] = useState<{
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    discountAmount: number;
  } | null>(null);

  const activeCoupon = appliedCoupon || localCoupon;
  const selectedProductIds = searchParams.get('selected')?.split(',').filter(Boolean) || [];
  const selectedItems = selectedProductIds.length > 0
    ? items.filter((item) => {
      const productId = typeof item.product === 'string' ? item.product : item.product._id;
      return selectedProductIds.includes(productId);
    })
    : items;
  const selectedIds = selectedItems.map((item) => typeof item.product === 'string' ? item.product : item.product._id);
  const selectedSubtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const {
    register,
    handleSubmit,
    watch,
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
    },
  });

  useEffect(() => {
    const defaultIndex = savedAddresses.findIndex((address) => address.isDefault);
    const addressIndex = defaultIndex >= 0 ? defaultIndex : savedAddresses.length > 0 ? 0 : -1;
    if (addressIndex >= 0) {
      const address = savedAddresses[addressIndex];
      setSelectedAddressIndex(addressIndex);
      reset({
        recipientName: user ? `${user.firstName} ${user.lastName}` : '',
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        phone: user?.phone || '',
      });
    }
  }, [reset, savedAddresses, user]);

  const shippingCost = getShippingCost(watch('city'), watch('state'));
  const discountAmount = activeCoupon?.discountAmount || 0;
  const taxAmount = Math.round((selectedSubtotal * 13) / 100);
  const grandTotal = Math.max(0, selectedSubtotal + shippingCost + taxAmount - discountAmount);

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
    if (selectedItems.length === 0) {
      toast.error('Select at least one cart item');
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

    navigate(`/payment/select?selected=${selectedIds.join(',')}`, {
      state: {
        shippingAddress,
        couponCode: activeCoupon?.code || undefined,
        discountAmount,
      },
    });
  };

  const handleInvalidSubmit = () => {
    toast.error('Please complete your shipping address before continuing');
    if (savedAddresses.length > 0 && selectedAddressIndex === null) {
      setShowManualEntry(true);
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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto px-4 py-5 sm:px-6 lg:py-7">
        <nav className="mb-5 flex items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/cart" className="transition-colors hover:text-foreground">Cart</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">Checkout</span>
        </nav>

      <form onSubmit={handleSubmit(onSubmit, handleInvalidSubmit)}>
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(320px,0.9fr)]">
          <div className="space-y-4">
            <Card className="rounded-none border-0 shadow-sm">
              <CardHeader className="flex-row items-center justify-between border-b border-border bg-card px-4 py-3 sm:px-5">
                <CardTitle className="text-lg font-sans font-medium">Shipping Address</CardTitle>
                <button type="button" className="text-sm font-medium text-sky-600 hover:underline">EDIT</button>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-5">
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
                    <div className="rounded-xl border border-border bg-background p-4">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                        <User className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">Contact Information</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          Who will receive the order
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Full Name"
                          placeholder="Full name"
                          error={errors.recipientName?.message}
                          {...register('recipientName')}
                        />
                        <Input
                          label="Mobile Number"
                          placeholder="98XXXXXXXX"
                          error={errors.phone?.message}
                          {...register('phone')}
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-background p-4">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">Address Details</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          Delivery location
                        </span>
                      </div>
                      <Input
                        label="Detailed Address"
                        placeholder="Street address, house/building, apartment, suite, etc."
                        error={errors.street?.message}
                        {...register('street')}
                      />
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Input
                          label="City"
                          placeholder="City"
                          error={errors.city?.message}
                          {...register('city')}
                        />
                        <Input
                          label="District"
                          placeholder="District"
                          error={errors.state?.message}
                          {...register('state')}
                        />
                        <Input
                          label="Postal Code"
                          placeholder="Postal code"
                          error={errors.zipCode?.message}
                          {...register('zipCode')}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-none border-0 shadow-sm">
              <CardHeader className="flex-row items-center justify-between border-b border-border bg-card px-4 py-3 sm:px-5">
                <CardTitle className="text-base font-sans font-semibold">Package 1 of 1</CardTitle>
                <span className="text-xs text-muted-foreground">Shipped by <strong className="text-foreground">{selectedItems.length > 0 && typeof selectedItems[0].product !== 'string' && typeof selectedItems[0].product.seller === 'object' && 'storeName' in selectedItems[0].product.seller ? selectedItems[0].product.seller.storeName : 'Artisan Store'}</strong></span>
              </CardHeader>
              <CardContent className="p-4 sm:p-5">
                <p className="mb-3 text-sm font-medium text-foreground">Delivery or Pickup</p>
                <div className="mb-5 flex max-w-xs items-start gap-3 border border-sky-400 bg-sky-50/40 p-4">
                  <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-xs text-white">✓</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{formatCurrency(shippingCost)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Standard Delivery</p>
                    <p className="mt-5 text-xs text-muted-foreground">Delivery fee based on your location</p>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {selectedItems.map((item) => {
                    const product = typeof item.product === 'string' ? null : item.product;
                    if (!product) return null;
                    const imageUrl = product.variants?.[0]?.images?.[0] || '';
                    return (
                      <div key={product._id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                        <div className="h-20 w-20 shrink-0 overflow-hidden border border-border bg-accent">
                          {imageUrl ? <img src={imageUrl} alt={product.name} className="h-full w-full object-cover" /> : <ShoppingBag className="m-auto h-7 w-7 text-muted-foreground/40" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-medium text-foreground">{product.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="shrink-0 text-sm font-medium text-primary">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 rounded-none border-0 shadow-sm">
              <CardHeader className="border-b border-border px-4 py-3 sm:px-5">
                <CardTitle className="text-xl font-sans font-medium">Promotion</CardTitle>
                <div className="mt-3 flex gap-2">
                  <Input placeholder="Enter Store/Daraz Code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="h-11 rounded-none" />
                  <Button type="button" variant="secondary" onClick={handleApplyCoupon} disabled={!couponCode.trim()} className="h-11 rounded-none bg-sky-500 px-5 text-white hover:bg-sky-600">APPLY</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-4 sm:p-5">
                <div className="flex items-center justify-between border-b border-border pb-5">
                  <span className="font-sans text-lg font-medium">Invoice and Contact Info</span>
                  <button type="button" className="text-sm font-medium text-sky-600 hover:underline">Edit</button>
                </div>
                <div>
                  <h3 className="mb-4 font-sans text-lg font-medium">Order Detail</h3>
                  <div className="space-y-4 text-sm">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items Total ({selectedItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>{formatCurrency(selectedSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>{formatCurrency(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (13%)</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-green-600">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="text-lg font-semibold text-primary">
                        {formatCurrency(grandTotal)}
                      </span>
                    </div>
                  </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-none bg-primary text-base font-semibold hover:bg-primary/90"
                  size="lg"
                >
                  <Truck className="h-5 w-5" />
                  Proceed to Pay
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  By placing this order, you agree to our terms and conditions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
      </div>
    </div>
  );
}
