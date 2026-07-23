import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { ShoppingCart, User, LogOut, Menu, X, Store, Shield, Heart, Clock } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useCartDrawer } from './CartDrawer';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistItems } = useWishlist();
  const { openCartDrawer } = useCartDrawer();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-primary text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-heading font-bold tracking-wide">Kala Bazaar</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-secondary transition-colors text-sm font-medium uppercase tracking-wider">Home</Link>
            <Link to="/shop" className="hover:text-secondary transition-colors text-sm font-medium uppercase tracking-wider">Shop</Link>
            {!user && <Link to="/seller/register" className="hover:text-secondary transition-colors text-sm font-medium uppercase tracking-wider">Become an Artisan</Link>}
            {user?.role === 'customer' && <Link to="/seller/apply" className="hover:text-secondary transition-colors text-sm font-medium uppercase tracking-wider">Become an Artisan</Link>}
            {user?.role === 'seller' && (
              <>
                <Link to="/seller/dashboard" className="hover:text-secondary transition-colors flex items-center gap-1 text-sm">
                  <Store size={16} /> Dashboard
                </Link>
                <Link to="/seller/feed" className="hover:text-secondary transition-colors text-sm">Feed</Link>
              </>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin/dashboard" className="hover:text-secondary transition-colors flex items-center gap-1 text-sm">
                <Shield size={16} /> Admin
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user && <NotificationBell />}
            <Link to="/recently-viewed" className="hover:text-secondary transition-colors" title="Recently Viewed">
              <Clock size={22} />
            </Link>
            <Link to="/wishlist" className="relative hover:text-secondary transition-colors">
              <Heart size={22} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistItems.length > 9 ? '9+' : wishlistItems.length}
                </span>
              )}
            </Link>
            <button onClick={openCartDrawer} className="relative hover:text-secondary transition-colors">
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/orders" className="text-sm hover:text-secondary transition-colors">Orders</Link>
                <button onClick={logout} className="hover:text-secondary transition-colors" title="Logout">
                  <LogOut size={20} />
                </button>
                <Link to="/profile" className="flex items-center gap-2 text-sm hover:text-secondary transition-colors">
                  <User size={18} />
                  <span className="hidden lg:inline">{user.name}</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-sm hover:text-secondary transition-colors">Login</Link>
                <Link to="/register" className="bg-secondary text-primary px-4 py-2 rounded-md text-sm font-semibold hover:bg-secondary/90 transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-primary/95 border-t border-primary-700 px-4 pb-4">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-secondary">Home</Link>
          <Link to="/shop" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-secondary">Shop</Link>
          {!user && <Link to="/seller/register" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-secondary">Become an Artisan</Link>}
          {user?.role === 'customer' && <Link to="/seller/apply" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-secondary">Become an Artisan</Link>}
          {user ? (
            <>
              <Link to="/recently-viewed" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-secondary">Recently Viewed</Link>
              <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-secondary">Wishlist</Link>
              <button onClick={() => { openCartDrawer(); setMobileOpen(false); }} className="block py-2 hover:text-secondary w-full text-left">Cart ({itemCount})</button>
              <Link to="/orders" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-secondary">Orders</Link>
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-secondary">Profile</Link>
              {user.role === 'seller' && <Link to="/seller/dashboard" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-secondary">Seller Dashboard</Link>}
              {user.role === 'seller' && <Link to="/seller/feed" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-secondary">Seller Feed</Link>}
              {user.role === 'admin' && <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-secondary">Admin Dashboard</Link>}
              <button onClick={() => { logout(); setMobileOpen(false); }} className="block py-2 hover:text-secondary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-secondary">Login</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="block py-2 hover:text-secondary">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
