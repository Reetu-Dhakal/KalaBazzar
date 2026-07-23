import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import usePageTitle from '../hooks/usePageTitle';
import { useState } from 'react';
import { Heart, ShoppingCart, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  usePageTitle('My Wishlist');
  const { wishlistItems, loading, toggleWishlist, clearWishlist, moveAllToCart, fetchWishlist } = useWishlist();
  const { addItem } = useCart();
  const [moving, setMoving] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleAddToCart = async (productId) => {
    try {
      await addItem(productId);
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart size={28} className="text-primary" />
        <h1 className="text-3xl font-heading font-bold">My Wishlist ({wishlistItems.length})</h1>
      </div>

      {wishlistItems.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          <Button variant="default" disabled={moving} onClick={async () => { setMoving(true); await moveAllToCart(); fetchWishlist(); setMoving(false); }}>
            <ShoppingBag size={16} className="mr-2" /> {moving ? 'Moving...' : 'Move All to Cart'}
          </Button>
          <Button variant="outline" disabled={clearing} onClick={async () => { if (!confirm('Clear all items from wishlist?')) return; setClearing(true); await clearWishlist(); setClearing(false); }}>
            <Trash2 size={16} className="mr-2" /> {clearing ? 'Clearing...' : 'Clear Wishlist'}
          </Button>
        </div>
      )}

      {wishlistItems.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-heading font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-text-secondary mb-6">Save items you love to your wishlist</p>
          <Link to="/shop"><Button>Browse Products</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => {
            const p = item.product;
            if (!p) return null;
            return (
              <Card key={p._id} className="overflow-hidden hover:shadow-lg transition-shadow group h-full">
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <Link to={`/product/${p._id}`}>
                    <img loading="lazy" src={p.images?.[0]?.url || '/placeholder.svg'} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </Link>
                  <button onClick={() => toggleWishlist(p._id)} className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow">
                    <Heart size={18} className="fill-primary text-primary" />
                  </button>
                </div>
                <CardContent className="p-4">
                  <Link to={`/product/${p._id}`} className="font-heading font-semibold text-lg hover:text-primary line-clamp-1">{p.name}</Link>
                  <p className="text-sm text-text-muted mb-3">Rs. {p.price?.toLocaleString()}</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => handleAddToCart(p._id)}>
                      <ShoppingCart size={14} className="mr-1" /> Add to Cart
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toggleWishlist(p._id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
