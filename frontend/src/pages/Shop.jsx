import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import usePageTitle from '../hooks/usePageTitle';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProductGridSkeleton } from '../components/ui/ProductSkeleton';
import { Star, Search, Heart, SlidersHorizontal, MapPin, LayoutGrid, List } from 'lucide-react';
import QuickViewModal from '../components/layout/QuickViewModal';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export default function Shop() {
  usePageTitle('Shop Handcrafted Products', 'Browse our curated collection of authentic handmade products from verified Nepali artisans. Find unique crafts, textiles, pottery, and more.');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [sort, setSort] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [pagination, setPagination] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const searchRef = useRef(null);

  const handleQuickView = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(product);
  };
  const suggestTimer = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (search.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    clearTimeout(suggestTimer.current);
    suggestTimer.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/products/published?search=${encodeURIComponent(search)}&limit=5`);
        setSuggestions(data.data.products || []);
        setShowSuggestions(true);
      } catch { setSuggestions([]); }
    }, 300);
    return () => clearTimeout(suggestTimer.current);
  }, [search]);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.data)).catch(() => {});
    api.get('/regions').then(({ data }) => setRegions(data.data)).catch(() => {});
  }, []);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12, sort });
      if (search) params.set('search', search);
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedRegion) params.set('region', selectedRegion);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      const { data } = await api.get(`/products/published?${params}`);
      setProducts(data.data.products);
      setPagination(data.data.pagination);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, [selectedCategory, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(1);
  };

  const handleWishlistClick = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/login?redirect=/shop'); return; }
    await toggleWishlist(productId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">Shop</h1>
        <p className="text-text-secondary">Discover authentic handmade crafts from Nepal's finest artisans</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md" ref={searchRef}>
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} onFocus={() => suggestions.length > 0 && setShowSuggestions(true)} className="pl-9" />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
                {suggestions.map((s) => (
                  <Link key={s._id} to={`/product/${s._id}`} onClick={() => setShowSuggestions(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded bg-gray-50 overflow-hidden flex-shrink-0">
                      <img loading="lazy" src={s.images?.[0]?.url || '/placeholder.svg'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium line-clamp-1">{s.name}</p>
                      <p className="text-xs text-text-muted">Rs. {s.price?.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-text-muted" />
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="border rounded-md px-3 py-2 text-sm bg-white">
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="popular">Most Popular</option>
            </select>
            <div className="flex border rounded-md overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-text-muted hover:bg-gray-50'}`} title="Grid view">
                <LayoutGrid size={16} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-text-muted hover:bg-gray-50'}`} title="List view">
                <List size={16} />
              </button>
            </div>
          </div>
      </div>

      {categories.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2 font-medium">Category</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSelectedCategory('')} className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${!selectedCategory ? 'bg-primary text-white border-primary' : 'bg-white border-gray-300 hover:border-primary'}`}>All</button>
            {categories.map((cat) => (
              <button key={cat._id} onClick={() => setSelectedCategory(cat._id)} className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${selectedCategory === cat._id ? 'bg-primary text-white border-primary' : 'bg-white border-gray-300 hover:border-primary'}`}>
                {cat.name}{cat.productCount !== undefined ? ` (${cat.productCount})` : ''}
              </button>
            ))}
          </div>
        </div>
      )}
      {regions.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2 font-medium flex items-center gap-1"><MapPin size={12} /> Region</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSelectedRegion('')} className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${!selectedRegion ? 'bg-primary text-white border-primary' : 'bg-white border-gray-300 hover:border-primary'}`}>All</button>
            {regions.map((r) => (
              <button key={r._id} onClick={() => setSelectedRegion(r._id)} className={`px-3 py-1.5 rounded-full text-sm border transition-colors flex items-center gap-1 ${selectedRegion === r._id ? 'bg-primary text-white border-primary' : 'bg-white border-gray-300 hover:border-primary'}`}>
                {r.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <p className="text-xs text-text-muted uppercase tracking-wider mb-2 font-medium">Price Range</p>
        <div className="flex items-center gap-2">
          <Input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-24 text-sm" min={0} />
          <span className="text-text-muted">—</span>
          <Input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-24 text-sm" min={0} />
          <Button size="sm" variant="outline" onClick={() => { setMinPrice(''); setMaxPrice(''); fetchProducts(1); }}>Clear</Button>
        </div>
      </div>

          {loading ? (
        <ProductGridSkeleton count={12} />
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-secondary text-lg">No products found</p>
          {(search || selectedCategory) && (
            <Button variant="outline" className="mt-4" onClick={() => { setSearch(''); setSelectedCategory(''); }}>Clear Filters</Button>
          )}
        </div>
      ) : (
        <>
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'space-y-4'}>
            {products.map((product) => (
              viewMode === 'grid' ? (
                <Link key={product._id} to={`/product/${product.slug || product._id}`} className="group">
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      <img loading="lazy" src={product.images?.[0]?.url || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <button onClick={(e) => handleWishlistClick(e, product._id)} className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors shadow opacity-0 group-hover:opacity-100">
                        <Heart size={16} className={isInWishlist(product._id) ? 'fill-primary text-primary' : 'text-gray-600'} />
                      </button>
                      {product.comparePrice ? (
                        <Badge variant="danger" className="absolute top-3 left-3">-{Math.round((1 - product.price / product.comparePrice) * 100)}%</Badge>
                      ) : product.stock === 0 ? (
                        <Badge variant="danger" className="absolute top-3 left-3">Out of Stock</Badge>
                      ) : product.stock <= 5 ? (
                        <Badge variant="warning" className="absolute top-3 left-3">Low Stock</Badge>
                      ) : null}
                      <button onClick={(e) => handleQuickView(e, product)} className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 text-xs font-semibold px-4 py-1.5 rounded-full shadow hover:bg-white opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
                        Quick View
                      </button>
                      </div>
                    <CardContent className="p-4">
                      {product.seller?._id ? (
                        <Link to={`/artisan/${product.seller._id}`} onClick={(e) => e.stopPropagation()} className="text-xs text-text-muted uppercase tracking-wider mb-1 hover:text-primary block">{product.seller?.name}</Link>
                      ) : (<p className="text-xs text-text-muted uppercase tracking-wider mb-1">Artisan</p>)}
                      <h3 className="font-heading font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        <Star size={14} className="fill-secondary text-secondary" />
                        <span className="text-sm font-medium">{product.rating}</span>
                        <span className="text-text-muted text-sm">({product.numReviews})</span>
                        {product.numSold > 0 && <span className="text-text-muted text-sm ml-2">· {product.numSold} sold</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">Rs. {product.price?.toLocaleString()}</span>
                        {product.comparePrice && <span className="text-sm text-text-muted line-through">Rs. {product.comparePrice?.toLocaleString()}</span>}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Card key={product._id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <Link to={`/product/${product.slug || product._id}`} className="flex gap-4 p-3">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                      <img loading="lazy" src={product.images?.[0]?.url || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {product.seller?._id && <p className="text-xs text-text-muted">{product.seller?.name}</p>}
                          <h3 className="font-heading font-semibold line-clamp-1">{product.name}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <Star size={12} className="fill-secondary text-secondary" />
                            <span className="text-xs font-medium">{product.rating}</span>
                            <span className="text-xs text-text-muted">({product.numReviews})</span>
                            {product.numSold > 0 && <span className="text-xs text-text-muted ml-1">· {product.numSold} sold</span>}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-primary">Rs. {product.price?.toLocaleString()}</p>
                          {product.comparePrice && <p className="text-xs text-text-muted line-through">Rs. {product.comparePrice?.toLocaleString()}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {product.comparePrice ? (
                          <Badge variant="danger" className="text-xs">-{Math.round((1 - product.price / product.comparePrice) * 100)}%</Badge>
                        ) : product.stock <= 5 ? (
                          <Badge variant="warning" className="text-xs">Low Stock</Badge>
                        ) : null}
                        <button onClick={(e) => { e.preventDefault(); handleWishlistClick(e, product._id); }} className="ml-auto p-1.5 hover:bg-gray-100 rounded-full">
                          <Heart size={14} className={isInWishlist(product._id) ? 'fill-primary text-primary' : 'text-gray-400'} />
                        </button>
                      </div>
                    </div>
                  </Link>
                </Card>
              )
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <Button key={p} variant={p === pagination.page ? 'default' : 'outline'} size="sm" onClick={() => fetchProducts(p)}>
                  {p}
                </Button>
              ))}
            </div>
          )}
        </>
      )}

      {quickViewProduct && <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />}
    </div>
  );
}
