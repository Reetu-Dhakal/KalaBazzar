import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { ProductGridSkeleton } from '../components/ui/ProductSkeleton';
import { ArrowRight, Star, Shield, Truck, Heart, Leaf, Clock, Quote } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import usePageTitle from '../hooks/usePageTitle';

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

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { items: recentlyViewed } = useRecentlyViewed();
  usePageTitle('Handcrafted Treasures from Nepal', 'Discover authentic handmade crafts from Nepal\'s finest artisans. Shop traditional and contemporary crafts at Kala Bazaar.');
  useEffect(() => {
    Promise.all([
      api.get('/products/featured'),
      api.get('/categories'),
    ]).then(([productsRes, categoriesRes]) => {
      setFeaturedProducts(productsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
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
              <Link to="/seller/apply">
                <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10">
                  Become an Artisan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

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

      {categories.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Shop by Category</h2>
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
                      {cat.children?.length > 0 && (
                        <p className="text-white/70 text-sm">{cat.children.length} subcategories</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
                <Link key={product._id} to={`/product/${product._id}`} className="group">
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                    <div className="aspect-square overflow-hidden bg-gray-50 relative">
                      <img loading="lazy" src={product.images?.[0]?.url || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {product.stock <= 5 && !product.comparePrice && (
                        <Badge variant="warning" className="absolute top-3 left-3">Low Stock</Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      {product.seller?._id && (
                        <Link to={`/store/${product.seller._id}`} onClick={(e) => e.stopPropagation()} className="text-xs text-text-muted uppercase tracking-wider hover:text-primary block mb-0.5">{product.seller?.name}</Link>
                      )}
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
          {featuredProducts.length > 0 && (
            <div className="text-center mt-8 sm:hidden">
              <Link to="/shop"><Button variant="outline">View All Products</Button></Link>
            </div>
          )}
        </div>
      </section>

      {recentlyViewed.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-8">
              <Clock size={22} className="text-primary" />
              <h2 className="text-2xl md:text-3xl font-heading font-bold">Recently Viewed</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recentlyViewed.slice(0, 6).map((item) => (
                <Link key={item._id} to={`/product/${item._id}`} className="group">
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

      <section className="py-16 bg-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Join Our Artisan Community</h2>
          <p className="text-text-secondary max-w-2xl mx-auto mb-8">
            Are you a skilled artisan? Showcase your crafts to thousands of customers who value authentic handmade products.
          </p>
          <Link to="/seller/apply">
            <Button size="xl" variant="default">Apply as a Seller</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
