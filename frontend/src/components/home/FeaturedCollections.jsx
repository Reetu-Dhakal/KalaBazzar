import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiOutlineArrowRight } from 'react-icons/hi';
import { Container, SectionTitle } from '../../components/ui';

const collections = [
  {
    slug: 'festive',
    name: 'Festive Collection',
    itemCount: 24,
    image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1200',
  },
  {
    slug: 'home-living',
    name: 'Home & Living',
    itemCount: 18,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200',
  },
  {
    slug: 'artisans-choice',
    name: "Artisan's Choice",
    itemCount: 32,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200',
  },
  {
    slug: 'gift-sets',
    name: 'Gift Sets',
    itemCount: 15,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200',
  },
];

const FeaturedCollections = () => {
  return (
    <section className="py-16 md:py-28 bg-white">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="flex items-end justify-between mb-12"
        >
          <SectionTitle
            subtitle="Collections"
            title="Featured Collections"
            description="Curated selections of Nepal's finest handmade creations"
            align="left"
          />
          <Link
            to="/shop"
            className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all group shrink-0"
          >
            View All
            <HiOutlineArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </Container>

      {/* Horizontal scroll container */}
      <div
        className="overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0"
      >
        <div className="flex gap-6 px-6 md:px-8 lg:px-12 min-w-max pb-2">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              className="snap-start shrink-0"
            >
              <Link
                to={`/shop?collection=${collection.slug}`}
                className="group block relative w-[85vw] md:w-[500px] lg:w-[580px] aspect-[4/3] rounded-2xl overflow-hidden"
              >
                <img
                  src={collection.image}
                  alt={collection.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                  <h3 className="font-heading text-2xl md:text-3xl font-semibold mb-2">
                    {collection.name}
                  </h3>
                  <p className="text-sm text-white/80">
                    {collection.itemCount} handcrafted items
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
