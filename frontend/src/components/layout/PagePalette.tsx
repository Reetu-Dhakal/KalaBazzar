import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type PagePaletteName =
  | 'palette-home'
  | 'palette-shop'
  | 'palette-store'
  | 'palette-product'
  | 'palette-auth'
  | 'palette-cart'
  | 'palette-wishlist'
  | 'palette-orders'
  | 'palette-profile'
  | 'palette-seller'
  | 'palette-admin'
  | 'palette-info'
  | 'palette-notfound'
  | 'palette-soft';

export function PagePalette({ palette, children }: { palette: PagePaletteName; children: ReactNode }) {
  return <div className={cn('min-h-full', palette)}>{children}</div>;
}