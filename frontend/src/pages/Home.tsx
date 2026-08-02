import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Users,
  Leaf,
  Mail,
  Phone,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  ChevronDown,
  Send,
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
import toast from 'react-hot-toast';
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
  { icon: HandMetal, title: 'Handmade', description: 'Every product is handcrafted with love and traditional techniques.' },
  { icon: ShieldCheck, title: 'Verified Artisans', description: 'All sellers are verified to ensure authenticity and quality.' },
  { icon: CreditCard, title: 'Secure Payment', description: 'Multiple secure payment options including COD, Khalti, and eSewa.' },
  { icon: Truck, title: 'Fast Delivery', description: 'Reliable delivery across Nepal with tracking support.' },
];

const values = [
  { icon: ShieldCheck, title: 'Authenticity', description: 'Every product on KalaBazzar is verified to be genuinely handcrafted. We work directly with artisans to ensure traditional techniques are preserved.' },
  { icon: Star, title: 'Quality', description: 'We curate only the finest handcrafted goods. Our quality standards ensure that every item meets the expectations of discerning customers.' },
  { icon: Users, title: 'Community', description: 'KalaBazzar is more than a marketplace — it is a community that connects artisans with appreciative customers worldwide.' },
  { icon: Leaf, title: 'Sustainability', description: 'Handcrafted products are inherently sustainable. We promote eco-friendly materials and ethical production practices.' },
];

const testimonials = [
  { id: '1', name: 'Anita Sharma', location: 'Kathmandu', comment: 'The handwoven shawl I purchased is absolutely stunning. The quality is exceptional and it arrived beautifully packaged. KalaBazzar has become my go-to for authentic Nepali crafts.', rating: 5 },
  { id: '2', name: 'Rajesh Thapa', location: 'Pokhara', comment: 'I bought a traditional Dhaka topi as a gift. The artisan even added a personalized note. This is what real craftsmanship looks like. Highly recommended!', rating: 5 },
  { id: '3', name: 'Maya Gurung', location: 'Lalitpur', comment: 'Supporting local artisans through KalaBazzar feels wonderful. The products are genuine, well-made, and the customer service is outstanding.', rating: 5 },
];

const faqCategories = [
  {
    title: 'Orders & Shipping',
    items: [
      { q: 'How do I place an order?', a: 'Simply browse our shop, add items to your cart, and proceed to checkout. You can pay via COD, Khalti, or eSewa. After placing an order, you will receive a confirmation email with your order details.' },
      { q: 'How long does shipping take?', a: 'Standard shipping within Nepal typically takes 3-7 business days depending on your location. Express shipping is available for faster delivery.' },
      { q: 'Can I track my order?', a: 'Yes! Once your order is shipped, you will receive a tracking number via email. You can also track your order status from your Orders page in your account.' },
    ],
  },
  {
    title: 'Payments',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept Cash on Delivery (COD), Khalti digital wallet, and eSewa. All online payments are processed securely.' },
      { q: 'Is COD available everywhere?', a: 'COD is available in most areas within Nepal. Some remote locations may only support online payment methods.' },
      { q: 'Can I get a refund if I paid online?', a: 'Yes, refunds for online payments are processed back to your original payment method within 5-7 business days after the refund is approved.' },
    ],
  },
  {
    title: 'Returns & Refunds',
    items: [
      { q: 'What is your return policy?', a: 'We offer a 7-day return policy for most items. Products must be unused, in original packaging, and in the same condition as received. Custom-made items are not eligible for returns.' },
      { q: 'How do I initiate a return?', a: 'Go to your Orders page, select the order containing the item you want to return, and click "Request Return." Follow the instructions and we will process your request.' },
      { q: 'What if I receive a damaged item?', a: 'If you receive a damaged item, please contact us within 48 hours with photos of the damage. We will arrange a replacement or full refund immediately.' },
    ],
  },
  {
    title: 'Seller Questions',
    items: [
      { q: 'How do I become a seller?', a: 'Click "Become an Artisan" and fill out the seller application form. Our team will review your application within 3-5 business days.' },
      { q: 'What are the fees for selling?', a: 'KalaBazzar charges a small commission on each sale. There are no listing fees or monthly charges. You only pay when you make a sale.' },
      { q: 'Can I offer custom orders?', a: 'Yes! You can enable custom orders in your product listings and specify customization options. Customers can then request personalized versions of your products.' },
    ],
  },
];

