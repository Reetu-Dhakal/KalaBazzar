import { createContext, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/Button';
import { X, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';

const CartDrawerContext = createContext(null);

export function CartDrawerProvider({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <CartDrawerContext.Provider value={{ openCartDrawer: () => setOpen(true), closeCartDrawer: () => setOpen(false) }}>
      {children}
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </CartDrawerContext.Provider>
  );
}

export const useCartDrawer = () => {
  const ctx = useContext(CartDrawerContext);
  if (!ctx) throw new Error('useCartDrawer must be used within CartDrawerProvider');
  return ctx;
};

function CartDrawer({ open, onClose }) {
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart();

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-4 border-b bg-primary text-white">
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} />
              <span className="font-semibold text-lg">Cart ({itemCount})</span>
            </div>
            <button onClick={onClose} className="hover:text-secondary transition-colors"><X size={22} /></button>
          </div>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted gap-3 px-4">
              <ShoppingCart size={48} className="opacity-30" />
              <p className="text-lg">Your cart is empty</p>
              <Link to="/shop" onClick={onClose}><Button variant="secondary" size="sm">Start Shopping</Button></Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {items.map((item) => {
                  const product = item.product || {};
                  const productId = product._id || item.product;
                  return (
                    <div key={productId} className="flex gap-3 bg-gray-50 rounded-lg p-3 items-center">
                      <Link to={`/product/${productId}`} onClick={onClose} className="shrink-0">
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-white">
                          {product.images?.[0] && <img loading="lazy" src={product.images[0]?.url || product.images[0]} alt="" className="w-full h-full object-cover" />}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${productId}`} onClick={onClose} className="text-sm font-medium hover:text-primary line-clamp-1">{product.name || item.name}</Link>
                        <p className="text-xs text-text-muted">Rs. {(product.price || item.price).toLocaleString()}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <button onClick={() => updateQuantity(productId, item.quantity - 1)} className="p-0.5 rounded border hover:bg-gray-200 transition-colors" disabled={item.quantity <= 1}><Minus size={14} /></button>
                          <span className="text-sm w-6 text-center font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(productId, item.quantity + 1)} className="p-0.5 rounded border hover:bg-gray-200 transition-colors"><Plus size={14} /></button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">Rs. {((product.price || item.price) * item.quantity).toLocaleString()}</p>
                        <button onClick={() => removeItem(productId)} className="text-red-400 hover:text-red-600 mt-1 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t px-4 py-4 space-y-3 bg-gray-50">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Subtotal</span>
                  <span className="font-semibold">Rs. {subtotal.toLocaleString()}</span>
                </div>
                <p className="text-xs text-text-muted">Shipping calculated at checkout</p>
                <Link to="/checkout" onClick={onClose}><Button className="w-full">Proceed to Checkout</Button></Link>
                <Link to="/cart" onClick={onClose} className="block text-center text-xs text-primary hover:underline">View Full Cart</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
