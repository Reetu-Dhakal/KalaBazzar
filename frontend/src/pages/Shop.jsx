import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineAdjustments, HiOutlineX, HiOutlineStar, HiOutlineHeart } from 'react-icons/hi';
import API from '../utils/axios';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
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
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold">Shop</h1>
              <p className="text-sm text-text-muted mt-1">Discover handmade products from Nepali artisans</p>
            </div>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm"
            >
              <HiOutlineAdjustments className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Search */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full max-w-md px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary bg-background"
            />
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 shrink-0 ${filtersOpen ? 'fixed inset-0 z-50 lg:relative lg:inset-auto' : 'hidden lg:block'}`}>
            <div className={`bg-white rounded-xl p-6 ${filtersOpen ? 'h-full overflow-auto' : ''}`}>
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="font-heading font-semibold">Filters</h3>
                <button onClick={() => setFiltersOpen(false)}>
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>

              {/* Category */}
              <div className="mb-6">
                <h4 className="font-medium text-sm mb-3">Category</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => { setFilters({ ...filters, category: '' }); setCurrentPage(1); }}
                    className={`block text-sm w-full text-left px-3 py-1.5 rounded-lg transition-colors ${!filters.category ? 'bg-primary text-white' : 'text-text-muted hover:bg-background'}`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => { setFilters({ ...filters, category: cat.slug }); setCurrentPage(1); }}
                      className={`block text-sm w-full text-left px-3 py-1.5 rounded-lg transition-colors ${filters.category === cat.slug ? 'bg-primary text-white' : 'text-text-muted hover:bg-background'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-sm mb-3">Price Range</h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => { setFilters({ ...filters, minPrice: e.target.value }); setCurrentPage(1); }}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary bg-background"
                  />
                  <span className="text-text-muted self-center">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => { setFilters({ ...filters, maxPrice: e.target.value }); setCurrentPage(1); }}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary bg-background"
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <h4 className="font-medium text-sm mb-3">Sort By</h4>
                <select
                  value={filters.sort}
                  onChange={(e) => { setFilters({ ...filters, sort: e.target.value }); setCurrentPage(1); }}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary bg-background"
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-text-muted">No products found.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {products.map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
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
                              <span className="text-xs text-text-muted">{product.rating?.toFixed(1)} ({product.numReviews} reviews)</span>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-lg font-heading font-bold text-primary">Rs. {product.price?.toLocaleString()}</span>
                              <span className="text-xs text-text-muted">{product.district}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                          currentPage === i + 1
                            ? 'bg-primary text-white'
                            : 'bg-white text-text-muted hover:bg-background border border-border'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;