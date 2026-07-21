import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CategoryCard = ({ category, index = 0, imageMap = {} }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const imageUrl = imageMap[category.slug] || 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
    >
      <Link 
        to={`/shop?category=${category.slug}`}
        className="group block relative aspect-3/4 rounded-2xl overflow-hidden bg-background"
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-linear-to-br from-gray-100 to-gray-200 animate-pulse" />
        )}
        <img
          src={imageUrl}
          alt={category.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          } group-hover:scale-105`}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/20 to-transparent" />
        
        {/* Content */}
        <div className="absolute inset-0 p-5 flex flex-col justify-between">
          <div>
            <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-white text-xs font-medium border border-white/20">
              {category.productCount || 0} items
            </span>
          </div>
          <div>
            <h3 className="text-white font-heading text-xl font-semibold mb-1">
              {category.name}
            </h3>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;