import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Star, Minus, Plus, ShoppingCart, Heart, Truck, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function QuickViewModal({ product, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [adding, setAdding] = useState(false);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  if (!product) return null;

  const images = product.images || [];

  const handleAddToCart = async () => {
    if (!user) return toast.error('Login to add items');
    if (product.stock < 1) return toast.error('Out of stock');
    setAdding(true);
    try {
      await addItem(product._id, quantity);
      toast.success('Added to cart!');
      onClose();
    } catch { toast.error('Failed to add'); }
    setAdding(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="relative">
            <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full hover:bg-white shadow transition-colors">
              <X size={20} />
            </button>

            <div className="grid md:grid-cols-2">
              <div className="relative bg-gray-50 rounded-l-2xl">
                <div className="aspect-square">
                  {images.length > 0 ? (
                    <img loading="lazy" src={images[currentImage]?.url || images[currentImage]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">No image</div>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2">
                    <button onClick={() => setCurrentImage((p) => (p - 1 + images.length) % images.length)} className="p-1.5 bg-white/80 rounded-full shadow hover:bg-white"><ChevronLeft size={18} /></button>
                    <button onClick={() => setCurrentImage((p) => (p + 1) % images.length)} className="p-1.5 bg-white/80 rounded-full shadow hover:bg-white"><ChevronRight size={18} /></button>
                  </div>
                )}
                {images.length > 1 && (
                  <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setCurrentImage(i)} className={`w-2 h-2 rounded-full transition-all ${i === currentImage ? 'bg-primary w-4' : 'bg-gray-400'}`} />
                    ))}
                  </div>
                )}
                {product.comparePrice && (
                  <Badge variant="danger" className="absolute top-4 left-4">-{Math.round((1 - product.price / product.comparePrice) * 100)}%</Badge>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-l-2xl">
                    <Badge variant="danger" className="text-lg px-6 py-2">Out of Stock</Badge>
                  </div>
                )}
              </div>

              <div className="p-6 flex flex-col">
                {product.seller?._id && (
                  <Link to={`/artisan/${product.seller._id}`} onClick={onClose} className="text-xs text-text-muted uppercase tracking-wider hover:text-primary mb-1">{product.seller?.name}</Link>
                )}
                <h2 className="text-xl font-heading font-bold mb-2">{product.name}</h2>

                <div className="flex items-center gap-1 mb-3">
                  <Star size={15} className="fill-secondary text-secondary" />
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-text-muted text-sm">({product.numReviews} reviews)</span>
                  {product.numSold > 0 && <span className="text-text-muted text-sm ml-1">· {product.numSold} sold</span>}
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-primary">Rs. {product.price?.toLocaleString()}</span>
                  {product.comparePrice && <span className="text-text-muted line-through">Rs. {product.comparePrice?.toLocaleString()}</span>}
                </div>

                <div className="flex items-center gap-1 mb-2">
                  {product.stock <= 5 && product.stock > 0 ? (
                    <Badge variant="warning">{product.stock === 0 ? 'Out of Stock' : `Only ${product.stock} left`}</Badge>
                  ) : product.stock > 5 ? (
                    <Badge variant="success">In Stock</Badge>
                  ) : null}
                </div>

                <p className="text-sm text-text-secondary mb-4 line-clamp-3 leading-relaxed">{product.description}</p>

                <div className="space-y-2 text-sm text-text-secondary mb-4">
                  <div className="flex items-center gap-2"><Truck size={15} /> Free shipping on orders over Rs. 2,000</div>
                  <div className="flex items-center gap-2"><Shield size={15} /> Authentic product guaranteed</div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center border rounded-lg">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gray-100 transition-colors"><Minus size={16} /></button>
                    <span className="px-4 w-10 text-center font-medium">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-gray-100 transition-colors"><Plus size={16} /></button>
                  </div>
                  <button onClick={() => { if (!user) return toast.error('Login first'); toggleWishlist(product._id); }} className={`p-2.5 rounded-lg border transition-colors ${isInWishlist(product._id) ? 'bg-primary text-white border-primary' : 'hover:bg-gray-100 border-gray-300'}`}>
                    <Heart size={18} className={isInWishlist(product._id) ? 'fill-white' : ''} />
                  </button>
                </div>

                <div className="flex gap-2 mt-auto">
                  <Button onClick={handleAddToCart} disabled={adding || product.stock < 1} className="flex-1">
                    {adding ? 'Adding...' : <><ShoppingCart size={18} className="mr-1" /> Add to Cart</>}
                  </Button>
                  <Link to={`/product/${product.slug || product._id}`} onClick={onClose}>
                    <Button variant="outline">Details</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
