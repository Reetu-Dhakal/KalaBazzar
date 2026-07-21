import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineAdjustments, HiOutlineX, HiOutlineStar, HiOutlineHeart, HiOutlineGrid, HiOutlineList } from 'react-icons/hi';
import ProductCard from '../components/product/ProductCard';
import { Button } from '../components/ui';
import API from '../utils/axios';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
    search: searchParams.get('search') || '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get('/categories');
        setCategories(data.data);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.sort) params.append('sort', filters.sort);
        if (filters.search) params.append('search', filters.search);
        params.append('page', currentPage);
        params.append('limit', '12');

        const { data } = await API.get(`/products?${params}`);
        setProducts(data.data);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters, currentPage]);

  return (
    <div className="min-h-screen pt-24">
      {/* Header */}
      <div className="bg-white border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="font-heading text-4xl md:text-5xl font-semibold text-text mb-2">
                Shop
              </h1>
              <p className="text-text-muted">
                Discover handmade products from Nepali artisans
              </p>
            </div>
            
            {/* View Toggle */}
            <div className="hidden md:flex items-center gap-2 bg-background rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-text-muted'
                }`}
                aria-label="Grid view"
              >
                <HiOutlineGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-text-muted'
                }`}
                aria-label="List view"
              >
                <HiOutlineList className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setCurrentPage(1);
              }}
              className="flex-1 max-w-md px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <Button
              onClick={() => setFiltersOpen(!filtersOpen)}
              variant="outline"
              className="lg:hidden"
              icon={HiOutlineAdjustments}
            >
              Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 shrink-0 ${filtersOpen ? 'fixed inset-0 z-50 lg:relative lg:inset-auto' : 'hidden lg:block'}`}>
            {filtersOpen && (
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm lg:hidden" onClick={() => setFiltersOpen(false)} />
            )}
            <div className={`bg-white rounded-2xl border border-border/50 p-6 ${filtersOpen ? 'h-full overflow-auto relative z-10' : ''}`}>
              {filtersOpen && (
                <div className="flex items-center justify-between mb-6 lg:hidden">
                  <h2 className="font-heading text-xl font-semibold text-text">Filters</h2>
                  <button onClick={() => setFiltersOpen(false)} className="p-2">
                    <HiOutlineX className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => { setFilters({ ...filters, category: '' }); setCurrentPage(1); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      !filters.category ? 'bg-primary/10 text-primary font-medium' : 'text-text-muted hover:bg-background'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => { setFilters({ ...filters, category: cat.slug }); setCurrentPage(1); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        filters.category === cat.slug ? 'bg-primary/10 text-primary font-medium' : 'text-text-muted hover:bg-background'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-4">Price Range</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => { setFilters({ ...filters, minPrice: e.target.value }); setCurrentPage(1); }}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => { setFilters({ ...filters, maxPrice: e.target.value }); setCurrentPage(1); }}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-4">Sort By</h3>
                <select
                  value={filters.sort}
                  onChange={(e) => { setFilters({ ...filters, sort: e.target.value }); setCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-2xl mb-4" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                  {products.map((product, index) => (
                    <ProductCard key={product._id} product={product} index={index} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <Button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          currentPage === i + 1
                            ? 'bg-primary text-white'
                            : 'bg-white text-text hover:bg-background'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <Button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-text-muted mb-4 text-lg">No products found</p>
                <p className="text-sm text-text-muted">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;