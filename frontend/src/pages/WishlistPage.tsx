import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Product } from '@/types';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

export default function WishlistPage() {
  usePageTitle('Wishlist — KalaBazzar', 'Your saved products.');
  const { items, isLoading, removeFromWishlist, clearWishlist, moveToCart } = useWishlist();
  const { addToCart } = useCart();
  const [movingItems, setMovingItems] = useState<Set<string>>(new Set());

  const handleMoveToCart = async (productId: string) => {
    setMovingItems((prev) => new Set(prev).add(productId));
    try {
      await moveToCart(productId);
      await addToCart(productId);
      toast.success('Moved to cart');
    } catch {
      toast.error('Failed to move to cart');
    } finally {
      setMovingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleClearAll = async () => {
    try {
      await clearWishlist();
      toast.success('Wishlist cleared');
    } catch {
      toast.error('Failed to clear wishlist');
    }
  };

  const getProduct = (item: { product: Product | string }): Product | null => {
    return typeof item.product === 'object' ? item.product : null;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-primary py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-2xl mx-auto text-center"
          >
            <motion.div variants={fadeInUp}>
              <Heart className="h-12 w-12 text-primary-foreground/60 mx-auto mb-4" />
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-heading text-primary-foreground"
            >
              My Wishlist
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-primary-foreground/80"
            >
              Products you love and want to purchase later
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {items.length > 0 ? (
                <>
                  {/* Actions */}
                  <motion.div variants={fadeInUp} className="flex items-center justify-between mb-8">
                    <p className="text-muted-foreground">
                      {items.length} {items.length === 1 ? 'item' : 'items'}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearAll}
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear Wishlist
                    </Button>
                  </motion.div>

                  {/* Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                    {items.map((item) => {
                      const product = getProduct(item);
                      if (!product) return null;

                      const images = product.variants?.[0]?.images || [];
                      const firstImage = images[0] || '/placeholder.jpg';
                      const hasDiscount =
                        product.compareAtPrice &&
                        product.compareAtPrice > product.basePrice;
                      const discountPercent = hasDiscount
                        ? Math.round(
                            ((product.compareAtPrice! - product.basePrice) /
                              product.compareAtPrice!) *
                              100,
                          )
                        : 0;
                      const isMoving = movingItems.has(product._id);

                      return (
                        <motion.div key={product._id} variants={fadeInUp}>
                          <div className="group">
                            <div className="relative overflow-hidden rounded-xl bg-card border border-border">
                              <Link to={`/shop/${product.slug}`}>
                                <div className="aspect-square overflow-hidden">
                                  <img
                                    src={firstImage}
                                    alt={product.name}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                </div>
                              </Link>

                              {hasDiscount && (
                                <span className="absolute top-2 left-2 inline-flex items-center rounded-full bg-destructive px-2 py-0.5 text-xs font-medium text-white">
                                  {discountPercent}% OFF
                                </span>
                              )}

                              <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleRemove(product._id)}
                                  className="p-1.5 rounded-full bg-white/90 text-foreground hover:bg-destructive hover:text-white backdrop-blur-sm transition-colors"
                                  aria-label="Remove from wishlist"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-3">
                              <Link to={`/shop/${product.slug}`}>
                                <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors text-sm">
                                  {product.name}
                                </h3>
                              </Link>

                              <div className="mt-1.5 flex items-center gap-2">
                                <span className="text-base font-semibold text-primary">
                                  {formatCurrency(product.basePrice)}
                                </span>
                                {hasDiscount && (
                                  <span className="text-xs text-muted-foreground line-through">
                                    {formatCurrency(product.compareAtPrice!)}
                                  </span>
                                )}
                              </div>

                              <div className="mt-3 flex gap-2">
                                <Button
                                  onClick={() => handleMoveToCart(product._id)}
                                  disabled={isMoving}
                                  size="sm"
                                  className="flex-1"
                                >
                                  {isMoving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <ShoppingBag className="h-4 w-4" />
                                  )}
                                  Move to Cart
                                </Button>
                                <Button
                                  onClick={() => handleRemove(product._id)}
                                  variant="outline"
                                  size="icon"
                                  className="shrink-0"
                                  aria-label="Remove from wishlist"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* Empty State */
                <motion.div variants={fadeInUp}>
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <h2 className="text-2xl font-heading text-foreground mb-2">
                        Your Wishlist is Empty
                      </h2>
                      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        Save products you love by clicking the heart icon on any
                        product. They will appear here for easy access.
                      </p>
                      <Button asChild size="lg">
                        <Link to="/shop">
                          Browse Products
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
