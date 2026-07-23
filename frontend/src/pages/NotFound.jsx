import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import usePageTitle from '../hooks/usePageTitle';
import { Home, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  usePageTitle('Page Not Found');
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <div className="text-8xl font-heading font-bold text-primary mb-2">404</div>
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-heading font-semibold mb-2">Lost your way?</h2>
        <p className="text-text-secondary mb-8">The page you're looking for doesn't exist or has been moved. Let's get you back on track.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/"><Button><Home size={18} className="mr-2" /> Home</Button></Link>
          <Link to="/shop"><Button variant="secondary"><ShoppingBag size={18} className="mr-2" /> Shop</Button></Link>
        </div>
        <div className="mt-8 pt-8 border-t text-sm text-text-muted">
          <p>Popular pages:</p>
          <div className="flex flex-wrap gap-3 justify-center mt-3">
            <Link to="/shop" className="text-primary hover:underline">All Products</Link>
            <Link to="/seller/apply" className="text-primary hover:underline">Become a Seller</Link>
            <Link to="/about" className="text-primary hover:underline">About Us</Link>
            <Link to="/contact" className="text-primary hover:underline">Contact</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
