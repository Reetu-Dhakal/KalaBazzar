import React from 'react';
import { motion } from 'framer-motion';
import { Section, Container, SectionTitle, staggerContainer, fadeInUp } from '../ui';
import RegionCard from './RegionCard';

const regions = [
  {
    name: 'Bhaktapur',
    slug: 'bhaktapur',
    imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
    productCount: 350,
    description: 'Home of exquisite pottery and traditional Newari woodcraft, passed down through generations.'
  },
  {
    name: 'Patan',
    slug: 'patan',
    imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800',
    productCount: 420,
    description: 'Renowned for intricate metal crafts, bronze statues, and masterful wood carving.'
  },
  {
    name: 'Pokhara',
    slug: 'pokhara',
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
    productCount: 310,
    description: 'Himalayan hub for silver jewelry, fine pashmina, and Tibetan-inspired crafts.'
  },
  {
    name: 'Janakpur',
    slug: 'janakpur',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
    productCount: 280,
    description: 'Birthplace of vibrant Mithila paintings, Tikuli art, and handwoven Maithili textiles.'
  }
];

const ExploreRegions = () => {
  return (
    <Section className="py-24 md:py-32 bg-white">
      <Container>
        <SectionTitle
          subtitle="Discover"
          title="Explore by Region"
          description="Every region of Nepal has its own unique craft traditions. Explore products from different parts of the country."
          className="mb-16"
        />
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {regions.map((region, index) => (
            <motion.div
              key={region.slug}
              variants={fadeInUp}
              className={index === 0 ? 'lg:col-span-2' : ''}
            >
              <RegionCard region={region} index={index} />
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
};

export default ExploreRegions;
