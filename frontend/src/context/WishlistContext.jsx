import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchWishlist();
    else setWishlistItems([]);
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/wishlist');
      setWishlistItems(data.data?.items || []);
    } catch {
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (productId) => {
    if (!user) {
      toast.error('Please login to save items');
      return false;
    }
    const exists = wishlistItems.some((i) => i.product?._id === productId || i.product === productId);
    try {
      if (exists) {
        await api.delete(`/wishlist/remove/${productId}`);
        setWishlistItems((prev) => prev.filter((i) => (i.product?._id || i.product) !== productId));
        toast.success('Removed from wishlist');
      } else {
        const { data } = await api.post('/wishlist/add', { productId });
        setWishlistItems(data.data.items);
        toast.success('Added to wishlist');
      }
      return true;
    } catch {
      toast.error('Failed to update wishlist');
      return false;
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((i) => i.product?._id === productId || i.product === productId);
  };

  const clearWishlist = async () => {
    try {
      await api.delete('/wishlist/clear');
      setWishlistItems([]);
      toast.success('Wishlist cleared');
      return true;
    } catch {
      toast.error('Failed to clear wishlist');
      return false;
    }
  };

  const moveAllToCart = async () => {
    try {
      const { data } = await api.post('/wishlist/move-to-cart');
      setWishlistItems([]);
      toast.success(data.message || 'All items moved to cart');
      return true;
    } catch {
      toast.error('Failed to move items');
      return false;
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, loading, toggleWishlist, isInWishlist, clearWishlist, moveAllToCart, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
