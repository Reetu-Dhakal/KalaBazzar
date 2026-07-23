import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Card, CardContent } from '../components/ui/Card';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { Star, Minus, Plus, ShoppingCart, Shield, Truck, Heart, MessageSquare, User } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageLightbox from '../components/layout/ImageLightbox';
import ShareButton from '../components/layout/ShareButton';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import usePageTitle from '../hooks/usePageTitle';

function RelatedProducts({ categoryId, currentId }) {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    api.get(`/products/published?category=${categoryId}&limit=5`).then(({ data }) => {
      setProducts((data.data.products || []).filter((p) => p._id !== currentId).slice(0, 4));
    }).catch(() => {});
  }, [categoryId, currentId]);
  if (products.length === 0) return null;
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-heading font-bold mb-6">Related Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <Link key={p._id} to={`/product/${p.slug || p._id}`} className="group">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-50 mb-2">
              <img loading="lazy" src={p.images?.[0]?.url || '/placeholder.svg'} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <p className="font-heading font-medium text-sm line-clamp-1 group-hover:text-primary">{p.name}</p>
            <p className="text-sm font-bold text-primary">Rs. {p.price?.toLocaleString()}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StarRating({ rating, onSelect, readonly = false }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onSelect?.(star)} disabled={readonly} className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}>
          <Star size={18} className={star <= rating ? 'fill-secondary text-secondary' : 'text-gray-300'} />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ productId, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      await api.post('/reviews', { product: productId, rating, title, comment });
      toast.success('Review submitted!');
      setRating(0); setTitle(''); setComment('');
      onSubmitted();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Rating</label>
        <StarRating rating={rating} onSelect={setRating} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Title (optional)</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Summarize your review" maxLength={200} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Review *</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} required rows={3} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Share your experience with this product..." maxLength={2000} />
      </div>
      <Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Review'}</Button>
    </form>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  usePageTitle(product?.name, product?.description?.slice(0, 160));
  const { addItem: addToRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data.data);
        addToRecentlyViewed(data.data);
        api.post(`/products/${slug}/view`).catch(() => {});
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug, addToRecentlyViewed]);

  const fetchReviews = useCallback(async (page = 1) => {
    try {
      const { data } = await api.get(`/reviews/product/${slug}?page=${page}&limit=5`);
      setReviews((prev) => page === 1 ? data.data.reviews : [...prev, ...data.data.reviews]);
      setReviewCount(data.data.pagination?.total || 0);
      setReviewPage(page);
    } catch { /* ignore */ }
  }, [slug]);

  useEffect(() => { fetchReviews(1); }, [fetchReviews]);

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login to add items to cart'); return; }
    if (!product) return;
    try {
      await addItem(product._id, quantity);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!product) return <div className="text-center py-20 text-text-secondary">Product not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-sm mb-6 text-text-muted">
        <Link to="/" className="hover:text-primary">Home</Link> / <Link to="/shop" className="hover:text-primary">Shop</Link> / <span className="text-text">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16">
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-4 cursor-pointer" onClick={() => setLightboxOpen(true)}>
            <img src={product.images?.[activeImage]?.url || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImage(idx)} className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${idx === activeImage ? 'border-primary' : 'border-transparent'}`}>
                  <img loading="lazy" src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.seller?._id && (
            <Link to={`/artisan/${product.seller._id}`} className="text-sm text-text-muted uppercase tracking-wider mb-1 hover:text-primary inline-block">{product.seller?.name || 'Artisan'}</Link>
          )}
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">{product.name}</h1>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <Star size={16} className="fill-secondary text-secondary" />
              <span className="font-medium">{product.rating}</span>
            </div>
            <span className="text-text-muted">({reviewCount} reviews)</span>
            {product.numSold > 0 && <Badge variant="success">{product.numSold} sold</Badge>}
            {product.views > 0 && <span className="text-xs text-text-muted">{product.views} views</span>}
            {product.stock <= 5 && <Badge variant="warning">{product.stock === 0 ? 'Out of Stock' : `Only ${product.stock} left`}</Badge>}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-primary">Rs. {product.price?.toLocaleString()}</span>
            {product.comparePrice && <span className="text-lg text-text-muted line-through">Rs. {product.comparePrice?.toLocaleString()}</span>}
          </div>

          <p className="text-text-secondary leading-relaxed mb-6">{product.description}</p>

          {product.storyBehindProduct && (
            <div className="bg-secondary/5 rounded-lg p-4 mb-6">
              <p className="text-sm italic text-text-secondary">"{product.storyBehindProduct}"</p>
            </div>
          )}

          {product.materialsUsed?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2">Materials</h3>
              <div className="flex flex-wrap gap-2">{product.materialsUsed.map((m) => <Badge key={m} variant="outline">{m}</Badge>)}</div>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gray-50"><Minus size={18} /></button>
              <span className="px-4 font-medium min-w-[40px] text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-gray-50"><Plus size={18} /></button>
            </div>
            <Button size="lg" className="flex-1" onClick={handleAddToCart}><ShoppingCart size={18} className="mr-2" /> Add to Cart</Button>
            <button onClick={() => { if (!user) { navigate(`/login?redirect=/product/${slug}`); return; } toggleWishlist(product._id); }} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <Heart size={22} className={isInWishlist(product._id) ? 'fill-primary text-primary' : 'text-gray-500'} />
            </button>
            <ShareButton productName={product?.name} productId={product._id} />
          </div>

          <div className="space-y-2 text-sm text-text-secondary">
            <div className="flex items-center gap-2"><Truck size={16} /> Free shipping on orders over Rs. 2,000</div>
            <div className="flex items-center gap-2"><Shield size={16} /> Authentic product guaranteed</div>
          </div>
        </div>
      </div>

      {lightboxOpen && product.images?.length > 0 && (
        <ImageLightbox
          images={product.images}
          activeIndex={activeImage}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setActiveImage((p) => (p === 0 ? product.images.length - 1 : p - 1))}
          onNext={() => setActiveImage((p) => (p === product.images.length - 1 ? 0 : p + 1))}
        />
      )}

      <div className="border-t pt-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
              <MessageSquare size={22} /> Customer Reviews ({reviewCount})
            </h2>
          </div>
          <Button variant="secondary" onClick={() => { if (!user) { navigate(`/login?redirect=/product/${slug}`); return; } setShowReviewForm(!showReviewForm); }}>
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </Button>
        </div>

        {showReviewForm && user && (
          <Card className="mb-8 border-secondary">
            <CardContent className="p-6">
              <h3 className="font-heading font-semibold text-lg mb-4">Write Your Review</h3>
              <ReviewForm productId={product._id} onSubmitted={() => { setShowReviewForm(false); fetchReviews(1); }} />
            </CardContent>
          </Card>
        )}

        {product.category && (
          <RelatedProducts categoryId={product.category} currentId={product._id} />
        )}

        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-text-secondary">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="border-b pb-6 last:border-0">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {review.user?.avatar?.url ? (
                      <img loading="lazy" src={review.user.avatar.url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User size={20} className="text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium">{review.user?.name || 'Anonymous'}</span>
                      <StarRating rating={review.rating} readonly />
                      <span className="text-xs text-text-muted">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    {review.title && <p className="font-semibold text-sm mb-1">{review.title}</p>}
                    <p className="text-text-secondary text-sm leading-relaxed">{review.comment}</p>
                    <button
                      onClick={async () => {
                        try {
                          const { data } = await api.post(`/reviews/${review._id}/helpful`);
                          setReviews((prev) => prev.map((r) => r._id === review._id ? { ...r, helpfulCount: data.data.helpfulCount } : r));
                        } catch { toast.error('Failed'); }
                      }}
                      className={`mt-2 text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${review.helpfulBy?.includes(user?._id) ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-gray-100'}`}
                    >
                      👍 Helpful ({review.helpfulCount || 0})
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
