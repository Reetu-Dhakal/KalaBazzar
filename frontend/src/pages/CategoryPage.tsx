import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  PackageSearch,
} from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProductCard } from '@/components/ProductCard';
import api from '@/lib/api';
import type { Category, Product } from '@/types';

function CategorySkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-4 w-48 mb-6" />
      <Skeleton className="h-10 w-64 mb-2" />
      <Skeleton className="h-5 w-96 mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="aspect-square rounded-xl" />
            <div className="mt-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: categoryData, isLoading: isLoadingCategory, error: categoryError } = useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      const { data } = await api.get(`/categories/slug/${slug}`);
      return data.data as Category;
    },
    enabled: !!slug,
  });

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['categoryProducts', slug],
    queryFn: async () => {
      const { data } = await api.get('/products', {
        params: { category: slug, limit: 24, sort: 'newest' },
      });
      return (data.data.products || []) as Product[];
    },
    enabled: !!slug,
  });

  usePageTitle(
    categoryData ? `${categoryData.name} — KalaBazzar` : undefined,
    categoryData?.description || categoryData?.seo?.description,
  );

  if (isLoadingCategory) return <CategorySkeleton />;

  if (categoryError || !categoryData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-heading text-primary mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-2">Category not found</p>
          <p className="text-muted-foreground mb-8">
            The category you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/shop">Browse All Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">{categoryData.name}</span>
        </nav>

        <div className="mb-8">
          {categoryData.image && (
            <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-6">
              <img
                src={categoryData.image}
                alt={categoryData.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h1 className="font-heading text-3xl md:text-4xl font-semibold text-white">
                  {categoryData.name}
                </h1>
                {categoryData.productCount > 0 && (
                  <p className="text-white/80 text-sm mt-1">
                    {categoryData.productCount} product{categoryData.productCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          )}

          {!categoryData.image && (
            <>
              <h1 className="font-heading text-3xl md:text-4xl font-semibold text-foreground">
                {categoryData.name}
              </h1>
              {categoryData.productCount > 0 && (
                <p className="text-muted-foreground mt-1">
                  {categoryData.productCount} product{categoryData.productCount !== 1 ? 's' : ''}
                </p>
              )}
            </>
          )}

          {categoryData.description && (
            <p className="text-muted-foreground leading-relaxed mt-4 max-w-3xl">
              {categoryData.description}
            </p>
          )}
        </div>

        {isLoadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-square rounded-xl" />
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <PackageSearch className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-2">
              No products in this category
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              There are no products in this category yet. Check back soon or explore other categories.
            </p>
            <Button asChild variant="outline">
              <Link to="/shop">Browse All Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
