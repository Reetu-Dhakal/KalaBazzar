import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Package, DollarSign, ShoppingBag, Eye, Plus, Upload, X, Settings } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import SellerOnboardingChecklist from '../components/seller/SellerOnboardingChecklist';

export default function SellerDashboard() {
  usePageTitle('Seller Dashboard');
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [editForm, setEditForm] = useState({ name: '', description: '', price: '', stock: '', status: 'draft', tags: '', materialsUsed: '' });
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', stock: '1', category: '',
    tags: '', materialsUsed: '', status: 'draft',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, productsRes, ordersRes, revenueRes] = await Promise.all([
        api.get('/sellers/me'),
        api.get('/products'),
        api.get('/orders/seller-orders'),
        api.get('/sellers/revenue?days=30'),
      ]);
      setProfile(profileRes.data.data);
      setProducts(productsRes.data.data.products);
      setOrders(ordersRes.data.data.orders);
      setRevenueData(revenueRes.data.data.chartData || []);
      setTotalRevenue(revenueRes.data.data.totalRevenue || 0);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append('files', file);
      }
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadedImages((prev) => [...prev, ...data.data]);
      toast.success(`${files.length} image(s) uploaded`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const removeImage = (publicId) => {
    setUploadedImages((prev) => prev.filter((img) => img.publicId !== publicId));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        tags: productForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
        materialsUsed: productForm.materialsUsed.split(',').map((t) => t.trim()).filter(Boolean),
        images: uploadedImages.map((img, idx) => ({ url: img.url, publicId: img.publicId, isPrimary: idx === 0 })),
      });
      toast.success('Product created!');
      setShowProductForm(false);
      setUploadedImages([]);
      setProductForm({ name: '', description: '', price: '', stock: '1', category: '', tags: '', materialsUsed: '', status: 'draft' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create product');
    }
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      stock: product.stock?.toString() || '',
      status: product.status || 'draft',
      tags: (product.tags || []).join(', '),
      materialsUsed: (product.materialsUsed || []).join(', '),
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await api.put(`/products/${editingProduct._id}`, {
        ...editForm,
        price: parseFloat(editForm.price),
        stock: parseInt(editForm.stock),
        tags: editForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
        materialsUsed: editForm.materialsUsed.split(',').map((t) => t.trim()).filter(Boolean),
      });
      toast.success('Product updated!');
      setEditingProduct(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const toggleProductStatus = async (productId, newStatus) => {
    try {
      await api.put(`/products/${productId}`, { status: newStatus });
      toast.success(`Product ${newStatus}`);
      fetchData();
    } catch {
      toast.error('Failed to update product');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold">Seller Dashboard</h1>
          <p className="text-text-secondary">Welcome back{profile?.storeName ? `, ${profile.storeName}` : ''}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/seller/feed" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-50 transition-colors">
            Feed
          </Link>
          <Link to="/seller/earnings" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-50 transition-colors">
            <DollarSign size={16} /> Earnings
          </Link>
          <Link to="/seller/settings" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-50 transition-colors">
            <Settings size={16} /> Settings
          </Link>
          <Button onClick={() => setShowProductForm(!showProductForm)}>
            <Plus size={18} className="mr-1" /> New Product
          </Button>
        </div>
      </div>

      {!profile?.isVerifiedArtisan ? (
        <Card className="border-secondary bg-secondary/5">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-secondary" />
            </div>
            <h3 className="text-xl font-heading font-bold mb-2">Application Under Review</h3>
            <p className="text-text-secondary max-w-md mx-auto mb-6">
              Your seller application is being reviewed by our team. You'll receive an email once it's approved. Until then, some dashboard features are limited.
            </p>
            <div className="inline-flex items-center gap-2 bg-secondary/10 rounded-full px-4 py-2">
              <Badge variant="warning">Status: {profile?.verificationStatus || 'Pending'}</Badge>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <SellerOnboardingChecklist profile={profile} productCount={products.length} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-text-muted text-sm">Total Products</p><p className="text-2xl font-bold">{products.length}</p></div>
              <Package className="text-primary" size={28} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-text-muted text-sm">Total Orders</p><p className="text-2xl font-bold">{orders.length}</p></div>
              <ShoppingBag className="text-primary" size={28} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-text-muted text-sm">Total Sales</p><p className="text-2xl font-bold">Rs. {profile?.totalSales?.toLocaleString() || '0'}</p></div>
              <DollarSign className="text-primary" size={28} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div><p className="text-text-muted text-sm">Store Rating</p><p className="text-2xl font-bold">{profile?.rating || '0'}</p></div>
              <Eye className="text-primary" size={28} />
            </div>
          </CardContent>
        </Card>
      </div>

      {revenueData.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Revenue (Last 30 Days) — Rs. {totalRevenue.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(val) => val.slice(5)} stroke="#999" />
                <YAxis tick={{ fontSize: 10 }} stroke="#999" />
                <Tooltip formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'Revenue']} labelFormatter={(label) => new Date(label).toLocaleDateString()} />
                <Bar dataKey="revenue" fill="#6E1E1E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {products.filter(p => p.stock > 0 && p.stock <= 5).length > 0 && (
        <Card className="mb-8 border-2 border-amber-400 bg-amber-50">
          <CardHeader><CardTitle className="text-amber-800"><span className="mr-2">⚠</span>Low Stock Alerts</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {products.filter(p => p.stock > 0 && p.stock <= 5).map(p => (
                <div key={p._id} className="flex items-center justify-between bg-white rounded px-4 py-2 shadow-sm">
                  <div>
                    <span className="font-medium">{p.name}</span>
                    <span className="text-text-muted text-sm ml-2">({p.status})</span>
                  </div>
                  <span className="text-amber-600 font-bold text-sm">Only {p.stock} left</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {editingProduct && profile?.isVerifiedArtisan && (
        <Card className="mb-8 border-secondary">
          <CardHeader><CardTitle>Edit Product: {editingProduct.name}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-sm font-medium mb-1">Product Name *</label><input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /></div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-1">Description *</label><textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} required rows={3} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium mb-1">Price (Rs.) *</label><input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} required min="0" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium mb-1">Stock *</label><input type="number" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} required min="0" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium mb-1">Status</label><select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"><option value="draft">Draft</option><option value="published">Published</option></select></div>
                <div><label className="block text-sm font-medium mb-1">Tags</label><input value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} placeholder="wood, handmade" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /></div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-1">Materials</label><input value={editForm.materialsUsed} onChange={(e) => setEditForm({ ...editForm, materialsUsed: e.target.value })} placeholder="Sal wood, Varnish" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /></div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save Changes</Button>
                <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showProductForm && profile?.isVerifiedArtisan && (
        <Card className="mb-8">
          <CardHeader><CardTitle>Add New Product</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-sm font-medium mb-1">Product Name *</label><input name="name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /></div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-1">Description *</label><textarea name="description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} required rows={3} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium mb-1">Price (Rs.) *</label><input type="number" name="price" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required min="0" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium mb-1">Stock *</label><input type="number" name="stock" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} required min="0" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium mb-1">Category ID *</label><input name="category" value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} required placeholder="MongoDB Category ID" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium mb-1">Status</label><select name="status" value={productForm.status} onChange={(e) => setProductForm({ ...productForm, status: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"><option value="draft">Draft</option><option value="published">Published</option></select></div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-1">Tags (comma separated)</label><input name="tags" value={productForm.tags} onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })} placeholder="wood, handmade, decor" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /></div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-1">Materials (comma separated)</label><input name="materialsUsed" value={productForm.materialsUsed} onChange={(e) => setProductForm({ ...productForm, materialsUsed: e.target.value })} placeholder="Sal wood, Varnish" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /></div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Product Images</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50 text-sm">
                    <Upload size={16} />
                    {uploadingImages ? 'Uploading...' : 'Upload Images'}
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImages} />
                  </label>
                </div>
                {uploadedImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {uploadedImages.map((img) => (
                      <div key={img.publicId} className="relative w-20 h-20 rounded-lg overflow-hidden border group">
                        <img loading="lazy" src={img.url} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(img.publicId)} className="absolute top-1 right-1 p-0.5 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={12} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={uploadingImages}>Create Product</Button>
                <Button type="button" variant="outline" onClick={() => { setShowProductForm(false); setUploadedImages([]); }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="mb-8">
        <CardHeader><CardTitle>My Products ({products.length})</CardTitle></CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-text-secondary text-center py-8">No products yet. Create your first product!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-semibold">Product</th>
                    <th className="pb-3 font-semibold">Price</th>
                    <th className="pb-3 font-semibold">Stock</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id} className="border-b last:border-0">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          {p.images?.[0]?.url && (
                            <img loading="lazy" src={p.images[0].url} alt="" className="w-10 h-10 rounded object-cover" />
                          )}
                          <Link to={`/product/${p._id}`} className="font-medium hover:text-primary">{p.name}</Link>
                        </div>
                      </td>
                      <td className="py-3">Rs. {p.price?.toLocaleString()}</td>
                      <td className="py-3">{p.stock}</td>
                      <td className="py-3">
                        <Badge variant={p.status === 'published' ? 'success' : p.status === 'draft' ? 'warning' : 'default'}>
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditForm(p)}>Edit</Button>
                          {p.status === 'draft' && <Button size="sm" onClick={() => toggleProductStatus(p._id, 'published')}>Publish</Button>}
                          {p.status === 'published' && <Button size="sm" variant="outline" onClick={() => toggleProductStatus(p._id, 'draft')}>Unpublish</Button>}
                          <Button size="sm" variant="danger" onClick={() => toggleProductStatus(p._id, 'removed')}>Remove</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {orders.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Recent Orders ({orders.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Items</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 20).map((o) => (
                    <tr key={o._id} className="border-b last:border-0">
                      <td className="py-3 font-mono text-xs">{o._id.slice(-8)}</td>
                      <td className="py-3">
                        <div className="flex flex-col gap-0.5">
                          {o.items.map((item, idx) => (
                            <span key={idx} className="text-xs truncate max-w-[200px]">{item.name} x{item.quantity}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3">Rs. {o.total?.toLocaleString()}</td>
                      <td className="py-3">
                        <Badge variant={o.status === 'delivered' ? 'success' : o.status === 'cancelled' ? 'danger' : o.status === 'shipped' ? 'info' : 'warning'}>{o.status}</Badge>
                      </td>
                      <td className="py-3 space-y-1.5">
                        <div className="flex gap-1">
                          {['pending', 'confirmed', 'processing', 'shipped'].includes(o.status) && (
                            <select
                              value={o.status}
                              onChange={async (e) => {
                                try {
                                  await api.put(`/orders/${o._id}/status`, { status: e.target.value });
                                  toast.success(`Order ${e.target.value}`);
                                  fetchData();
                                } catch { toast.error('Failed to update'); }
                              }}
                              className="text-xs border rounded px-2 py-1 bg-white"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirm</option>
                              <option value="processing">Process</option>
                              <option value="shipped">Ship</option>
                              <option value="delivered">Deliver</option>
                            </select>
                          )}
                        </div>
                        {o.trackingNumber ? (
                          <p className="text-xs text-text-muted">Tracking: {o.trackingNumber}</p>
                        ) : ['shipped', 'delivered'].includes(o.status) && (
                          <div className="flex gap-1">
                            <input id={`tracking-${o._id}`} placeholder="Tracking #" className="text-xs border rounded px-1.5 py-1 w-24 bg-white" />
                            <button
                              onClick={async () => {
                                const input = document.getElementById(`tracking-${o._id}`);
                                if (!input.value.trim()) return toast.error('Enter tracking number');
                                try {
                                  await api.put(`/orders/${o._id}/tracking`, { trackingNumber: input.value.trim() });
                                  toast.success('Tracking added');
                                  fetchData();
                                } catch { toast.error('Failed'); }
                              }}
                              className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary-dark"
                            >Set</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}</>
      )}
    </div>
  );
}
