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
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePageTitle } from '@/hooks/usePageTitle';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/api';
import { Footer } from '@/components/layout/Footer';
import type { Product, Category, Review, Banner } from '@/types';

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09 },
  },
};

const goldPattern = (opacity = 0.08) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'><g fill='none' stroke='%23E6C582' stroke-opacity='${opacity}'><path d='M48 4 92 48 48 92 4 48Z' stroke-width='0.75'/><path d='M4 4 92 92M92 4 4 92' stroke-width='0.4'/></g></svg>`,
  )}")`;

const HERO_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1767390552768-6703f91c2518?w=1920&q=80&auto=format&fit=crop';

function Eyebrow({ children, centered = false }: { children: React.ReactNode; centered?: boolean }) {
  return (
    <p
      className={`flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-gold-400 md:text-xs ${
        centered ? 'justify-center' : ''
      }`}
    >
      <span className="h-px w-8 bg-linear-to-r from-transparent to-gold-500/70" />
      <span className="shrink-0">✦ {children} ✦</span>
      <span className="h-px w-8 bg-linear-to-l from-transparent to-gold-500/70" />
    </p>
  );
}

function Ornament() {
  return (
    <div className="flex items-center justify-center gap-3 text-gold-500">
      <span className="h-px w-14 bg-linear-to-r from-transparent to-gold-500/50" />
      <span className="text-gold-400">✦</span>
      <span className="h-px w-14 bg-linear-to-l from-transparent to-gold-500/50" />
    </div>
  );
}

const heroPrimaryBtn =
  'inline-flex items-center justify-center gap-2 h-12 px-8 rounded-lg bg-gold-500 text-[#1A2340] font-semibold tracking-wide shadow-lg shadow-black/40 hover:bg-gold-400 hover:-translate-y-0.5 transition-all duration-300';
const heroOutlineBtn =
  'inline-flex items-center justify-center gap-2 h-12 px-8 rounded-lg border border-[#EDF2FA]/30 text-[#EDF2FA] hover:border-gold-400/70 hover:text-gold-300 hover:bg-white/5 transition-all duration-300';

const features = [
  { icon: HandMetal, title: 'Handmade', description: 'Every piece is handcrafted using techniques passed down through generations.' },
  { icon: ShieldCheck, title: 'Verified Artisans', description: 'Every seller is personally verified for authenticity and quality.' },
  { icon: CreditCard, title: 'Secure Payments', description: 'Pay with COD, Khalti, or eSewa — all transactions fully protected.' },
  { icon: Truck, title: 'Nationwide Delivery', description: 'Reliable delivery across all seven provinces with tracking.' },
];

const categoryImages: Record<string, string> = {
  handicrafts: 'https://images.unsplash.com/photo-1595231776515-ddffb1f4eb73?w=500&q=80',
  jewelry: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80',
  paintings: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&q=80',
  ceramics: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=500&q=80',
  pottery: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=500&q=80',
  woodwork: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500&q=80',
  textiles: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80',
  metalwork: 'https://images.unsplash.com/photo-1590422749897-47036da0b0ff?w=500&q=80',
  sculptures: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=500&q=80',
  'bags-accessories': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80',
  'home-decor': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&q=80',
  'musical-instruments': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
};

const fallbackCategoryImage = 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&q=80';

