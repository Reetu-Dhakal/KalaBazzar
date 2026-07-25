import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import api from '@/lib/api';
import type { CartItem, Product } from '@/types';
import { useAuth } from './AuthContext';

interface CartItemWithProduct extends CartItem {
  product: Product;
}

interface CartState {
  items: CartItemWithProduct[];
  totalItems: number;
  subtotal: number;
  isLoading: boolean;
  appliedCoupon: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    discountAmount: number;
  } | null;
  total: number;
}

interface CartContextType extends CartState {
  addToCart: (productId: string, quantity?: number, selectedVariants?: Record<string, string>) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CartState['appliedCoupon']>(null);
  const { isAuthenticated } = useAuth();
  const updateTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const discountAmount = appliedCoupon
    ? appliedCoupon.discountType === 'percentage'
      ? subtotal * (appliedCoupon.discountValue / 100)
      : appliedCoupon.discountValue
    : 0;

  const total = Math.max(0, subtotal - discountAmount);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const { data } = await api.get('/cart');
      const cart = data.data?.cart;
      setItems(cart?.items || []);
      setAppliedCoupon(cart?.appliedCoupon || null);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
    return () => {
      updateTimers.current.forEach((timer) => clearTimeout(timer));
    };
  }, [fetchCart]);

  const addToCart = async (
    productId: string,
    quantity = 1,
    selectedVariants?: Record<string, string>,
  ) => {
    await api.post('/cart/items', {
      productId,
      quantity,
      selectedVariants,
    });
    await fetchCart();
  };

  const performUpdate = async (productId: string, quantity: number) => {
    try {
      await api.put(`/cart/items/${productId}`, { quantity });
      await fetchCart();
    } catch {
      await fetchCart();
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;

    const existingTimer = updateTimers.current.get(productId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    setItems((prev) =>
      prev.map((item) => {
        const pid = typeof item.product === 'string' ? item.product : item.product._id;
        return pid === productId ? { ...item, quantity } : item;
      }),
    );

    const timer = setTimeout(() => {
      performUpdate(productId, quantity);
      updateTimers.current.delete(productId);
    }, 400);

    updateTimers.current.set(productId, timer);
  };

  const removeFromCart = async (productId: string) => {
    await api.delete(`/cart/items/${productId}`);
    await fetchCart();
  };

  const clearCart = async () => {
    await api.delete('/cart');
    setItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code: string) => {
    const { data } = await api.post('/coupons/apply', { code });
    setAppliedCoupon(data.data);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        isLoading,
        appliedCoupon,
        total,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}