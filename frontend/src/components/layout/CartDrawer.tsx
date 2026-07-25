import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, totalItems, subtotal, updateQuantity, removeFromCart } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-card shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-heading text-xl font-semibold text-foreground">
                Shopping Cart ({totalItems})
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Discover authentic handmade crafts from Nepal's finest artisans.
                  </p>
                  <Button onClick={onClose} asChild>
                    <Link to="/shop">Start Shopping</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
                    const product =
                      typeof item.product === 'string' ? null : item.product;
                    if (!product) return null;

                    const imageUrl =
                      product.variants?.[0]?.images?.[0] || '';

                    return (
                      <div
                        key={product._id}
                        className="flex gap-4 p-3 rounded-lg border border-border"
                      >
                        <Link
                          to={`/shop/${product.slug}`}
                          onClick={onClose}
                          className="shrink-0"
                        >
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-accent">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/shop/${product.slug}`}
                            onClick={onClose}
                            className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                          >
                            {product.name}
                          </Link>
                          <p className="text-sm font-semibold text-primary mt-1">
                            {formatCurrency(item.price)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() =>
                                updateQuantity(product._id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className="h-7 w-7 flex items-center justify-center rounded-md border border-border hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-sm font-medium w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(product._id, item.quantity + 1)
                              }
                              className="h-7 w-7 flex items-center justify-center rounded-md border border-border hover:bg-accent transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(product._id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors self-start"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border px-6 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-lg font-semibold text-foreground">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Shipping &amp; taxes calculated at checkout
                </p>
                <Button className="w-full" size="lg" asChild>
                  <Link to="/checkout" onClick={onClose}>
                    Proceed to Checkout
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={onClose}
                  asChild
                >
                  <Link to="/cart">View Full Cart</Link>
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
