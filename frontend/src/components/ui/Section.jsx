import React from 'react';
import { motion } from 'framer-motion';

export const Section = ({ children, className = '', variant = 'default', id }) => {
  const bgClass = variant === 'secondary' ? 'bg-[#F5EFE5]' : 'bg-background';

  return (
    <section id={id} className={`${bgClass} ${className || 'py-16 md:py-28'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </section>
  );
};
