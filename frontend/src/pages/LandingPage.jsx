import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { ProductGridSkeleton } from '../components/ui/ProductSkeleton';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { ArrowRight, Star, Shield, Truck, Heart, Leaf, Clock, Quote, Users, Mail, MapPin, Phone, Send, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';

const testimonials = [
  { name: 'Anita Sharma', location: 'Kathmandu', text: 'I found the most beautiful pashmina shawl here. The quality is exceptional and it arrived in just 3 days!', rating: 5, avatar: 'AS' },
  { name: 'Rajesh Gurung', location: 'Pokhara', text: 'Being able to buy directly from the artisans means I get authentic products at fair prices. Highly recommend!', rating: 5, avatar: 'RG' },
  { name: 'Maya Bajracharya', location: 'Lalitpur', text: 'The handmade pottery I ordered exceeded my expectations. Each piece is truly unique and crafted with love.', rating: 5, avatar: 'MB' },
  { name: 'Prakash Adhikari', location: 'Biratnagar', text: 'I ordered a wooden statue for my office and it is absolutely stunning. Will definitely be buying more!', rating: 5, avatar: 'PA' },
];

const features = [
  { icon: Shield, title: 'Verified Artisans', desc: 'Every seller is personally verified by our team' },
  { icon: Heart, title: 'Authentic Crafts', desc: 'Directly from Nepal\'s master artisans' },
  { icon: Truck, title: 'Nationwide Delivery', desc: 'Free shipping on orders over Rs. 2,000' },
  { icon: Leaf, title: 'Eco-friendly', desc: 'Sustainable materials and traditional techniques' },
];

const stats = [
  { label: 'Active Artisans', value: '500+' },
  { label: 'Handcrafted Products', value: '10,000+' },
  { label: 'Districts Covered', value: '50+' },
  { label: 'Happy Customers', value: '25,000+' },
];

const values = [
  { icon: Shield, title: 'Authenticity', desc: 'Every artisan is personally verified to ensure genuine Nepali craftsmanship' },
  { icon: Heart, title: 'Fair Trade', desc: 'Artisans set their own prices and receive fair compensation for their work' },
  { icon: Leaf, title: 'Sustainability', desc: 'We promote eco-friendly materials and traditional techniques that protect our planet' },
  { icon: Users, title: 'Community', desc: 'Building a vibrant community of artisans, collectors, and craft enthusiasts' },
];

const contactInfo = [
  { icon: MapPin, label: 'Address', value: 'Kathmandu, Nepal' },
  { icon: Phone, label: 'Phone', value: '+977-1-4XXXXXX' },
  { icon: Mail, label: 'Email', value: 'hello@kalabazaar.com' },
  { icon: Clock, label: 'Hours', value: 'Sun-Fri, 9:00 AM - 6:00 PM' },
];

export default function LandingPage() {
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const { items: recentlyViewed } = useRecentlyViewed();
  usePageTitle('Handcrafted Treasures from Nepal', 'Discover authentic handmade crafts from Nepal\'s finest artisans. Shop traditional and contemporary crafts at Kala Bazaar.');

  useEffect(() => {
    Promise.all([
      api.get('/products/featured'),
      api.get('/categories'),
    ]).then(([productsRes, categoriesRes]) => {
      const products = productsRes.data.data || [];
      setFeaturedProducts(products);
      setCategories(categoriesRes.data.data || []);
      const seen = new Set();
      const uniqueArtisans = products
        .filter((p) => p.seller?._id && !seen.has(p.seller._id) && seen.add(p.seller._id))
        .map((p) => p.seller)
        .slice(0, 4);
      setArtisans(uniqueArtisans);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Message sent! We will get back to you soon.');
    setContactForm({ name: '', email: '', subject: '', message: '' });
    setSending(false);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary via-primary-800 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold leading-tight mb-6">
              Discover Nepal's
              <span className="text-secondary block">Finest Handmade Crafts</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl leading-relaxed">
              Connect directly with master artisans across Nepal. Each piece tells a story of tradition, skill, and cultural heritage passed down through generations.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop">
                <Button size="xl" className="bg-secondary text-primary hover:bg-secondary/90 font-semibold">
                  Explore Collection <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link to={user ? '/seller/apply' : '/seller/register'}>
                <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10">
                  Become an Artisan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">Our Story</h2>
          <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
            Kala Bazaar was born from a simple vision — to connect the world with Nepal's extraordinary heritage of handmade craftsmanship and ensure that the artisans who preserve these traditions thrive.
          </p>
        </div>
      </section>

      <section className="py-12 bg-surface">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl md:text-4xl font-heading font-bold text-primary mb-1">{s.value}</p>
                <p className="text-text-secondary text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-surface">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center mb-4">What We Stand For</h2>
          <p className="text-text-secondary text-center mb-12 max-w-xl mx-auto">Our commitment to preserving Nepal's craft heritage</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((v) => (
              <div key={v.title} className="flex gap-4 bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0">
                  <v.icon size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg mb-1">{v.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Handpicked Collections / Categories */}
      {categories.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Handpicked Collections</h2>
              <p className="text-text-secondary max-w-2xl mx-auto">Explore our diverse range of traditional crafts from every corner of Nepal</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.slice(0, 10).map((cat) => (
                <Link key={cat._id} to={`/category/${cat.slug}`} className="group">
                  <div className="relative overflow-hidden rounded-xl aspect-square bg-gradient-to-br from-secondary/20 to-primary/10">
                    {cat.image?.url ? (
                      <img loading="lazy" src={cat.image.url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl">{cat.icon || '🏺'}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-heading font-semibold text-lg">{cat.name}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-2">Featured Products</h2>
              <p className="text-text-secondary">Handpicked treasures from our finest artisans</p>
            </div>
            <Link to="/shop" className="hidden sm:inline-flex items-center gap-1 text-primary font-medium hover:underline">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          {loading ? <ProductGridSkeleton count={4} /> : featuredProducts.length === 0 ? null : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link key={product._id} to={`/product/${product.slug || product._id}`} className="group">
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                    <div className="aspect-square overflow-hidden bg-gray-50 relative">
                      <img loading="lazy" src={product.images?.[0]?.url || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {product.stock <= 5 && (
                        <Badge variant="warning" className="absolute top-3 left-3">Low Stock</Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-heading font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        <Star size={14} className="fill-secondary text-secondary" />
                        <span className="text-sm font-medium">{product.rating}</span>
                        <span className="text-text-muted text-sm">({product.numReviews})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">Rs. {product.price?.toLocaleString()}</span>
                        {product.comparePrice && (
                          <span className="text-sm text-text-muted line-through">Rs. {product.comparePrice?.toLocaleString()}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Meet Our Artisans */}
      {artisans.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Meet Our Artisans</h2>
              <p className="text-text-secondary max-w-2xl mx-auto">Talented craftspeople preserving Nepal's rich cultural heritage through their work</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {artisans.map((artisan) => (
                <Link key={artisan._id} to={`/artisan/${artisan._id}`} className="group text-center">
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-primary/10 flex items-center justify-center">
                    {artisan.avatar?.url ? (
                      <img loading="lazy" src={artisan.avatar.url} alt={artisan.name} className="w-full h-full object-cover" />
                    ) : (
                      <Store size={36} className="text-primary" />
                    )}
                  </div>
                  <h3 className="font-heading font-semibold text-lg group-hover:text-primary">{artisan.name}</h3>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/shop">
                <Button variant="outline">Explore All Artisans <ArrowRight size={16} className="ml-2" /></Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-8">
              <Clock size={22} className="text-primary" />
              <h2 className="text-2xl md:text-3xl font-heading font-bold">Recently Viewed</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recentlyViewed.slice(0, 6).map((item) => (
                <Link key={item._id} to={`/product/${item.slug || item._id}`} className="group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-50 mb-2">
                    <img loading="lazy" src={item.image || '/placeholder.svg'} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <p className="text-sm font-heading font-medium line-clamp-2 group-hover:text-primary">{item.name}</p>
                  <p className="text-sm font-bold text-primary">Rs. {item.price?.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Band */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/5 mb-4">
                  <feature.icon className="text-primary" size={28} />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-text-secondary text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">What Our Customers Say</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">Hear from people who've discovered authentic Nepali crafts</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-gray-50 rounded-xl p-6 relative">
                <Quote size={24} className="text-secondary/30 absolute top-4 right-4" />
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }, (_, i) => <Star key={i} size={14} className="fill-secondary text-secondary" />)}
                </div>
                <p className="text-sm text-text-secondary mb-4 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">{t.avatar}</div>
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-text-muted">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Become an Artisan */}
      <section className="py-16 bg-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Join Our Artisan Community</h2>
          <p className="text-text-secondary max-w-2xl mx-auto mb-8">
            Are you a skilled artisan? Showcase your crafts to thousands of customers who value authentic handmade products.
          </p>
          <Link to={user ? '/seller/apply' : '/seller/register'}>
            <Button size="xl" variant="default">Apply as a Seller</Button>
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white" id="contact">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Get in Touch</h2>
            <p className="text-text-secondary max-w-xl mx-auto">Have a question, suggestion, or just want to say hello? We'd love to hear from you.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-heading font-semibold text-lg mb-4">Send a Message</h3>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Name *</label>
                        <Input value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email *</label>
                        <Input type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Subject</label>
                      <Input value={contactForm.subject} onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Message *</label>
                      <textarea value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} required rows={5} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                    </div>
                    <Button type="submit" disabled={sending}>
                      <Send size={16} className="mr-2" /> {sending ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              {contactInfo.map((item) => (
                <Card key={item.label}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0">
                      <item.icon size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-text-muted">{item.label}</p>
                      <p className="font-medium text-sm">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
