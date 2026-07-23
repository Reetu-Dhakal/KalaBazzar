import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from '../ScrollToTop';
import BackToTop from './BackToTop';
import { CartDrawerProvider } from './CartDrawer';

export default function Layout() {
  return (
    <CartDrawerProvider>
      <div className="min-h-screen flex flex-col bg-surface font-body text-text">
        <ScrollToTop />
        <BackToTop />
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </CartDrawerProvider>
  );
}