function ProductSkeleton() {
  return (
    <div className="w-64 shrink-0 sm:w-72">
      <div className="aspect-square animate-pulse rounded-2xl bg-[#E3E9F4]" />
      <div className="mt-4 space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-[#E3E9F4]" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-[#E3E9F4]" />
        <div className="h-6 w-1/3 animate-pulse rounded bg-[#E3E9F4]" />
      </div>
    </div>
  );
}

function getHomeFallbackImage(name: string): string {
  const map: Record<string, string> = {
    singing: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
    bowl: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=400&h=400&fit=crop',
    earring: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',
    silver: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop',
    basket: 'https://images.unsplash.com/photo-1595231776515-ddffb1f4eb73?w=400&h=400&fit=crop',
    bamboo: 'https://images.unsplash.com/photo-1595231776515-ddffb1f4eb73?w=400&h=400&fit=crop',
    painting: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop',
    thangka: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop',
    mandala: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop',
    pendant: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop',
    necklace: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop',
    clay: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop',
    pot: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop',
    ceramic: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop',
    buddha: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=400&fit=crop',
    statue: 'https://images.unsplash.com/photo-1590422749897-47036da0b0ff?w=400&h=400&fit=crop',
    brass: 'https://images.unsplash.com/photo-1590422749897-47036da0b0ff?w=400&h=400&fit=crop',
    ganesh: 'https://images.unsplash.com/photo-1590422749897-47036da0b0ff?w=400&h=400&fit=crop',
    topi: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop',
    dhaka: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop',
    wood: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop',
    carved: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop',
    door: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop',
    frame: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop',
    woven: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop',
    cap: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop',
    scarf: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop',
    shawl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop',
    mug: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop',
    cup: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop',
  };
  const lower = name.toLowerCase();
  for (const [key, url] of Object.entries(map)) {
    if (lower.includes(key)) return url;
  }
  return 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop';
}

function ProductCard({ product }: { product: Product }) {
  const images = product.variants?.[0]?.images || [];
  const firstImage = images[0] || getHomeFallbackImage(product.name);

  return (
    <Link to={`/shop/${product.slug}`} className="group block w-64 shrink-0 sm:w-72">
      <div className="relative overflow-hidden rounded-2xl border border-[#DDE4EF] bg-white shadow-sm transition-all duration-300 group-hover:border-gold-500/50">
        <div className="aspect-square overflow-hidden">
          <img
            src={firstImage}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>
        {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
          <span className="absolute left-3 top-3 rounded-full bg-[#A52019] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#FFF6EC]">
            {Math.round(((product.compareAtPrice - product.basePrice) / product.compareAtPrice) * 100)}% Off
          </span>
        )}
        {product.isFeatured && (
          <span className="absolute right-3 top-3 rounded-full border border-gold-500/50 bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold-300 backdrop-blur">
            Featured
          </span>
        )}
        <div className="absolute inset-0 flex items-end justify-center bg-black/0 p-4 opacity-0 transition-all duration-300 group-hover:bg-black/40 group-hover:opacity-100">
          <span className="rounded-lg bg-gold-500 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-[#1A2340]">
            View Piece
          </span>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="line-clamp-1 font-heading text-lg leading-snug text-[#33415C] transition-colors group-hover:text-primary">
          {product.name}
        </h3>
        {typeof product.category === 'object' && product.category && (
          <p className="mt-0.5 text-xs uppercase tracking-widest text-[#53617E]">{product.category.name}</p>
        )}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-semibold text-gold-600">{formatCurrency(product.basePrice)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
            <span className="text-sm text-[#8A95AD] line-through">{formatCurrency(product.compareAtPrice)}</span>
          )}
        </div>
        {product.analytics?.averageRating > 0 && (
          <div className="mt-1 flex items-center gap-1.5 text-sm text-[#53617E]">
            <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
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
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topReviews, setTopReviews] = useState<Review[]>([]);
  const [heroBanners, setHeroBanners] = useState<Banner[]>([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    setIsSubscribing(true);
    try {
      await api.post('/newsletter', { email: newsletterEmail });
      toast.success('Thanks for subscribing!');
      setNewsletterEmail('');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, reviewsRes, bannersRes] = await Promise.allSettled([
          api.get('/products/featured'),
          api.get('/categories'),
          api.get('/reviews', { params: { sort: '-rating', limit: 3 } }),
          api.get('/banners', { params: { position: 'hero' } }),
        ]);
        if (productsRes.status === 'fulfilled') setFeaturedProducts(productsRes.value.data.data || []);
        if (categoriesRes.status === 'fulfilled') setCategories((categoriesRes.value.data.data || []).slice(0, 12));
        if (reviewsRes.status === 'fulfilled') setTopReviews(reviewsRes.value.data.data || []);
        if (bannersRes.status === 'fulfilled') {
          const banners = bannersRes.value.data.data || [];
          setHeroBanners(banners);
          setActiveBannerIndex(0);
        }
      } catch {} finally {
        setIsLoadingProducts(false);
        setIsLoadingCategories(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBannerIndex((i) => (i + 1) % heroBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  const getBannerLink = (banner: Banner): string => {
    if (banner.linkType === 'url') return banner.linkValue || '/shop';
    if (banner.linkType === 'product') return `/shop/${banner.linkValue}`;
    if (banner.linkType === 'artisan') return `/store/${banner.linkValue}`;
    if (banner.linkType === 'category') return `/shop?category=${banner.linkValue}`;
    if (banner.linkType === 'region') return `/shop?region=${banner.linkValue}`;
    if (banner.linkType === 'craft') return `/shop?craft=${banner.linkValue}`;
    if (banner.linkType === 'collection') return `/shop?collection=${banner.linkValue}`;
    return '/shop';
  };

  const activeBanner = heroBanners[activeBannerIndex];

  const heroBannerTextColor = activeBanner?.textColor || '#EDF2FA';

  return (
    <div className="min-h-screen bg-[#EDF2FA] text-[#33415C]">
      {/* ─── HERO ─── */}
      <section className="relative flex min-h-screen items-end overflow-hidden" id="hero">
        <div className="absolute inset-0">
          <img
            key={activeBanner?._id || 'hero-default'}
            src={activeBanner?.mobileImage || activeBanner?.image || HERO_FALLBACK_IMAGE}
            alt={activeBanner?.title || 'Artisan weaving on a traditional loom'}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = HERO_FALLBACK_IMAGE;
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: activeBanner
                ? `${activeBanner.backgroundColor || '#14100B'}${Math.round((activeBanner.overlayOpacity ?? 0.7) * 255)
                    .toString(16)
                    .padStart(2, '0')}`
                : undefined,
            }}
          />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(20,16,11,0.5) 0%, rgba(20,16,11,0.2) 40%, rgba(20,16,11,0.94) 100%), linear-gradient(90deg, rgba(20,16,11,0.55) 0%, rgba(20,16,11,0.15) 45%, rgba(20,16,11,0) 70%)',
          }}
        />
        <div className="absolute inset-0" style={{ backgroundImage: goldPattern(0.1) }} />

        <div className="relative container mx-auto px-4 pb-16 pt-32 md:pb-20">
          {activeBanner ? (
            <motion.div
              key={activeBanner._id + activeBannerIndex}
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="flex max-w-2xl flex-col items-start text-left"
              style={{ color: heroBannerTextColor }}
            >
              <motion.div variants={fadeInUp}>
                <Eyebrow>Handcrafted Heritage</Eyebrow>
              </motion.div>
              <motion.h1
                variants={fadeInUp}
                className="mt-6 font-heading text-3xl leading-tight sm:text-4xl md:text-5xl lg:text-6xl"
                style={{ color: heroBannerTextColor }}
              >
                {activeBanner.title}
                {activeBanner.subtitle && (
                  <em className="mt-2 block italic text-gold-400">{activeBanner.subtitle}</em>
                )}
              </motion.h1>
              {activeBanner.description && (
                <motion.p
                  variants={fadeInUp}
                  className="mt-6 max-w-lg text-lg leading-relaxed"
                  style={{ color: activeBanner.textColor ? undefined : '#EDF2FA' }}
                >
                  {activeBanner.description}
                </motion.p>
              )}
              {(activeBanner.buttonText || !activeBanner.description) && (
                <motion.div variants={fadeInUp} className="mt-9 flex flex-wrap gap-4">
                  {activeBanner.buttonText ? (
                    <Link to={getBannerLink(activeBanner)} className={heroPrimaryBtn}>
                      {activeBanner.buttonText} <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <>
                      <Link to="/shop" className={heroPrimaryBtn}>
                        Shop Handmade Goods <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link to="/seller/apply" className={heroOutlineBtn}>
                        Become an Artisan
                      </Link>
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="flex max-w-3xl flex-col items-start"
            >
              <motion.div variants={fadeInUp}>
                <Eyebrow>Handcrafted Heritage from the Himalayas</Eyebrow>
              </motion.div>
              <motion.h1
                variants={fadeInUp}
                className="mt-6 font-heading text-3xl leading-tight text-[#EDF2FA] sm:text-4xl md:text-5xl lg:text-6xl"
              >
                The Soul of Nepal,
                <br />
                <em className="italic text-gold-400">Woven by Hand</em>
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="mt-7 max-w-xl text-lg leading-relaxed text-[#EDF2FA]/75"
              >
                Discover authentic handcrafted treasures from skilled artisans across Nepal — each
                piece carrying the stories, skills, and heritage of generations.
              </motion.p>
              <motion.div variants={fadeInUp} className="mt-10 flex flex-wrap gap-4">
                <Link to="/shop" className={heroPrimaryBtn}>
                  Shop Handmade Goods <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/seller/apply" className={heroOutlineBtn}>
                  Become an Artisan
                </Link>
              </motion.div>
            </motion.div>
          )}
        </div>

        {heroBanners.length > 1 && (
        <div className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {heroBanners.map((b, i) => (
            <button
              key={b._id}
              onClick={() => setActiveBannerIndex(i)}
              className={`transition-all duration-300 ${
                i === activeBannerIndex ? 'h-2.5 w-10 rounded-full bg-gold-400' : 'h-2.5 w-2.5 rounded-full bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>

    {/* ─── FEATURES ─── */}
      <section id="features" className="bg-[#EDF2FA] py-20 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4"
          >
            {features.map((f) => (
              <motion.div key={f.title} variants={fadeInUp} className="text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-gold-500/30 bg-gold-500/10">
                  <f.icon className="h-7 w-7 text-gold-400" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-[#33415C]">{f.title}</h3>
                <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed text-[#53617E]">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="relative overflow-hidden bg-white py-20 md:py-28">
        <div className="absolute inset-0" style={{ backgroundImage: goldPattern(0.05) }} />
        <div className="relative container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <Eyebrow>Curated Collections</Eyebrow>
                <h2 className="mt-4 font-heading text-4xl text-[#33415C] md:text-5xl">Shop by Category</h2>
              </div>
              <Link
                to="/shop"
                className="group flex items-center gap-1.5 text-sm font-medium tracking-wide text-gold-400 transition-colors hover:text-gold-300"
              >
                View All Collections
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            {isLoadingCategories ? (
              <div className="scrollbar-hide -mx-4 flex gap-6 overflow-x-auto snap-x snap-mandatory px-4 pb-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="w-44 shrink-0 sm:w-64">
                    <div className="aspect-3/4 animate-pulse rounded-t-[999px] rounded-b-2xl bg-[#E3E9F4]" />
                  </div>
                ))}
              </div>
            ) : (
              <motion.div className="scrollbar-hide -mx-4 overflow-x-auto snap-x snap-mandatory px-4 pb-4">
                <div className="flex gap-6">
                  {categories.map((cat) => (
                    <motion.div key={cat._id} variants={fadeInUp} className="w-44 shrink-0 snap-start sm:w-64">
                      <Link
                        to={`/shop?category=${cat.slug}`}
                        className="group relative block aspect-3/4 overflow-hidden rounded-t-[999px] rounded-b-2xl border border-[#DDE4EF] transition-colors duration-300 hover:border-gold-500/50"
                      >
                        <img
                          src={cat.image || categoryImages[cat.slug] || fallbackCategoryImage}
                          alt={cat.name}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-[#1F2937]/85 via-[#1F2937]/20 to-transparent" />
                        <div className="absolute bottom-0 inset-x-0 p-4 text-center">
                          <p className="mb-2 text-gold-400 opacity-0 transition-all duration-300 group-hover:opacity-100">✦</p>
                          <h3 className="font-heading text-lg leading-tight text-[#EDF2FA] transition-colors group-hover:text-gold-300">
                            {cat.name}
                          </h3>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ─── */}
      <section className="bg-[#EDF2FA] py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <Eyebrow>Handpicked by Our Curators</Eyebrow>
                <h2 className="mt-4 font-heading text-4xl text-[#33415C] md:text-5xl">Featured Craft</h2>
              </div>
              <Link
                to="/shop"
                className="group flex items-center gap-1.5 text-sm font-medium tracking-wide text-gold-400 transition-colors hover:text-gold-300"
              >
                View All Pieces
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              className="scrollbar-hide -mx-4 overflow-x-auto snap-x snap-mandatory px-4 pb-4"
            >
              <div className="flex gap-6">
                {isLoadingProducts
                  ? Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)
                  : featuredProducts.map((p) => (
                      <div key={p._id} className="snap-start">
                        <ProductCard product={p} />
                      </div>
                    ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
</section>

      {/* ─── ARTISAN CTA ─── */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80"
          alt="Skilled wood carving"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#14100B]/85" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(20,16,11,0.6), rgba(20,16,11,0.9))' }}
        />
        <div className="absolute inset-0" style={{ backgroundImage: goldPattern(0.1) }} />

        <div className="relative container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div variants={fadeInUp}>
              <Eyebrow centered>For Artisans</Eyebrow>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="mt-5 font-heading text-3xl leading-tight text-[#EDF2FA] md:text-4xl"
            >
              Turn Your Craft Into a <em className="italic text-gold-400">Thriving Business</em>
            </motion.h2>
            <motion.p variants={fadeInUp} className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#EDF2FA]/70">
              Join कलाbazzar and reach customers who treasure authentic handcrafted products. Set up
              your store, manage orders, and grow your artisan business with our support.
            </motion.p>
            <motion.div variants={fadeInUp} className="mt-8 flex flex-wrap justify-center gap-3">
              {['Zero listing fees for your first month', 'Verified artisan badge', 'Marketing support', 'Secure payments'].map(
                (b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-[#EDF2FA]/80"
                  >
                    <span className="text-gold-400">✦</span>
                    {b}
                  </span>
                ),
              )}
            </motion.div>
            <motion.div variants={fadeInUp} className="mt-10 flex flex-wrap justify-center gap-4">
              <Link to="/seller/apply" className={heroPrimaryBtn}>
                Start Selling Today <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/shop" className={heroOutlineBtn}>
                Explore the Marketplace
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-14 text-center">
              <Eyebrow centered>Voices of Our Community</Eyebrow>
              <h2 className="mt-5 font-heading text-4xl text-[#33415C] md:text-5xl">Loved by Customers Everywhere</h2>
              <Ornament />
            </motion.div>
            <div className="grid gap-6 md:grid-cols-3">
              {topReviews.map((r) => {
                const authorName =
                  typeof r.customer === 'object' && r.customer
                    ? `${r.customer.firstName} ${r.customer.lastName}`
                    : 'Verified Customer';
                return (
                  <motion.div key={r._id} variants={fadeInUp}>
                    <div className="relative h-full rounded-2xl border border-[#DDE4EF] bg-white p-7 pt-10 transition-all duration-300 hover:border-gold-500/40">
                      <span className="absolute left-6 top-1 select-none font-heading text-7xl leading-none text-gold-500/30">
                        “
                      </span>
                      <div className="relative">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < r.rating ? 'fill-gold-400 text-gold-400' : 'text-[#E3E9F4]'}`}
                            />
                          ))}
                        </div>
                        <p className="mt-4 leading-relaxed text-[#53617E]">{r.comment}</p>
                        <div className="mt-6 flex items-center gap-3 border-t border-[#EDF1F8] pt-5">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-500/30 bg-gold-500/10 font-heading text-base font-semibold text-gold-600">
                            {authorName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-[#33415C]">{authorName}</p>
                            <p className="text-xs uppercase tracking-widest text-[#8A95AD]">Verified Purchase</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── NEWSLETTER CTA ─── */}
      <section className="relative overflow-hidden bg-[#1A2340] py-20 md:py-24">
        <div className="absolute inset-0" style={{ backgroundImage: goldPattern(0.08) }} />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(120deg, rgba(20,16,11,0.5), rgba(20,16,11,0))' }}
        />
        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mx-auto max-w-2xl"
          >
            <motion.div variants={fadeInUp}>
              <Eyebrow centered>Stay Inspired</Eyebrow>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="mt-5 font-heading text-3xl leading-tight text-[#EDF2FA] md:text-4xl"
            >
              Join the <em className="italic text-gold-400">कलाbazzar</em> Community
            </motion.h2>
            <motion.p variants={fadeInUp} className="mx-auto mt-4 text-lg leading-relaxed text-[#EDF2FA]/70">
              Get curated stories of Nepali artisans, new arrivals, and exclusive offers in your inbox.
              No spam, ever.
            </motion.p>
            <motion.form
              variants={fadeInUp}
              onSubmit={handleNewsletterSubmit}
              className="mx-auto mt-9 flex w-full max-w-lg flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Your email address"
                className="h-12 flex-1 rounded-lg border border-white/15 bg-white/5 px-4 text-[#EDF2FA] placeholder:text-[#EDF2FA]/40 focus:outline-none focus:ring-2 focus:ring-gold-400"
                required
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className={heroPrimaryBtn + ' shrink-0 disabled:opacity-50'}
              >
                Subscribe <Send className="h-4 w-4" />
              </button>
            </motion.form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}