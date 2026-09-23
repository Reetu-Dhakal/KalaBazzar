import { useCallback, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronDown,
  PackageSearch,
  Store,
} from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProductCard } from '@/components/ProductCard';
import { Footer } from '@/components/layout/Footer';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import type { Product, Category, PaginationMeta } from '@/types';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

const LIMIT = 100;

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
  const [shopByCategoryOpen, setShopByCategoryOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

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
  }, [setSearchParams]);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories?includeProductCount=true');
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

  const groupedByCategory = useMemo(() => {
    if (category || search || craft || region || minPrice || maxPrice) {
      return null;
    }
    const map = new Map<string, { categoryName: string; items: Product[] }>();
    for (const p of products) {
      const categoryValue = typeof p.category === 'object' && p.category ? p.category : null;
      const key = categoryValue ? categoryValue._id : String(p.category || 'featured');
      const categoryName = categoryValue?.name
        || categories.find((item) => item.slug === String(p.category || ''))?.name
        || 'Featured collection';
      if (!map.has(key)) map.set(key, { categoryName, items: [] });
      map.get(key)!.items.push(p);
    }
    return Array.from(map.values());
  }, [products, category, search, craft, region, minPrice, maxPrice, categories]);

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

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-5 sm:py-8">
        <div className="relative mb-5 overflow-hidden border border-[#D9B45B]/70 bg-[#4A1018]">
          <img
            src="/festival-banner.jpg"
            alt="Festive artisan marketplace"
            className="h-[clamp(9rem,18vw,14rem)] w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#4A1018]/45" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="mx-auto flex max-w-2xl flex-col items-center px-6 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#F5D88A] sm:text-xs">
                ✦ Handcrafted Heritage
              </p>
              <h2 className="mt-1.5 font-heading text-xl font-bold leading-tight text-[#FFF7E6] sm:text-3xl md:text-4xl">
                Festive Artisan Collection
                <em className="mt-1 block text-base italic text-[#E3C36F] sm:text-lg">Celebrating Nepal&apos;s artisans</em>
              </h2>
              <p className="mt-1 hidden text-xs text-[#F8E7C1]/90 sm:block sm:text-sm">
                Authentic handmade crafts for your festive home — every piece carries a story.
              </p>
              <Link
                to="/offers"
                className="mt-3 inline-flex items-center gap-2 rounded-md bg-[#C9972F] px-4 py-2 text-xs font-semibold text-[#4A1018] transition-colors hover:bg-[#D9B45B] sm:text-sm"
              >
                Shop Handmade Goods →
              </Link>
            </div>
          </div>
        </div>
        <div className="mb-5 flex flex-col gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">Handmade marketplace</p>
            <div className="relative mt-2 inline-block">
              <button
                type="button"
                onClick={() => setShopByCategoryOpen((o) => !o)}
                aria-expanded={shopByCategoryOpen}
                className="flex h-11 w-60 cursor-pointer items-center justify-between rounded-md border border-border/70 bg-card px-4 text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                Shop by Category
                <ChevronDown
                  className={cn('h-4 w-4 text-muted-foreground transition-transform', shopByCategoryOpen && 'rotate-180')}
                />
              </button>
              {shopByCategoryOpen && (
                <div className="absolute left-0 top-full z-20 mt-2 max-h-[60vh] w-60 overflow-y-auto rounded-md border border-border bg-card py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      updateParams('category', '');
                      setShopByCategoryOpen(false);
                    }}
                    className="block w-full cursor-pointer px-4 py-2 text-left text-sm font-semibold text-foreground transition-colors hover:bg-surface-hover"
                  >
                    All products
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => {
                        updateParams('category', cat.slug);
                        setShopByCategoryOpen(false);
                      }}
                      className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-foreground/80 transition-colors hover:bg-surface-hover hover:text-foreground"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
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

          </div>
        </div>

        <main>
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
              groupedByCategory ? (
                <div className="space-y-9">
                  {groupedByCategory.map((group) => (
                    <div key={group.categoryName}>
                      <div className="mb-3 flex items-center justify-between gap-3 bg-[#F3F3F3] px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                        <Store className="h-4 w-4 text-primary" />
                          <h2 className="truncate text-sm font-semibold uppercase tracking-[0.08em] text-foreground">{group.categoryName}</h2>
                          <span className="shrink-0 text-xs text-muted-foreground">{group.items.length} items</span>
                        </div>
                        <div className="hidden shrink-0 items-center gap-5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:flex">
                          <button onClick={() => updateParams('sort', 'popular')} className="hover:text-primary">Best selling</button>
                          <button onClick={() => updateParams('sort', 'newest')} className="hover:text-primary">New collection</button>
                          <button onClick={() => updateParams('sort', 'rating')} className="hover:text-primary">Top rated</button>
                          <button onClick={() => updateParams('category', group.categoryName)} className="hover:text-primary">View all</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {group.items.map((product: Product) => (
                          <ProductCard key={product._id} product={product} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {products.map((product: Product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )
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
      <Footer className="shop-footer" />
    </div>
  );
}
