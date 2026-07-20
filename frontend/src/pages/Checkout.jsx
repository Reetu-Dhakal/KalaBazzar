import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineShieldCheck } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../utils/axios';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    district: user?.address?.district || '',
    province: user?.address?.province || '',
    zipCode: user?.address?.zipCode || '',
  });

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        product: item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        seller: item.seller,
      }));

      const { data } = await API.post('/orders', {
        orderItems,
        shippingAddress: address,
        billingAddress: address,
        paymentMethod,
        itemsPrice: subtotal,
        shippingPrice: 0,
        taxPrice: 0,
        totalPrice: subtotal,
      });

      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/dashboard?order=${data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container-custom py-8">
        <h1 className="text-3xl font-heading font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6"
            >
              <h2 className="font-heading font-semibold text-lg mb-6">Shipping Address</h2>
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={address.fullName}
                      onChange={handleAddressChange}
                      required
                      className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Phone *</label>
                    <input
                      type="text"
                      name="phone"
                      value={address.phone}
                      onChange={handleAddressChange}
                      required
                      className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary bg-background"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Street Address *</label>
                  <input
                    type="text"
                    name="street"
                    value={address.street}
                    onChange={handleAddressChange}
                    required
                    className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary bg-background"
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={address.city}
                      onChange={handleAddressChange}
                      required
                      className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">District *</label>
                    <input
                      type="text"
                      name="district"
                      value={address.district}
                      onChange={handleAddressChange}
                      required
                      className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Province *</label>
                    <input
                      type="text"
                      name="province"
                      value={address.province}
                      onChange={handleAddressChange}
                      required
                      className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary bg-background"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mt-8">
                  <h2 className="font-heading font-semibold text-lg mb-4">Payment Method</h2>
                  <div className="space-y-3">
                    {[
                      { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive' },
                      { value: 'esewa', label: 'eSewa', desc: 'Pay with eSewa wallet' },
                      { value: 'khalti', label: 'Khalti', desc: 'Pay with Khalti wallet' },
                    ].map((method) => (
                      <label
                        key={method.value}
                        className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                          paymentMethod === method.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-background'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={paymentMethod === method.value}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-primary"
                        />
                        <div>
                          <p className="font-medium text-sm">{method.label}</p>
                          <p className="text-xs text-text-muted">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition-colors disabled:opacity-50 mt-6"
                >
                  {loading ? 'Processing...' : `Place Order - Rs. ${subtotal?.toLocaleString()}`}
                </button>
              </form>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 sticky top-24">
              <h3 className="font-heading font-semibold text-lg mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.product} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=100'}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.name}</p>
                      <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">Rs. {(item.price * item.quantity)?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <hr className="border-border mb-4" />
              <div className="space-y-2 text-sm">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;