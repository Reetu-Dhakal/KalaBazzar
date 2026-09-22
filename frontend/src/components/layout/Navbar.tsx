import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Heart,
  Menu,
  X,
  ChevronDown,
  User,
  Package,
  Store,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { NotificationBell } from './NotificationBell';
import { cn } from '@/lib/utils';
import { navigateAndScroll } from '@/lib/scrollTo';
import api from '@/lib/api';
import type { Category, Product } from '@/types';

const guestNavSections = ['features'];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSignupMenuOpen, setIsSignupMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const signupMenuRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const role = user?.role;
  const activeSection = useScrollSpy(guestNavSections, 100);
  const isShopPage =
    location.pathname === '/' ||
    location.pathname === '/shop' ||
    location.pathname.startsWith('/category/');

  const guestLinks = [
    { label: 'Home', section: 'hero' },
    { label: 'Features', section: 'features' },
  ];

  const handleGuestNav = (section: string) => {
    setIsMobileMenuOpen(false);
    if (section === 'hero') {
      if (location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate('/');
      }
    } else {
      navigateAndScroll(section, navigate, location.pathname);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setIsScrolled(currentY > 10);

      if (currentY < 10) {
        setIsHidden(false);
      } else if (currentY > lastScrollY.current + 5) {
        setIsHidden(true);
        setIsUserMenuOpen(false);
        setIsSignupMenuOpen(false);
        setIsSearchOpen(false);
      } else if (currentY < lastScrollY.current - 5) {
        setIsHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isShopPage) return;
    api.get('/categories').then(({ data }) => {
      setCategories(data.data || []);
    }).catch(() => setCategories([]));
  }, [isShopPage]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (signupMenuRef.current && !signupMenuRef.current.contains(event.target as Node)) {
        setIsSignupMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

      if (query.trim().length < 2) {
        setSearchResults([]);
        setIsSearchOpen(false);
        return;
      }

      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const { data } = await api.get('/products', {
            params: { search: query, limit: 5, status: 'approved' },
          });
          setSearchResults(data.data || []);
          setIsSearchOpen(true);
        } catch {
          setSearchResults([]);
        }
      }, 300);
    },
    [],
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const customerLinks = [
    { to: '/shop', label: 'Shop' },
  ];

  const sellerLinks = [
    { to: '/seller/dashboard', label: 'Dashboard' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard' },
  ];

  const navLinks = !isAuthenticated
    ? []
    : role === 'admin'
      ? adminLinks
      : role === 'seller'
        ? sellerLinks
        : customerLinks;

  const showSearch = !role || role === 'customer';
  const showWishlist = !role || role === 'customer';
  const showCart = role === 'customer';

  return (
    <>
      <header
        className={cn(
          'site-navbar sticky top-0 z-50 transition-all duration-300 ease-in-out border-b border-white/10 shadow-md',
          isShopPage && 'shop-navbar',
          isScrolled && !isHidden && 'shadow-lg shadow-black/20',
          isHidden && !isShopPage && '-translate-y-full',
        )}
      >
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-8">
              <Link to={isAuthenticated && role === 'admin' ? '/admin/dashboard' : isAuthenticated && role === 'seller' ? '/seller/dashboard' : '/'} className="shrink-0">
                <span className="font-heading text-xl font-bold text-white sm:text-2xl">
                  कलाbazzar
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                {!isAuthenticated && !isShopPage && guestLinks.map((link) => (
                  <button
                    key={link.section}
                    onClick={() => handleGuestNav(link.section)}
                    className={cn(
                      'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      activeSection === link.section
                        ? 'text-gold-300 bg-white/10'
                        : 'text-white/85 hover:text-gold-300 hover:bg-white/10',
                    )}
                  >
                    {link.label}
                  </button>
                ))}
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="px-3 py-2 text-sm font-medium text-white/85 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {showSearch && (
              <div ref={searchRef} className={cn('relative mx-auto flex-1 hidden sm:block', isShopPage ? 'shop-navbar-search' : 'max-w-sm')}>
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A1F2B]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Search handmade crafts..."
                      className={cn(
                        'w-full h-10 pl-10 rounded-md border bg-[#FFFDF8] text-sm text-[#4A1018] placeholder:text-[#85645A] focus:outline-none transition-colors',
                        isShopPage ? 'border-[#E2E2E2] pr-4 focus:border-[#222] focus:ring-2 focus:ring-black/10' : 'border-[#E5CFA6] pr-4 focus:ring-2 focus:ring-[#C9972F]/40 focus:border-[#C9972F]',
                      )}
                    />
                  </div>
                </form>

                {isSearchOpen && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
                    {searchResults.map((product) => (
                      <Link
                        key={product._id}
                        to={`/shop/${product.slug}`}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors border-b border-border/50 last:border-0"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-accent shrink-0">
                          {product.variants?.[0]?.images?.[0] ? (
                            <img
                              src={product.variants[0].images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            NPR {product.basePrice}
                          </p>
                        </div>
                      </Link>
                    ))}
                    <Link
                      to={`/shop?search=${encodeURIComponent(searchQuery)}`}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="block px-4 py-2.5 text-xs font-medium text-primary hover:bg-surface-hover transition-colors text-center"
                    >
                      View all results
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-1">
              <NotificationBell dark />

              {showWishlist && (
                <button
                  onClick={() => navigate('/wishlist')}
                  className="relative p-2 rounded-lg transition-colors hidden sm:flex text-white/90 hover:text-white hover:bg-white/10"
                  aria-label="Wishlist"
                >
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {wishlistCount}
                    </span>
                  )}
                </button>
              )}

              {showCart && (
                <Link
                  to="/cart"
                  className="relative p-2 rounded-lg transition-colors text-white/90 hover:text-white hover:bg-white/10"
                  aria-label="Cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}

              {isAuthenticated ? (
                <div ref={userMenuRef} className="relative hidden md:block">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-white/10"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.firstName}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded-full flex items-center justify-center bg-white/15">
                        <span className="text-xs font-semibold text-white">
                          {user?.firstName?.[0]}
                          {user?.lastName?.[0]}
                        </span>
                      </div>
                    )}
                    <ChevronDown className="h-3.5 w-3.5 text-white/70" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-scale-in">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-medium text-foreground">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-surface-hover transition-colors"
                        >
                          <User className="h-4 w-4 text-muted-foreground" />
                          Profile
                        </Link>
                        {role === 'customer' && (
                          <Link
                            to="/orders"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-surface-hover transition-colors"
                          >
                            <Package className="h-4 w-4 text-muted-foreground" />
                            My Orders
                          </Link>
                        )}
                        {(role === 'customer' && (user?.sellerApplication === 'pending' || user?.sellerApplication === 'rejected')) && (
                          <Link
                            to="/seller/apply"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-surface-hover transition-colors"
                          >
                            <Store className="h-4 w-4 text-muted-foreground" />
                            Seller Application
                          </Link>
                        )}
                        {role === 'seller' && (
                          <>
                            <Link
                              to="/seller/dashboard"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-surface-hover transition-colors"
                            >
                              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                              Seller Dashboard
                            </Link>
                            <Link
                              to="/seller/products"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-surface-hover transition-colors"
                            >
                              <Package className="h-4 w-4 text-muted-foreground" />
                              My Products
                            </Link>
                            <Link
                              to="/seller/orders"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-surface-hover transition-colors"
                            >
                              <Package className="h-4 w-4 text-muted-foreground" />
                              My Orders
                            </Link>
                            <Link
                              to="/seller/profile"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-surface-hover transition-colors"
                            >
                              <Store className="h-4 w-4 text-muted-foreground" />
                              Shop Profile
                            </Link>
                          </>
                        )}
                        {role === 'admin' && (
                          <>
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-surface-hover transition-colors"
                            >
                              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                              Admin Dashboard
                            </Link>
                            <Link
                              to="/admin/sellers"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-surface-hover transition-colors"
                            >
                              <Store className="h-4 w-4 text-muted-foreground" />
                              Manage Sellers
                            </Link>
                            <Link
                              to="/admin/orders"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-surface-hover transition-colors"
                            >
                              <Package className="h-4 w-4 text-muted-foreground" />
                              Manage Orders
                            </Link>
                          </>
                        )}
                      </div>
                      <div className="border-t border-border py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors w-full"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-6">
                  <Link
                    to="/login"
                    className="text-sm font-medium transition-colors text-white/90 hover:text-gold-300"
                  >
                    Login
                  </Link>
                  <div ref={signupMenuRef} className="relative">
                    <button
                      onClick={() => setIsSignupMenuOpen(!isSignupMenuOpen)}
                      className="flex items-center gap-1 text-sm font-medium transition-colors text-white/90 hover:text-gold-300"
                    >
                      Sign up
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    {isSignupMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-scale-in">
                        <Link
                          to="/register"
                          onClick={() => setIsSignupMenuOpen(false)}
                          className="flex items-start gap-3 px-4 py-3 text-sm text-foreground hover:bg-surface-hover transition-colors"
                        >
                          <User className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                          <span>
                            <span className="block font-medium">Sign up as Customer</span>
                            <span className="block text-xs text-muted-foreground">Shop and order crafts</span>
                          </span>
                        </Link>
                        <Link
                          to="/seller/register"
                          onClick={() => setIsSignupMenuOpen(false)}
                          className="flex items-start gap-3 px-4 py-3 text-sm text-foreground hover:bg-surface-hover transition-colors border-t border-border"
                        >
                          <Store className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                          <span>
                            <span className="block font-medium">Become a Seller</span>
                            <span className="block text-xs text-muted-foreground">Sell your crafts to the world</span>
                          </span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors md:hidden"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {showSearch && (
            <div className="sm:hidden pb-3">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A1F2B]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search handmade crafts..."
                    className="w-full h-9 pl-10 pr-4 rounded-md border border-[#E5CFA6] bg-[#FFFDF8] text-[#4A1018] text-sm placeholder:text-[#85645A] focus:outline-none focus:ring-2 focus:ring-[#C9972F]/40 focus:border-[#C9972F]"
                  />
                </div>
              </form>
            </div>
          )}
        </nav>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#1A2340]">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {!isAuthenticated && !isShopPage && guestLinks.map((link) => (
                <button
                  key={link.section}
                  onClick={() => handleGuestNav(link.section)}
                  className={cn(
                    'block w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-colors',
                    activeSection === link.section
                      ? 'text-gold-300 bg-white/10'
                      : 'text-white/85 hover:text-gold-300 hover:bg-white/10',
                  )}
                >
                  {link.label}
                </button>
              ))}
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-white/85 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              {isShopPage && showSearch && (
                <div className="border-t border-white/10 pt-2">
                  <p className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-300">Categories</p>
                  <Link
                    to="/shop"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    All Categories
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category._id}
                      to={`/shop?category=${category.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block rounded-lg px-4 py-2.5 text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}

              {showWishlist && (
                <Link
                  to="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-white/85 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Heart className="h-4 w-4" />
                  Wishlist
                  {wishlistCount > 0 && (
                    <span className="ml-auto text-xs bg-gold-500 text-[#1A2340] px-2 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              {isAuthenticated ? (
                <>
                  <div className="border-t border-white/10 my-2 pt-2">
                    <div className="px-4 py-2">
                      <p className="text-sm font-medium text-white">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-white/60">{user?.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/85 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  {role === 'customer' && (
                    <Link
                      to="/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/85 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Package className="h-4 w-4" />
                      My Orders
                    </Link>
                  )}
                  {(role === 'customer' && (user?.sellerApplication === 'pending' || user?.sellerApplication === 'rejected')) && (
                    <Link
                      to="/seller/apply"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/85 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Store className="h-4 w-4" />
                      Seller Application
                    </Link>
                  )}
                  {role === 'seller' && (
                    <>
                      <Link
                        to="/seller/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/85 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Store className="h-4 w-4" />
                        Seller Dashboard
                      </Link>
                      <Link
                        to="/seller/products"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/85 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Package className="h-4 w-4" />
                        My Products
                      </Link>
                      <Link
                        to="/seller/orders"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/85 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Package className="h-4 w-4" />
                        My Orders
                      </Link>
                      <Link
                        to="/seller/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/85 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Store className="h-4 w-4" />
                        Shop Profile
                      </Link>
                    </>
                  )}
                  {role === 'admin' && (
                    <>
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/85 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                      <Link
                        to="/admin/sellers"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/85 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Store className="h-4 w-4" />
                        Manage Sellers
                      </Link>
                      <Link
                        to="/admin/orders"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/85 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Package className="h-4 w-4" />
                        Manage Orders
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-white/10 rounded-lg transition-colors w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="border-t border-white/10 my-2 pt-2 px-4">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-white/85 transition-colors hover:text-white"
                  >
                    Login
                  </Link>
                  <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold-300">
                    Sign up
                  </p>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-white/85 transition-colors hover:text-white"
                  >
                    <User className="h-4 w-4" />
                    Sign up as Customer
                  </Link>
                  <Link
                    to="/seller/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-white/85 transition-colors hover:text-white"
                  >
                    <Store className="h-4 w-4" />
                    Become a Seller
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
