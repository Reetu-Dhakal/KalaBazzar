import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineHeart, HiOutlineShoppingBag, HiOutlineStar, HiOutlineMinus, HiOutlinePlus, HiOutlineShare2, HiOutlineMapPin, HiOutlineTruck, HiOutlineArrowLeft } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui';
import API from '../utils/axios';

const ProductDetail = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${slug}`);
        setProduct(data.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const handleAddToCart = () => {
    addItem({
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url,
      price: product.price,
      quantity,
      seller: product.seller?._id || 'seller1',
      slug: product.slug,
    });
  };

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

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
            {product.rating && (
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
            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-4xl font-heading font-semibold text-primary">
                Rs. {product.price?.toLocaleString()}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-xl text-text-muted line-through">
                  Rs. {product.comparePrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-text-muted leading-relaxed mb-8">
              {product.description || 'Handcrafted with love and care by skilled Nepali artisans. Each piece is unique and carries the essence of traditional Nepali craftsmanship.'}
            </p>

            {/* Meta Info */}
            <div className="space-y-3 mb-8">
              {product.district && (
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <HiOutlineMapPin className="w-4 h-4 text-primary" />
                  <span>From {product.district}, Nepal</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <HiOutlineTruck className="w-4 h-4 text-primary" />
                <span>Free delivery across Nepal</span>
              </div>
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
              >
                Add to Cart - Rs. {(product.price * quantity).toLocaleString()}
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-8 border-t border-border">
              <button className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors">
                <HiOutlineHeart className="w-5 h-5" />
                <span>Add to Wishlist</span>
              </button>
              <button className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors">
                <HiOutlineShare2 className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;