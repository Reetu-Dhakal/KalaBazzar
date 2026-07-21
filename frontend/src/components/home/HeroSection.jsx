import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiOutlineArrowRight } from 'react-icons/hi';

const floatingShapes = [
  { size: 'w-20 h-20', top: '12%', left: '5%', delay: 0 },
  { size: 'w-12 h-12', top: '22%', right: '10%', delay: 0.4 },
  { size: 'w-28 h-28', bottom: '15%', left: '10%', delay: 0.8 },
  { size: 'w-14 h-14', bottom: '28%', right: '8%', delay: 1.2 },
  { size: 'w-8 h-8', top: '45%', left: '3%', delay: 1.6 },
  { size: 'w-10 h-10', top: '8%', right: '24%', delay: 2.0 },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1920&q=90"
          alt="Nepali handicrafts display"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/30" />
      </div>

      {/* Floating decorative circles */}
      {floatingShapes.map((shape, i) => (
        <motion.div
          key={i}
          className={`absolute ${shape.size} border border-white/10 rounded-full pointer-events-none`}
          style={{
            top: shape.top,
            left: shape.left,
            right: shape.right,
            bottom: shape.bottom,
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -6, 0],
          }}
          transition={{
            duration: 1.5,
            delay: shape.delay,
            ease: 'easeOut',
            y: {
              duration: 4 + i,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        >
          <div className="absolute inset-2 rounded-full border border-white/5" />
        </motion.div>
      ))}

      {/* Diamond decorative elements */}
      <motion.div
        className="absolute top-[30%] left-[15%] w-6 h-6 border border-white/10 rotate-45 pointer-events-none"
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 1, rotate: 45, y: [0, -4, 0] }}
        transition={{
          delay: 2.2,
          duration: 1,
          y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
      <motion.div
        className="absolute bottom-[35%] right-[15%] w-4 h-4 border border-white/10 rotate-45 pointer-events-none"
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 1, rotate: 45, y: [0, -4, 0] }}
        transition={{
          delay: 2.6,
          duration: 1,
          y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 lg:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold text-white leading-tight mb-6"
          >
            <span className="block">Discover Nepal's Finest</span>
            <span className="block text-secondary mt-2">Handcrafted Treasures</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="text-base sm:text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Authentic handmade creations from skilled Nepali artisans — each piece tells a story of centuries-old tradition and culture.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link
              to="/shop"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-primary text-white font-medium rounded-full hover:bg-primary-light transition-all duration-300 shadow-lg hover:shadow-xl group text-sm sm:text-base"
            >
              Explore Marketplace
              <HiOutlineArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-transparent text-white font-medium rounded-full border-2 border-white hover:bg-white/10 transition-all duration-300 text-sm sm:text-base"
            >
              Meet the Artisans
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
