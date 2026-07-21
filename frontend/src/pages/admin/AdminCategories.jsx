import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import API from '../../utils/axios';
import { Button, Container, LoadingSkeleton } from '../../components/ui';
import toast from 'react-hot-toast';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', order: 0 });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await API.get('/categories');
      setCategories(data.data || []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await API.put(`/categories/${editId}`, form);
        toast.success('Category updated');
      } else {
        await API.post('/categories', form);
        toast.success('Category created');
      }
      setForm({ name: '', description: '', order: 0 });
      setEditId(null);
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description || '', order: cat.order || 0 });
    setEditId(cat._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await API.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      toast.success('Category deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleCancel = () => {
    setForm({ name: '', description: '', order: 0 });
    setEditId(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen pt-24">
      <Container>
        <div className="py-8 max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="font-heading text-4xl font-semibold text-text">Categories</h1>
              <p className="text-text-muted mt-1">{categories.length} categories</p>
            </div>
            <Button
              icon={HiOutlinePlus}
              onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', description: '', order: 0 }); }}
            >
              {showForm ? 'Cancel' : 'Add Category'}
            </Button>
          </motion.div>

          {/* Form */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-border/50 p-6 mb-8"
            >
              <h2 className="font-heading text-xl font-semibold text-text mb-4">
                {editId ? 'Edit Category' : 'New Category'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-text mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="e.g. Pottery"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Order</label>
                    <input
                      type="number"
                      value={form.order}
                      onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                      min="0"
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    placeholder="Optional description"
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" loading={saving} disabled={saving}>
                    {editId ? 'Update' : 'Create'}
                  </Button>
                  <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Categories List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-border/50 overflow-hidden"
          >
            {loading ? (
              <div className="p-6"><LoadingSkeleton variant="list" count={5} /></div>
            ) : categories.length > 0 ? (
              <div className="divide-y divide-border">
                {categories.map((cat) => (
                  <div key={cat._id} className="flex items-center gap-4 px-6 py-4 hover:bg-background/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      {cat.image?.url ? (
                        <img src={cat.image.url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-primary">{cat.name?.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text">{cat.name}</p>
                      <p className="text-xs text-text-muted truncate">{cat.description || 'No description'}</p>
                    </div>
                    <span className="text-xs text-text-muted">Order: {cat.order}</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-2 text-text-muted hover:text-primary rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="p-2 text-text-muted hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-text-muted mb-4">No categories yet</p>
                <Button onClick={() => setShowForm(true)}>Create First Category</Button>
              </div>
            )}
          </motion.div>
        </div>
      </Container>
    </div>
  );
};

export default AdminCategories;
