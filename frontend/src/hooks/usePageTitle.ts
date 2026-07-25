import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const routeMeta: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'KalaBazzar — Handcrafted Art & Artisan Marketplace',
    description:
      'Discover authentic handcrafted products from skilled artisans across Nepal. Shop traditional art, textiles, pottery, and more.',
  },
  '/shop': {
    title: 'Shop — KalaBazzar',
    description:
      'Browse our curated collection of handcrafted products from verified artisans.',
  },
  '/about': {
    title: 'About Us — KalaBazzar',
    description:
      'Learn about KalaBazzar and our mission to connect artisans with conscious consumers.',
  },
  '/contact': {
    title: 'Contact Us — KalaBazzar',
    description:
      'Get in touch with the KalaBazzar team for support or inquiries.',
  },
  '/faq': {
    title: 'FAQ — KalaBazzar',
    description:
      'Frequently asked questions about shopping, shipping, returns, and more.',
  },
  '/privacy': {
    title: 'Privacy Policy — KalaBazzar',
    description:
      'Our privacy policy explains how we collect and protect your data.',
  },
  '/terms': {
    title: 'Terms of Service — KalaBazzar',
    description:
      'Read our terms of service for using the KalaBazzar platform.',
  },
  '/login': {
    title: 'Login — KalaBazzar',
    description: 'Sign in to your KalaBazzar account.',
  },
  '/register': {
    title: 'Register — KalaBazzar',
    description: 'Create a new KalaBazzar account.',
  },
  '/forgot-password': {
    title: 'Forgot Password — KalaBazzar',
    description: 'Reset your KalaBazzar account password.',
  },
  '/cart': {
    title: 'Cart — KalaBazzar',
    description: 'Review your shopping cart.',
  },
  '/checkout': {
    title: 'Checkout — KalaBazzar',
    description: 'Complete your purchase.',
  },
  '/orders': {
    title: 'My Orders — KalaBazzar',
    description: 'View and track your orders.',
  },
  '/profile': {
    title: 'My Profile — KalaBazzar',
    description: 'Manage your account profile and addresses.',
  },
  '/seller/apply': {
    title: 'Become a Seller — KalaBazzar',
    description: 'Apply to sell your handcrafted products on KalaBazzar.',
  },
  '/seller/dashboard': {
    title: 'Seller Dashboard — KalaBazzar',
    description: 'Manage your products, orders, and store settings.',
  },
  '/seller/products': {
    title: 'My Products — KalaBazzar',
    description: 'Manage your product listings.',
  },
  '/seller/products/new': {
    title: 'Add Product — KalaBazzar',
    description: 'Create a new product listing.',
  },
  '/seller/orders': {
    title: 'My Orders — KalaBazzar',
    description: 'Manage and fulfill customer orders.',
  },
  '/seller/earnings': {
    title: 'Earnings — KalaBazzar',
    description: 'View your earnings and payout information.',
  },
  '/seller/settings': {
    title: 'Store Settings — KalaBazzar',
    description: 'Manage your store details and payout information.',
  },
  '/admin/dashboard': {
    title: 'Admin Dashboard — KalaBazzar',
    description: 'Admin panel for managing the KalaBazzar platform.',
  },
  '/admin/sellers': {
    title: 'Manage Sellers — KalaBazzar',
    description: 'Review and manage seller applications.',
  },
  '/admin/users': {
    title: 'Manage Users — KalaBazzar',
    description: 'Manage platform users and their roles.',
  },
  '/admin/orders': {
    title: 'Manage Orders — KalaBazzar',
    description: 'View and manage all customer orders.',
  },
  '/admin/reviews': {
    title: 'Manage Reviews — KalaBazzar',
    description: 'View and moderate customer reviews.',
  },
  '/admin/coupons': {
    title: 'Manage Coupons — KalaBazzar',
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
    const title = customTitle || meta?.title || 'KalaBazzar';
    const description =
      customDescription || meta?.description || 'KalaBazzar — Artisan Marketplace';

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
