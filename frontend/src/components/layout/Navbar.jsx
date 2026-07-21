import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSearch, HiOutlineUser, HiOutlineShoppingBag, HiOutlineMenu, HiOutlineX, HiOutlineCube, HiOutlineCog } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setSearchOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'seller') return '/seller';
    return '/dashboard';
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-lg shadow-[0_1px_0_0_rgba(0,0,0,0.05)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="relative z-10 flex items-center gap-1">
            <span className="text-2xl font-heading font-semibold text-primary tracking-tight">
              Kala
            </span>
            <span className="text-2xl font-heading font-light text-text/80 tracking-tight">
              Bazaar
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-sm font-medium transition-colors duration-300 ${
                  location.pathname === link.path
                    ? 'text-primary'
                    : 'text-text/70 hover:text-text'
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 text-text/70 hover:text-text transition-colors duration-300"
              aria-label="Search"
            >
              <HiOutlineSearch className="w-5 h-5" />
            </button>

            {/* Account */}
            <Link
              to={getDashboardLink()}
              className="p-2.5 text-text/70 hover:text-text transition-colors duration-300 hidden sm:flex"
              aria-label="Account"
            >
              <HiOutlineUser className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2.5 text-text/70 hover:text-text transition-colors duration-300 relative"
              aria-label="Cart"
            >
              <HiOutlineShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth Button */}
            {user ? (
              <div className="hidden lg:flex items-center gap-3 ml-2">
                <Link
                  to={getDashboardLink()}
                  className="flex items-center gap-2 text-sm font-medium text-text/70 hover:text-text transition-colors"
                >
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span>{user.name.split(' ')[0]}</span>
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="p-2 text-text/70 hover:text-primary transition-colors"
                    title="Admin Dashboard"
                  >
                    <HiOutlineCog className="w-5 h-5" />
                  </Link>
                )}
                {user.role === 'seller' && (
                  <Link
                    to="/seller/products/new"
                    className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-light transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    + Add Product
                  </Link>
                )}
                {user.role === 'customer' && (
                  <Link
                    to="/become-seller"
                    className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-light transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    Sell
                  </Link>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden lg:inline-flex px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-light transition-all duration-300 shadow-sm hover:shadow-md ml-2"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2.5 text-text/70 hover:text-text transition-colors duration-300 ml-1"
              aria-label="Toggle menu"
            >
              {isOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <form onSubmit={handleSearch} className="py-4">
                <div className="relative max-w-2xl mx-auto">
                  <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search handmade treasures..."
                    className="w-full pl-12 pr-20 py-3.5 bg-white border border-border rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-light transition-colors"
                  >
                    Search
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white/98 backdrop-blur-lg border-t border-border/50"
          >
            <div className="px-6 py-6 space-y-1 max-h-[70vh] overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block py-3 px-4 rounded-xl text-base font-medium transition-all ${
                    location.pathname === link.path
                      ? 'bg-primary/5 text-primary'
                      : 'text-text/70 hover:bg-background'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-4 mt-4 border-t border-border">
                {user ? (
                  <>
                    <Link
                      to={getDashboardLink()}
                      className="flex items-center gap-3 py-3 px-4 text-base font-medium text-text/70 hover:bg-background rounded-xl"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      {user.name}
                      <span className="ml-auto px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full capitalize">
                        {user.role}
                      </span>
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 py-3 px-4 text-base font-medium text-text/70 hover:bg-background rounded-xl"
                      >
                        <HiOutlineCog className="w-5 h-5" />
                        Admin Dashboard
                      </Link>
                    )}
                    {user.role === 'seller' && (
                      <Link
                        to="/seller"
                        className="flex items-center gap-3 py-3 px-4 text-base font-medium text-text/70 hover:bg-background rounded-xl"
                      >
                        <HiOutlineCube className="w-5 h-5" />
                        Seller Dashboard
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="block w-full text-left py-3 px-4 text-base font-medium text-red-600 hover:bg-red-50 rounded-xl mt-1"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block py-3 px-4 text-base font-medium text-text/70 hover:bg-background rounded-xl"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="block py-3 px-4 text-base font-medium text-primary hover:bg-primary/5 rounded-xl"
                    >
                      Create Account
                    </Link>
                    <Link
                      to="/become-seller"
                      className="block mt-2 py-3.5 px-4 bg-primary text-white text-center font-medium rounded-xl"
                    >
                      Start Selling
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
