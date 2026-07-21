import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowRight } from 'react-icons/hi';
import { Section, Container, SectionTitle, Badge, Card, staggerContainer, fadeInUp } from '../ui';

const products = [
  {
    _id: 'na1',
    slug: 'handwoven-dhaka-scarf',
    name: 'Handwoven Dhaka Scarf',
    price: 1299,
    images: [{ url: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600' }],
    artisan: 'Maya Thapa',
    district: 'Palpa'
  },
  {
    _id: 'na2',
    slug: 'brass-singing-bowl-set',
    name: 'Brass Singing Bowl Set',
    price: 2499,
    images: [{ url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600' }],
    artisan: 'Kaji Tamang',
    district: 'Kathmandu'
  },
  {
    _id: 'na3',
    slug: 'thangka-wall-hanging',
    name: 'Thangka Wall Hanging',
    price: 3999,
    images: [{ url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600' }],
    artisan: 'Pemba Sherpa',
    district: 'Mustang'
  },
  {
    _id: 'na4',
    slug: 'wooden-khukuri-letter-opener',
    name: 'Wooden Khukuri Letter Opener',
    price: 899,
    images: [{ url: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600' }],
    artisan: 'Raju Shrestha',
    district: 'Lalitpur'
  },
  {
    _id: 'na5',
    slug: 'felted-wool-slippers',
    name: 'Felted Wool Slippers',
    price: 1599,
    images: [{ url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600' }],
    artisan: 'Dawa Lama',
    district: 'Solukhumbu'
  },
  {
    _id: 'na6',
    slug: 'handpainted-ceramic-mug-set',
    name: 'Handpainted Ceramic Mug Set',
    price: 1699,
    images: [{ url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600' }],
    artisan: 'Sunita Devi',
    district: 'Bhaktapur'
  }
];

const NewArrivals = () => {
  const scrollRef = useRef(null);

  return (
    <Section className="py-24 md:py-32">
      <Container>
        <div className="flex items-end justify-between mb-12">
          <SectionTitle
            subtitle="Just Landed"
            title="New Arrivals"
            description="Fresh from the hands of our artisans — discover the latest additions to our collection."
            align="left"
            className="mb-0"
          />
          <Link
            to="/shop?sort=newest"
            className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all group flex-shrink-0"
          >
            View All
            <HiOutlineArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div
          ref={scrollRef}
          className="overflow-x-auto pb-4 -mx-6 md:-mx-8 lg:-mx-12 px-6 md:px-8 lg:px-12 scrollbar-thin scroll-smooth"
          style={{ scrollbarWidth: 'thin' }}
        >
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: '-80px' }}
            className="flex gap-6"
            style={{ minWidth: 'max-content' }}
          >
            {products.map((product) => (
              <motion.div key={product._id} variants={fadeInUp} className="w-[300px] md:w-[360px] flex-shrink-0">
                <Link to={`/product/${product.slug}`} className="group block">
                  <Card className="overflow-hidden">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary">New</Badge>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                        {product.district}
                      </p>
                      <h3 className="font-medium text-base text-text group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {product.name}
                      </h3>
                      <p className="text-xs text-text-muted mb-3">
                        by {product.artisan}
                      </p>
                      <p className="text-lg font-heading font-semibold text-primary">
                        Rs. {product.price.toLocaleString()}
                      </p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="text-center mt-10 md:hidden">
          <Link
            to="/shop?sort=newest"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full text-sm font-medium"
          >
            View All New Arrivals
            <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Container>
    </Section>
  );
};

export default NewArrivals;
