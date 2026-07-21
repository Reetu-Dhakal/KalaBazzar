import React from 'react';
import { motion } from 'framer-motion';

// Animation variants for premium feel
export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: 'easeOut' }
};

export const staggerContainer = {
  initial: {},
  whileInView: {},
  viewport: { once: true, margin: '-80px' },
  transition: { staggerChildren: 0.08, delayChildren: 0.1 }
};

export const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { duration: 0.8 }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: 'easeOut' }
};

// Button Component
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  href, 
  onClick, 
  className = '', 
  icon: Icon,
  loading = false,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-light focus:ring-primary shadow-sm hover:shadow-md',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary shadow-sm hover:shadow-md',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
    ghost: 'text-text hover:text-primary hover:bg-primary/5',
    minimal: 'text-text hover:text-primary underline underline-offset-4 decoration-1 hover:decoration-2'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl'
  };
  
  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;
  
  const content = (
    <>
      {loading ? (
        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        Icon && <Icon className="w-5 h-5" />
      )}
      {children}
    </>
  );
  
  if (href) {
    return (
      <a href={href} className={combinedClassName} {...props}>
        {content}
      </a>
    );
  }
  
  return (
    <button onClick={onClick} className={combinedClassName} disabled={loading} {...props}>
      {content}
    </button>
  );
};

// Section Title Component
export const SectionTitle = ({ 
  subtitle, 
  title, 
  description, 
  align = 'center',
  className = '' 
}) => {
  const alignment = {
    center: 'text-center',
    left: 'text-left'
  };
  
  return (
    <motion.div 
      {...fadeInUp} 
      className={`max-w-3xl ${alignment[align]} ${className}`}
    >
      {subtitle && (
        <span className="inline-block px-4 py-1.5 bg-primary/5 text-primary text-sm font-medium rounded-full mb-4">
          {subtitle}
        </span>
      )}
      {title && (
        <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold text-text leading-tight mb-4">
          {title}
        </h2>
      )}
      {description && (
        <p className="text-text-muted text-base md:text-lg leading-relaxed">
          {description}
        </p>
      )}
    </motion.div>
  );
};

// Container Component
export const Container = ({ children, className = '', size = 'default' }) => {
  const sizes = {
    default: 'max-w-7xl',
    narrow: 'max-w-4xl',
    wide: 'max-w-7xl',
    full: 'max-w-full'
  };
  
  return (
    <div className={`${sizes[size]} mx-auto px-6 md:px-8 lg:px-12 ${className}`}>
      {children}
    </div>
  );
};

// Premium Card Component
export const Card = ({ children, className = '', hover = true }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
      className={`bg-white rounded-2xl border border-border/50 ${hover ? 'hover:shadow-xl hover:border-border transition-all duration-300' : 'shadow-sm'} ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Image Component with lazy loading
export const PremiumImage = ({ src, alt, className = '', aspectRatio = 'aspect-square' }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  
  return (
    <div className={`relative overflow-hidden bg-gray-100 ${aspectRatio}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-linear-to-br from-gray-100 to-gray-200 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-700 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'} ${className}`}
      />
    </div>
  );
};

// Divider Component
export const Divider = ({ className = '' }) => (
  <div className={`w-full h-px bg-linear-to-r from-transparent via-border to-transparent ${className}`} />
);

// Badge Component
export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    outline: 'border border-border text-text-muted'
  };
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export { default as RegionCard } from '../home/RegionCard';
export { default as ReviewCard } from '../product/ReviewCard';
export { Section } from './Section';
export { Input } from './Input';
export { Textarea } from './Textarea';
export { Select } from './Select';
export { StatCard } from './StatCard';
export { default as Modal } from './Modal';
export { default as Drawer } from './Drawer';
export { default as Pagination } from './Pagination';
export { default as LoadingSkeleton } from './LoadingSkeleton';
export { default as EmptyState } from './EmptyState';