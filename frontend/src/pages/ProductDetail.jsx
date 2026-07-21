import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineHeart,
  HiOutlineShoppingBag,
  HiOutlineStar,
  HiOutlineMinus,
  HiOutlinePlus,
  HiOutlineShare,
  HiOutlineMap,
  HiOutlineTruck,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineEye,
} from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button, ReviewCard } from '../components/ui';
import ProductCard from '../components/product/ProductCard';
import API from '../utils/axios';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${slug}`);
        setProduct(data.data);

        // Fetch related products
        if (data.data?._id) {
          try {
            const { data: relData } = await API.get(`/products/${data.data._id}/related`);
            setRelatedProducts(relData.data || []);
          } catch {
            // Related products not critical
          }
        }
      } catch {
        // Error handled below
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  useEffect(() => {
    if (!product?._id || !user) return;
    const checkWishlist = async () => {
      try {
        const { data } = await API.get('/wishlist');
        const ids = data.data?.products?.map((p) => p._id || p) || [];
        setIsInWishlist(ids.includes(product._id));
      } catch {
        // Not logged in or error
      }
    };
    checkWishlist();
  }, [product?._id, user]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url,
      price: product.price,
      quantity,
      seller: product.seller?._id,
      slug: product.slug,
    });
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }
    try {
      const { data } = await API.put(`/wishlist/${product._id}`);
      setIsInWishlist(data.action === 'added');
      toast.success(data.message);
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      } catch {
        toast.error('Failed to copy link');
      }
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to leave a review');
      return;
    }
    if (!reviewForm.comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }
    setSubmittingReview(true);
    try {
      const { data } = await API.post(`/products/${product._id}/reviews`, {
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setProduct(data.data);
      setReviewForm({ rating: 5, comment: '' });
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const discount = product?.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const stockStatus = product
    ? product.stock > 10
      ? 'in-stock'
      : product.stock > 0
        ? 'low-stock'
        : 'out-of-stock'
    : null;

  if (loading) {
    return (
      <div className="min-h-screen pt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 text-sm text-text-muted mb-8">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="text-border">/</span>
            <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
            <span className="text-border">/</span>
            <span className="text-text">Loading...</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <div className="aspect-square bg-gray-200 rounded-3xl animate-pulse" />
            <div className="space-y-6">
              <div className="h-10 bg-gray-200 rounded-xl w-3/4 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-14 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <p className="text-text-muted mb-4 text-lg">Product not found</p>
            <Link to="/shop" className="text-primary hover:underline underline-offset-4 decoration-1">
              Back to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-text-muted mb-8"
        >
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="text-border">/</span>
          <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <span className="text-border">/</span>
          <Link to={`/shop?category=${product.category?.slug || ''}`} className="hover:text-primary transition-colors">
            {product.category?.name}
          </Link>
          <span className="text-border">/</span>
          <span className="text-text font-medium">{product.name}</span>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-background">
              <img
                src={product.images?.[selectedImage]?.url || product.images?.[0]?.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-full">
                    {discount}% OFF
                  </span>
                </div>
              )}
              {product.isPreorder && (
                <div className="absolute top-4 right-4">
                  <span className="px-4 py-2 bg-secondary text-white text-sm font-medium rounded-full flex items-center gap-1">
                    <HiOutlineClock className="w-4 h-4" />
                    Pre-order
                  </span>
                </div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col"
          >
            {product.category && (
              <p className="text-sm text-primary font-medium mb-3">
                {product.category.name}
              </p>
            )}
            <h1 className="font-heading text-4xl md:text-5xl font-semibold text-text mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <HiOutlineStar
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-secondary fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-text-muted">
                  {product.rating?.toFixed(1)} ({product.numReviews || 0} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-4xl font-heading font-semibold text-primary">
                Rs. {product.price?.toLocaleString()}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-xl text-text-muted line-through">
                  Rs. {product.comparePrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-6">
              {stockStatus === 'in-stock' && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                  <HiOutlineCheckCircle className="w-4 h-4" />
                  In Stock ({product.stock} available)
                </span>
              )}
              {stockStatus === 'low-stock' && (
                <span className="flex items-center gap-1.5 text-sm text-amber-600 font-medium">
                  <HiOutlineClock className="w-4 h-4" />
                  Low Stock — Only {product.stock} left
                </span>
              )}
              {stockStatus === 'out-of-stock' && (
                <span className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-text-muted leading-relaxed mb-6">
                {product.shortDescription}
              </p>
            )}

            {/* Meta Info */}
            <div className="space-y-3 mb-8">
              {product.district && (
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <HiOutlineMap className="w-4 h-4 text-primary" />
                  <span>From {product.district}, Nepal</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <HiOutlineTruck className="w-4 h-4 text-primary" />
                <span>Delivery: {product.deliveryEstimate || '5-7 business days'}</span>
              </div>
              {product.materials?.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <span className="text-primary font-medium">Materials:</span>
                  <span>{product.materials.join(', ')}</span>
                </div>
              )}
              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-background text-text-muted text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center gap-3 bg-white border border-border rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-4 text-text hover:text-primary transition-colors"
                  aria-label="Decrease quantity"
                >
                  <HiOutlineMinus className="w-5 h-5" />
                </button>
                <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-4 text-text hover:text-primary transition-colors"
                  aria-label="Increase quantity"
                >
                  <HiOutlinePlus className="w-5 h-5" />
                </button>
              </div>
              <Button
                onClick={handleAddToCart}
                size="lg"
                icon={HiOutlineShoppingBag}
                className="flex-1"
                disabled={stockStatus === 'out-of-stock'}
              >
                {stockStatus === 'out-of-stock'
                  ? 'Out of Stock'
                  : `Add to Cart - Rs. ${(product.price * quantity).toLocaleString()}`}
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-8 border-t border-border">
              <button
                onClick={handleWishlistToggle}
                className={`flex items-center gap-2 text-sm transition-colors ${
                  isInWishlist ? 'text-primary' : 'text-text-muted hover:text-primary'
                }`}
              >
                <HiOutlineHeart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                <span>{isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors"
              >
                <HiOutlineShare className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Seller Info */}
        {product.seller && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-white rounded-2xl border border-border/50 p-6 md:p-8"
          >
            <div className="flex items-center gap-4">
              <img
                src={product.seller.sellerProfile?.storeLogo?.url || product.seller.avatar?.url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                alt={product.seller.sellerProfile?.storeName || product.seller.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Sold by</p>
                <h3 className="font-heading text-xl font-semibold text-text">
                  {product.seller.sellerProfile?.storeName || product.seller.name}
                </h3>
                {product.seller.sellerProfile?.district && (
                  <p className="text-sm text-text-muted flex items-center gap-1 mt-1">
                    <HiOutlineMap className="w-3.5 h-3.5" />
                    {product.seller.sellerProfile.district}
                  </p>
                )}
              </div>
              <Link
                to={`/shop?seller=${product.seller._id}`}
                className="hidden sm:block"
              >
                <Button variant="outline" size="sm">
                  View Store
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Tabs: Description / Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="flex gap-1 border-b border-border mb-8">
            {['description', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'text-primary border-primary'
                    : 'text-text-muted border-transparent hover:text-text'
                }`}
              >
                {tab === 'reviews'
                  ? `Reviews (${product.reviews?.length || 0})`
                  : 'Description'}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div className="bg-white rounded-2xl border border-border/50 p-6 md:p-8">
              <p className="text-text-muted leading-relaxed whitespace-pre-line">
                {product.description || 'No description available for this product.'}
              </p>
              {product.dimensions && (product.dimensions.length || product.dimensions.weight) && (
                <div className="mt-8 pt-6 border-t border-border">
                  <h4 className="font-heading text-lg font-semibold text-text mb-4">Dimensions</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {product.dimensions.length && (
                      <div className="text-center p-3 bg-background rounded-xl">
                        <p className="text-xs text-text-muted mb-1">Length</p>
                        <p className="font-medium text-text">{product.dimensions.length} {product.dimensions.unit || 'cm'}</p>
                      </div>
                    )}
                    {product.dimensions.width && (
                      <div className="text-center p-3 bg-background rounded-xl">
                        <p className="text-xs text-text-muted mb-1">Width</p>
                        <p className="font-medium text-text">{product.dimensions.width} {product.dimensions.unit || 'cm'}</p>
                      </div>
                    )}
                    {product.dimensions.height && (
                      <div className="text-center p-3 bg-background rounded-xl">
                        <p className="text-xs text-text-muted mb-1">Height</p>
                        <p className="font-medium text-text">{product.dimensions.height} {product.dimensions.unit || 'cm'}</p>
                      </div>
                    )}
                    {product.dimensions.weight && (
                      <div className="text-center p-3 bg-background rounded-xl">
                        <p className="text-xs text-text-muted mb-1">Weight</p>
                        <p className="font-medium text-text">{product.dimensions.weight} g</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Review Form */}
              {user && (
                <div className="bg-white rounded-2xl border border-border/50 p-6 md:p-8">
                  <h3 className="font-heading text-xl font-semibold text-text mb-4">
                    Write a Review
                  </h3>
                  <form onSubmit={handleSubmitReview}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-text mb-2">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className="p-1"
                          >
                            <HiOutlineStar
                              className={`w-7 h-7 transition-colors ${
                                star <= reviewForm.rating
                                  ? 'text-secondary fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-text mb-2">Your Review</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                        placeholder="Share your experience with this product..."
                      />
                    </div>
                    <Button type="submit" loading={submittingReview} disabled={submittingReview}>
                      Submit Review
                    </Button>
                  </form>
                </div>
              )}

              {/* Reviews List */}
              {product.reviews?.length > 0 ? (
                <div className="grid gap-4">
                  {product.reviews.map((review, idx) => (
                    <ReviewCard key={review._id || idx} review={review} index={idx} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-border/50">
                  <HiOutlineEye className="w-12 h-12 text-text-muted mx-auto mb-3" />
                  <p className="text-text-muted">No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <h2 className="font-heading text-3xl font-semibold text-text mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((p, idx) => (
                <ProductCard key={p._id} product={p} index={idx} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
