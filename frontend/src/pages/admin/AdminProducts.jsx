import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineEye, HiOutlineTrash } from 'react-icons/hi';
import API from '../../utils/axios';
import { Container, LoadingSkeleton } from '../../components/ui';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchProducts = async () => {
    try {
      const { data } = await API.get(`/products?page=${page}&limit=20`);
      setProducts(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await API.delete(`/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.seller?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-24">
      <Container>
        <div className="py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-heading text-4xl font-semibold text-text">Products</h1>
            <p className="text-text-muted mt-1">Manage all platform products</p>
          </motion.div>

          {/* Search */}
          <div className="relative mb-6">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or sellers..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-border/50 overflow-hidden"
          >
            {loading ? (
              <div className="p-6"><LoadingSkeleton variant="list" count={5} /></div>
            ) : filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-background/50">
                      <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">Product</th>
                      <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">Seller</th>
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
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <p className="font-medium text-text truncate max-w-[200px]">{product.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-muted">{product.seller?.name || '—'}</td>
                        <td className="px-6 py-4 text-sm font-medium text-primary">Rs. {product.price?.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${product.stock === 0 ? 'text-red-600' : 'text-text'}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="text-secondary">★</span> {product.rating?.toFixed(1) || '—'}
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
                            >
                              <HiOutlineEye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="p-2 text-text-muted hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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
                <p className="text-text-muted">No products found</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPage(p); setLoading(true); }}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      page === p ? 'bg-primary text-white' : 'text-text-muted hover:bg-background'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </Container>
    </div>
  );
};

export default AdminProducts;
