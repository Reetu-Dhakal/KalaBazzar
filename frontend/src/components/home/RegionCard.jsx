import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const RegionCard = ({ region, index = 0 }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageUrl = region.imageUrl || 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
    >
      <Link
        to={`/shop?region=${region.slug}`}
        className="group block relative aspect-5/4 rounded-2xl overflow-hidden bg-background"
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-linear-to-br from-gray-100 to-gray-200 animate-pulse" />
        )}
        <img
          src={imageUrl}
          alt={region.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          } group-hover:scale-105`}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 group-hover:via-black/30 group-hover:to-transparent transition-all duration-500" />

        {/* Content */}
        <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
          <span className="inline-block w-fit px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-white text-xs font-medium border border-white/20 mb-3">
            {region.productCount || 0} products
          </span>
          <h3 className="text-white font-heading text-2xl md:text-3xl font-semibold mb-2">
            {region.name}
          </h3>
          {region.description && (
            <p className="text-white/80 text-sm leading-relaxed line-clamp-2 max-w-md">
              {region.description}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default RegionCard;
