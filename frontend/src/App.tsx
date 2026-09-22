import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { Layout } from '@/components/layout/Layout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { SellerLayout } from '@/components/layout/SellerLayout';
import { PagePalette } from '@/components/layout/PagePalette';

const Shop = lazy(() => import('@/pages/Shop'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const SellerRegister = lazy(() => import('@/pages/SellerRegister'));
const VerifyEmail = lazy(() => import('@/pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const PaymentSelection = lazy(() => import('@/pages/PaymentSelection'));
const OrderSuccess = lazy(() => import('@/pages/OrderSuccess'));
const PaymentMock = lazy(() => import('@/pages/PaymentMock'));
const PaymentReturn = lazy(() => import('@/pages/PaymentReturn'));
const OrdersPage = lazy(() => import('@/pages/OrdersPage'));
const OrderDetail = lazy(() => import('@/pages/OrderDetail'));
const OrderInvoice = lazy(() => import('@/pages/OrderInvoice'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SellerDashboard = lazy(() => import('@/pages/SellerDashboard'));
const SellerApplication = lazy(() => import('@/pages/SellerApplication'));
const SellerProducts = lazy(() => import('@/pages/SellerProducts'));
const SellerProductForm = lazy(() => import('@/pages/SellerProductForm'));
const SellerOrders = lazy(() => import('@/pages/SellerOrders'));
const ShopProfile = lazy(() => import('@/pages/ShopProfile'));
const SellerEarnings = lazy(() => import('@/pages/SellerEarnings'));
const StorePage = lazy(() => import('@/pages/StorePage'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const AdminSellers = lazy(() => import('@/pages/AdminSellers'));
const AdminSellerApplications = lazy(() => import('@/pages/AdminSellerApplications'));
const AdminUsers = lazy(() => import('@/pages/AdminUsers'));
const AdminOrders = lazy(() => import('@/pages/AdminOrders'));
const AdminReviews = lazy(() => import('@/pages/AdminReviews'));
const AdminCoupons = lazy(() => import('@/pages/AdminCoupons'));
const AdminCategories = lazy(() => import('@/pages/AdminCategories'));
const AdminCrafts = lazy(() => import('@/pages/AdminCrafts'));
const AdminRegions = lazy(() => import('@/pages/AdminRegions'));
const AdminBanners = lazy(() => import('@/pages/AdminBanners'));
const AdminCollections = lazy(() => import('@/pages/AdminCollections'));
const AdminHomepage = lazy(() => import('@/pages/AdminHomepage'));
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const WishlistPage = lazy(() => import('@/pages/WishlistPage'));
const RecentlyViewed = lazy(() => import('@/pages/RecentlyViewed'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/login" element={<PagePalette palette="palette-auth"><Login /></PagePalette>} />
        <Route path="/register" element={<PagePalette palette="palette-auth"><Register /></PagePalette>} />
        <Route path="/seller/register" element={<PagePalette palette="palette-auth"><SellerRegister /></PagePalette>} />
        <Route path="/verify-email" element={<PagePalette palette="palette-auth"><VerifyEmail /></PagePalette>} />
        <Route path="/forgot-password" element={<PagePalette palette="palette-auth"><ForgotPassword /></PagePalette>} />
        <Route path="/reset-password/:token" element={<PagePalette palette="palette-auth"><ResetPassword /></PagePalette>} />

        <Route element={<Layout />}>
          <Route path="/" element={<PagePalette palette="palette-shop"><Shop /></PagePalette>} />
          <Route path="/shop" element={<Navigate to="/" replace />} />
          <Route path="/shop/:slug" element={<PagePalette palette="palette-product"><ProductDetail /></PagePalette>} />
          <Route path="/store/:slug" element={<PagePalette palette="palette-store"><StorePage /></PagePalette>} />
          <Route path="/category/:slug" element={<PagePalette palette="palette-shop"><CategoryPage /></PagePalette>} />
          <Route path="/recently-viewed" element={<PagePalette palette="palette-soft"><RecentlyViewed /></PagePalette>} />

          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<PagePalette palette="palette-cart"><CartPage /></PagePalette>} />
            <Route path="/wishlist" element={<PagePalette palette="palette-wishlist"><WishlistPage /></PagePalette>} />
            <Route path="/checkout" element={<PagePalette palette="palette-cart"><Checkout /></PagePalette>} />
            <Route path="/payment/select" element={<PagePalette palette="palette-cart"><PaymentSelection /></PagePalette>} />
            <Route path="/order-success/:id" element={<PagePalette palette="palette-cart"><OrderSuccess /></PagePalette>} />
            <Route path="/payment/mock/:method/:orderId" element={<PagePalette palette="palette-cart"><PaymentMock /></PagePalette>} />
            <Route path="/payment/return" element={<PagePalette palette="palette-cart"><PaymentReturn /></PagePalette>} />
            <Route path="/orders" element={<PagePalette palette="palette-orders"><OrdersPage /></PagePalette>} />
            <Route path="/orders/:id" element={<PagePalette palette="palette-orders"><OrderDetail /></PagePalette>} />
            <Route path="/orders/:id/invoice" element={<PagePalette palette="palette-orders"><OrderInvoice /></PagePalette>} />
            <Route path="/profile" element={<PagePalette palette="palette-profile"><ProfilePage /></PagePalette>} />
            <Route path="/seller/apply" element={<PagePalette palette="palette-seller"><SellerApplication /></PagePalette>} />
            <Route element={<SellerLayout />}>
              <Route path="/seller/dashboard" element={<PagePalette palette="palette-seller"><SellerDashboard /></PagePalette>} />
              <Route path="/seller/products" element={<PagePalette palette="palette-seller"><SellerProducts /></PagePalette>} />
              <Route path="/seller/products/new" element={<PagePalette palette="palette-seller"><SellerProductForm /></PagePalette>} />
              <Route path="/seller/products/:id/edit" element={<PagePalette palette="palette-seller"><SellerProductForm /></PagePalette>} />
              <Route path="/seller/orders" element={<PagePalette palette="palette-seller"><SellerOrders /></PagePalette>} />
              <Route path="/seller/profile" element={<PagePalette palette="palette-seller"><ShopProfile /></PagePalette>} />
              <Route path="/seller/earnings" element={<PagePalette palette="palette-seller"><SellerEarnings /></PagePalette>} />
            </Route>
          </Route>

          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<PagePalette palette="palette-admin"><AdminDashboard /></PagePalette>} />
              <Route path="/admin/sellers" element={<PagePalette palette="palette-admin"><AdminSellers /></PagePalette>} />
              <Route path="/admin/seller-applications" element={<PagePalette palette="palette-admin"><AdminSellerApplications /></PagePalette>} />
              <Route path="/admin/users" element={<PagePalette palette="palette-admin"><AdminUsers /></PagePalette>} />
              <Route path="/admin/orders" element={<PagePalette palette="palette-admin"><AdminOrders /></PagePalette>} />
              <Route path="/admin/reviews" element={<PagePalette palette="palette-admin"><AdminReviews /></PagePalette>} />
              <Route path="/admin/coupons" element={<PagePalette palette="palette-admin"><AdminCoupons /></PagePalette>} />
              <Route path="/admin/categories" element={<PagePalette palette="palette-admin"><AdminCategories /></PagePalette>} />
              <Route path="/admin/crafts" element={<PagePalette palette="palette-admin"><AdminCrafts /></PagePalette>} />
              <Route path="/admin/regions" element={<PagePalette palette="palette-admin"><AdminRegions /></PagePalette>} />
              <Route path="/admin/banners" element={<PagePalette palette="palette-admin"><AdminBanners /></PagePalette>} />
              <Route path="/admin/collections" element={<PagePalette palette="palette-admin"><AdminCollections /></PagePalette>} />
              <Route path="/admin/homepage" element={<PagePalette palette="palette-admin"><AdminHomepage /></PagePalette>} />
            </Route>
          </Route>

          <Route path="*" element={<PagePalette palette="palette-soft"><NotFound /></PagePalette>} />
        </Route>
      </Routes>
    </Suspense>
  );
}
