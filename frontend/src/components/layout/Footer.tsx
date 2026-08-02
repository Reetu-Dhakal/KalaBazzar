import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import toast from 'react-hot-toast';

const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/#about', label: 'About' },
  { to: '/#contact', label: 'Contact' },
  { to: '/#faq', label: 'FAQ' },
];

const categoryLinks = [
  { to: '/shop?category=pottery', label: 'Pottery' },
  { to: '/shop?category=woodwork', label: 'Woodwork' },
  { to: '/shop?category=textiles', label: 'Textiles' },
  { to: '/shop?category=metalwork', label: 'Metalwork' },
  { to: '/shop?category=paintings', label: 'Paintings' },
];

const socialLinks = [
  { href: 'https://facebook.com', label: 'Facebook', icon: Facebook },
  { href: 'https://instagram.com', label: 'Instagram', icon: Instagram },
  { href: 'https://youtube.com', label: 'YouTube', icon: Youtube },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Thanks for subscribing!');
      setEmail('');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer>
      <div className="bg-[#1C1917] text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <rect width="32" height="32" rx="8" fill="#FFFCF5" />
                  <text x="7" y="23" fontFamily="Georgia, serif" fontSize="20" fontWeight="bold" fill="#2D1810">K</text>
                  <circle cx="24" cy="9" r="2.5" fill="#C0392B" />
                </svg>
                <span className="font-heading text-2xl font-bold">Kala Bazaar</span>
              </Link>
              <p className="text-sm text-white/70 leading-relaxed max-w-sm mb-6">
                Nepal&apos;s premier artisan marketplace connecting you with authentic handmade crafts.
                Every purchase supports local artisans and preserves centuries-old traditions.
              </p>
              <div className="space-y-3">
                <a
                  href="mailto:hello@kalabazaar.com"
                  className="flex items-center gap-3 text-sm text-white/70 hover:text-white transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  kalabazaar@gmail.com
                </a>
                <a
                  href="tel:+977-1-4567890"
                  className="flex items-center gap-3 text-sm text-white/70 hover:text-white transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  +977-******
                </a>
                <div className="flex items-start gap-3 text-sm text-white/70">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Kathmandu, Nepal</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-heading text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-heading text-lg font-semibold mb-4">Categories</h4>
              <ul className="space-y-2.5">
                {categoryLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-heading text-lg font-semibold mb-4">Stay Connected</h4>
              <p className="text-sm text-white/70 mb-4">
                Subscribe to get updates on new artisans and exclusive offers.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full h-10 pl-4 pr-12 rounded-lg bg-white/10 border border-white/20 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-secondary"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="absolute right-1 top-1 h-8 w-8 flex items-center justify-center rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
              <div className="flex items-center gap-3 mt-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 w-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/60">
              &copy; {new Date().getFullYear()} Kala Bazaar. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
