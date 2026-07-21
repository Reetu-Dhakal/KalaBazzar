import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowLeft, HiOutlineSave, HiOutlineTrash } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import API from '../../utils/axios';
import { Button, Container } from '../../components/ui';
import toast from 'react-hot-toast';

const SellerProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    comparePrice: '',
    category: '',
    stock: '',
    minOrderQuantity: '1',
    district: '',
    province: '',
    deliveryEstimate: '5-7 business days',
    materials: '',
    tags: '',
    isPreorder: false,
    preorderDays: '',
    images: [],
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await API.get('/categories');
        setCategories(data.data || []);
      } catch {
        // silent
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    const loadProduct = async () => {
      try {
        const { data } = await API.get(`/products/seller/me?limit=100`);
        const product = data.data?.find((p) => p._id === id);
        if (product) {
          setForm({
            name: product.name || '',
            description: product.description || '',
            shortDescription: product.shortDescription || '',
            price: product.price || '',
            comparePrice: product.comparePrice || '',
            category: product.category?._id || '',
            stock: product.stock || '',
            minOrderQuantity: product.minOrderQuantity || '1',
            district: product.district || '',
            province: product.province || '',
            deliveryEstimate: product.deliveryEstimate || '5-7 business days',
            materials: (product.materials || []).join(', '),
            tags: (product.tags || []).join(', '),
            isPreorder: product.isPreorder || false,
            preorderDays: product.preorderDays || '',
            images: product.images || [],
          });
        } else {
          toast.error('Product not found');
          navigate('/seller/products');
        }
      } catch {
        toast.error('Failed to load product');
        navigate('/seller/products');
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.price || !form.category || !form.stock) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        shortDescription: form.shortDescription,
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : 0,
        category: form.category,
        stock: Number(form.stock),
        minOrderQuantity: Number(form.minOrderQuantity),
        district: form.district,
        province: form.province,
        deliveryEstimate: form.deliveryEstimate,
        materials: form.materials
          .split(',')
          .map((m) => m.trim())
          .filter(Boolean),
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        isPreorder: form.isPreorder,
        preorderDays: form.isPreorder ? Number(form.preorderDays) : 0,
      };

      if (isEdit) {
        await API.put(`/products/${id}`, payload);
        toast.success('Product updated!');
      } else {
        await API.post('/products', payload);
        toast.success('Product created!');
      }
      navigate('/seller/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24">
        <Container>
          <div className="py-8 max-w-3xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 rounded w-1/3" />
              <div className="h-64 bg-gray-200 rounded-2xl" />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      <Container>
        <div className="py-8 max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link to="/seller/products" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors mb-4">
              <HiOutlineArrowLeft className="w-4 h-4" />
              Back to Products
            </Link>
            <h1 className="font-heading text-4xl font-semibold text-text">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-border/50 p-6 md:p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="font-heading text-lg font-semibold text-text mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="e.g. Hand-thrown Clay Pot"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                      placeholder="Detailed description of your product..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Short Description</label>
                    <input
                      type="text"
                      name="shortDescription"
                      value={form.shortDescription}
                      onChange={handleChange}
                      maxLength={300}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="Brief one-liner (max 300 chars)"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div>
                <h3 className="font-heading text-lg font-semibold text-text mb-4">Pricing & Stock</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Price (Rs.) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Compare Price (Rs.)</label>
                    <input
                      type="number"
                      name="comparePrice"
                      value={form.comparePrice}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Stock <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={form.stock}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Min Order Quantity</label>
                    <input
                      type="number"
                      name="minOrderQuantity"
                      value={form.minOrderQuantity}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Category */}
              <div>
                <h3 className="font-heading text-lg font-semibold text-text mb-4">Category</h3>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <h3 className="font-heading text-lg font-semibold text-text mb-4">Origin</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">District</label>
                    <input
                      type="text"
                      name="district"
                      value={form.district}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="e.g. Bhaktapur"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Province</label>
                    <input
                      type="text"
                      name="province"
                      value={form.province}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="e.g. Bagmati"
                    />
                  </div>
                </div>
              </div>

              {/* Details */}
              <div>
                <h3 className="font-heading text-lg font-semibold text-text mb-4">Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Materials</label>
                    <input
                      type="text"
                      name="materials"
                      value={form.materials}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="e.g. Clay, Natural dye (comma separated)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Tags</label>
                    <input
                      type="text"
                      name="tags"
                      value={form.tags}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="e.g. handmade, traditional, gift (comma separated)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Delivery Estimate</label>
                    <input
                      type="text"
                      name="deliveryEstimate"
                      value={form.deliveryEstimate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="isPreorder"
                      checked={form.isPreorder}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <label className="text-sm font-medium text-text">This is a pre-order product</label>
                  </div>
                  {form.isPreorder && (
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">Pre-order Days</label>
                      <input
                        type="number"
                        name="preorderDays"
                        value={form.preorderDays}
                        onChange={handleChange}
                        min="1"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        placeholder="Days to fulfill"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Link to="/seller/products" className="flex-1">
                  <Button type="button" variant="ghost" className="w-full" icon={HiOutlineTrash}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" className="flex-1" icon={HiOutlineSave} loading={saving} disabled={saving}>
                  {isEdit ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </Container>
    </div>
  );
};

export default SellerProductForm;
