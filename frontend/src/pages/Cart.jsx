import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineTrash, HiOutlineMinus, HiOutlinePlus, HiOutlineArrowLeft, HiOutlineShoppingBag } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <HiOutlineShoppingBag className="w-20 h-20 text-text-muted mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-bold mb-2">Your cart is empty</h2>
          <p className="text-text-muted mb-6">Looks like you haven't added anything yet.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl">
            <HiOutlineArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container-custom py-8">
        <h1 className="text-3xl font-heading font-bold mb-8">Shopping Cart ({itemCount} items)</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.product}
                layout
                className="bg-white rounded-xl p-4 flex gap-4"
              >
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=200'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link to={`/product/${item.slug}`} className="font-medium text-sm hover:text-primary transition-colors">
                        {item.name}
                      </Link>
                      <p className="text-sm text-text-muted mt-0.5">Rs. {item.price?.toLocaleString()}</p>
                    </div>
                    <button onClick={() => removeItem(item.product)} className="p-1 hover:text-error transition-colors">
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-border rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.product, item.quantity - 1)}
                        className="p-2 hover:bg-background transition-colors"
                      >
                        <HiOutlineMinus className="w-4 h-4" />
                      </button>
                      <span className="px-4 text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product, item.quantity + 1)}
                        className="p-2 hover:bg-background transition-colors"
                      >
                        <HiOutlinePlus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-heading font-bold text-primary">
                      Rs. {(item.price * item.quantity)?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 sticky top-24">
              <h3 className="font-heading font-semibold text-lg mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Subtotal</span>
                  <span className="font-medium">Rs. {subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Shipping</span>
                  <span className="font-medium text-success">Free</span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between text-base">
                  <span className="font-medium">Total</span>
                  <span className="font-heading font-bold text-primary text-lg">Rs. {subtotal?.toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full mt-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition-colors"
              >
                Proceed to Checkout
              </button>
              <Link to="/shop" className="block text-center mt-3 text-sm text-text-muted hover:text-primary transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;