import React from 'react';
import { motion } from 'framer-motion';
import { Section, Container, SectionTitle } from '../../components/ui';
import CategoryCard from './CategoryCard';

const categories = [
  { slug: 'pottery-ceramics', name: 'Pottery', productCount: 48 },
  { slug: 'wood-carving', name: 'Wood Carving', productCount: 36 },
  { slug: 'dhaka-fabric', name: 'Dhaka Fabric', productCount: 52 },
  { slug: 'pashmina', name: 'Pashmina', productCount: 28 },
  { slug: 'mithila-art', name: 'Mithila Art', productCount: 41 },
  { slug: 'thanka-painting', name: 'Thanka Painting', productCount: 33 },
];

const imageMap = {
  'pottery-ceramics': 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
  'wood-carving': 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800',
  'dhaka-fabric': 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800',
  'pashmina': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
  'mithila-art': 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
  'thanka-painting': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
};

const FeaturedCategories = () => {
  return (
    <Section>
      <Container>
        <SectionTitle
          subtitle="Categories"
          title="Handcrafted Categories"
          description="From intricate wood carvings to vibrant textiles, each category showcases Nepal's rich artisanal heritage"
        />

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
          transition={{ staggerChildren: 0.06, delayChildren: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-12 gap-4 mt-14"
        >
          {categories.map((cat, index) => (
            <motion.div
              key={cat.slug}
              variants={{
                initial: { opacity: 0, y: 30 },
                animate: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={
                index === 0 ? 'md:col-span-6' :
                index === 4 ? 'md:col-span-6' :
                'md:col-span-3'
              }
            >
              <CategoryCard category={cat} index={index} imageMap={imageMap} />
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
};

export default FeaturedCategories;
