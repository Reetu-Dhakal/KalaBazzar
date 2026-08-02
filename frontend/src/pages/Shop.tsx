import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronRight,
  PackageSearch,
} from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProductCard } from '@/components/ProductCard';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/api';
import type { Product, Category, Craft, Region, PaginationMeta } from '@/types';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

const LIMIT = 12;

function ShopSkeleton() {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="aspect-square rounded-xl" />
            <div className="mt-3 space-y-2">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Shop() {
  usePageTitle();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const craft = searchParams.get('craft') || '';
  const region = searchParams.get('region') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'newest';

  const updateParams = useCallback(
    (key: string, value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
        if (key !== 'page') next.set('page', '1');
        return next;
      });
    },
    [setSearchParams],
  );

  const clearAllFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
    setSearchInput('');
  }, [setSearchParams]);

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories?includeProductCount=true');
      return data.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: craftsData, isLoading: isLoadingCrafts } = useQuery({
    queryKey: ['crafts'],
    queryFn: async () => {
      const { data } = await api.get('/crafts');
      return data.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: regionsData, isLoading: isLoadingRegions } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const { data } = await api.get('/regions');
      return data.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const productsQuery = useQuery({
    queryKey: ['products', { page, search, category, craft, region, minPrice, maxPrice, sort }],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(LIMIT),
        sort,
      };
      if (search) params.search = search;
      if (category) params.category = category;
      if (craft) params.craft = craft;
      if (region) params.region = region;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const { data } = await api.get('/products', { params });
      return {
        products: data.data || [],
        pagination: data.meta?.pagination as PaginationMeta,
      };
    },
    placeholderData: (prev) => prev,
  });

  const products = productsQuery.data?.products || [];
  const pagination = productsQuery.data?.pagination;

  const categories: Category[] = categoriesData || [];
  const crafts: Craft[] = craftsData || [];
  const regions: Region[] = regionsData || [];

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    if (category) count++;
    if (craft) count++;
    if (region) count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    return count;
  }, [search, category, craft, region, minPrice, maxPrice]);

  const getCategoryLabel = (slug: string) =>
    categories.find((c) => c.slug === slug)?.name || slug;
  const getCraftLabel = (slug: string) =>
    crafts.find((c) => c.slug === slug)?.name || slug;
  const getRegionLabel = (slug: string) =>
    regions.find((r) => r.slug === slug)?.name || slug;

  useEffect(() => {
    if (searchInput === search) return;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      updateParams('search', searchInput.trim());
    }, 300);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchInput, search, updateParams]);

  const totalPages = pagination?.totalPages || 1;

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-sm font-semibold text-foreground mb-3">Category</h3>
        <div className="space-y-1.5">
          {isLoadingCategories
            ? Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))
            : categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => updateParams('category', cat.slug === category ? '' : cat.slug)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                    category === cat.slug
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {cat.productCount > 0 && (
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">
                      ({cat.productCount})
                    </span>
                  )}
                </button>
              ))}
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="font-heading text-sm font-semibold text-foreground mb-3">Craft</h3>
        <div className="space-y-1.5">
          {isLoadingCrafts
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))
            : crafts.map((c) => (
                <button
                  key={c._id}
                  onClick={() => updateParams('craft', c.slug === craft ? '' : c.slug)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                    craft === c.slug
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="font-heading text-sm font-semibold text-foreground mb-3">Region</h3>
        <div className="space-y-1.5">
          {isLoadingRegions
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))
            : regions.map((r) => (
                <button
                  key={r._id}
                  onClick={() => updateParams('region', r.slug === region ? '' : r.slug)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                    region === r.slug
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                  }`}
                >
                  <span className="truncate">{r.name}</span>
                </button>
              ))}
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="font-heading text-sm font-semibold text-foreground mb-3">Price Range</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => updateParams('minPrice', e.target.value)}
            className="h-9 text-xs"
            min="0"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => updateParams('maxPrice', e.target.value)}
            className="h-9 text-xs"
            min="0"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Shop</span>
          </nav>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-heading text-foreground">Shop</h1>
            <p className="text-muted-foreground mt-1">
              {pagination
                ? `Showing ${products.length} of ${pagination.total} products`
                : 'Browse our collection'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-border/60 bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput('');
                    updateParams('search', '');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <select
              value={sort}
              onChange={(e) => updateParams('sort', e.target.value)}
              className="h-10 px-3 rounded-lg border border-border/60 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none cursor-pointer min-w-35"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="icon"
              className="lg:hidden"
              onClick={() => setShowMobileFilters(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {search && (
              <Badge variant="secondary" className="gap-1">
                Search: {search}
                <button onClick={() => { setSearchInput(''); updateParams('search', ''); }}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {category && (
              <Badge variant="secondary" className="gap-1">
                {getCategoryLabel(category)}
                <button onClick={() => updateParams('category', '')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {craft && (
              <Badge variant="secondary" className="gap-1">
                {getCraftLabel(craft)}
                <button onClick={() => updateParams('craft', '')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {region && (
              <Badge variant="secondary" className="gap-1">
                {getRegionLabel(region)}
                <button onClick={() => updateParams('region', '')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(minPrice || maxPrice) && (
              <Badge variant="secondary" className="gap-1">
                {minPrice && maxPrice
                  ? `${formatCurrency(Number(minPrice))} – ${formatCurrency(Number(maxPrice))}`
                  : minPrice
                  ? `From ${formatCurrency(Number(minPrice))}`
                  : `Up to ${formatCurrency(Number(maxPrice))}`}
                <button onClick={() => { updateParams('minPrice', ''); updateParams('maxPrice', ''); }}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs text-primary hover:underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-lg font-semibold text-foreground">Filters</h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-primary hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <FilterContent />
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {productsQuery.isLoading ? (
              <ShopSkeleton />
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <PackageSearch className="h-16 w-16 text-muted-foreground/40 mb-4" />
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-2">
                  No products found
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  We couldn't find any products matching your current filters. Try adjusting your search or clearing filters.
                </p>
                <Button onClick={clearAllFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product: Product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrev}
                  onClick={() => updateParams('page', String(page - 1))}
                >
                  Previous
                </Button>
                {pageNumbers.map((num, i) =>
                  num === '...' ? (
                    <span key={`dots-${i}`} className="px-2 text-muted-foreground">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={num}
                      variant={num === page ? 'primary' : 'outline'}
                      size="sm"
                      className="min-w-9"
                      onClick={() => updateParams('page', String(num))}
                    >
                      {num}
                    </Button>
                  ),
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNext}
                  onClick={() => updateParams('page', String(page + 1))}
                >
                  Next
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {showMobileFilters && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-card shadow-xl lg:hidden overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-1.5 rounded-lg hover:bg-accent transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <FilterContent />
              <div className="mt-6 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { clearAllFilters(); setShowMobileFilters(false); }}
                >
                  Clear All
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setShowMobileFilters(false)}
                >
                  Show Results
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
