import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { Spinner } from './components/ui/Spinner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const SellerLogin = lazy(() => import('./pages/SellerLogin'));
const SellerRegister = lazy(() => import('./pages/SellerRegister'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const CartPage = lazy(() => import('./pages/CartPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const OrderInvoice = lazy(() => import('./pages/OrderInvoice'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'));
const SellerFeed = lazy(() => import('./pages/SellerFeed'));
const SellerEarnings = lazy(() => import('./pages/SellerEarnings'));
const SellerSettings = lazy(() => import('./pages/SellerSettings'));
const SellerApplication = lazy(() => import('./pages/SellerApplication'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminCoupons = lazy(() => import('./pages/AdminCoupons'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminReviews = lazy(() => import('./pages/AdminReviews'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const StorePage = lazy(() => import('./pages/StorePage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const RegionPage = lazy(() => import('./pages/RegionPage'));
const RecentlyViewed = lazy(() => import('./pages/RecentlyViewed'));
const NotFound = lazy(() => import('./pages/NotFound'));

const Lazy = ({ children }) => <Suspense fallback={<div className="py-20 text-center"><Spinner /></div>}>{children}</Suspense>;

export default function App() {
  return (
    <Routes>
      {/* Auth screens — standalone, no persistent layout */}
      <Route path="/login" element={<Lazy><Login /></Lazy>} />
      <Route path="/register" element={<Lazy><Register /></Lazy>} />
      <Route path="/seller/login" element={<Lazy><SellerLogin /></Lazy>} />
      <Route path="/seller/register" element={<Lazy><SellerRegister /></Lazy>} />
      <Route path="/admin/login" element={<Lazy><AdminLogin /></Lazy>} />
      <Route path="/forgot-password" element={<Lazy><ForgotPassword /></Lazy>} />
      <Route path="/reset-password/:token" element={<Lazy><ResetPassword /></Lazy>} />

      {/* App shell — Layout provides Navbar / Footer / CartDrawer */}
      <Route element={<Layout />}>
        {/* Public Landing */}
        <Route path="/" element={<Lazy><LandingPage /></Lazy>} />

        {/* Shop App — browsable by guests */}
        <Route path="/shop" element={<Lazy><Shop /></Lazy>} />
        <Route path="/product/:slug" element={<Lazy><ProductDetail /></Lazy>} />
        <Route path="/category/:slug" element={<Lazy><CategoryPage /></Lazy>} />
        <Route path="/region/:slug" element={<Lazy><RegionPage /></Lazy>} />
        <Route path="/artisan/:slug" element={<Lazy><StorePage /></Lazy>} />
        <Route path="/recently-viewed" element={<Lazy><RecentlyViewed /></Lazy>} />

        {/* Customer (protected) */}
        <Route path="/cart" element={<Lazy><ProtectedRoute><CartPage /></ProtectedRoute></Lazy>} />
        <Route path="/wishlist" element={<Lazy><ProtectedRoute><WishlistPage /></ProtectedRoute></Lazy>} />
        <Route path="/profile" element={<Lazy><ProtectedRoute><ProfilePage /></ProtectedRoute></Lazy>} />
        <Route path="/orders" element={<Lazy><ProtectedRoute><OrdersPage /></ProtectedRoute></Lazy>} />
        <Route path="/orders/:id" element={<Lazy><ProtectedRoute><OrderDetail /></ProtectedRoute></Lazy>} />
        <Route path="/orders/:id/invoice" element={<Lazy><ProtectedRoute><OrderInvoice /></ProtectedRoute></Lazy>} />
        <Route path="/checkout" element={<Lazy><ProtectedRoute><Checkout /></ProtectedRoute></Lazy>} />
        <Route path="/order-success/:id" element={<Lazy><ProtectedRoute><OrderSuccess /></ProtectedRoute></Lazy>} />

        {/* Seller (protected) */}
        <Route path="/seller/apply" element={<Lazy><ProtectedRoute><SellerApplication /></ProtectedRoute></Lazy>} />
        <Route path="/seller/dashboard" element={<Lazy><ProtectedRoute><SellerDashboard /></ProtectedRoute></Lazy>} />
        <Route path="/seller/feed" element={<Lazy><ProtectedRoute><SellerFeed /></ProtectedRoute></Lazy>} />
        <Route path="/seller/earnings" element={<Lazy><ProtectedRoute><SellerEarnings /></ProtectedRoute></Lazy>} />
        <Route path="/seller/settings" element={<Lazy><ProtectedRoute><SellerSettings /></ProtectedRoute></Lazy>} />

        {/* Admin (admin only) */}
        <Route path="/admin/dashboard" element={<Lazy><AdminRoute><AdminDashboard /></AdminRoute></Lazy>} />
        <Route path="/admin/coupons" element={<Lazy><AdminRoute><AdminCoupons /></AdminRoute></Lazy>} />
        <Route path="/admin/orders" element={<Lazy><AdminRoute><AdminOrders /></AdminRoute></Lazy>} />
        <Route path="/admin/reviews" element={<Lazy><AdminRoute><AdminReviews /></AdminRoute></Lazy>} />
        <Route path="/admin/users" element={<Lazy><AdminRoute><AdminUsers /></AdminRoute></Lazy>} />

        {/* Static pages */}
        <Route path="/faq" element={<Lazy><FAQ /></Lazy>} />
        <Route path="/privacy" element={<Lazy><Privacy /></Lazy>} />
        <Route path="/terms" element={<Lazy><Terms /></Lazy>} />

        <Route path="*" element={<Lazy><NotFound /></Lazy>} />
      </Route>
    </Routes>
  );
}
