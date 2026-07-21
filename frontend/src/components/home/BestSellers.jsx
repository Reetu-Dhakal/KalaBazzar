import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowRight } from 'react-icons/hi';
import { Section, Container, SectionTitle, Badge, Card, staggerContainer, fadeInUp } from '../ui';

const products = [
  {
    _id: 'bs1',
    slug: 'mithila-painting-set',
    name: 'Mithila Painting Set',
    price: 2999,
    comparePrice: 3999,
    rating: 4.8,
    numReviews: 124,
    images: [{ url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200' }]
  },
  {
    _id: 'bs2',
    slug: 'pashmina-shawl',
    name: 'Pure Pashmina Shawl',
    price: 5499,
    comparePrice: 6999,
    rating: 4.9,
    numReviews: 89,
    images: [{ url: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=200' }]
  },
  {
    _id: 'bs3',
    slug: 'brass-buddha-statue',
    name: 'Brass Buddha Statue',
    price: 4499,
    comparePrice: 5999,
    rating: 4.7,
    numReviews: 67,
    images: [{ url: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=200' }]
  },
  {
    _id: 'bs4',
    slug: 'handknotted-wool-rug',
    name: 'Handknotted Wool Rug',
    price: 8999,
    comparePrice: 11999,
    rating: 4.9,
    numReviews: 43,
    images: [{ url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200' }]
  },
  {
    _id: 'bs5',
    slug: 'silver-earring-set',
    name: 'Silver Filigree Earring Set',
    price: 1899,
    comparePrice: 2499,
    rating: 4.6,
    numReviews: 156,
    images: [{ url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200' }]
  },
  {
    _id: 'bs6',
    slug: 'ceramic-dinner-set',
    name: 'Handthrown Ceramic Dinner Set',
    price: 6999,
    comparePrice: 8999,
    rating: 4.8,
    numReviews: 78,
    images: [{ url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200' }]
  }
];

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-secondary fill-current' : 'text-gray-300'}`}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.529c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
    <span className="text-xs text-text-muted ml-1">({rating})</span>
  </div>
);

const BestSellers = () => {
  return (
    <Section className="py-24 md:py-32">
      <Container>
        <div className="flex items-end justify-between mb-12">
          <SectionTitle
            subtitle="Most Popular"
            title="Best Sellers"
            description="Our community's most-loved pieces — crafted with care, chosen by thousands."
            align="left"
            className="mb-0"
          />
          <Link
            to="/shop?sort=popular"
            className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all group flex-shrink-0"
          >
            View All
            <HiOutlineArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {products.map((product, index) => (
            <motion.div key={product._id} variants={fadeInUp}>
              <Link to={`/product/${product.slug}`} className="block group">
                <Card className="flex items-center gap-4 p-4">
                  <span className="text-3xl md:text-4xl font-heading font-bold text-primary/20 flex-shrink-0 w-10 text-center">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-background">
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-medium text-sm md:text-base text-text group-hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <Badge variant="default" className="flex-shrink-0 whitespace-nowrap">
                        Best Seller
                      </Badge>
                    </div>
                    <StarRating rating={product.rating} />
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-base font-heading font-semibold text-primary">
                        Rs. {product.price.toLocaleString()}
                      </span>
                      {product.comparePrice && (
                        <span className="text-xs text-text-muted line-through">
                          Rs. {product.comparePrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-10 md:hidden">
          <Link
            to="/shop?sort=popular"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full text-sm font-medium"
          >
            View All Best Sellers
            <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Container>
    </Section>
  );
};

export default BestSellers;
