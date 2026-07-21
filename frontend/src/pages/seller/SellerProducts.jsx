import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineSearch,
} from 'react-icons/hi';
import API from '../../utils/axios';
import { Button, Container, LoadingSkeleton } from '../../components/ui';
import toast from 'react-hot-toast';

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await API.get('/products/seller/me?limit=100');
      setProducts(data.data || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await API.delete(`/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleToggleActive = async (productId, currentStatus) => {
    try {
      const { data } = await API.put(`/products/${productId}`, { isActive: !currentStatus });
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, isActive: data.data.isActive } : p))
      );
      toast.success(data.data.isActive ? 'Product activated' : 'Product deactivated');
    } catch {
      toast.error('Failed to update product');
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && p.isActive) ||
      (filter === 'inactive' && !p.isActive) ||
      (filter === 'out-of-stock' && p.stock === 0);
    return matchesSearch && matchesFilter;
  });

  const filters = [
    { id: 'all', label: 'All', count: products.length },
    { id: 'active', label: 'Active', count: products.filter((p) => p.isActive).length },
    { id: 'inactive', label: 'Inactive', count: products.filter((p) => !p.isActive).length },
    { id: 'out-of-stock', label: 'Out of Stock', count: products.filter((p) => p.stock === 0).length },
  ];

  return (
    <div className="min-h-screen pt-24">
      <Container>
        <div className="py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="font-heading text-4xl font-semibold text-text">Products</h1>
              <p className="text-text-muted mt-1">{products.length} total products</p>
            </div>
            <Link to="/seller/products/new">
              <Button icon={HiOutlinePlus}>Add Product</Button>
            </Link>
          </motion.div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            <div className="flex gap-2">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    filter === f.id
                      ? 'bg-primary text-white'
                      : 'bg-white border border-border text-text-muted hover:text-text'
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
          </div>

          {/* Products Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-border/50 overflow-hidden"
          >
            {loading ? (
              <div className="p-6">
                <LoadingSkeleton variant="list" count={5} />
              </div>
            ) : filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-background/50">
                      <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">Product</th>
                      <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">Price</th>
                      <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">Stock</th>
                      <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">Rating</th>
                      <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">Status</th>
                      <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((product) => (
                      <tr key={product._id} className="border-b border-border last:border-0 hover:bg-background/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=100'}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-text truncate max-w-[200px]">{product.name}</p>
                              <p className="text-xs text-text-muted">{product.category?.name || 'Uncategorized'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-primary">Rs. {product.price?.toLocaleString()}</p>
                          {product.comparePrice > product.price && (
                            <p className="text-xs text-text-muted line-through">Rs. {product.comparePrice.toLocaleString()}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-medium ${product.stock === 0 ? 'text-red-600' : product.stock <= 5 ? 'text-amber-600' : 'text-text'}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <span className="text-secondary">★</span>
                            <span className="text-sm">{product.rating?.toFixed(1) || '—'}</span>
                            <span className="text-xs text-text-muted">({product.numReviews || 0})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/product/${product.slug}`}
                              className="p-2 text-text-muted hover:text-primary rounded-lg hover:bg-primary/5 transition-colors"
                              title="View"
                            >
                              <HiOutlineEye className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/seller/products/edit/${product._id}`}
                              className="p-2 text-text-muted hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <HiOutlinePencil className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleToggleActive(product._id, product.isActive)}
                              className="p-2 text-text-muted hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                              title={product.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {product.isActive ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="p-2 text-text-muted hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <HiOutlineSearch className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <p className="text-text-muted mb-4">
                  {search || filter !== 'all' ? 'No products match your search' : 'No products yet'}
                </p>
                {!search && filter === 'all' && (
                  <Link to="/seller/products/new">
                    <Button>Add Your First Product</Button>
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </Container>
    </div>
  );
};

export default SellerProducts;
