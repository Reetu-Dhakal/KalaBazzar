import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineMenu, HiOutlineX, HiOutlineShoppingBag, HiOutlineHeart, HiOutlineUser, HiOutlineSearch } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setSearchOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-heading font-bold text-primary">
              Kala
            </span>
            <span className="text-2xl font-heading font-light text-primary-light">
              Bazaar
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.path
                    ? 'text-primary'
                    : 'text-text-muted'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:text-primary transition-colors"
              aria-label="Search"
            >
              <HiOutlineSearch className="w-5 h-5" />
            </button>

            <Link
              to="/dashboard"
              className="p-2 hover:text-primary transition-colors"
              aria-label="Dashboard"
            >
              <HiOutlineUser className="w-5 h-5" />
            </Link>

            <Link
              to="/cart"
              className="p-2 hover:text-primary transition-colors relative"
              aria-label="Cart"
            >
              <HiOutlineShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden lg:flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-primary transition-colors"
                >
                  <HiOutlineUser className="w-5 h-5" />
                  <span>{user.name.split(' ')[0]}</span>
                </Link>
                {user.role !== 'seller' && (
                  <Link
                    to="/become-seller"
                    className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-light transition-colors"
                  >
                    Sell
                  </Link>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden lg:inline-flex px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-light transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <HiOutlineX className="w-6 h-6" />
              ) : (
                <HiOutlineMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-t border-border"
          >
            <div className="container-custom py-4">
              <div className="relative max-w-2xl mx-auto">
                <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search handmade products..."
                  className="w-full pl-12 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:border-primary bg-background"
                  autoFocus
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white border-t border-border"
          >
            <div className="container-custom py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'bg-primary/5 text-primary'
                      : 'text-text-muted hover:bg-background'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <hr className="my-2 border-border" />
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block py-3 px-4 text-sm font-medium text-text-muted hover:bg-background rounded-lg"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left py-3 px-4 text-sm font-medium text-error hover:bg-background rounded-lg"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block py-3 px-4 text-sm font-medium text-text-muted hover:bg-background rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block py-3 px-4 text-sm font-medium text-primary hover:bg-background rounded-lg"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;