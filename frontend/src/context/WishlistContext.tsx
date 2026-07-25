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

  const totalItems = items.length;

  const fetchWishlist = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/wishlist');
      setItems(data.data.items || []);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = async (productId: string) => {
    const { data } = await api.post('/wishlist/items', { productId });
    setItems(data.data.items);
  };

  const removeFromWishlist = async (productId: string) => {
    const { data } = await api.delete(`/wishlist/items/${productId}`);
    setItems(data.data.items);
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
    setItems((prev) =>
      prev.filter((item) => {
        const pid = typeof item.product === 'string' ? item.product : item.product._id;
        return pid !== productId;
      }),
    );
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

export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
