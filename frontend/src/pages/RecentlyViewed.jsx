import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Clock, Trash2 } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';

export default function RecentlyViewed() {
  usePageTitle('Recently Viewed');
  const { items, clearItems } = useRecentlyViewed();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Clock size={28} className="text-primary" />
          <h1 className="text-3xl font-heading font-bold">Recently Viewed ({items.length})</h1>
        </div>
        {items.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearItems}><Trash2 size={14} className="mr-1" /> Clear</Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <Clock size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-heading font-semibold mb-2">No recently viewed items</h2>
          <p className="text-text-secondary mb-6">Start browsing products to see them here</p>
          <Link to="/shop"><Button>Browse Products</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <Link key={item._id} to={`/product/${item._id}`} className="group">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                <div className="aspect-square overflow-hidden bg-gray-50">
                  <img loading="lazy" src={item.image || '/placeholder.svg'} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-heading font-medium line-clamp-2 group-hover:text-primary">{item.name}</p>
                  <p className="text-sm font-bold text-primary mt-1">Rs. {item.price?.toLocaleString()}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
