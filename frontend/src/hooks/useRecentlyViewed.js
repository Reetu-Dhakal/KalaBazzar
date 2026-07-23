import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'kalabazaar_recently_viewed';
const MAX_ITEMS = 8;

export function useRecentlyViewed() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setItems(stored);
    } catch { setItems([]); }
  }, []);

  const addItem = useCallback((product) => {
    if (!product?._id) return;
    setItems((prev) => {
      const filtered = prev.filter((i) => i._id !== product._id);
      const next = [{ _id: product._id, name: product.name, price: product.price, image: product.images?.[0]?.url }, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearItems = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
  }, []);

  return { items, addItem, clearItems };
}
