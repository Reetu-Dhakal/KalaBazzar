import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  Tag,
  X,
  PackageOpen,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePageTitle } from '@/hooks/usePageTitle';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

const SHIPPING_THRESHOLD = 5000;
const SHIPPING_COST = 250;

export default function CartPage() {
  usePageTitle('Shopping Cart');
  const {
    items,
    totalItems,
    subtotal,
    isLoading,
    appliedCoupon,
    total,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const shippingCost = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const freeShippingRemaining = SHIPPING_THRESHOLD - subtotal;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    try {
      await applyCoupon(couponCode.trim());
      setCouponCode('');
      toast.success('Coupon applied successfully!');
    } catch {
      toast.error('Invalid or expired coupon code');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast.success('Coupon removed');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <PackageOpen className="h-20 w-20 text-muted-foreground/30 mx-auto mb-6" />
        <h1 className="text-3xl font-heading text-foreground mb-3">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Looks like you haven't added any items to your cart yet. Explore our collection of authentic handmade crafts.
        </p>
        <Button size="lg" asChild>
          <Link to="/shop">
            <ShoppingBag className="h-5 w-5" />
            Start Shopping
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <span className="mx-1">/</span>
        <span className="text-foreground font-medium">Cart</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-heading text-foreground">
          Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </h1>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/shop">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
      </div>

      {freeShippingRemaining > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200">
          <p className="text-sm text-green-800">
            Add <span className="font-semibold">{formatCurrency(freeShippingRemaining)}</span> more for free shipping!
          </p>
          <div className="mt-2 h-2 bg-green-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 rounded-full transition-all"
              style={{ width: `${Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = typeof item.product === 'string' ? null : item.product;
            if (!product) return null;

            const imageUrl = product.variants?.[0]?.images?.[0] || '';
            const itemTotal = item.price * item.quantity;

            return (
              <Card key={product._id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Link
                      to={`/shop/${product.slug}`}
                      className="flex-shrink-0"
                    >
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-accent">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="h-8 w-8 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/shop/${product.slug}`}
                          className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
                        >
                          {product.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(product._id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors flex-shrink-0"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>

                      <p className="text-sm text-muted-foreground mt-1">
                        {formatCurrency(item.price)} each
                      </p>

                      {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(item.selectedVariants).map(([key, value]) => (
                            <span
                              key={key}
                              className="text-xs px-2 py-1 rounded-full bg-accent text-muted-foreground"
                            >
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(product._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-9 w-9 flex items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-12 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product._id, item.quantity + 1)}
                            className="h-9 w-9 flex items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="font-semibold text-foreground">
                          {formatCurrency(itemTotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatCurrency(shippingCost)
                    )}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Tag className="h-3.5 w-3.5" />
                      Discount ({appliedCoupon.code})
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-destructive hover:underline ml-1"
                      >
                        <X className="h-3.5 w-3.5 inline" />
                      </button>
                    </span>
                    <span className="font-medium text-green-600">
                      -{formatCurrency(appliedCoupon.discountAmount)}
                    </span>
                  </div>
                )}

                <div className="border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-bold text-lg text-foreground">
                      {formatCurrency(total + shippingCost)}
                    </span>
                  </div>
                </div>
              </div>

              {!appliedCoupon && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    className="h-10"
                  />
                  <Button
                    variant="outline"
                    onClick={handleApplyCoupon}
                    isLoading={isApplyingCoupon}
                    disabled={!couponCode.trim()}
                  >
                    Apply
                  </Button>
                </div>
              )}

              <Button className="w-full" size="lg" asChild>
                <Link to="/checkout">Proceed to Checkout</Link>
              </Button>

              <Button variant="ghost" className="w-full" asChild>
                <Link to="/shop">
                  <ArrowLeft className="h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
