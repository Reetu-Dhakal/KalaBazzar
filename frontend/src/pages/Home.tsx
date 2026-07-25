import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HandMetal,
  ShieldCheck,
  CreditCard,
  Truck,
  Star,
  ChevronRight,
  ArrowRight,
  Quote,
} from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/api';
import type { Product, Category, Review } from '@/types';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const features = [
  {
    icon: HandMetal,
    title: 'Handmade',
    description: 'Every product is handcrafted with love and traditional techniques.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Artisans',
    description: 'All sellers are verified to ensure authenticity and quality.',
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    description: 'Multiple secure payment options including COD, Khalti, and eSewa.',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Reliable delivery across Nepal with tracking support.',
  },
];

const testimonials = [
  {
    id: '1',
    name: 'Anita Sharma',
    location: 'Kathmandu',
    comment:
      'The handwoven shawl I purchased is absolutely stunning. The quality is exceptional and it arrived beautifully packaged. KalaBazzar has become my go-to for authentic Nepali crafts.',
    rating: 5,
    avatar: '',
  },
  {
    id: '2',
    name: 'Rajesh Thapa',
    location: 'Pokhara',
    comment:
      'I bought a traditional Dhaka topi as a gift. The artisan even added a personalized note. This is what real craftsmanship looks like. Highly recommended!',
    rating: 5,
    avatar: '',
  },
  {
    id: '3',
    name: 'Maya Gurung',
    location: 'Lalitpur',
    comment:
      'Supporting local artisans through KalaBazzar feels wonderful. The products are genuine, well-made, and the customer service is outstanding.',
    rating: 5,
    avatar: '',
  },
];

