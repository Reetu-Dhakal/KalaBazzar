import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import usePageTitle from '../hooks/usePageTitle';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  usePageTitle('Shopping Cart');

  const handleQuantityChange = async (productId, newQty) => {
    if (newQty < 1) return;
    try {
      await updateQuantity(productId, newQty);
    } catch {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeItem(productId);
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-heading font-bold mb-2">Your cart is empty</h2>
        <p className="text-text-secondary mb-6">Start shopping to add items to your cart</p>
        <Link to="/shop"><Button>Continue Shopping</Button></Link>
      </div>
    );
  }

  const shipping = subtotal > 2000 ? 0 : 200;
  const total = subtotal + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-heading font-bold mb-8">Shopping Cart ({itemCount} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.product?._id} className="overflow-hidden">
              <CardContent className="p-4 flex gap-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                  <img
                    src={item.product?.images?.[0]?.url || '/placeholder.svg'}
                    alt={item.product?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product?._id}`} className="font-heading font-semibold text-lg hover:text-primary line-clamp-1">
                    {item.product?.name}
                  </Link>
                  <p className="text-text-muted text-sm mb-2">Rs. {item.product?.price?.toLocaleString()}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border rounded-lg">
                      <button onClick={() => handleQuantityChange(item.product?._id, item.quantity - 1)} className="p-1.5 hover:bg-gray-50">
                        <Minus size={16} />
                      </button>
                      <span className="px-3 font-medium text-sm">{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item.product?._id, item.quantity + 1)} className="p-1.5 hover:bg-gray-50">
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-primary">Rs. {(item.product?.price * item.quantity).toLocaleString()}</span>
                      <button onClick={() => handleRemove(item.product?._id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-heading text-xl font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `Rs. ${shipping}`}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">Rs. {total.toLocaleString()}</span>
                </div>
              </div>
              <Link to="/checkout">
                <Button className="w-full" size="lg">Proceed to Checkout</Button>
              </Link>
              <Link to="/shop" className="block text-center text-sm text-text-secondary hover:text-primary mt-3">
                <ArrowLeft size={14} className="inline mr-1" /> Continue Shopping
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
