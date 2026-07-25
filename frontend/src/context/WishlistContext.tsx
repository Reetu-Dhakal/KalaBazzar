import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import api from '@/lib/api';
import type { Product } from '@/types';
import { useAuth } from './AuthContext';

interface WishlistItemWithProduct {
  product: Product;
  addedAt: string;
}

interface WishlistContextType {
  items: WishlistItemWithProduct[];
  totalItems: number;
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
  moveToCart: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const totalItems = items.length;

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const { data } = await api.get('/wishlist');
      const wishlist = data.data?.wishlist;
      setItems(wishlist?.items || []);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = async (productId: string) => {
    await api.post('/wishlist', { productId });
    await fetchWishlist();
  };

  const removeFromWishlist = async (productId: string) => {
    await api.delete(`/wishlist/${productId}`);
    await fetchWishlist();
  };

  const isInWishlist = (productId: string) => {
    return items.some((item) => {
      const pid = typeof item.product === 'string' ? item.product : item.product._id;
      return pid === productId;
    });
  };

  const clearWishlist = async () => {
    await api.delete('/wishlist');
    setItems([]);
  };

  const moveToCart = async (productId: string) => {
    await api.post('/wishlist/move-to-cart', { productId });
    await fetchWishlist();
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        totalItems,
        isLoading,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        moveToCart,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}