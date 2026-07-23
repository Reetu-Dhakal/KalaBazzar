import { Link, useNavigate } from 'react-router-dom';
import { Heart, Shield, Truck, Leaf } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();

  const scrollToContact = (e) => {
    e.preventDefault();
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-heading font-bold mb-4">Kala Bazaar</h3>
            <p className="text-primary-100 text-sm leading-relaxed">
              Nepal's premier marketplace connecting you with authentic Nepali artisans and handmade crafts.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 uppercase tracking-wider text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-100">
              <li><Link to="/shop" className="hover:text-secondary transition-colors">All Products</Link></li>
              <li><Link to="/seller/register" className="hover:text-secondary transition-colors">Become an Artisan</Link></li>
              <li><Link to="/faq" className="hover:text-secondary transition-colors">Help Center</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 uppercase tracking-wider text-sm">Support</h4>
            <ul className="space-y-2 text-sm text-primary-100">
              <li><a href="/" onClick={scrollToContact} className="hover:text-secondary transition-colors cursor-pointer">Contact Us</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Returns</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 uppercase tracking-wider text-sm">Why Kala Bazaar</h4>
            <ul className="space-y-3 text-sm text-primary-100">
              <li className="flex items-center gap-2"><Shield size={16} /> Verified Artisans</li>
              <li className="flex items-center gap-2"><Truck size={16} /> Nationwide Delivery</li>
              <li className="flex items-center gap-2"><Heart size={16} /> Authentic Crafts</li>
              <li className="flex items-center gap-2"><Leaf size={16} /> Eco-friendly</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-700 mt-8 pt-8 text-center text-sm text-primary-200">
          <div className="flex justify-center gap-4 mb-3">
            <Link to="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-secondary transition-colors">Terms of Service</Link>
            <Link to="/faq" className="hover:text-secondary transition-colors">FAQ</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} Kala Bazaar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
