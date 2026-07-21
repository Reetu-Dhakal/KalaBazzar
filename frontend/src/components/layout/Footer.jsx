import { Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone, HiOutlineMap } from 'react-icons/hi';
import { FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-border/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-1 mb-5">
              <span className="text-2xl font-heading font-semibold text-primary tracking-tight">Kala</span>
              <span className="text-2xl font-heading font-light text-text/80 tracking-tight">Bazaar</span>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed mb-8 max-w-sm">
              A curated marketplace for authentic Nepali handcrafted treasures. Connecting artisans with appreciative homes worldwide.
            </p>
            <div className="flex gap-2">
              {[
                { icon: FaInstagram, label: 'Instagram' },
                { icon: FaFacebook, label: 'Facebook' },
                { icon: FaTwitter, label: 'Twitter' },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-background hover:bg-primary hover:text-white text-text/70 flex items-center justify-center transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="text-sm font-semibold text-text uppercase tracking-wider mb-5">Discover</h4>
            <ul className="space-y-3">
              {[
                { name: 'Shop All', path: '/shop' },
                { name: 'Artisans', path: '/shop' },
                { name: 'Categories', path: '/shop' },
                { name: 'New Arrivals', path: '/shop?sort=newest' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-text-muted hover:text-primary transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold text-text uppercase tracking-wider mb-5">Company</h4>
            <ul className="space-y-3">
              {[
                { name: 'About', path: '/about' },
                { name: 'Become a Seller', path: '/become-seller' },
                { name: 'Contact', path: '/contact' },
                { name: 'Privacy', path: '/about' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-text-muted hover:text-primary transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold text-text uppercase tracking-wider mb-5">Contact</h4>
            <ul className="space-y-4">
              <li>
                <div className="flex items-start gap-3">
                  <HiOutlineMap className="w-4 h-4 text-primary mt-0.5" />
                  <span className="text-sm text-text-muted">Kathmandu, Nepal</span>
                </div>
              </li>
              <li>
                <a href="tel:+977-1-2345678" className="flex items-center gap-3 text-text-muted hover:text-primary transition-colors">
                  <HiOutlinePhone className="w-4 h-4" />
                  <span className="text-sm">+977-1-2345678</span>
                </a>
              </li>
              <li>
                <a href="mailto:info@kalabazaar.com" className="flex items-center gap-3 text-text-muted hover:text-primary transition-colors">
                  <HiOutlineMail className="w-4 h-4" />
                  <span className="text-sm">info@kalabazaar.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            {new Date().getFullYear()} Kala Bazaar Nepal. Crafted with care.
          </p>
          <p className="text-xs text-text-muted">
            Preserving heritage through craftsmanship.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;