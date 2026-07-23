import { useState, useEffect } from 'react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';
import usePageTitle from '../hooks/usePageTitle';
import { MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Checkout() {
  usePageTitle('Checkout');
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [notes, setNotes] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    district: '',
    province: '',
    zipCode: '',
  });

  useEffect(() => {
    api.get('/addresses').then(({ data }) => {
      setSavedAddresses(data.data);
      const def = data.data.find((a) => a.isDefault);
      if (def) {
        setSelectedAddressId(def._id);
        setAddress({ fullName: def.fullName, phone: def.phone, street: def.street, city: def.city, district: def.district, province: def.province || '', zipCode: def.zipCode || '' });
      }
    }).catch(() => {});
  }, []);

  const selectAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setAddress({ fullName: addr.fullName, phone: addr.phone, street: addr.street, city: addr.city, district: addr.district, province: addr.province || '', zipCode: addr.zipCode || '' });
  };

  const applyCoupon = async () => {
    if (!couponCode) return;
    try {
      const { data } = await api.post('/coupons/validate', { code: couponCode, amount: subtotal });
      setDiscount(data.data.discount);
      setCouponMsg(`Coupon applied! -Rs. ${data.data.discount}`);
      toast.success('Coupon applied');
    } catch {
      setDiscount(0);
      setCouponMsg('Invalid or expired coupon');
      toast.error('Invalid coupon');
    }
  };

  const shipping = subtotal > 2000 ? 0 : 200;
  const total = subtotal + shipping - discount;

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        shippingAddress: { ...address, address: address.street },
        paymentMethod,
        notes,
      });
      await clearCart();

      if (paymentMethod === 'cod') {
        navigate(`/order-success/${data.data._id}`);
      } else if (paymentMethod === 'khalti') {
        const { data: khaltiData } = await api.post('/payment/khalti/initiate', { orderId: data.data._id });
        window.location.href = khaltiData.data.paymentUrl;
      } else {
        navigate(`/order-success/${data.data._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-heading font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {savedAddresses.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Saved Addresses</p>
                  <div className="space-y-2 mb-4">
                    {savedAddresses.map((addr) => (
                      <label key={addr._id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${selectedAddressId === addr._id ? 'border-primary bg-primary/5' : ''}`}>
                        <input type="radio" name="savedAddress" checked={selectedAddressId === addr._id} onChange={() => selectAddress(addr)} className="accent-primary" />
                        <MapPin size={16} className="text-primary flex-shrink-0" />
                        <div className="text-sm">
                          <span className="font-medium">{addr.label}</span> — {addr.fullName}, {addr.street}, {addr.city}
                          {addr.isDefault && <Badge variant="secondary" className="ml-2 text-xs">Default</Badge>}
                        </div>
                      </label>
                    ))}
                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${selectedAddressId === 'new' ? 'border-primary bg-primary/5' : ''}`}>
                      <input type="radio" name="savedAddress" checked={selectedAddressId === 'new'} onChange={() => { setSelectedAddressId('new'); setAddress({ fullName: user?.name || '', phone: user?.phone || '', street: '', city: '', district: '', province: '', zipCode: '' }); }} className="accent-primary" />
                      <span className="text-sm">Enter a new address</span>
                    </label>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-sm font-medium mb-1">Full Name</label><Input name="fullName" value={address.fullName} onChange={handleChange} required /></div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-1">Phone</label><Input name="phone" value={address.phone} onChange={handleChange} required /></div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-1">Street / Address</label><Input name="street" value={address.street} onChange={handleChange} required /></div>
                <div><label className="block text-sm font-medium mb-1">City</label><Input name="city" value={address.city} onChange={handleChange} required /></div>
                <div><label className="block text-sm font-medium mb-1">District</label><Input name="district" value={address.district} onChange={handleChange} required /></div>
                <div><label className="block text-sm font-medium mb-1">Province</label><Input name="province" value={address.province} onChange={handleChange} /></div>
                <div><label className="block text-sm font-medium mb-1">ZIP Code</label><Input name="zipCode" value={address.zipCode} onChange={handleChange} /></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { value: 'cod', label: 'Cash on Delivery' },
                  { value: 'khalti', label: 'Khalti' },
                  { value: 'esewa', label: 'eSewa' },
                ].map((method) => (
                  <label key={method.value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="payment" value={method.value} checked={paymentMethod === method.value} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-primary" />
                    <span className="font-medium">{method.label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader><CardTitle>Order Notes (Optional)</CardTitle></CardHeader>
            <CardContent>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Delivery instructions, landmark, etc." />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.product?._id} className="flex justify-between text-sm">
                    <span className="text-text-secondary truncate pr-2">{item.product?.name} x{item.quantity}</span>
                    <span>Rs. {(item.product?.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mb-4">
                <Input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="text-sm" />
                <Button type="button" variant="outline" size="sm" onClick={applyCoupon}>Apply</Button>
              </div>
              {couponMsg && <p className={`text-xs mb-3 ${discount > 0 ? 'text-green-600' : 'text-red-500'}`}>{couponMsg}</p>}
              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-text-secondary">Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Shipping</span><span>{shipping === 0 ? 'Free' : `Rs. ${shipping}`}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-Rs. {discount}</span></div>}
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">Rs. {total.toLocaleString()}</span>
                </div>
              </div>
              <Button type="submit" className="w-full mt-6" size="lg" disabled={loading}>
                {loading ? <Spinner size="sm" /> : `Place Order (Rs. ${total.toLocaleString()})`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
