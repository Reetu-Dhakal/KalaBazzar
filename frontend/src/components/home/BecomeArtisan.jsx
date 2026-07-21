import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowRight } from 'react-icons/hi';

const BecomeArtisan = () => {
  return (
    <section className="relative py-28 md:py-36 bg-[#F5EFE5] overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236E1E1E' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-4xl mx-auto px-6 md:px-8 lg:px-12 text-center relative z-10"
      >
        <span className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-full mb-6">
          Join Our Community
        </span>
        <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl font-semibold text-text leading-tight mb-6">
          Share Your Craft with{' '}
          <span className="text-primary">the World</span>
        </h2>
        <p className="text-lg md:text-xl text-text-muted leading-relaxed max-w-2xl mx-auto mb-10">
          Join hundreds of Nepali artisans already selling on Kala Bazaar. Set up your store for free
          and reach customers who value authentic craftsmanship.
        </p>
        <Link
          to="/become-seller"
          className="inline-flex items-center gap-2.5 px-10 py-5 bg-primary text-white font-medium rounded-full hover:bg-primary-light transition-all duration-300 shadow-lg hover:shadow-xl text-lg group"
        >
          Apply Now
          <HiOutlineArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </Link>
        <p className="text-sm text-text-muted mt-4">
          No commission for the first 3 months. Zero setup fees.
        </p>
      </motion.div>
    </section>
  );
};

export default BecomeArtisan;
