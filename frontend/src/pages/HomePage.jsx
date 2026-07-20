import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowRight, HiOutlineStar, HiOutlineShieldCheck, HiOutlineTruck, HiOutlineHeart, HiOutlineCurrencyRupee } from 'react-icons/hi';
import API from '../utils/axios';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  initial: {},
  whileInView: {},
  viewport: { once: true, margin: '-100px' },
  transition: { staggerChildren: 0.1 },
};

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          API.get('/products?featured=true&limit=8'),
          API.get('/categories'),
        ]);
        setFeaturedProducts(productsRes.data.data);
        setCategories(categoriesRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-b from-background to-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1920')] bg-cover bg-center opacity-5" />
        <div className="container-custom relative z-10 pt-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-1.5 bg-primary/5 text-primary text-sm rounded-full mb-6">
                Discover Nepal's Finest Crafts
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-text leading-tight mb-6">
                Where Tradition
                <span className="block text-primary">Meets Craftsmanship</span>
              </h1>
              <p className="text-lg text-text-muted mb-8 max-w-lg leading-relaxed">
                Explore authentic handmade products directly from Nepal's skilled artisans. 
                Each piece tells a story of culture, heritage, and dedication.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors font-medium"
                >
                  Explore Collection
                  <HiOutlineArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/become-seller"
                  className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-colors font-medium"
                >
                  Start Selling
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800"
                  alt="Nepali Handicrafts"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent" />
              </div>
              {/* Floating cards */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg">
                <p className="text-sm font-medium text-text">Trusted by</p>
                <p className="text-2xl font-heading font-bold text-primary">500+</p>
                <p className="text-xs text-text-muted">Artisans</p>
              </div>
              <div className="absolute -top-6 -right-6 bg-white rounded-xl p-4 shadow-lg">
                <p className="text-sm font-medium text-text">Handmade</p>
                <p className="text-2xl font-heading font-bold text-primary">10K+</p>
                <p className="text-xs text-text-muted">Products</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <span className="text-sm text-primary font-medium uppercase tracking-wider">Categories</span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-text mt-2">
              Shop by Category
            </h2>
            <p className="text-text-muted mt-3 max-w-lg mx-auto">
              Explore our curated collection of authentic Nepali handicrafts
            </p>
          </motion.div>

          <motion.div {...staggerContainer} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.length > 0 ? (
              categories.map((cat, index) => {
                const imageMap = {
                  'pottery-ceramics': 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400',
                  'wood-crafts': 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400',
                  'paintings': 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400',
                  'jewelry': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
                  'textiles': 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=400',
                  'home-decor': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
                };
                return (
                  <motion.div
                    key={cat._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={`/shop?category=${cat.slug}`}
                      className="group block"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                        <img
                          src={imageMap[cat.slug] || 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=400'}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/60 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-white font-heading font-semibold text-sm">{cat.name}</h3>
                          <p className="text-white/70 text-xs">{cat.productCount || 0} items</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            ) : (
              // Fallback to static categories if API data not available
              [
                { name: 'Pottery & Ceramics', slug: 'pottery-ceramics', image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400', count: '120+' },
                { name: 'Wood Crafts', slug: 'wood-crafts', image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400', count: '85+' },
                { name: 'Paintings', slug: 'paintings', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400', count: '200+' },
                { name: 'Jewelry', slug: 'jewelry', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400', count: '150+' },
                { name: 'Textiles', slug: 'textiles', image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=400', count: '90+' },
                { name: 'Home Decor', slug: 'home-decor', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400', count: '75+' },
              ].map((cat, index) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={`/shop?category=${cat.slug}`}
                    className="group block"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-primary/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-white font-heading font-semibold text-sm">{cat.name}</h3>
                        <p className="text-white/70 text-xs">{cat.count} items</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-background">
        <div className="container-custom">
          <motion.div {...fadeInUp} className="flex items-end justify-between mb-12">
            <div>
              <span className="text-sm text-primary font-medium uppercase tracking-wider">Featured</span>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-text mt-2">
                Featured Products
              </h2>
            </div>
            <Link
              to="/shop"
              className="hidden md:inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
            >
              View All <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/product/${product.slug}`} className="group block">
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=400'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                          <HiOutlineHeart className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-text-muted mb-1">{product.category?.name}</p>
                        <h3 className="font-medium text-sm text-text group-hover:text-primary transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <HiOutlineStar className="w-3.5 h-3.5 text-secondary" />
                          <span className="text-xs text-text-muted">{product.rating?.toFixed(1) || '0.0'} ({product.numReviews || 0} reviews)</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-lg font-heading font-bold text-primary">Rs. {product.price?.toLocaleString()}</span>
                          <span className="text-xs text-text-muted">{product.district || 'Nepal'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              // Fallback to static products if API data not available
              [1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: item * 0.05 }}
                >
                  <Link to={`/product/handmade-product-${item}`} className="group block">
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={`https://images.unsplash.com/photo-${1565193566173 + item}?w=400`}
                          alt="Product"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = `https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=400`;
                          }}
                        />
                        <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                          <HiOutlineHeart className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-text-muted mb-1">Pottery & Ceramics</p>
                        <h3 className="font-medium text-sm text-text group-hover:text-primary transition-colors line-clamp-2">
                          Handcrafted Ceramic Vase
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <HiOutlineStar className="w-3.5 h-3.5 text-secondary" />
                          <span className="text-xs text-text-muted">4.8 (24 reviews)</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-lg font-heading font-bold text-primary">Rs. 1,500</span>
                          <span className="text-xs text-text-muted">Kathmandu</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>

          <div className="text-center mt-10 md:hidden">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors font-medium"
            >
              View All Products <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Kala Bazaar */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="text-sm text-primary font-medium uppercase tracking-wider">Why Us</span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-text mt-2">
              Why Choose Kala Bazaar
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: HiOutlineShieldCheck, title: 'Authentic Products', desc: 'Every item is verified for authenticity and quality by our team.' },
              { icon: HiOutlineTruck, title: 'Nationwide Delivery', desc: 'Free shipping on orders over Rs. 2,000. Delivered to your doorstep.' },
              { icon: HiOutlineCurrencyRupee, title: 'Secure Payments', desc: 'Multiple payment options including eSewa, Khalti, and Cash on Delivery.' },
              { icon: HiOutlineHeart, title: 'Support Artisans', desc: 'Your purchase directly supports local Nepali artisans and their families.' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Kala Bazaar */}
      <section className="py-20 bg-background">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <div className="aspect-video rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800"
                    alt="Nepali Artisan"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-primary text-white rounded-xl p-6 shadow-lg max-w-200px">
                  <p className="text-3xl font-heading font-bold">10+</p>
                  <p className="text-sm text-white/80">Years of empowering artisans</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-sm text-primary font-medium uppercase tracking-wider">Our Story</span>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-text mt-2 mb-6">
                Preserving Nepal's <span className="text-primary">Heritage</span> Through Craft
              </h2>
              <p className="text-text-muted leading-relaxed mb-6">
                Kala Bazaar Nepal was born from a simple vision — to create a platform where 
                Nepal's talented artisans can showcase their craft to the world. We believe that 
                every handmade piece carries the soul of its creator and the spirit of Nepal.
              </p>
              <p className="text-text-muted leading-relaxed mb-8">
                From the intricate Mithila paintings of Janakpur to the fine Dhaka weaves of 
                Palpa, we bring you authentic products directly from the hands of master craftspeople.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors font-medium"
              >
                Learn Our Story <HiOutlineArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Become a Seller */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1920')] bg-cover bg-center opacity-10" />
        <div className="container-custom relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div {...fadeInUp}>
              <span className="text-sm text-secondary font-medium uppercase tracking-wider">Join Us</span>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mt-2 mb-6">
                Are You a Nepali Artisan?
              </h2>
              <p className="text-white/70 text-lg mb-8 leading-relaxed">
                Showcase your craft to thousands of customers across Nepal. 
                Set up your free online store in minutes and start selling your handmade products.
              </p>
              <div className="grid grid-cols-3 gap-6 mb-10">
                {[
                  { number: '0%', label: 'Setup Fee' },
                  { number: '10%', label: 'Commission' },
                  { number: '24/7', label: 'Support' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-3xl font-heading font-bold text-secondary">{stat.number}</p>
                    <p className="text-white/60 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
              <Link
                to="/become-seller"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-secondary text-primary font-medium rounded-xl hover:bg-secondary/90 transition-colors"
              >
                Start Selling Today <HiOutlineArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <span className="text-sm text-primary font-medium uppercase tracking-wider">Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-text mt-2">
              What Our Community Says
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Kala Bazaar has transformed my small pottery business. I can now reach customers across Nepal without leaving my village.",
                name: "Sita Devi",
                role: "Pottery Artisan, Bhaktapur",
                rating: 5,
              },
              {
                quote: "Finally, a platform where I can find authentic Nepali handicrafts. The quality and authenticity are unmatched.",
                name: "Rajesh Sharma",
                role: "Customer, Kathmandu",
                rating: 5,
              },
              {
                quote: "The platform made it so easy to start selling my Mithila paintings. The team is incredibly supportive.",
                name: "Anita Mahato",
                role: "Mithila Artist, Janakpur",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-background rounded-xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <HiOutlineStar key={i} className="w-4 h-4 text-secondary fill-current" />
                  ))}
                </div>
                <p className="text-text-muted text-sm leading-relaxed mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-medium text-sm">{testimonial.name}</p>
                  <p className="text-xs text-text-muted">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-background">
        <div className="container-custom">
          <motion.div {...fadeInUp} className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl font-heading font-bold text-text mb-3">
              Stay Inspired
            </h2>
            <p className="text-text-muted text-sm mb-6">
              Subscribe to receive stories about Nepali artisans, new arrivals, and exclusive offers.
            </p>
            <form className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-light transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;