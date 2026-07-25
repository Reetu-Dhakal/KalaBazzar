import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Trash2, ShoppingBag } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

export default function RecentlyViewed() {
  usePageTitle('Recently Viewed — KalaBazzar', 'Continue where you left off.');
  const { recentItems, clearHistory } = useRecentlyViewed();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-primary py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-2xl mx-auto text-center"
          >
            <motion.div variants={fadeInUp}>
              <Clock className="h-12 w-12 text-primary-foreground/60 mx-auto mb-4" />
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-heading text-primary-foreground"
            >
              Recently Viewed
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-primary-foreground/80"
            >
              Products you have recently browsed
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {recentItems.length > 0 ? (
              <>
                {/* Actions */}
                <motion.div variants={fadeInUp} className="flex items-center justify-between mb-8">
                  <p className="text-muted-foreground">
                    {recentItems.length} {recentItems.length === 1 ? 'item' : 'items'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearHistory}
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear History
                  </Button>
                </motion.div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                  {recentItems.map((item) => (
                    <motion.div key={item._id} variants={fadeInUp}>
                      <Link
                        to={`/shop/${item.slug}`}
                        className="group block"
                      >
                        <div className="relative overflow-hidden rounded-xl bg-card border border-border">
                          <div className="aspect-square overflow-hidden">
                            <img
                              src={item.images?.[0] || '/placeholder.jpg'}
                              alt={item.name}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors text-sm">
                            {item.name}
                          </h3>
                          <span className="mt-1 text-sm font-semibold text-primary block">
                            {formatCurrency(item.basePrice)}
                          </span>
                          {item.category && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.category}
                            </p>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              /* Empty State */
              <motion.div variants={fadeInUp}>
                <Card>
                  <CardContent className="p-12 text-center">
                    <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h2 className="text-2xl font-heading text-foreground mb-2">
                      No Recently Viewed Products
                    </h2>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      Start exploring our collection and the products you view
                      will appear here.
                    </p>
                    <Button asChild size="lg">
                      <Link to="/shop">
                        Browse Products
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
