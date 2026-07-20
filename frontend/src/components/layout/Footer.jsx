import { Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-primary text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <span className="text-2xl font-heading font-bold text-white">Kala</span>
              <span className="text-2xl font-heading font-light text-secondary">Bazaar</span>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Nepal's trusted marketplace connecting you with authentic handmade products from skilled artisans across the country.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Facebook">
                <FaFacebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Instagram">
                <FaInstagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Twitter">
                <FaTwitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Youtube">
                <FaYoutube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { name: 'About Us', path: '/about' },
                { name: 'Shop All', path: '/shop' },
                { name: 'Become a Seller', path: '/become-seller' },
                { name: 'Contact', path: '/contact' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-white/70 text-sm hover:text-secondary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-3">
              {[
                { name: 'Help Center', path: '/contact' },
                { name: 'Shipping Info', path: '/about' },
                { name: 'Returns & Refunds', path: '/contact' },
                { name: 'Privacy Policy', path: '/about' },
                { name: 'Terms of Service', path: '/about' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-white/70 text-sm hover:text-secondary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">Get in Touch</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <HiOutlineLocationMarker className="w-5 h-5 text-secondary mt-0.5" />
                <span className="text-white/70 text-sm">
                  Kathmandu, Nepal
                </span>
              </li>
              <li className="flex items-center gap-3">
                <HiOutlinePhone className="w-5 h-5 text-secondary" />
                <a href="tel:+977-1-2345678" className="text-white/70 text-sm hover:text-secondary transition-colors">
                  +977-1-2345678
                </a>
              </li>
              <li className="flex items-center gap-3">
                <HiOutlineMail className="w-5 h-5 text-secondary" />
                <a href="mailto:info@kalabazaar.com" className="text-white/70 text-sm hover:text-secondary transition-colors">
                  info@kalabazaar.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-lg font-heading font-semibold mb-2">Stay Connected</h3>
            <p className="text-white/70 text-sm mb-4">
              Subscribe to discover new artisans, exclusive offers, and Nepali craft stories.
            </p>
            <form className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:border-secondary"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-secondary text-primary font-medium text-sm rounded-lg hover:bg-secondary/90 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="container-custom py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-white/60 text-xs">
            © {new Date().getFullYear()} Kala Bazaar Nepal. All rights reserved.
          </p>
          <p className="text-white/40 text-xs">
            Empowering Nepali artisans, one craft at a time.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;