import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { Layout } from '@/components/layout/Layout';
import { AdminLayout } from '@/components/layout/AdminLayout';

const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Shop = lazy(() => import('@/pages/Shop'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const OrderSuccess = lazy(() => import('@/pages/OrderSuccess'));
const OrdersPage = lazy(() => import('@/pages/OrdersPage'));
const OrderDetail = lazy(() => import('@/pages/OrderDetail'));
const OrderInvoice = lazy(() => import('@/pages/OrderInvoice'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SellerDashboard = lazy(() => import('@/pages/SellerDashboard'));
const SellerApplication = lazy(() => import('@/pages/SellerApplication'));
const SellerProducts = lazy(() => import('@/pages/SellerProducts'));
const SellerProductForm = lazy(() => import('@/pages/SellerProductForm'));
const SellerOrders = lazy(() => import('@/pages/SellerOrders'));
const SellerSettings = lazy(() => import('@/pages/SellerSettings'));
const SellerEarnings = lazy(() => import('@/pages/SellerEarnings'));
const StorePage = lazy(() => import('@/pages/StorePage'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const AdminSellers = lazy(() => import('@/pages/AdminSellers'));
const AdminUsers = lazy(() => import('@/pages/AdminUsers'));
const AdminOrders = lazy(() => import('@/pages/AdminOrders'));
const AdminReviews = lazy(() => import('@/pages/AdminReviews'));
const AdminCoupons = lazy(() => import('@/pages/AdminCoupons'));
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
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:slug" element={<ProductDetail />} />
          <Route path="/store/:slug" element={<StorePage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/recently-viewed" element={<RecentlyViewed />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success/:id" element={<OrderSuccess />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/orders/:id/invoice" element={<OrderInvoice />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/seller/apply" element={<SellerApplication />} />
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/products" element={<SellerProducts />} />
            <Route path="/seller/products/new" element={<SellerProductForm />} />
            <Route path="/seller/products/:id/edit" element={<SellerProductForm />} />
            <Route path="/seller/orders" element={<SellerOrders />} />
            <Route path="/seller/settings" element={<SellerSettings />} />
            <Route path="/seller/earnings" element={<SellerEarnings />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/sellers" element={<AdminSellers />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/reviews" element={<AdminReviews />} />
              <Route path="/admin/coupons" element={<AdminCoupons />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
