import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const routeMeta: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'कलाbazzar — Handcrafted Art & Artisan Marketplace',
    description:
      'Discover authentic handcrafted products from skilled artisans across Nepal. Shop traditional art, textiles, pottery, and more.',
  },
  '/shop': {
    title: 'Shop — कलाbazzar',
    description:
      'Browse our curated collection of handcrafted products from verified artisans.',
  },
  '/login': {
    title: 'Login — कलाbazzar',
    description: 'Sign in to your कलाbazzar account.',
  },
  '/register': {
    title: 'Register — कलाbazzar',
    description: 'Create a new कलाbazzar account.',
  },
  '/seller/register': {
    title: 'Create Seller Account — कलाbazzar',
    description: 'Register a seller account to start selling on कलाbazzar.',
  },
  '/forgot-password': {
    title: 'Forgot Password — कलाbazzar',
    description: 'Reset your कलाbazzar account password.',
  },
  '/cart': {
    title: 'Cart — कलाbazzar',
    description: 'Review your shopping cart.',
  },
  '/checkout': {
    title: 'Checkout — कलाbazzar',
    description: 'Complete your purchase.',
  },
  '/orders': {
    title: 'My Orders — कलाbazzar',
    description: 'View and track your orders.',
  },
  '/profile': {
    title: 'My Profile — कलाbazzar',
    description: 'Manage your account profile and addresses.',
  },
  '/seller/apply': {
    title: 'Become a Seller — कलाbazzar',
    description: 'Apply to sell your handcrafted products on कलाbazzar.',
  },
  '/seller/dashboard': {
    title: 'Seller Dashboard — कलाbazzar',
    description: 'Manage your products, orders, and store settings.',
  },
  '/seller/products': {
    title: 'My Products — कलाbazzar',
    description: 'Manage your product listings.',
  },
  '/seller/products/new': {
    title: 'Add Product — कलाbazzar',
    description: 'Create a new product listing.',
  },
  '/seller/orders': {
    title: 'My Orders — कलाbazzar',
    description: 'Manage and fulfill customer orders.',
  },
  '/seller/earnings': {
    title: 'Earnings — कलाbazzar',
    description: 'View your earnings and payout information.',
  },
  '/seller/profile': {
    title: 'Shop Profile — कलाbazzar',
    description: 'Your shop profile and product feed.',
  },
  '/admin/dashboard': {
    title: 'Admin Dashboard — कलाbazzar',
    description: 'Admin panel for managing the कलाbazzar platform.',
  },
  '/admin/sellers': {
    title: 'Manage Sellers — कलाbazzar',
    description: 'Review and manage seller applications.',
  },
  '/admin/seller-applications': {
    title: 'Seller Applications — कलाbazzar',
    description: 'Review new seller applications and activate approved shops.',
  },
  '/admin/users': {
    title: 'Manage Users — कलाbazzar',
    description: 'Manage platform users and their roles.',
  },
  '/admin/orders': {
    title: 'Manage Orders — कलाbazzar',
    description: 'View and manage all customer orders.',
  },
  '/admin/reviews': {
    title: 'Manage Reviews — कलाbazzar',
    description: 'View and moderate customer reviews.',
  },
  '/admin/coupons': {
    title: 'Manage Coupons — कलाbazzar',
    description: 'Create and manage discount coupons.',
  },
};

export function usePageTitle(
  customTitle?: string,
  customDescription?: string,
) {
  const location = useLocation();

  useEffect(() => {
    const meta = routeMeta[location.pathname];
    const title = customTitle || meta?.title || 'कलाbazzar';
    const description =
      customDescription || meta?.description || 'कलाbazzar — Artisan Marketplace';

    document.title = title;

    let metaTag = document.querySelector('meta[name="description"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'description');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', description);
  }, [location.pathname, customTitle, customDescription]);
}
