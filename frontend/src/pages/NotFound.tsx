import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Home, ShoppingBag, Info, Mail, ArrowLeft } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const popularLinks = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Shop', href: '/shop', icon: ShoppingBag },
  { label: 'About', href: '/#about', icon: Info },
  { label: 'Contact', href: '/#contact', icon: Mail },
];

export default function NotFound() {
  usePageTitle('Page Not Found — KalaBazzar', 'The page you are looking for does not exist.');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="max-w-lg w-full text-center"
      >
        {/* 404 */}
        <motion.div variants={fadeInUp}>
          <p className="text-[120px] md:text-[160px] font-heading font-bold text-primary/10 leading-none select-none">
            404
          </p>
        </motion.div>

        {/* Message */}
        <motion.div variants={fadeInUp} className="-mt-8">
          <h1 className="text-3xl md:text-4xl font-heading text-foreground">
            Page Not Found
          </h1>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div variants={fadeInUp} className="mt-8">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
            <div className="flex-1">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <Button type="submit">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </motion.div>

        {/* Popular Links */}
        <motion.div variants={fadeInUp} className="mt-10">
          <p className="text-sm text-muted-foreground mb-4">Popular Links</p>
          <div className="grid grid-cols-2 gap-3">
            {popularLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="group"
              >
                <Card variant="outlined" className="transition-colors hover:border-primary hover:bg-primary/5">
                  <CardContent className="p-4 flex items-center gap-3">
                    <link.icon className="h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors text-sm">
                      {link.label}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div variants={fadeInUp} className="mt-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
