import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import usePageTitle from '../hooks/usePageTitle';
import { Spinner } from '../components/ui/Spinner';
import { Store, MapPin, Star, Package, Award } from 'lucide-react';

export default function StorePage() {
  usePageTitle('Artisan Store');
  const { slug } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sellerRes = await api.get(`/sellers/public/${slug}`);
        const sellerData = sellerRes.data.data;
        setSeller(sellerData);
        const userId = sellerData.user?._id || sellerData.user;
        if (userId) {
          const productsRes = await api.get(`/products/published?seller=${userId}&limit=50`);
          setProducts(productsRes.data.data.products || []);
        }
      } catch {
        setSeller(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!seller) return <div className="text-center py-20 text-text-secondary">Store not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl border p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            {seller.user?.avatar?.url ? (
              <img loading="lazy" src={seller.user.avatar.url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <Store size={40} className="text-primary" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-heading font-bold mb-2">{seller.storeName || seller.user?.name}'s Store</h1>
            {seller.bio && <p className="text-text-secondary mb-4">{seller.bio}</p>}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-text-secondary"><MapPin size={16} /> {seller.district}</div>
              {seller.yearsOfExperience && <div className="flex items-center gap-1.5 text-text-secondary"><Award size={16} /> {seller.yearsOfExperience} years experience</div>}
              <div className="flex items-center gap-1.5"><Star size={16} className="fill-secondary text-secondary" /> {seller.rating || 'No ratings'}</div>
              <Badge variant="success" className="flex items-center gap-1"><Package size={12} /> {products.length} products</Badge>
            </div>
            {seller.craftStory && (
              <div className="mt-4 bg-secondary/5 rounded-lg p-4">
                <p className="text-sm italic text-text-secondary">"{seller.craftStory}"</p>
              </div>
            )}
            {seller.specialization?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {seller.specialization.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
              </div>
            )}
          </div>
        </div>
      </div>

      {products.length > 0 && (
        <>
          <h2 className="text-2xl font-heading font-bold mb-6">Products by {seller.storeName || 'this artisan'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product._id} to={`/product/${product.slug || product._id}`} className="group">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <div className="aspect-square overflow-hidden bg-gray-50 relative">
                    <img loading="lazy" src={product.images?.[0]?.url || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {product.stock <= 5 && <Badge variant="warning" className="absolute top-3 left-3">Low Stock</Badge>}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-heading font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
                    <p className="font-bold text-primary">Rs. {product.price?.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