function ProductSkeleton() {
  return (
    <div className="min-w-65">
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
    <Link to={`/shop/${product.slug}`} className="group block min-w-65">
      <div className="relative overflow-hidden rounded-xl bg-card border border-border shadow-sm transition-shadow duration-300 group-hover:shadow-lg">
        <div className="aspect-square overflow-hidden">
          <img src={firstImage} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        </div>
        {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            {Math.round(((product.compareAtPrice - product.basePrice) / product.compareAtPrice) * 100)}% OFF
          </Badge>
        )}
        {product.isFeatured && (
          <Badge variant="secondary" className="absolute top-2 right-2">Featured</Badge>
        )}
      </div>
      <div className="mt-3">
        <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h3>
        {typeof product.category === 'object' && product.category && (
          <p className="text-xs text-muted-foreground mt-1">{product.category.name}</p>
        )}
        <div className="mt-1 flex items-center gap-2">
          <span className="text-lg font-semibold text-primary">{formatCurrency(product.basePrice)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
            <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.compareAtPrice)}</span>
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

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden transition-shadow hover:shadow-sm">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-hover transition-colors">
        <span className="font-medium text-foreground">{question}</span>
        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  usePageTitle();
  const navigate = useNavigate();
  const { recentItems } = useRecentlyViewed();
  const { user, isAuthenticated } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topReviews, setTopReviews] = useState<Review[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'seller') {
        navigate('/seller/dashboard', { replace: true });
      } else {
        navigate('/shop', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, reviewsRes] = await Promise.allSettled([
          api.get('/products/featured'),
          api.get('/categories'),
          api.get('/reviews', { params: { sort: '-rating', limit: 3 } }),
        ]);
        if (productsRes.status === 'fulfilled') setFeaturedProducts(productsRes.value.data.data || []);
        if (categoriesRes.status === 'fulfilled') setCategories((categoriesRes.value.data.data || []).slice(0, 8));
        if (reviewsRes.status === 'fulfilled') setTopReviews(reviewsRes.value.data.data || []);
      } catch {} finally {
        setIsLoadingProducts(false);
        setIsLoadingCategories(false);
      }
    };
    fetchData();
  }, []);

  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    setTimeout(() => {
      toast.success('Message sent! We will get back to you soon.');
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setIsSubmittingContact(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen">
      {/* ─── HERO ─── */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden scroll-mt-20" id="hero">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1546006200-f8c574598b28?w=1920&q=80&auto=format&fit=crop"
            alt="Nepali handicrafts"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1C1917]/90 via-[#1C1917]/70 to-[#1C1917]/40" />
        </div>

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-2xl">
            <motion.div variants={fadeInUp}>
              <Badge variant="secondary" className="mb-4">Handcrafted in Nepal</Badge>
            </motion.div>
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl lg:text-7xl font-heading text-white leading-tight">
              Discover Authentic Nepali Crafts
            </motion.h1>
            <motion.p variants={fadeInUp} className="mt-6 text-lg text-white/70 max-w-lg">
              Connect with skilled artisans and bring home handcrafted treasures that tell the story of Nepal&apos;s rich cultural heritage.
            </motion.p>
            <motion.div variants={fadeInUp} className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-secondary text-white hover:bg-secondary/90">
                <Link to="/shop">Shop Now <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Link to="/seller/apply">Become an Artisan</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-16 md:py-20 scroll-mt-20" id="features">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((f) => (
              <motion.div key={f.title} variants={fadeInUp}>
                <Card variant="elevated" className="text-center p-6 h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-0">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                      <f.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-foreground">{f.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-heading text-foreground">Shop by Category</h2>
                <p className="mt-2 text-muted-foreground">Explore our curated collections</p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/shop">View All <ChevronRight className="h-4 w-4" /></Link>
              </Button>
            </motion.div>
            {isLoadingCategories ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {categories.map((cat) => (
                  <motion.div key={cat._id} variants={fadeInUp}>
                    <Link to={`/shop?category=${cat.slug}`} className="group block relative overflow-hidden rounded-xl aspect-square">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="h-full w-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <span className="text-4xl font-heading text-primary">{cat.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-heading text-lg font-semibold text-white">{cat.name}</h3>
                        {cat.productCount > 0 && <p className="text-sm text-white/80">{cat.productCount} products</p>}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ─── */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-heading text-foreground">Featured Products</h2>
                <p className="mt-2 text-muted-foreground">Handpicked by our curators</p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/shop">View All <ChevronRight className="h-4 w-4" /></Link>
              </Button>
            </motion.div>
            <motion.div variants={fadeInUp} className="overflow-x-auto scrollbar-hide -mx-4 px-4">
              <div className="flex gap-6 pb-4">
                {isLoadingProducts
                  ? Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)
                  : featuredProducts.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── RECENTLY VIEWED ─── */}
      {recentItems.length > 0 && (
        <section className="py-16 md:py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
              <motion.div variants={fadeInUp} className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-heading text-foreground">Recently Viewed</h2>
                  <p className="mt-2 text-muted-foreground">Continue where you left off</p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/recently-viewed">View All <ChevronRight className="h-4 w-4" /></Link>
                </Button>
              </motion.div>
              <motion.div variants={fadeInUp} className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex gap-6 pb-4">
                  {recentItems.map((item) => (
                    <Link key={item._id} to={`/shop/${item.slug}`} className="group block min-w-50">
                      <div className="relative overflow-hidden rounded-xl bg-card border border-border shadow-sm transition-shadow duration-300 group-hover:shadow-lg">
                        <div className="aspect-square overflow-hidden">
                          <img src={item.images[0] || '/placeholder.jpg'} alt={item.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <h3 className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">{item.name}</h3>
                        <span className="mt-1 text-sm font-semibold text-primary">{formatCurrency(item.basePrice)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ─── ABOUT / OUR STORY ─── */}
      <section className="py-16 md:py-20 scroll-mt-20" id="about">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="max-w-3xl mx-auto text-center mb-12">
              <Badge variant="secondary" className="mb-4">Our Mission</Badge>
              <h2 className="text-3xl md:text-4xl font-heading text-foreground">Empowering Artisans, Preserving Heritage</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                KalaBazzar was born from a simple observation: Nepal&apos;s talented artisans — weavers, potters, woodworkers, and craftspeople — possess extraordinary skills passed down through generations, yet many struggled to reach the customers who would treasure their work. Today, KalaBazzar is home to over 500 verified artisans from all seven provinces of Nepal.
              </p>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* ─── VALUES ─── */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <h2 className="text-3xl font-heading text-foreground">Our Values</h2>
              <p className="mt-2 text-muted-foreground">The principles that guide everything we do</p>
            </motion.div>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              {values.map((v) => (
                <motion.div key={v.title} variants={fadeInUp}>
                  <Card variant="elevated" className="h-full p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <CardContent className="p-0">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                        <v.icon className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="font-heading text-lg font-semibold text-foreground">{v.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <h2 className="text-3xl font-heading text-foreground">What Our Customers Say</h2>
              <p className="mt-2 text-muted-foreground max-w-lg mx-auto">Hear from people who have experienced the beauty of Nepali craftsmanship</p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {(topReviews.length > 0 ? topReviews : testimonials).map((t) => {
                const isReview = '_id' in t;
                const key = isReview ? t._id : t.id;
                const comment = t.comment;
                const rating = t.rating;
                const authorName = isReview
                  ? typeof t.customer === 'object' && t.customer ? `${t.customer.firstName} ${t.customer.lastName}` : 'Verified Customer'
                  : t.name;
                const authorSub = isReview ? 'Verified Purchase' : t.location;
                return (
                  <motion.div key={key} variants={fadeInUp}>
                    <Card variant="elevated" className="h-full transition-all duration-300 hover:shadow-lg">
                      <CardContent className="p-6">
                        <Quote className="h-8 w-8 text-secondary/40 mb-4" />
                        <p className="text-foreground leading-relaxed">{comment}</p>
                        <div className="mt-4 flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-secondary text-secondary' : 'text-muted-foreground'}`} />
                          ))}
                        </div>
                        <div className="mt-4 border-t border-border pt-4">
                          <p className="font-medium text-foreground">{authorName}</p>
                          <p className="text-sm text-muted-foreground">{authorSub}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── ARTISAN CTA ─── */}
      <section className="py-16 md:py-20 bg-primary/5 scroll-mt-20">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.div variants={fadeInUp}>
              <Card variant="elevated" className="overflow-hidden border-0 shadow-xl">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <Badge variant="secondary" className="w-fit mb-4">For Artisans</Badge>
                    <h2 className="text-3xl font-heading text-foreground mb-4">Turn Your Craft Into a Business</h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      Join KalaBazzar and reach customers who appreciate authentic handcrafted products. Set up your online store, manage orders, and grow your artisan business with our support.
                    </p>
                    <ul className="space-y-3 mb-8">
                      {['Zero listing fees for your first month', 'Verified artisan badge', 'Marketing & promotional support', 'Secure payment processing'].map((b) => (
                        <li key={b} className="flex items-center gap-2 text-sm text-foreground">
                          <ShieldCheck className="h-4 w-4 text-success shrink-0" />{b}
                        </li>
                      ))}
                    </ul>
                    <div>
                      <Button asChild size="lg">
                        <Link to={user?.role === 'seller' ? '/seller/dashboard' : '/seller/apply'}>
                          {user?.role === 'seller' ? 'Go to Dashboard' : 'Start Selling Today'} <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="relative h-64 md:h-auto bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <div className="text-center p-8">
                      <HandMetal className="h-16 w-16 text-primary/60 mx-auto mb-4" />
                      <p className="font-heading text-2xl text-foreground">500+ Artisans</p>
                      <p className="text-muted-foreground mt-1">Already selling on KalaBazzar</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-16 md:py-20 scroll-mt-20" id="faq">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <h2 className="text-3xl font-heading text-foreground">Frequently Asked Questions</h2>
              <p className="mt-2 text-muted-foreground">Find answers to common questions about shopping on KalaBazzar</p>
            </motion.div>
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              {faqCategories.map((cat) => (
                <motion.div key={cat.title} variants={fadeInUp}>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-4">{cat.title}</h3>
                  <div className="space-y-3">
                    {cat.items.map((item) => (
                      <FaqItem key={item.q} question={item.q} answer={item.a} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div variants={fadeInUp} className="text-center mt-8">
              <p className="text-muted-foreground mb-4">Still have questions?</p>
              <div className="flex justify-center gap-4">
                <Button asChild variant="outline">
                  <Link to="/#contact">Contact Support</Link>
                </Button>
                <Button asChild variant="ghost">
                  <a href="mailto:support@kalabazzar.com">Email Us</a>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section className="py-16 md:py-20 bg-muted/50 scroll-mt-20" id="contact">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">Get in Touch</Badge>
              <h2 className="text-3xl font-heading text-foreground">Contact Us</h2>
              <p className="mt-2 text-muted-foreground">Have a question or feedback? We would love to hear from you.</p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <motion.div variants={fadeInUp} className="md:col-span-2">
                <Card variant="elevated">
                  <CardContent className="p-6">
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-6">Send us a Message</h3>
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <input type="text" placeholder="Your name" required value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} className="w-full rounded-lg border border-border/60 bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" />
                        <input type="email" placeholder="your@email.com" required value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} className="w-full rounded-lg border border-border/60 bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" />
                      </div>
                      <input type="text" placeholder="How can we help?" required value={contactForm.subject} onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })} className="w-full rounded-lg border border-border/60 bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" />
                      <textarea placeholder="Tell us more about your inquiry..." required rows={5} value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} className="w-full rounded-lg border border-border/60 bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none" />
                      <Button type="submit" size="lg" isLoading={isSubmittingContact}>
                        <Send className="h-4 w-4" /> Send Message
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={fadeInUp} className="space-y-4">
                <Card variant="elevated">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-heading text-lg font-semibold text-foreground">Contact Information</h3>
                    {[
                      { icon: Mail, label: 'Email', value: 'support@kalabazaar.com', href: 'mailto:support@kalabazaar.com' },
                      { icon: Phone, label: 'Phone', value: '+977-1-4567890', href: 'tel:+97714567890' },
                      { icon: MapPin, label: 'Address', value: 'Kathmandu, Nepal', href: '' },
                      { icon: Clock, label: 'Hours', value: 'Sun-Fri: 9AM - 6PM', href: '' },
                    ].map((c) => (
                      <div key={c.label} className="flex items-start gap-3">
                        <c.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">{c.label}</p>
                          {c.href ? <a href={c.href} className="text-sm text-foreground hover:text-primary transition-colors">{c.value}</a> : <p className="text-sm text-foreground">{c.value}</p>}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card variant="elevated">
                  <CardContent className="p-6">
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-3">Follow Us</h3>
                    <div className="flex gap-3">
                      <a href="https://facebook.com/kalabazaar" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                        <Facebook className="h-5 w-5" />
                      </a>
                      <a href="https://instagram.com/kalabazaar" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                        <Instagram className="h-5 w-5" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
