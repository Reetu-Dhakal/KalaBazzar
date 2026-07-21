import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineTrash, HiOutlinePlus, HiOutlineMinus, HiOutlineArrowLeft, HiOutlineShoppingBag } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui';

const Cart = () => {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const [isUpdating, setIsUpdating] = useState({});

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setIsUpdating(prev => ({ ...prev, [itemId]: true }));
    await updateQuantity(itemId, newQuantity);
    setIsUpdating(prev => ({ ...prev, [itemId]: false }));
  };

  const handleRemove = async (itemId) => {
    await removeItem(itemId);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto"
          >
            <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineShoppingBag className="w-12 h-12 text-text-muted" />
            </div>
            <h1 className="font-heading text-4xl font-semibold text-text mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-text-muted mb-8">
              Looks like you haven't added any items to your cart yet. Start exploring our collection of handcrafted treasures.
            </p>
            <Link to="/shop">
              <Button size="lg" icon={HiOutlineArrowLeft}>
                Continue Shopping
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-heading text-4xl md:text-5xl font-semibold text-text mb-2">
            Shopping Cart
          </h1>
          <p className="text-text-muted">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl border border-border/50 p-4 md:p-6"
                >
                  <div className="flex gap-4 md:gap-6">
                    {/* Image */}
                    <Link to={`/product/${item.slug}`} className="shrink-0">
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-background">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-4 mb-3">
                        <div>
                          <Link 
                            to={`/product/${item.slug}`}
                            className="font-medium text-text hover:text-primary transition-colors line-clamp-2 mb-1"
                          >
                            {item.name}
                          </Link>
                          <p className="text-sm text-text-muted">Rs. {item.price?.toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => handleRemove(item._id)}
                          className="p-2 text-text-muted hover:text-error transition-colors shrink-0"
                          aria-label="Remove item"
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Quantity & Total */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-background rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isUpdating[item._id]}
                            className="p-2 text-text hover:text-primary transition-colors disabled:opacity-50"
                            aria-label="Decrease quantity"
                          >
                            <HiOutlineMinus className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-medium w-8 text-center">
                            {isUpdating[item._id] ? '...' : item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            disabled={isUpdating[item._id]}
                            className="p-2 text-text hover:text-primary transition-colors disabled:opacity-50"
                            aria-label="Increase quantity"
                          >
                            <HiOutlinePlus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="font-heading font-semibold text-primary text-lg">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-border/50 p-6 md:p-8 sticky top-28"
            >
              <h2 className="font-heading text-2xl font-semibold text-text mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Subtotal</span>
                  <span className="text-text font-medium">Rs. {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Shipping</span>
                  <span className="text-text font-medium">
                    {total > 2000 ? 'Free' : 'Rs. 150'}
                  </span>
                </div>
                {total <= 2000 && (
                  <p className="text-xs text-text-muted">
                    Add Rs. {(2000 - total).toLocaleString()} more for free delivery
                  </p>
                )}
                <Divider />
                <div className="flex justify-between text-lg pt-2">
                  <span className="font-semibold text-text">Total</span>
                  <span className="font-heading font-semibold text-primary">
                    Rs. {(total + (total > 2000 ? 0 : 150)).toLocaleString()}
                  </span>
                </div>
              </div>

              <Link to="/checkout">
                <Button className="w-full" size="lg">
                  Proceed to Checkout
                </Button>
              </Link>

              <Link
                to="/shop"
                className="flex items-center justify-center gap-2 text-sm text-text-muted hover:text-primary transition-colors mt-4"
              >
                <HiOutlineArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Divider = ({ className = '' }) => (
  <div className={`w-full h-px bg-border ${className}`} />
);

export default Cart;