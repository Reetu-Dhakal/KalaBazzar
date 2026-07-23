import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { useWishlist } from '../context/WishlistContext';
import { Star, ArrowLeft } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

export default function CategoryPage() {
  usePageTitle('Category');
  const { slug } = useParams();
  useWishlist();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchProducts = async (catId, p = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products/published?category=${catId}&page=${p}&limit=12`);
      setProducts(data.data.products);
      setPagination(data.data.pagination);
    } catch { setProducts([]); }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    api.get(`/categories/${slug}`).then((catRes) => {
      const cat = catRes.data.data;
      setCategory(cat);
      fetchProducts(cat._id, 1);
    }).catch(() => {
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!category) return <div className="text-center py-20 text-text-secondary">Category not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-4">
        <ArrowLeft size={16} /> Back to Shop
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">{category.name}</h1>
        {category.description && <p className="text-text-secondary">{category.description}</p>}
        <p className="text-sm text-text-muted mt-1">{products.length} products</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-secondary text-lg">No products in this category yet</p>
          <Link to="/shop"><Button variant="outline" className="mt-4">Browse All Products</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product._id} to={`/product/${product.slug || product._id}`} className="group">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <img loading="lazy" src={product.images?.[0]?.url || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {product.stock <= 5 && <Badge variant="warning" className="absolute top-3 left-3">Low Stock</Badge>}
                </div>
                <CardContent className="p-4">
                  {product.seller?._id ? (
                    <Link to={`/artisan/${product.seller._id}`} onClick={(e) => e.stopPropagation()} className="text-xs text-text-muted uppercase tracking-wider mb-1 hover:text-primary block">{product.seller?.name || 'Artisan'}</Link>
                  ) : (
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Artisan</p>
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

      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => { setPage(p); fetchProducts(category._id, p); }}>
              {p}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
