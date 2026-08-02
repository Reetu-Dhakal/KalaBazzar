import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, Star, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { QuickViewModal } from '@/components/QuickViewModal';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

const fallbackImages: Record<string, string> = {
  singing: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
  bowl: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=400&h=400&fit=crop',
  earring: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',
  silver: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop',
  basket: 'https://images.unsplash.com/photo-1595231776515-ddffb1f4eb73?w=400&h=400&fit=crop',
  bamboo: 'https://images.unsplash.com/photo-1595231776515-ddffb1f4eb73?w=400&h=400&fit=crop',
  painting: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop',
  thangka: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop',
  mandala: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop',
  pendant: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop',
  necklace: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop',
  clay: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop',
  pot: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop',
  ceramic: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop',
  buddha: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=400&fit=crop',
  statue: 'https://images.unsplash.com/photo-1590422749897-47036da0b0ff?w=400&h=400&fit=crop',
  brass: 'https://images.unsplash.com/photo-1590422749897-47036da0b0ff?w=400&h=400&fit=crop',
  ganesh: 'https://images.unsplash.com/photo-1590422749897-47036da0b0ff?w=400&h=400&fit=crop',
  topi: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop',
  dhaka: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop',
  cap: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop',
  door: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop',
  frame: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop',
  wood: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop',
  carved: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop',
  woven: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop',
  scarf: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop',
  shawl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop',
  mug: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop',
  cup: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop',
};

const defaultFallback = 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80';

function getFallbackImage(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, url] of Object.entries(fallbackImages)) {
    if (lower.includes(key)) return url;
  }
  return defaultFallback;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const images = product.variants?.[0]?.images || [];
  const firstImage = images[0] && !images[0].startsWith('/uploads/') ? images[0] : getFallbackImage(product.name);
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

  const isOutOfStock = product.status === 'out_of_stock' || ((product.variants?.length ?? 0) > 0 && product.variants?.every(v => v.inventory <= 0));

  const isNew =
    product.publishedAt &&
    Date.now() - new Date(product.publishedAt).getTime() < 7 * 24 * 60 * 60 * 1000;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    try {
      await addToCart(product._id);
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const sellerName =
    typeof product.seller === 'object' && product.seller
      ? product.seller.storeName
      : '';

  return (
    <>
      <Link
        to={`/shop/${product.slug}`}
        className="group block"
      >
        <div className="relative overflow-hidden rounded-xl bg-card border border-border shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
          <div className="aspect-square overflow-hidden bg-accent/50">
            <img
              src={firstImage || getFallbackImage(product.name)}
              alt={product.name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-accent animate-pulse" />
            )}
          </div>

          {hasDiscount && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              {discountPercent}% OFF
            </Badge>
          )}
          {isNew && !hasDiscount && (
            <Badge variant="success" className="absolute top-2 left-2">
              New
            </Badge>
          )}
          {isOutOfStock && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              Out of Stock
            </Badge>
          )}

          <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleWishlistToggle}
              className={`p-1.5 rounded-full backdrop-blur-sm transition-colors ${
                inWishlist
                  ? 'bg-destructive text-white'
                  : 'bg-white/90 text-foreground hover:bg-destructive hover:text-white'
              }`}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleQuickView}
              className="p-1.5 rounded-full bg-white/90 text-foreground hover:bg-primary hover:text-white backdrop-blur-sm transition-colors"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>

          {!isOutOfStock && (
            <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
              <Button
                onClick={handleAddToCart}
                className="w-full"
                size="sm"
              >
                <ShoppingBag className="h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          )}
        </div>

        <div className="mt-3 px-0.5">
          {sellerName && (
            <p className="text-xs text-muted-foreground mb-0.5">
              {sellerName}
            </p>
          )}
          <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors text-sm leading-snug">
            {product.name}
          </h3>

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

          {product.analytics?.averageRating > 0 && (
            <div className="mt-1 flex items-center gap-1">
              <Star className="h-3 w-3 fill-secondary text-secondary" />
              <span className="text-xs text-muted-foreground">
                {product.analytics?.averageRating.toFixed(1)}{' '}
                ({product.analytics?.reviewCount})
              </span>
            </div>
          )}
        </div>
      </Link>

      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}
