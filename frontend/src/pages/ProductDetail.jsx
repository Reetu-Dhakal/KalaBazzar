import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineHeart, HiOutlineShoppingBag, HiOutlineStar, HiOutlineMinus, HiOutlinePlus, HiOutlineShare, HiOutlineLocationMarker, HiOutlineTruck, HiOutlineArrowLeft } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
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

  if (loading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container-custom py-8">
          <div className="flex items-center gap-2 text-sm text-text-muted mb-8">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-primary">Shop</Link>
            <span>/</span>
            <span className="text-text">Loading...</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container-custom py-8">
          <div className="text-center py-20">
            <p className="text-text-muted mb-4">Product not found</p>
            <Link to="/shop" className="text-primary hover:underline">
              Back to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url || 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=400',
      price: product.price,
      quantity,
      seller: product.seller?._id || 'seller1',
      slug: product.slug,
    });
  };

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div className="min-h-screen pt-20">
      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-text-muted mb-8">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-primary">Shop</Link>
          <span>/</span>
          <Link to={`/shop?category=${product.category?.slug || ''}`} className="hover:text-primary">{product.category?.name}</Link>
          <span>/</span>
          <span className="text-text">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white mb-4">
              <img
                src={product.images?.[selectedImage]?.url || product.images?.[0]?.url || 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-error text-white text-xs rounded-full font-medium">
                  -{discount}%
                </span>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="sticky top-24">
              <div className="mb-6">
                <p className="text-sm text-text-muted mb-2">{product.category?.name}</p>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-text">
                  {product.name}
                </h1>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-heading font-bold text-primary">
                  Rs. {product.price?.toLocaleString()}
                </span>
                {product.comparePrice > 0 && (
                  <>
                    <span className="text-lg text-text-muted line-through">
                      Rs. {product.comparePrice?.toLocaleString()}
                    </span>
                    <span className="px-2 py-0.5 bg-error/10 text-error text-xs rounded-full">
                      Save Rs. {(product.comparePrice - product.price)?.toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <HiOutlineStar
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'text-secondary fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-text-muted">
                  {(product.rating || 0).toFixed(1)} ({product.numReviews || 0} reviews)
                </span>
              </div>

              {/* Description */}
              <p className="text-text-muted leading-relaxed mb-6">{product.description || product.shortDescription || 'No description available.'}</p>

              {/* Details */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-sm">
                  <HiOutlineLocationMarker className="w-4 h-4 text-primary" />
                  <span className="text-text-muted">Made in:</span>
                  <span className="font-medium">{product.district || 'Nepal'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <HiOutlineTruck className="w-4 h-4 text-primary" />
                  <span className="text-text-muted">Delivery:</span>
                  <span className="font-medium">{product.deliveryEstimate || '5-7 business days'}</span>
                </div>
                {product.materials && product.materials.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-sm text-text-muted">Materials:</span>
                    <span className="font-medium">{product.materials.join(', ')}</span>
                  </div>
                )}
                {product.dimensions?.height && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-text-muted">Dimensions:</span>
                    <span className="font-medium">
                      {product.dimensions.height} x {product.dimensions.width} {product.dimensions.unit}
                    </span>
                  </div>
                )}
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-border rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-background transition-colors"
                  >
                    <HiOutlineMinus className="w-4 h-4" />
                  </button>
                  <span className="px-6 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                    className="p-3 hover:bg-background transition-colors"
                  >
                    <HiOutlinePlus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-text-muted">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
                >
                  <HiOutlineShoppingBag className="w-5 h-5" />
                  Add to Cart
                </button>
                <button className="p-3.5 border border-border rounded-xl hover:bg-background transition-colors">
                  <HiOutlineHeart className="w-5 h-5" />
                </button>
                <button className="p-3.5 border border-border rounded-xl hover:bg-background transition-colors">
                  <HiOutlineShare className="w-5 h-5" />
                </button>
              </div>

              {/* Seller Info */}
              {product.seller && (
                <div className="mt-8 p-6 bg-background rounded-xl">
                  <p className="text-sm text-text-muted mb-1">Sold by</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{product.seller.sellerProfile?.storeName || product.seller.name}</p>
                      <p className="text-sm text-text-muted">{product.seller.sellerProfile?.district || 'Nepal'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-heading font-bold mb-6">Customer Reviews</h2>
            <div className="space-y-4">
              {product.reviews.map((review, i) => (
                <div key={i} className="bg-white rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, j) => (
                        <HiOutlineStar
                          key={j}
                          className={`w-4 h-4 ${j < review.rating ? 'text-secondary fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{review.name}</span>
                    <span className="text-xs text-text-muted">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-text-muted text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;