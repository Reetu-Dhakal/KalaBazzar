import React from 'react';
import { motion } from 'framer-motion';

const ReviewCard = ({ review, index = 0 }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const avatarUrl = review.user?.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f15?w=100';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="bg-white rounded-2xl border border-border/50 shadow-sm p-5"
    >
      {/* User Info Row */}
      <div className="flex items-center gap-3 mb-3">
        <img
          src={avatarUrl}
          alt={review.user?.name || 'User'}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text truncate">
            {review.user?.name || 'Anonymous'}
          </p>
        </div>
        <span className="text-xs text-text-muted whitespace-nowrap">
          {formatDate(review.createdAt)}
        </span>
      </div>

      {/* Star Rating */}
      <div className="flex items-center gap-0.5 mb-3">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < review.rating ? 'text-secondary fill-current' : 'text-gray-300'}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.529c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-sm text-text leading-relaxed mb-3">
          {review.comment}
        </p>
      )}

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {review.images.map((img, i) => (
            <img
              key={i}
              src={typeof img === 'string' ? img : img.url}
              alt="Review photo"
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ReviewCard;
