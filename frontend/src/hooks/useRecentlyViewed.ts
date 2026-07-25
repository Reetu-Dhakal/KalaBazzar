import { useState, useCallback } from 'react';
import type { Product } from '@/types';

const STORAGE_KEY = 'recentlyViewed';
const MAX_ITEMS = 8;

interface RecentProduct {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  basePrice: number;
  category: string;
  viewedAt: string;
}

function getStoredItems(): RecentProduct[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveItems(items: RecentProduct[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useRecentlyViewed() {
  const [recentItems, setRecentItems] = useState<RecentProduct[]>(getStoredItems);

  const addProduct = useCallback((product: Product) => {
    setRecentItems((prev) => {
      const filtered = prev.filter((item) => item._id !== product._id);
      const newItems: RecentProduct[] = [
        {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          images: product.variants?.[0]?.images || [],
          basePrice: product.basePrice,
          category: typeof product.category === 'string' ? product.category : product.category.name,
          viewedAt: new Date().toISOString(),
        },
        ...filtered,
      ].slice(0, MAX_ITEMS);

      saveItems(newItems);
      return newItems;
    });
  }, []);

  const getRecentlyViewed = useCallback((): RecentProduct[] => {
    return getStoredItems();
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setRecentItems([]);
  }, []);

  return {
    recentItems,
    addProduct,
    getRecentlyViewed,
    clearHistory,
  };
}
