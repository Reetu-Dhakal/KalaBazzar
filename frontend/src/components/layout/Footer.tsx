import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { CONTACT, SOCIAL_LINKS } from '@/lib/contact';

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
  { href: SOCIAL_LINKS.facebook, label: 'Facebook', icon: Facebook },
  { href: SOCIAL_LINKS.instagram, label: 'Instagram', icon: Instagram },
  { href: SOCIAL_LINKS.youtube, label: 'YouTube', icon: Youtube },
];

export function Footer({ className = '' }: { className?: string }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/newsletter', { email });
      toast.success('Thanks for subscribing!');
      setEmail('');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className={`site-footer ${className}`}>
      <div className="bg-[#4A1018] text-[#FFF7E6]">
        <div className="container mx-auto px-4 py-7">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-2">
                <span className="font-heading text-xl font-bold text-[#FFF7E6]">कलाbazzar</span>
              </Link>
              <p className="text-xs text-[#F8E7C1] leading-relaxed max-w-sm mb-3">
                Nepal&apos;s premier artisan marketplace connecting you with authentic handmade crafts.
                Every purchase supports local artisans and preserves centuries-old traditions.
              </p>
              <div className="space-y-1.5">
                <a
                  href={CONTACT.emailHref}
                  className="flex items-center gap-2.5 text-xs text-[#F8E7C1] hover:text-[#E3C36F] transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {CONTACT.email}
                </a>
                <a
                  href={CONTACT.phoneHref}
                  className="flex items-center gap-2.5 text-xs text-[#F8E7C1] hover:text-[#E3C36F] transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {CONTACT.phone}
                </a>
                <div className="flex items-start gap-2.5 text-xs text-[#F8E7C1]">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{CONTACT.address}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-heading text-sm font-semibold mb-3 text-[#E3C36F]">Quick Links</h4>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-xs text-[#F8E7C1] hover:text-[#E3C36F] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-heading text-sm font-semibold mb-3 text-[#E3C36F]">Categories</h4>
              <ul className="space-y-2">
                {categoryLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-xs text-[#F8E7C1] hover:text-[#E3C36F] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <h4 className="font-heading text-sm font-semibold mb-3 text-[#E3C36F]">Stay Connected</h4>
              <p className="text-xs text-[#F8E7C1] mb-3">
                Get updates on new artisans and offers.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-2.5">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full h-9 pl-3.5 pr-10 bg-[#FFF7E6] border border-[#C9972F] text-xs placeholder:text-[#85645A] focus:outline-none focus:ring-1 focus:ring-[#C9972F]"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="absolute right-1 top-1 h-7 w-7 flex items-center justify-center bg-secondary text-secondary-foreground hover:bg-[#B9832F] transition-colors disabled:opacity-50"
                  >
                    <Send className="h-3 w-3" />
                  </button>
                </div>
              </form>
              <div className="flex items-center gap-2.5 mt-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 w-8 flex items-center justify-center bg-[#FFF7E6] text-[#4A1018] border border-[#C9972F]/50 hover:border-[#C9972F] transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-[#C9972F]/40 mt-4 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[#F8E7C1]">
              &copy; {new Date().getFullYear()} कलाbazzar. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
