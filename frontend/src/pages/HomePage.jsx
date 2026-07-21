import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineArrowRight, HiOutlineStar, HiOutlineMail } from 'react-icons/hi';
import { FiMapPin, FiHeart } from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import API from '../utils/axios';
import { useCart } from '../context/CartContext';
import { SectionTitle, Container } from '../components/ui';
import ProductCard from '../components/product/ProductCard';
import ArtisanCard from '../components/product/ArtisanCard';
import CategoryCard from '../components/home/CategoryCard';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, newArrivalsRes, bestSellersRes] =
          await Promise.all([
            API.get('/products?featured=true&limit=8'),
            API.get('/categories'),
            API.get('/products?sort=newest&limit=8'),
            API.get('/products?sort=popular&limit=8'),
          ]);

        setFeaturedProducts(productsRes.data.data);
        setCategories(categoriesRes.data.data);
        setNewArrivals(newArrivalsRes.data.data);
        setBestSellers(bestSellersRes.data.data);

        const artisansRes = await API.get('/users?role=seller&featured=true&limit=3');
        setArtisans(artisansRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categoryImageMap = {
    'pottery-ceramics': 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
    'wood-crafts': 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800',
    'paintings': 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
    'jewelry': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
    'textiles': 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800',
    'home-decor': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Editorial Style */}
      <section className="relative min-h-[95vh] flex items-end overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1920&q=90"
            alt="Nepali Handicrafts"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-background/80 to-transparent" />
        </div>

        {/* Content */}
        <Container className="relative z-10 pb-20 md:pb-28 lg:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-3xl"
          >
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/95 rounded-full mb-8 shadow-lg"
            >
              <MdVerified className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Authentic Nepali Handmade Products</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="font-heading text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold text-text leading-[1.05] mb-6 tracking-tight"
            >
              Curating Nepal's
              <span className="block text-primary mt-2">Finest Crafts</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="text-lg md:text-xl text-text-muted mb-10 leading-relaxed max-w-xl"
            >
              Discover authentic handmade products crafted by skilled Nepali artisans. 
              Each piece carries centuries of tradition, culture, and dedication.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/shop"
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-primary text-white rounded-full hover:bg-primary-light transition-all duration-300 font-medium shadow-lg hover:shadow-xl group"
              >
                Explore Collection
                <HiOutlineArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-text rounded-full hover:bg-white/90 transition-all duration-300 font-medium border border-border"
              >
                Our Story
              </Link>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Stats Strip */}
      <section className="bg-white border-y border-border/50">
        <Container>
          <div className="py-12 md:py-16">
            <div className="grid grid-cols-3 gap-8 md:gap-12">
              {[
                { number: '500+', label: 'Artisans' },
                { number: '10K+', label: 'Handcrafted Products' },
                { number: '25K+', label: 'Happy Customers' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-4xl md:text-5xl font-heading font-semibold text-primary mb-1.5">
                    {stat.number}
                  </p>
                  <p className="text-sm text-text-muted">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Categories */}
      <section className="py-24 md:py-32 bg-background">
        <Container>
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-primary/5 text-primary text-sm font-medium rounded-full mb-4">
              Explore
            </span>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold text-text mb-4 tracking-tight">
              Handcrafted Categories
            </h2>
            <p className="text-text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              From intricate wood carvings to vibrant textiles, each category showcases Nepal's rich artisanal heritage
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {categories.length > 0 ? (
              categories.map((cat, index) => (
                <CategoryCard key={cat._id} category={cat} index={index} imageMap={categoryImageMap} />
              ))
            ) : (
              ['pottery-ceramics', 'wood-crafts', 'paintings', 'jewelry', 'textiles', 'home-decor'].map((slug, index) => (
                <CategoryCard
                  key={slug}
                  category={{ slug, name: slug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
                  index={index}
                  imageMap={categoryImageMap}
                />
              ))
            )}
          </div>
        </Container>
      </section>

      {/* Featured Products - Editorial Grid */}
      <section className="py-24 md:py-32 bg-white">
        <Container>
          <div className="flex items-end justify-between mb-16">
            <div>
              <span className="inline-block px-4 py-2 bg-primary/5 text-primary text-sm font-medium rounded-full mb-4">
                Selection
              </span>
              <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold text-text tracking-tight">
                Featured Products
              </h2>
            </div>
            <Link
              to="/shop"
              className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all group"
            >
              View All
              <HiOutlineArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product, index) => (
                <ProductCard key={product._id} product={product} index={index} />
              ))
            ) : (
              [1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div key={item} className="animate-pulse">
                  <div className="aspect-4/5 bg-gray-200 rounded-2xl mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-center mt-12 md:hidden">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full text-sm font-medium"
            >
              View All Products
              <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Artisan Spotlight */}
      <section className="py-24 md:py-32 bg-background">
        <Container>
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-primary/5 text-primary text-sm font-medium rounded-full mb-4">
              The Makers
            </span>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold text-text mb-4 tracking-tight">
              Meet Our Artisans
            </h2>
            <p className="text-text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Behind every product is a talented artisan with a unique story. 
              Get to know the hands that create magic.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artisans.length > 0 ? (
              artisans.map((artisan, index) => (
                <ArtisanCard key={artisan._id} artisan={artisan} index={index} />
              ))
            ) : (
              [
                {
                  name: 'Sita Devi',
                  sellerProfile: {
                    specialization: ['Pottery & Ceramics'],
                    district: 'Bhaktapur',
                    yearsOfExperience: 25,
                    story: 'Creating beautiful pottery using traditional techniques passed down through generations in Bhaktapur.'
                  }
                },
                {
                  name: 'Ram Bahadur',
                  sellerProfile: {
                    specialization: ['Wood Carving'],
                    district: 'Lalitpur',
                    yearsOfExperience: 30,
                    story: 'Master wood carver from Patan, specializing in traditional Nepali religious motifs and decorative pieces.'
                  }
                },
                {
                  name: 'Anita Mahato',
                  sellerProfile: {
                    specialization: ['Mithila Painting'],
                    district: 'Janakpur',
                    yearsOfExperience: 15,
                    story: 'Preserving the ancient art of Mithila painting while bringing it to modern homes across Nepal.'
                  }
                }
              ].map((artisan, index) => (
                <ArtisanCard key={artisan.name} artisan={artisan} index={index} />
              ))
            )}
          </div>
        </Container>
      </section>

      {/* About Kala Bazaar - Editorial Layout */}
      <section className="py-24 md:py-32 bg-white">
        <Container>
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            {/* Left Column - Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-5"
            >
              <div className="relative aspect-3/4 rounded-3xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800"
                  alt="Nepali Artisan at work"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            {/* Right Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-7"
            >
              <span className="inline-block px-4 py-2 bg-primary/5 text-primary text-sm font-medium rounded-full mb-4">
                About Kala Bazaar
              </span>
              <h2 className="font-heading text-4xl md:text-5xl font-semibold text-text mb-6 tracking-tight">
                Preserving Heritage Through Craftsmanship
              </h2>
              <div className="space-y-4 text-text-muted leading-relaxed mb-8">
                <p>
                  Kala Bazaar Nepal was born from a belief that every handmade product carries a story—of culture, 
                  heritage, and the skilled hands that create it.
                </p>
                <p>
                  We bridge the gap between traditional artisans and modern technology, ensuring that authentic 
                  Nepali craftsmanship reaches homes worldwide while providing sustainable livelihoods for our artisans.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
                {[
                  { number: '75+', label: 'Districts' },
                  { number: '10K+', label: 'Products' },
                  { number: '₹5Cr+', label: 'Artisan Earnings' },
                ].map((stat, index) => (
                  <div key={stat.label}>
                    <p className="text-3xl md:text-4xl font-heading font-semibold text-primary mb-1">
                      {stat.number}
                    </p>
                    <p className="text-sm text-text-muted">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* New Arrivals */}
      <section className="py-24 md:py-32 bg-background">
        <Container>
          <div className="flex items-end justify-between mb-16">
            <div>
              <span className="inline-block px-4 py-2 bg-primary/5 text-primary text-sm font-medium rounded-full mb-4">
                Just Landed
              </span>
              <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold text-text tracking-tight">
                New Arrivals
              </h2>
            </div>
            <Link
              to="/shop?sort=newest"
              className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all group"
            >
              View All
              <HiOutlineArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {newArrivals.length > 0 ? (
              newArrivals.map((product, index) => (
                <ProductCard key={product._id} product={product} index={index} />
              ))
            ) : (
              [1, 2, 3, 4].map((item) => (
                <div key={item} className="animate-pulse">
                  <div className="aspect-4/5 bg-gray-200 rounded-2xl mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))
            )}
          </div>
        </Container>
      </section>

      {/* Region Section - Immersive */}
      <section className="py-24 md:py-32 bg-white">
        <Container>
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-primary/5 text-primary text-sm font-medium rounded-full mb-4">
              Discover
            </span>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold text-text mb-4 tracking-tight">
              Explore by Region
            </h2>
            <p className="text-text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Every region of Nepal has its own unique craft traditions. Explore products from different parts of the country.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: 'Bhaktapur',
                image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800',
                specialty: 'Pottery & Woodcraft',
                products: '350+'
              },
              {
                name: 'Lalitpur',
                image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800',
                specialty: 'Wood Carving',
                products: '420+'
              },
              {
                name: 'Janakpur',
                image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
                specialty: 'Mithila Art',
                products: '280+'
              },
            ].map((region, index) => (
              <motion.div
                key={region.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link
                  to={`/shop?district=${region.name.toLowerCase()}`}
                  className="group block relative aspect-4/5 rounded-2xl overflow-hidden"
                >
                  <img
                    src={region.image}
                    alt={region.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                    <h3 className="font-heading text-2xl font-semibold mb-2">{region.name}</h3>
                    <p className="text-sm text-white/90 mb-1">{region.specialty}</p>
                    <p className="text-xs text-white/70">{region.products} products</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
            {[
              {
                name: 'Palpa',
                image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
                specialty: 'Dhaka Textiles',
                products: '190+'
              },
              {
                name: 'Mustang',
                image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
                specialty: 'Thangka Paintings',
                products: '120+'
              },
              {
                name: 'Pokhara',
                image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800',
                specialty: 'Silver Jewelry',
                products: '310+'
              },
            ].map((region, index) => (
              <motion.div
                key={region.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link
                  to={`/shop?district=${region.name.toLowerCase()}`}
                  className="group block relative aspect-4/5 rounded-2xl overflow-hidden"
                >
                  <img
                    src={region.image}
                    alt={region.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                    <h3 className="font-heading text-2xl font-semibold mb-2">{region.name}</h3>
                    <p className="text-sm text-white/90 mb-1">{region.specialty}</p>
                    <p className="text-xs text-white/70">{region.products} products</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Best Sellers */}
      <section className="py-24 md:py-32 bg-background">
        <Container>
          <div className="flex items-end justify-between mb-16">
            <div>
              <span className="inline-block px-4 py-2 bg-secondary/10 text-secondary text-sm font-medium rounded-full mb-4">
                Most Popular
              </span>
              <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold text-text tracking-tight">
                Best Sellers
              </h2>
            </div>
            <Link
              to="/shop?sort=popular"
              className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all group"
            >
              View All
              <HiOutlineArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {bestSellers.length > 0 ? (
              bestSellers.map((product, index) => (
                <ProductCard key={product._id} product={product} index={index} />
              ))
            ) : (
              [1, 2, 3, 4].map((item) => (
                <div key={item} className="animate-pulse">
                  <div className="aspect-4/5 bg-gray-200 rounded-2xl mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))
            )}
          </div>
        </Container>
      </section>

      {/* Artisan CTA - Full Width */}
      <section className="py-24 md:py-32 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <Container>
          <div className="max-w-4xl mx-auto text-center text-white relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-secondary text-sm font-medium mb-6">
                Join Our Community
              </span>
              <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 leading-tight">
                Are You a Nepali Artisan?
              </h2>
              <p className="text-xl md:text-2xl leading-relaxed text-white/90 mb-6 max-w-3xl mx-auto">
                Showcase your craft to thousands of customers across Nepal and the world.
              </p>
              <p className="text-base md:text-lg leading-relaxed text-white/70 mb-12 max-w-2xl mx-auto">
                Set up your free online store in minutes. No commission for the first 3 months. 
                We provide everything you need to start selling.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/become-seller"
                  className="inline-flex items-center justify-center gap-2.5 px-10 py-5 bg-white text-primary font-medium rounded-full hover:bg-white/90 transition-all duration-300 shadow-xl text-lg group"
                >
                  Start Selling Today
                  <HiOutlineArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Testimonials - Editorial */}
      <section className="py-24 md:py-32 bg-white">
        <Container>
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-primary/5 text-primary text-sm font-medium rounded-full mb-4">
              Testimonials
            </span>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold text-text tracking-tight">
              What Our Community Says
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Kala Bazaar has transformed my small pottery business. I can now reach customers across Nepal without leaving my village.",
                name: "Sita Devi",
                role: "Pottery Artisan, Bhaktapur",
              },
              {
                quote: "Finally, a platform where I can find authentic Nepali handicrafts. The quality and authenticity are unmatched.",
                name: "Rajesh Sharma",
                role: "Customer, Kathmandu",
              },
              {
                quote: "The platform made it so easy to start selling my Mithila paintings. Now I have customers from all over the world.",
                name: "Anita Mahato",
                role: "Mithila Artist, Janakpur",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-background rounded-2xl p-8 border border-border/50"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <FiHeart key={i} className="w-5 h-5 text-secondary fill-current" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-lg text-text leading-relaxed mb-6 font-light">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div>
                  <p className="font-heading font-semibold text-text">{testimonial.name}</p>
                  <p className="text-sm text-text-muted">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Newsletter */}
      <section className="py-24 md:py-32 bg-background">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white rounded-full mb-6 shadow-sm">
              <HiOutlineMail className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Stay Connected</span>
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-semibold text-text mb-4 tracking-tight">
              Get Inspired
            </h2>
            <p className="text-text-muted text-base md:text-lg mb-10">
              Subscribe to receive stories about Nepali artisans, new arrivals, and exclusive offers.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 bg-white border border-border rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                required
              />
              <button
                type="submit"
                className="px-8 py-4 bg-primary text-white font-medium rounded-2xl hover:bg-primary-light transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-text-muted mt-6">
              No spam, unsubscribe anytime.
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;