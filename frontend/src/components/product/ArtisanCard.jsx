import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowRight, HiOutlineMapPin, HiOutlineStar } from 'react-icons/hi';

const ArtisanCard = ({ artisan, index = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <Link to={`/shop?seller=${artisan._id}`} className="block">
        <div className="relative bg-white rounded-2xl overflow-hidden border border-border/50 hover:shadow-xl hover:border-border transition-all duration-500">
          {/* Image */}
          <div className="relative aspect-4/3 overflow-hidden bg-background">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-linear-to-br from-gray-100 to-gray-200 animate-pulse" />
            )}
            <img
              src={artisan.avatar?.url || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f15?w=800'}
              alt={artisan.name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-700 ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              } ${isHovered ? 'scale-105' : ''}`}
            />
            
            {/* Subtle Overlay */}
            {isHovered && (
              <div className="absolute inset-0 bg-black/10 transition-opacity duration-300" />
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Header */}
            <div className="mb-4">
              <h3 className="text-xl font-heading font-semibold text-text mb-1 group-hover:text-primary transition-colors">
                {artisan.name}
              </h3>
              <p className="text-sm text-primary font-medium">
                {artisan.sellerProfile?.specialization?.join(', ') || 'Artisan'}
              </p>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted mb-4">
              {artisan.sellerProfile?.district && (
                <span className="flex items-center gap-1">
                  <HiOutlineMapPin className="w-3.5 h-3.5" />
                  {artisan.sellerProfile.district}
                </span>
              )}
              {artisan.sellerProfile?.yearsOfExperience > 0 && (
                <span className="flex items-center gap-1">
                  <HiOutlineStar className="w-3.5 h-3.5 text-secondary fill-current" />
                  {artisan.sellerProfile.yearsOfExperience} years
                </span>
              )}
            </div>

            {/* Story */}
            <p className="text-sm text-text-muted leading-relaxed mb-5 line-clamp-3">
              {artisan.sellerProfile?.story || 'Passionate about preserving traditional Nepali craftsmanship through beautiful handmade products.'}
            </p>

            {/* CTA */}
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
              <span>Visit Store</span>
              <HiOutlineArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ArtisanCard;