import { useState, useEffect } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';

const defaultForm = { code: '', discountType: 'percentage', discountValue: '', minPurchase: '', usageLimit: '', maxDiscount: '', validFrom: '', validUntil: '' };

export default function AdminCoupons() {
  usePageTitle('Coupon Management');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [coupons, setCoupons] = useState([]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/coupons');
      setCoupons(data.data);
    } catch { toast.error('Failed to load coupons'); }
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/coupons', form);
      toast.success('Coupon created');
      setForm(defaultForm);
      setShowForm(false);
      fetchCoupons();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create coupon'); }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await api.put(`/coupons/${id}/toggle`);
      toast.success(data.message);
      fetchCoupons();
    } catch { toast.error('Failed to toggle coupon'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch { toast.error('Failed to delete coupon'); }
  };

  const now = new Date().toISOString().slice(0, 16);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-heading font-bold">Coupon Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCoupons}><RefreshCw size={16} className="mr-1" /> Refresh</Button>
          <Button onClick={() => setShowForm(!showForm)}><Plus size={16} className="mr-1" /> {showForm ? 'Cancel' : 'New Coupon'}</Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-8 border-secondary">
          <CardContent className="p-6">
            <h2 className="font-heading font-semibold text-lg mb-4">Create Coupon</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Code *</label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="e.g. WELCOME10" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Discount Type</label>
                <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (Rs.)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Discount Value *</label>
                <Input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} required min={1} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Min Purchase (Rs.)</label>
                <Input type="number" value={form.minPurchase} onChange={(e) => setForm({ ...form, minPurchase: e.target.value })} min={0} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Discount (Rs.)</label>
                <Input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} min={0} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Usage Limit</label>
                <Input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} min={1} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valid From *</label>
                <Input type="datetime-local" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} required max={form.validUntil || undefined} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valid Until *</label>
                <Input type="datetime-local" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} required min={form.validFrom || now} />
              </div>
              <div className="flex items-end">
                <Button type="submit">Create Coupon</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>All Coupons ({coupons.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-text-muted">Loading...</div>
          ) : coupons.length === 0 ? (
            <div className="p-8 text-center text-text-muted">No coupons created yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Code</th>
                    <th className="px-4 py-3 font-semibold">Discount</th>
                    <th className="px-4 py-3 font-semibold">Min Purchase</th>
                    <th className="px-4 py-3 font-semibold">Used / Limit</th>
                    <th className="px-4 py-3 font-semibold">Valid Until</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {coupons.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
                      <td className="px-4 py-3">
                        {c.discountType === 'percentage' ? `${c.discountValue}%` : `Rs. ${c.discountValue}`}
                        {c.maxDiscount ? ` (max Rs. ${c.maxDiscount})` : ''}
                      </td>
                      <td className="px-4 py-3">Rs. {c.minPurchase?.toLocaleString() || 0}</td>
                      <td className="px-4 py-3">{c.usedCount || 0} / {c.usageLimit || '∞'}</td>
                      <td className="px-4 py-3">{new Date(c.validUntil).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <Badge variant={c.isActive ? 'success' : 'secondary'}>{c.isActive ? 'Active' : 'Inactive'}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleToggle(c._id)}>
                            {c.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(c._id)}>
                            <Trash2 size={14} />
                          </Button>
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
    </div>
  );
}
