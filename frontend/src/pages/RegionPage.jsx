import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Card, CardContent } from '../components/ui/Card';

import { Badge } from '../components/ui/Badge';
import usePageTitle from '../hooks/usePageTitle';
import { Spinner } from '../components/ui/Spinner';
import { MapPin, Star, Package } from 'lucide-react';

export default function RegionPage() {
  const { slug } = useParams();
  const [region, setRegion] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  usePageTitle(region ? `Products from ${region.name}` : 'Region');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: regionData } = await api.get(`/regions`);
        const found = regionData.data?.find((r) => r.slug === slug);
        if (!found) {
          setLoading(false);
          return;
        }
        setRegion(found);
        const { data: productsData } = await api.get(`/products/published?region=${found._id}&limit=50`);
        setProducts(productsData.data.products || []);
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!region) return <div className="text-center py-20 text-text-secondary">Region not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-primary mb-2">
          <MapPin size={20} />
          <h1 className="text-3xl md:text-4xl font-heading font-bold">{region.name}</h1>
        </div>
        <p className="text-text-secondary">Handcrafted products from {region.name}</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-secondary">No products found from this region</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product._id} to={`/product/${product.slug || product._id}`} className="group">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                <div className="aspect-square overflow-hidden bg-gray-50 relative">
                  <img loading="lazy" src={product.images?.[0]?.url || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {product.stock <= 5 && <Badge variant="warning" className="absolute top-3 left-3">Low Stock</Badge>}
                </div>
                <CardContent className="p-4">
                  {product.seller?._id && (
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{product.seller?.name}</p>
                  )}
                  <h3 className="font-heading font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star size={14} className="fill-secondary text-secondary" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-text-muted text-sm">({product.numReviews})</span>
                  </div>
                  <span className="text-lg font-bold text-primary">Rs. {product.price?.toLocaleString()}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
