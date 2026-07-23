import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceTimers = useRef({});

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setItems([]);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/cart');
      setItems(data.data?.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId, quantity = 1) => {
    const { data } = await api.post('/cart/add', { productId, quantity });
    setItems(data.data.items);
    return data;
  };

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (quantity < 1) return;
    setItems((prev) => prev.map((i) => (i.product?._id === productId || i.product === productId) ? { ...i, quantity } : i));
    clearTimeout(debounceTimers.current[productId]);
    debounceTimers.current[productId] = setTimeout(async () => {
      try {
        const { data } = await api.put('/cart/update', { productId, quantity });
        setItems(data.data.items);
      } catch {
        fetchCart();
      }
    }, 400);
  }, []);

  const removeItem = async (productId) => {
    const { data } = await api.delete(`/cart/remove/${productId}`);
    setItems(data.data.items);
  };

  const clearCart = async () => {
    await api.delete('/cart/clear');
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, itemCount, subtotal, addItem, updateQuantity, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