function ProductSkeleton() {
  return (
    <div className="min-w-[260px]">
      <Skeleton className="aspect-square rounded-xl" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-1/3" />
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const images = product.variants?.[0]?.images || [];
  const firstImage = images[0] || '/placeholder.jpg';

  return (
    <Link to={`/shop/${product.slug}`} className="group block min-w-[260px]">
      <div className="relative overflow-hidden rounded-xl bg-card border border-border">
        <div className="aspect-square overflow-hidden">
          <img
            src={firstImage}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            {Math.round(
              ((product.compareAtPrice - product.basePrice) /
                product.compareAtPrice) *
                100,
            )}
            % OFF
          </Badge>
        )}
        {product.isFeatured && (
          <Badge variant="secondary" className="absolute top-2 right-2">
            Featured
          </Badge>
        )}
      </div>
      <div className="mt-3">
        <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        {typeof product.category === 'object' && product.category && (
          <p className="text-xs text-muted-foreground mt-1">
            {product.category.name}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2">
          <span className="text-lg font-semibold text-primary">
            {formatCurrency(product.basePrice)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(product.compareAtPrice)}
            </span>
          )}
        </div>
        {product.analytics?.averageRating > 0 && (
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
            <span>{product.analytics?.averageRating.toFixed(1)}</span>
            <span>({product.analytics?.reviewCount})</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function Home() {
  usePageTitle();
  const { recentItems } = useRecentlyViewed();
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topReviews, setTopReviews] = useState<Review[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, reviewsRes] = await Promise.allSettled([
          api.get('/products/featured'),
          api.get('/categories'),
          api.get('/reviews', { params: { sort: '-rating', limit: 3 } }),
        ]);

        if (productsRes.status === 'fulfilled') {
          setFeaturedProducts(productsRes.value.data.data || []);
        }
        if (categoriesRes.status === 'fulfilled') {
          setCategories(
            (categoriesRes.value.data.data || []).slice(0, 8),
          );
        }
        if (reviewsRes.status === 'fulfilled') {
          setTopReviews(reviewsRes.value.data.data || []);
        }
      } catch {
        // handled by individual checks
      } finally {
        setIsLoadingProducts(false);
        setIsLoadingCategories(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary" />
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-2xl"
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="secondary" className="mb-4">
                Handcrafted in Nepal
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-heading text-primary-foreground leading-tight"
            >
              Discover Authentic Nepali Crafts
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="mt-6 text-lg text-primary-foreground/80 max-w-lg"
            >
              Connect with skilled artisans and bring home handcrafted treasures
              that tell the story of Nepal's rich cultural heritage.
            </motion.p>
            <motion.div variants={fadeInUp} className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link to="/shop">
                  Shop Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/seller/apply">Become an Artisan</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={fadeInUp}>
                <Card variant="elevated" className="text-center p-6 h-full">
                  <CardContent className="p-0">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-heading text-foreground">
                  Shop by Category
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Explore our curated collections
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/shop">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            {isLoadingCategories ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <motion.div key={category._id} variants={fadeInUp}>
                    <Link
                      to={`/shop?category=${category.slug}`}
                      className="group block relative overflow-hidden rounded-xl aspect-square"
                    >
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <span className="text-4xl font-heading text-primary">
                            {category.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-heading text-lg font-semibold text-white">
                          {category.name}
                        </h3>
                        {category.productCount > 0 && (
                          <p className="text-sm text-white/80">
                            {category.productCount} products
                          </p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-heading text-foreground">
                  Featured Products
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Handpicked by our curators
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/shop">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div variants={fadeInUp} className="overflow-x-auto scrollbar-hide -mx-4 px-4">
              <div className="flex gap-6 pb-4">
                {isLoadingProducts
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <ProductSkeleton key={i} />
                    ))
                  : featuredProducts.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Recently Viewed */}
      {recentItems.length > 0 && (
        <section className="py-16 md:py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-heading text-foreground">
                    Recently Viewed
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Continue where you left off
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/recently-viewed">
                    View All
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div variants={fadeInUp} className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex gap-6 pb-4">
                  {recentItems.map((item) => (
                    <Link
                      key={item._id}
                      to={`/shop/${item.slug}`}
                      className="group block min-w-[200px]"
                    >
                      <div className="relative overflow-hidden rounded-xl bg-card border border-border">
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={item.images[0] || '/placeholder.jpg'}
                            alt={item.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <h3 className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                        <span className="mt-1 text-sm font-semibold text-primary">
                          {formatCurrency(item.basePrice)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <h2 className="text-3xl font-heading text-foreground">
                What Our Customers Say
              </h2>
              <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
                Hear from people who have experienced the beauty of Nepali craftsmanship
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {(topReviews.length > 0 ? topReviews : testimonials).map(
                (testimonial) => {
                  const isReview = '_id' in testimonial;
                  const key = isReview ? testimonial._id : testimonial.id;
                  const comment = isReview ? testimonial.comment : testimonial.comment;
                  const rating = isReview ? testimonial.rating : testimonial.rating;
                  const authorName = isReview
                    ? typeof testimonial.customer === 'object' && testimonial.customer
                      ? `${testimonial.customer.firstName} ${testimonial.customer.lastName}`
                      : 'Verified Customer'
                    : testimonial.name;
                  const authorSubtitle = isReview
                    ? 'Verified Purchase'
                    : testimonial.location;

                  return (
                    <motion.div key={key} variants={fadeInUp}>
                      <Card variant="elevated" className="h-full">
                        <CardContent className="p-6">
                          <Quote className="h-8 w-8 text-secondary/40 mb-4" />
                          <p className="text-foreground leading-relaxed">
                            {comment}
                          </p>
                          <div className="mt-4 flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < rating
                                    ? 'fill-secondary text-secondary'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="mt-4 border-t border-border pt-4">
                            <p className="font-medium text-foreground">
                              {authorName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {authorSubtitle}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                },
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Artisan CTA Section */}
      <section className="py-16 md:py-20 bg-secondary/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Card variant="elevated" className="overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <Badge variant="secondary" className="w-fit mb-4">
                      For Artisans
                    </Badge>
                    <h2 className="text-3xl font-heading text-foreground mb-4">
                      Turn Your Craft Into a Business
                    </h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      Join KalaBazzar and reach customers who appreciate authentic
                      handcrafted products. Set up your online store, manage orders,
                      and grow your artisan business with our support.
                    </p>
                    <ul className="space-y-3 mb-8">
                      {[
                        'Zero listing fees for your first month',
                        'Verified artisan badge',
                        'Marketing & promotional support',
                        'Secure payment processing',
                      ].map((benefit) => (
                        <li
                          key={benefit}
                          className="flex items-center gap-2 text-sm text-foreground"
                        >
                          <ShieldCheck className="h-4 w-4 text-success shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    <div>
                      <Button asChild size="lg">
                        <Link to={user?.role === 'seller' ? '/seller/dashboard' : '/seller/apply'}>
                          {user?.role === 'seller'
                            ? 'Go to Dashboard'
                            : 'Start Selling Today'}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="relative h-64 md:h-auto bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <div className="text-center p-8">
                      <HandMetal className="h-16 w-16 text-primary/60 mx-auto mb-4" />
                      <p className="font-heading text-2xl text-foreground">
                        500+ Artisans
                      </p>
                      <p className="text-muted-foreground mt-1">
                        Already selling on KalaBazzar
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
