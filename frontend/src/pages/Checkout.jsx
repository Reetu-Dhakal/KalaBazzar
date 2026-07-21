import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowLeft, HiOutlineMap, HiOutlineMail, HiOutlinePhone } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui';

const Checkout = () => {
  const { items, total } = useCart();
  const [step, setStep] = useState(1);

  const shipping = total > 2000 ? 0 : 150;
  const finalTotal = total + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto"
          >
            <h1 className="font-heading text-4xl font-semibold text-text mb-4">
              No items to checkout
            </h1>
            <p className="text-text-muted mb-8">
              Add some handcrafted items to your cart before checking out.
            </p>
            <Link to="/shop">
              <Button size="lg" icon={HiOutlineArrowLeft}>
                Start Shopping
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors mb-4">
            <HiOutlineArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>
          <h1 className="font-heading text-4xl md:text-5xl font-semibold text-text">
            Checkout
          </h1>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="flex items-center gap-4 mb-8">
              {['Shipping', 'Payment', 'Review'].map((label, idx) => (
                <div key={label} className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      step > idx + 1 ? 'bg-primary text-white' : step === idx + 1 ? 'bg-primary text-white' : 'bg-background text-text-muted'
                    }`}>
                      {step > idx + 1 ? '✓' : idx + 1}
                    </div>
                    <span className={`text-sm font-medium hidden sm:inline ${step === idx + 1 ? 'text-text' : 'text-text-muted'}`}>
                      {label}
                    </span>
                  </div>
                  {idx < 2 && <div className="flex-1 h-px bg-border" />}
                </div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-border/50 p-6 md:p-8"
            >
              {step === 1 && (
                <div>
                  <h2 className="font-heading text-2xl font-semibold text-text mb-6">
                    Shipping Information
                  </h2>
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">First Name</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">Last Name</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">Email</label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">Phone</label>
                      <input
                        type="tel"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        placeholder="+977-98XXXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">Address</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        placeholder="Street address"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">City</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                          placeholder="Kathmandu"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">District</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                          placeholder="Kathmandu"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-8">
                    <Button onClick={() => setStep(2)} className="w-full">
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="font-heading text-2xl font-semibold text-text mb-6">
                    Payment Method
                  </h2>
                  <div className="space-y-3">
                    {['Cash on Delivery', 'eSewa', 'Khalti', 'Bank Transfer'].map((method) => (
                      <label
                        key={method}
                        className="flex items-center gap-4 p-4 bg-background rounded-xl border-2 border-transparent hover:border-primary cursor-pointer transition-all"
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method}
                          className="w-4 h-4 text-primary"
                        />
                        <span className="text-text font-medium">{method}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-8">
                    <Button
                      onClick={() => setStep(1)}
                      variant="ghost"
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button onClick={() => setStep(3)} className="flex-1">
                      Review Order
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="font-heading text-2xl font-semibold text-text mb-6">
                    Review Your Order
                  </h2>
                  <div className="space-y-4 mb-8">
                    {items.map((item) => (
                      <div key={item._id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-text">{item.name}</h3>
                          <p className="text-sm text-text-muted">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-heading font-semibold text-primary">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <Button
                      onClick={() => setStep(2)}
                      variant="ghost"
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button className="flex-1">
                      Place Order
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
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

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Subtotal ({items.length} items)</span>
                  <span className="text-text font-medium">Rs. {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Shipping</span>
                  <span className="text-text font-medium">
                    {shipping === 0 ? 'Free' : `Rs. ${shipping}`}
                  </span>
                </div>
                <div className="h-px bg-border my-4" />
                <div className="flex justify-between text-lg pt-2">
                  <span className="font-semibold text-text">Total</span>
                  <span className="font-heading font-semibold text-primary">
                    Rs. {finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-col gap-3 pt-6 border-t border-border">
                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <HiOutlineMap className="w-4 h-4 text-primary" />
                  <span>Pan-Nepal delivery available</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <HiOutlinePhone className="w-4 h-4 text-primary" />
                  <span>24/7 customer support</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <HiOutlineMail className="w-4 h-4 text-primary" />
                  <span>Order confirmation via email</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;