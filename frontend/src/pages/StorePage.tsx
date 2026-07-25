import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Package, ExternalLink, Instagram, Facebook } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import api from '@/lib/api';
import type { SellerProfile, Product, Review } from '@/types';

function StoreSkeleton() {
  return (
    <div>
      <Skeleton className="h-48 sm:h-64 w-full rounded-none" />
      <div className="container mx-auto px-4">
        <div className="relative -mt-16 mb-8">
          <Skeleton className="h-32 w-32 rounded-xl border-4 border-card" />
          <Skeleton className="h-8 w-64 mt-4" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="h-4 w-3/4 mt-3" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StorePage() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'about' | 'reviews'>('products');

  usePageTitle(
    store ? `${store.storeName} — KalaBazzar` : undefined,
    store?.description || undefined,
  );

  useEffect(() => {
    if (!slug) return;
    const fetchStore = async () => {
      try {
        const [storeRes, productsRes, reviewsRes] = await Promise.allSettled([
          api.get(`/sellers/${slug}`),
          api.get(`/products?seller=${slug}&limit=12`),
          api.get(`/reviews?seller=${slug}&limit=10`),
        ]);

        if (storeRes.status === 'fulfilled') {
          setStore(storeRes.value.data.data.seller || storeRes.value.data.data);
        }
        if (productsRes.status === 'fulfilled') {
          setProducts(productsRes.value.data.data.products || []);
        }
        if (reviewsRes.status === 'fulfilled') {
          setReviews(reviewsRes.value.data.data.reviews || []);
        }
      } catch {
        // handled
      } finally {
        setIsLoading(false);
      }
    };
    fetchStore();
  }, [slug]);

  if (isLoading) return <StoreSkeleton />;
  if (!store) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h2 className="text-2xl font-heading text-foreground mb-2">Store Not Found</h2>
        <p className="text-muted-foreground mb-6">This store doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/shop">Browse Shops</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Banner */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-br from-primary/20 to-secondary/20">
        {store.coverImage && (
          <img
            src={store.coverImage}
            alt={store.storeName}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="container mx-auto px-4">
        {/* Store Header */}
        <div className="relative -mt-16 mb-8 flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="w-32 h-32 rounded-xl border-4 border-card overflow-hidden bg-card shadow-lg">
            {store.logo ? (
              <img src={store.logo} alt={store.storeName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                <span className="text-4xl font-heading text-primary">
                  {store.storeName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-heading text-foreground">{store.storeName}</h1>
              {store.status === 'approved' && (
                <Badge variant="success">Verified Artisan</Badge>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {store.region && typeof store.region === 'object' && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {store.region.name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
                {store.rating?.toFixed(1) || '0.0'} ({store.reviewCount || 0} reviews)
              </span>
              <span className="flex items-center gap-1">
                <Package className="h-3.5 w-3.5" />
                {store.totalProducts || 0} products
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {store.socialLinks?.instagram && (
              <a
                href={store.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {store.socialLinks?.facebook && (
              <a
                href={store.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-8">
          {[
            { id: 'products' as const, label: 'Products', count: products.length },
            { id: 'about' as const, label: 'About' },
            { id: 'reviews' as const, label: 'Reviews', count: reviews.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1.5 text-xs">({tab.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 pb-16">
            {products.map((product) => {
              const image = product.variants?.[0]?.images?.[0] || '/placeholder.jpg';
              return (
                <Link key={product._id} to={`/shop/${product.slug}`} className="group">
                  <div className="relative overflow-hidden rounded-xl bg-card border border-border">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={image}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
                      <Badge variant="destructive" className="absolute top-2 left-2">
                        {Math.round(
                          ((product.compareAtPrice - product.basePrice) / product.compareAtPrice) * 100,
                        )}
                        % OFF
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3">
                    <h3 className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-semibold text-primary">
                        {formatCurrency(product.basePrice)}
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatCurrency(product.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
            {products.length === 0 && (
              <div className="col-span-full py-16 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No products yet</p>
              </div>
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="max-w-2xl pb-16 space-y-8">
            {store.description && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-heading text-lg font-semibold mb-3">About the Store</h3>
                  <p className="text-muted-foreground leading-relaxed">{store.description}</p>
                </CardContent>
              </Card>
            )}

            {store.crafts && store.crafts.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-heading text-lg font-semibold mb-3">Crafts</h3>
                  <div className="flex flex-wrap gap-2">
                    {store.crafts.map((craft) => (
                      <Badge key={typeof craft === 'string' ? craft : craft._id} variant="outline">
                        {typeof craft === 'object' ? craft.name : craft}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-6">
                <h3 className="font-heading text-lg font-semibold mb-3">Store Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member since</span>
                    <span>{formatDate(store.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total sales</span>
                    <span>{store.totalSales || 0} orders</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Store status</span>
                    <Badge variant={store.isStoreOpen ? 'success' : 'destructive'}>
                      {store.isStoreOpen ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-heading text-lg font-semibold mb-3">Contact</h3>
                <div className="space-y-3">
                  {store.socialLinks?.website && (
                    <a
                      href={store.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visit Website
                    </a>
                  )}
                  {store.socialLinks?.instagram && (
                    <a
                      href={store.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </a>
                  )}
                  {store.socialLinks?.facebook && (
                    <a
                      href={store.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="max-w-2xl pb-16 space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => {
                const customerName =
                  typeof review.customer === 'object' && review.customer
                    ? `${review.customer.firstName} ${review.customer.lastName}`
                    : 'Customer';
                return (
                  <Card key={review._id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{customerName}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < review.rating
                                    ? 'fill-secondary text-secondary'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      {review.title && (
                        <p className="font-medium text-sm mt-3">{review.title}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                      {review.sellerResponse && (
                        <div className="mt-3 p-3 rounded-lg bg-muted/50">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Seller Response:
                          </p>
                          <p className="text-sm">{review.sellerResponse.comment}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No reviews yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
