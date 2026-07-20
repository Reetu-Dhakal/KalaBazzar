import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineHeart, HiOutlineShoppingBag, HiOutlineStar, HiOutlineMinus, HiOutlinePlus, HiOutlineShare, HiOutlineLocationMarker, HiOutlineTruck } from 'react-icons/hi';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Mock product data
  const product = {
    _id: '1',
    name: 'Handcrafted Ceramic Vase',
    slug: 'handcrafted-ceramic-vase',
    price: 1500,
    comparePrice: 2000,
    description: 'This beautiful handcrafted ceramic vase is made by skilled artisans in Bhaktapur using traditional techniques passed down through generations. Each piece is unique and tells a story of Nepal\'s rich pottery heritage. The natural clay finish and elegant design make it perfect for both traditional and modern home decor.',
    shortDescription: 'Handcrafted ceramic vase made with traditional techniques',
    images: [
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600',
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600',
    ],
    category: { name: 'Pottery & Ceramics', slug: 'pottery-ceramics' },
    seller: {
      name: 'Sita Devi',
      sellerProfile: {
        storeName: 'Sita\'s Pottery Studio',
        district: 'Bhaktapur',
        rating: 4.9,
      },
    },
    district: 'Bhaktapur',
    materials: ['Natural Clay', 'Ceramic Glaze'],
    dimensions: { height: 25, width: 15, unit: 'cm' },
    deliveryEstimate: '5-7 business days',
    stock: 10,
    rating: 4.8,
    numReviews: 24,
    reviews: [
      { name: 'Ram Thapa', rating: 5, comment: 'Absolutely beautiful vase! The craftsmanship is incredible.', createdAt: '2024-01-15' },
      { name: 'Sita Sharma', rating: 5, comment: 'Perfect addition to my home. Love the natural finish.', createdAt: '2024-01-10' },
    ],
  };

  const handleAddToCart = () => {
    addItem({
      product: product._id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      quantity,
      seller: product.seller._id || 'seller1',
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
          <Link to={`/shop?category=${product.category.slug}`} className="hover:text-primary">{product.category.name}</Link>
          <span>/</span>
          <span className="text-text">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white mb-4">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-error text-white text-xs rounded-full font-medium">
                  -{discount}%
                </span>
              )}
            </div>
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                    selectedImage === i ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="sticky top-24">
              <div className="mb-6">
                <p className="text-sm text-text-muted mb-2">{product.category.name}</p>
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
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-secondary fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-text-muted">
                  {product.rating} ({product.numReviews} reviews)
                </span>
              </div>

              {/* Description */}
              <p className="text-text-muted leading-relaxed mb-6">{product.description}</p>

              {/* Details */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-sm">
                  <HiOutlineLocationMarker className="w-4 h-4 text-primary" />
                  <span className="text-text-muted">Made in:</span>
                  <span className="font-medium">{product.district}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <HiOutlineTruck className="w-4 h-4 text-primary" />
                  <span className="text-text-muted">Delivery:</span>
                  <span className="font-medium">{product.deliveryEstimate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-sm">Materials:</span>
                  <span className="font-medium">{product.materials?.join(', ')}</span>
                </div>
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
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
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
              <div className="mt-8 p-6 bg-background rounded-xl">
                <p className="text-sm text-text-muted mb-1">Sold by</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{product.seller.sellerProfile?.storeName || product.seller.name}</p>
                    <p className="text-sm text-text-muted">{product.seller.sellerProfile?.district}</p>
                  </div>
                  <Link
                    to={`/seller/${product.seller._id}`}
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    View Store
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
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
      </div>
    </div>
  );
};

export default ProductDetail;