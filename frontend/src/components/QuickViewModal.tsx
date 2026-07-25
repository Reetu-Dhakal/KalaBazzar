import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Star, ShoppingBag, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const images = product.variants?.[0]?.images || [];
  const inWishlist = isInWishlist(product._id);
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.basePrice;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.basePrice) /
          product.compareAtPrice!) *
          100,
      )
    : 0;

  const isOutOfStock = product.variants.every(v => v.inventory <= 0);

  const handleClose = () => {
    setQuantity(1);
    setCurrentImageIndex(0);
    onClose();
  };

  const handlePrev = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    try {
      await addToCart(product._id, quantity);
      toast.success('Added to cart');
      handleClose();
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const handleWishlistToggle = async () => {
    try {
      if (inWishlist) {
        await removeFromWishlist(product._id);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(product._id);
        toast.success('Added to wishlist');
      }
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-card rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-white/90 text-foreground hover:bg-white transition-colors backdrop-blur-sm"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="grid md:grid-cols-2">
                <div className="relative aspect-square bg-accent/50">
                  {images.length > 0 ? (
                    <>
                      <img
                        src={images[currentImageIndex]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={handlePrev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 hover:bg-white transition-colors"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 hover:bg-white transition-colors"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                            {images.map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setCurrentImageIndex(i)}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  i === currentImageIndex
                                    ? 'bg-primary'
                                    : 'bg-white/60'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                  )}

                  {hasDiscount && (
                    <Badge variant="destructive" className="absolute top-3 left-3">
                      {discountPercent}% OFF
                    </Badge>
                  )}
                </div>

                <div className="p-6 flex flex-col">
                  {typeof product.seller === 'object' && product.seller && (
                    <p className="text-xs text-muted-foreground mb-1">
                      {product.seller.storeName}
                    </p>
                  )}
                  <h2 className="font-heading text-xl font-semibold text-foreground leading-tight">
                    {product.name}
                  </h2>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(product.basePrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatCurrency(product.compareAtPrice!)}
                      </span>
                    )}
                  </div>

                  {product.analytics.averageRating > 0 && (
                    <div className="mt-2 flex items-center gap-1">
                      <Star className="h-4 w-4 fill-secondary text-secondary" />
                      <span className="text-sm text-muted-foreground">
                        {product.analytics.averageRating.toFixed(1)}{' '}
                        ({product.analytics.reviewCount} reviews)
                      </span>
                    </div>
                  )}

                  {product.shortDescription && (
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {product.shortDescription}
                    </p>
                  )}

                  {!isOutOfStock && (
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-2">Quantity</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-border rounded-lg">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            −
                          </button>
                          <span className="px-4 py-1.5 text-sm font-medium min-w-[3rem] text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto pt-6 flex gap-2">
                    <Button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      className="flex-1"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                    <Button
                      onClick={handleWishlistToggle}
                      variant="outline"
                      size="icon"
                    >
                      <Heart className={`h-4 w-4 ${inWishlist ? 'fill-destructive text-destructive' : ''}`} />
                    </Button>
                  </div>

                  <Link
                    to={`/shop/${product.slug}`}
                    onClick={handleClose}
                    className="mt-3 text-center text-sm text-primary hover:underline"
                  >
                    View Full Details
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
