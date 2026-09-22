import { useEffect, useMemo, useRef, useState } from 'react';
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
  Check,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePageTitle } from '@/hooks/usePageTitle';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

const SHIPPING_COST = 100;

export default function CartPage() {
  usePageTitle('Shopping Cart');
  const {
    items,
    totalItems,
    isLoading,
    appliedCoupon,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const autoSelected = useRef(false);

  useEffect(() => {
    if (!autoSelected.current && items.length > 0) {
      autoSelected.current = true;
      setSelectedProductIds(
        new Set(items.map((item) => typeof item.product === 'string' ? item.product : item.product._id)),
      );
    }
  }, [items]);

  const selectedItems = useMemo(
    () => items.filter((item) => {
      const product = typeof item.product === 'string' ? null : item.product;
      return product && selectedProductIds.has(product._id);
    }),
    [items, selectedProductIds],
  );
  const selectedTotalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const selectedSubtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const shippingCost = SHIPPING_COST;
  const allSelected = items.length > 0 && selectedItems.length === items.length;

  const toggleProduct = (productId: string) => {
    setSelectedProductIds((previous) => {
      const next = new Set(previous);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedProductIds(allSelected
      ? new Set()
      : new Set(items.map((item) => typeof item.product === 'string' ? item.product : item.product._id)));
  };

  const getStoreName = (product: NonNullable<typeof items[number]['product']>) => {
    if (typeof product === 'string') return 'Artisan Store';
    const seller = product.seller;
    if (typeof seller === 'object' && 'storeName' in seller && seller.storeName) return seller.storeName;
    if (typeof seller === 'object' && 'firstName' in seller) {
      const sellerUser = seller as { firstName: string; lastName?: string };
      return `${sellerUser.firstName} ${sellerUser.lastName || ''}`.trim();
    }
    return 'Artisan Store';
  };

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
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:py-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Your basket</p>
            <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">Shopping Cart</h1>
          </div>
          <Link to="/shop" className="hidden items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-secondary sm:flex">
            <ArrowLeft className="h-4 w-4" />
            Continue shopping
          </Link>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center gap-3 bg-card px-4 py-3 text-sm shadow-sm">
            <button
              type="button"
              onClick={toggleAll}
              aria-label={allSelected ? 'Deselect all cart items' : 'Select all cart items'}
              className={`flex h-5 w-5 items-center justify-center border ${allSelected ? 'border-primary bg-primary text-white' : 'border-border bg-white'}`}
            >
              {allSelected && <Check className="h-3.5 w-3.5" />}
            </button>
            <span>Select all ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
          </div>
          {items.map((item) => {
            const product = typeof item.product === 'string' ? null : item.product;
            if (!product) return null;

            const imageUrl = product.variants?.[0]?.images?.[0] || '';
            const itemTotal = item.price * item.quantity;

            return (
              <Card key={product._id} className="overflow-hidden rounded-none border-0 shadow-sm">
                <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-3 text-sm font-medium text-foreground">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  <button
                    type="button"
                    onClick={() => toggleProduct(product._id)}
                    aria-label={`Select ${product.name}`}
                    className={`flex h-5 w-5 items-center justify-center border ${selectedProductIds.has(product._id) ? 'border-primary bg-primary text-white' : 'border-border bg-white'}`}
                  >
                    {selectedProductIds.has(product._id) && <Check className="h-3.5 w-3.5" />}
                  </button>
                  {getStoreName(product)}
                  <span className="text-muted-foreground">›</span>
                </div>
                <CardContent className="p-4 sm:p-5">
                  <div className="flex gap-3 sm:gap-5">
                    <Link
                      to={`/shop/${product.slug}`}
                      className="shrink-0"
                    >
                      <div className="h-24 w-24 overflow-hidden border border-border bg-accent sm:h-32 sm:w-32">
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
                          className="line-clamp-2 text-sm font-medium leading-5 text-foreground transition-colors hover:text-primary sm:text-base"
                        >
                          {product.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(product._id)}
                          className="shrink-0 p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>

                      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                        Handmade piece · {formatCurrency(item.price)} each
                      </p>

                      {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(item.selectedVariants).map(([key, value]) => (
                            <span
                              key={key}
                              className="bg-accent px-2 py-1 text-xs text-muted-foreground"
                            >
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div className="flex items-center border border-border bg-surface-alt">
                          <button
                            onClick={() => updateQuantity(product._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-9 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product._id, item.quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:bg-accent"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-base font-semibold text-primary sm:text-lg">
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
          <Card className="sticky top-24 rounded-none border-0 shadow-sm">
            <CardHeader className="border-b border-border p-5">
              <CardTitle className="text-2xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-5">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                  </span>
                    <span className="font-medium">{formatCurrency(selectedSubtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping Fee</span>
                  <span className="font-medium">{formatCurrency(shippingCost)}</span>
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

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-lg font-semibold text-primary">
                      {formatCurrency(Math.max(0, selectedSubtotal - (appliedCoupon?.discountAmount || 0)) + shippingCost)}
                    </span>
                  </div>
                </div>
              </div>

              {!appliedCoupon && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter Voucher Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    className="h-10"
                  />
                  <Button
                    variant="secondary"
                    onClick={handleApplyCoupon}
                    isLoading={isApplyingCoupon}
                    disabled={!couponCode.trim()}
                  >
                    APPLY
                  </Button>
                </div>
              )}

              {selectedItems.length === 0 ? (
                <Button
                  className="w-full rounded-none bg-primary text-base font-semibold hover:bg-primary/90"
                  size="lg"
                  disabled
                >
                  PROCEED TO CHECKOUT
                </Button>
              ) : (
                <Button
                  className="w-full rounded-none bg-primary text-base font-semibold hover:bg-primary/90"
                  size="lg"
                  asChild
                >
                  <Link to={`/checkout?selected=${selectedItems.map((item) => typeof item.product === 'string' ? item.product : item.product._id).join(',')}`}>
                    PROCEED TO CHECKOUT ({selectedTotalItems})
                  </Link>
                </Button>
              )}

              <Button variant="ghost" className="w-full sm:hidden" asChild>
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
    </div>
  );
}
