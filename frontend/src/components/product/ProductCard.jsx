import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineHeart, HiOutlineShoppingBag, HiOutlineEye } from 'react-icons/hi';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product, index = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url,
      quantity: 1,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <Link to={`/product/${product.slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-4/5 rounded-2xl overflow-hidden bg-background mb-4">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-linear-to-br from-gray-100 to-gray-200 animate-pulse" />
          )}
          <img
            src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600'}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            } ${isHovered ? 'scale-105' : ''}`}
          />
          
          {/* Overlay Actions */}
          <motion.div
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
          >
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 shadow-sm"
                aria-label="Add to wishlist"
              >
                <HiOutlineHeart className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 shadow-sm"
                aria-label="Quick view"
              >
                <HiOutlineEye className="w-4 h-4" />
              </button>
            </div>
            
            {/* Add to Cart Button */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: isHovered ? 0 : 10, opacity: isHovered ? 1 : 0 }}
              className="absolute bottom-3 left-3 right-3"
            >
              <button
                onClick={handleAddToCart}
                className="w-full px-4 py-3 bg-white text-text rounded-xl hover:bg-primary hover:text-white transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <HiOutlineShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>
            </motion.div>
          </motion.div>

          {/* Badges */}
          {product.comparePrice && product.comparePrice > product.price && (
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-full">
                {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          {product.category && (
            <p className="text-xs text-text-muted uppercase tracking-wider">
              {product.category.name}
            </p>
          )}
          <h3 className="font-medium text-base text-text group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
          
          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'text-secondary fill-current' : 'text-gray-300'}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.529c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-text-muted ml-1">
                ({product.numReviews || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 pt-2">
            <span className="text-lg font-heading font-semibold text-primary">
              Rs. {product.price?.toLocaleString()}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-text-muted line-through">
                Rs. {product.comparePrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Location */}
          {product.district && (
            <p className="text-xs text-text-muted flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {product.district}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;