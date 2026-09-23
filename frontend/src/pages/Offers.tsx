import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PackageSearch, Tag } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProductCard } from '@/components/ProductCard';
import api from '@/lib/api';
import type { Product } from '@/types';

export default function Offers() {
  usePageTitle('Festive Offers & Deals');

  const { data, isLoading } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      const { data } = await api.get('/products', { params: { limit: 100 } });
      return (data.data || []) as Product[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const offers = (data || []).filter(
    (p) => p.compareAtPrice && p.compareAtPrice > p.basePrice,
  );

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-5 sm:py-8">
        <div className="relative mb-8 overflow-hidden border border-[#D9B45B]/70 bg-[#4A1018]">
          <img
            src="/festival-banner.jpg"
            alt="Festive sales and offers"
            className="h-[clamp(10rem,20vw,16rem)] w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#4A1018]/50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="mx-auto flex max-w-2xl flex-col items-center px-6 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#F5D88A] sm:text-xs">
                ✦ Limited-time festive offers
              </p>
              <h1 className="mt-1.5 font-heading text-2xl font-bold leading-tight text-[#FFF7E6] sm:text-4xl md:text-5xl">
                Festive Sales &amp; Offers
              </h1>
              <p className="mt-2 hidden text-xs text-[#F8E7C1]/90 sm:block sm:text-sm">
                Handmade crafts at special festive prices — every piece carries a story, every deal too.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-5 flex items-center gap-2 border-b border-border/70 pb-4">
          <Tag className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-foreground">
            On sale now
          </h2>
          <span className="text-xs text-muted-foreground">{offers.length} items</span>
        </div>

        <main>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-square rounded-xl" />
                  <div className="mt-3 space-y-2">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : offers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <PackageSearch className="h-16 w-16 text-muted-foreground/40 mb-4" />
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-2">
                No active offers right now
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                There are no discounted products at the moment. Explore the full collection for handmade treasures.
              </p>
              <Button asChild>
                <Link to="/">Browse the shop</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {offers.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}