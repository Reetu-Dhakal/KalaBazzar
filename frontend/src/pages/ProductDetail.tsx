import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronRight,
  Star,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Truck,
  Shield,
  RotateCcw,
  Package,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  Eye,
} from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProductCard } from '@/components/ProductCard';
import { formatCurrency, formatDate } from '@/lib/utils';
import api from '@/lib/api';
import type { Product, Review, SellerProfile, Category, Craft, Region } from '@/types';
import toast from 'react-hot-toast';

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-4 w-48 mb-6" />
      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-3">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-20 h-20 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

function ReviewForm({
  productId,
  onSuccess,
}: {
  productId: string;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  const queryClient = useQueryClient();

  const submitReview = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/products/${productId}/reviews`, {
        rating,
        title,
        comment,
        pros,
        cons,
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Review submitted!');
      queryClient.invalidateQueries({ queryKey: ['productReviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      setRating(5);
      setTitle('');
      setComment('');
      setPros('');
      setCons('');
      onSuccess();
    },
    onError: () => {
      toast.error('Failed to submit review. You may have already reviewed this product.');
    },
  });

  return (
    <div className="bg-muted/50 rounded-xl p-6">
      <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Write a Review</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => setRating(star)}
              className="p-0.5"
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  star <= (hoveredStar || rating)
                    ? 'fill-secondary text-secondary'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">{rating} stars</span>
        </div>
      </div>
      <div className="space-y-3">
        <Input
          label="Review Title"
          placeholder="Summarize your experience"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Comment *</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={4}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Pros"
            placeholder="What you liked"
            value={pros}
            onChange={(e) => setPros(e.target.value)}
          />
          <Input
            label="Cons"
            placeholder="What could be better"
            value={cons}
            onChange={(e) => setCons(e.target.value)}
          />
        </div>
        <Button
          onClick={() => submitReview.mutate()}
          disabled={!comment.trim() || submitReview.isPending}
          isLoading={submitReview.isPending}
        >
          Submit Review
        </Button>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addProduct } = useRecentlyViewed();
  const queryClient = useQueryClient();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'story' | 'shipping'>('description');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: productData, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await api.get(`/products/${slug}`);
      return data.data.product as Product & {
        seller: SellerProfile;
        category: Category;
        craft: Craft;
        region: Region;
      };
    },
    enabled: !!slug,
  });

  const relatedProductsQuery = useQuery({
    queryKey: ['relatedProducts', slug],
    queryFn: async () => {
      const { data } = await api.get(`/products/${slug}`);
      return (data.data.relatedProducts || []) as Product[];
    },
    enabled: !!slug,
  });

  const reviewsQuery = useQuery({
    queryKey: ['productReviews', productData?._id, reviewPage],
    queryFn: async () => {
      const { data } = await api.get(`/products/${productData!._id}/reviews`, {
        params: { page: reviewPage, limit: 5 },
      });
      return {
        reviews: data.data as Review[],
        pagination: data.meta?.pagination,
      };
    },
    enabled: !!productData?._id,
  });

  const helpfulMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { data } = await api.put(`/reviews/${reviewId}/helpful`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productReviews'] });
    },
  });

  useEffect(() => {
    if (productData) {
      addProduct(productData as any);
      api.post(`/products/${productData._id}/view`).catch(() => {});
    }
  }, [productData?._id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  usePageTitle(
    productData ? `${productData.name} — KalaBazzar` : undefined,
    productData?.shortDescription || productData?.description?.slice(0, 160),
  );

  const product = productData;
  const inWishlist = product ? isInWishlist(product._id) : false;
  const images = product?.variants?.[0]?.images || [];
  const reviews = reviewsQuery.data?.reviews || [];
  const reviewsPagination = reviewsQuery.data?.pagination;

  const hasDiscount = product && product.compareAtPrice && product.compareAtPrice > product.basePrice;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product!.compareAtPrice! - product!.basePrice) /
          product!.compareAtPrice!) *
          100,
      )
    : 0;

  const isOutOfStock = product ? (product.status === 'out_of_stock' || product.variants.every(v => v.inventory <= 0)) : false;

  const sellerName = product?.seller?.storeName || '';
  const sellerSlug = product?.seller?.slug || '';
  const categoryName = product?.category?.name || '';
  const categorySlug = product?.category?.slug || '';
  const craftName = product?.craft?.name || '';
  const regionName = product?.region?.name || '';

  const handleAddToCart = async () => {
    if (!product || isOutOfStock) return;
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    try {
      await addToCart(product._id, quantity);
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      toast.error('Please login to manage your wishlist');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
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

  const relatedProducts = relatedProductsQuery.data || [];

  if (isLoading) return <ProductDetailSkeleton />;

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-heading text-primary mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-2">Product not found</p>
          <p className="text-muted-foreground mb-8">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/shop">Browse All Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          {categoryName && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link
                to={`/shop?category=${categorySlug}`}
                className="hover:text-foreground transition-colors"
              >
                {categoryName}
              </Link>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-accent/50 mb-4">
              {images.length > 0 ? (
                <img
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-24 w-24 text-muted-foreground/30" />
                </div>
              )}
              {hasDiscount && (
                <Badge variant="destructive" className="absolute top-4 left-4">
                  {discountPercent}% OFF
                </Badge>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === selectedImageIndex
                        ? 'border-primary'
                        : 'border-border hover:border-muted-foreground/50'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {sellerName && (
              <Link
                to={`/store/${sellerSlug}`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {sellerName}
              </Link>
            )}

            <h1 className="font-heading text-2xl lg:text-3xl font-semibold text-foreground mt-2 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(product.analytics?.averageRating ?? 0)
                        ? 'fill-secondary text-secondary'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-1">
                  ({product.analytics?.reviewCount} reviews)
                </span>
              </div>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {product.analytics?.views} views
              </span>
            </div>

            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(product.basePrice)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatCurrency(product.compareAtPrice!)}
                </span>
              )}
            </div>

            {product.shortDescription && (
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              {categoryName && (
                <Badge variant="outline">{categoryName}</Badge>
              )}
              {craftName && (
                <Badge variant="outline">{craftName}</Badge>
              )}
              {regionName && (
                <Badge variant="outline">{regionName}</Badge>
              )}
            </div>

            {!isOutOfStock && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-foreground mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-5 py-2 text-sm font-medium min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                size="lg"
                className="flex-1"
              >
                <ShoppingCart className="h-5 w-5" />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button
                onClick={handleWishlistToggle}
                variant="outline"
                size="lg"
              >
                <Heart className={`h-5 w-5 ${inWishlist ? 'fill-destructive text-destructive' : ''}`} />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
                <Truck className="h-5 w-5 text-primary mb-1" />
                <span className="text-xs text-muted-foreground">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
                <Shield className="h-5 w-5 text-primary mb-1" />
                <span className="text-xs text-muted-foreground">Verified Artisan</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
                <RotateCcw className="h-5 w-5 text-primary mb-1" />
                <span className="text-xs text-muted-foreground">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="flex border-b border-border gap-1">
            {(['description', 'story', 'shipping'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'description'
                  ? 'Description'
                  : tab === 'story'
                  ? 'Story Behind the Product'
                  : 'Shipping & Returns'}
              </button>
            ))}
          </div>

          <div className="py-6">
            {activeTab === 'description' && (
              <div>
                {product.description ? (
                  <div className={`text-muted-foreground leading-relaxed prose prose-sm max-w-none ${!isDescriptionExpanded ? 'line-clamp-6' : ''}`}>
                    {product.description}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No description available.</p>
                )}
                {product.description && product.description.length > 300 && (
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="mt-3 text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    {isDescriptionExpanded ? (
                      <>Show less <ChevronUp className="h-4 w-4" /></>
                    ) : (
                      <>Read more <ChevronDown className="h-4 w-4" /></>
                    )}
                  </button>
                )}

                {product.materials && product.materials.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-heading text-sm font-semibold text-foreground mb-2">Materials</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.materials.map((material) => (
                        <Badge key={material} variant="outline">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {product.dimensions && (
                  <div className="mt-6">
                    <h4 className="font-heading text-sm font-semibold text-foreground mb-2">Dimensions</h4>
                    <div className="text-sm text-muted-foreground">
                      {product.dimensions.length && (
                        <span>Length: {product.dimensions.length}{product.dimensions.unit}</span>
                      )}
                      {product.dimensions.width && (
                        <span className="ml-4">Width: {product.dimensions.width}{product.dimensions.unit}</span>
                      )}
                      {product.dimensions.height && (
                        <span className="ml-4">Height: {product.dimensions.height}{product.dimensions.unit}</span>
                      )}
                      {product.dimensions.weight && (
                        <span className="ml-4">Weight: {product.dimensions.weight}{product.dimensions.unit}</span>
                      )}
                    </div>
                  </div>
                )}

                {product.careInstructions && (
                  <div className="mt-6">
                    <h4 className="font-heading text-sm font-semibold text-foreground mb-2">Care Instructions</h4>
                    <p className="text-sm text-muted-foreground">{product.careInstructions}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'story' && (
              <div>
                {product.story ? (
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.story}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No story has been shared for this product yet.
                  </p>
                )}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="h-4 w-4 text-primary" />
                      <h4 className="font-medium text-sm text-foreground">Shipping</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {product.shippingClass === 'free'
                        ? 'Free shipping on this item'
                        : product.shippingClass === 'express'
                        ? 'Express shipping available'
                        : 'Standard shipping applies'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Processing time: {product.processingTime} business day{product.processingTime !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <RotateCcw className="h-4 w-4 text-primary" />
                      <h4 className="font-medium text-sm text-foreground">Returns</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Returns accepted within 7 days of delivery. Item must be unused and in original packaging.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-semibold text-foreground">Customer Reviews</h2>
            {isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                {showReviewForm ? 'Cancel' : 'Write a Review'}
              </Button>
            )}
          </div>

          {showReviewForm && (
            <div className="mb-8">
              <ReviewForm
                productId={product._id}
                onSuccess={() => setShowReviewForm(false)}
              />
            </div>
          )}

          <div className="grid md:grid-cols-[200px_1fr] gap-8">
            <div className="text-center p-6 bg-muted/50 rounded-xl h-fit">
              <div className="text-5xl font-bold text-foreground">
                {(product.analytics?.averageRating ?? 0).toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(product.analytics?.averageRating ?? 0)
                        ? 'fill-secondary text-secondary'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {product.analytics?.reviewCount} review{product.analytics?.reviewCount !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-4">
              {reviewsQuery.isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))
              ) : reviews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                </div>
              ) : (
                reviews.map((review) => {
                  const reviewer =
                    typeof review.customer === 'object' && review.customer
                      ? review.customer
                      : null;
                  const hasVoted = review.helpfulBy?.includes(user?._id || '');
                  return (
                    <div key={review._id} className="p-4 rounded-xl border border-border">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              {reviewer?.avatar ? (
                                <img
                                  src={reviewer.avatar}
                                  alt=""
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-semibold text-primary">
                                  {reviewer?.firstName?.[0]}{reviewer?.lastName?.[0]}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : 'Customer'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(review.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3.5 w-3.5 ${
                                  star <= review.rating
                                    ? 'fill-secondary text-secondary'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.isVerifiedPurchase && (
                          <Badge variant="success" className="text-[10px]">Verified Purchase</Badge>
                        )}
                      </div>

                      {review.title && (
                        <p className="mt-3 font-medium text-sm text-foreground">{review.title}</p>
                      )}
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                        {review.comment}
                      </p>
                      {review.pros && (
                        <p className="mt-2 text-sm text-success">
                          <span className="font-medium">Pros:</span> {review.pros}
                        </p>
                      )}
                      {review.cons && (
                        <p className="mt-1 text-sm text-destructive">
                          <span className="font-medium">Cons:</span> {review.cons}
                        </p>
                      )}

                      <div className="mt-3 flex items-center gap-3">
                        {isAuthenticated && (
                          <button
                            onClick={() => helpfulMutation.mutate(review._id)}
                            className={`flex items-center gap-1 text-xs transition-colors ${
                              hasVoted
                                ? 'text-primary font-medium'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <ThumbsUp className={`h-3.5 w-3.5 ${hasVoted ? 'fill-current' : ''}`} />
                            Helpful ({review.helpfulCount})
                          </button>
                        )}
                      </div>

                      {review.sellerResponse && (
                        <div className="mt-3 ml-4 p-3 bg-muted/50 rounded-lg border-l-2 border-primary">
                          <p className="text-xs font-medium text-foreground mb-1">
                            Seller response ({formatDate(review.sellerResponse.respondedAt)}):
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {review.sellerResponse.comment}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {reviewsPagination && reviewsPagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!reviewsPagination.hasPrev}
                    onClick={() => setReviewPage(reviewPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: reviewsPagination.totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <Button
                        key={p}
                        variant={p === reviewPage ? 'primary' : 'outline'}
                        size="sm"
                        className="min-w-[32px]"
                        onClick={() => setReviewPage(p)}
                      >
                        {p}
                      </Button>
                    ),
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!reviewsPagination.hasNext}
                    onClick={() => setReviewPage(reviewPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((rp) => (
                <ProductCard key={rp._id} product={rp} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
