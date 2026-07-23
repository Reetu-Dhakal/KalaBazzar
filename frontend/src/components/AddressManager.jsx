import { useState, useEffect } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Plus, MapPin, Pencil, Trash2, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const defaultForm = { label: 'Home', fullName: '', phone: '', street: '', city: '', district: '', province: '', zipCode: '', isDefault: false };

export default function AddressManager() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const fetchAddresses = async () => {
    try {
      const { data } = await api.get('/addresses');
      setAddresses(data.data);
    } catch { toast.error('Failed to load addresses'); }
    setLoading(false);
  };

  useEffect(() => { fetchAddresses(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { data } = await api.put(`/addresses/${editingId}`, form);
        setAddresses(data.data);
        toast.success('Address updated');
      } else {
        const { data } = await api.post('/addresses', form);
        setAddresses(data.data);
        toast.success('Address added');
      }
      setForm(defaultForm);
      setShowForm(false);
      setEditingId(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save address'); }
  };

  const handleEdit = (addr) => {
    setForm({
      label: addr.label || 'Home',
      fullName: addr.fullName,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      district: addr.district,
      province: addr.province || '',
      zipCode: addr.zipCode || '',
      isDefault: addr.isDefault,
    });
    setEditingId(addr._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      const { data } = await api.delete(`/addresses/${id}`);
      setAddresses(data.data);
      toast.success('Address deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleSetDefault = async (id) => {
    try {
      const { data } = await api.put(`/addresses/${id}/default`);
      setAddresses(data.data);
      toast.success('Default address updated');
    } catch { toast.error('Failed to update'); }
  };

  if (loading) return <p className="text-text-muted">Loading addresses...</p>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Saved Addresses</CardTitle>
            <CardDescription>Manage your shipping addresses</CardDescription>
          </div>
          <Button size="sm" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(defaultForm); }}>
            <Plus size={16} className="mr-1" /> {showForm ? 'Cancel' : 'Add'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 border rounded-lg bg-gray-50">
            <div>
              <label className="block text-sm font-medium mb-1">Label</label>
              <select value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option>Home</option>
                <option>Work</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Street *</label>
              <Input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City *</label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">District *</label>
              <Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Province</label>
              <Input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Zip Code</label>
              <Input value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isDefault" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
              <label htmlFor="isDefault" className="text-sm">Set as default</label>
            </div>
            <div className="flex items-end">
              <Button type="submit">{editingId ? 'Update' : 'Add'} Address</Button>
            </div>
          </form>
        )}

        {addresses.length === 0 ? (
          <p className="text-text-secondary text-center py-6">No addresses saved yet.</p>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr._id} className={`flex items-start justify-between gap-4 p-4 rounded-lg border ${addr.isDefault ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={16} className="text-primary flex-shrink-0" />
                    <span className="font-semibold text-sm">{addr.label}</span>
                    {addr.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                  </div>
                  <p className="text-sm">{addr.fullName} — {addr.phone}</p>
                  <p className="text-sm text-text-secondary">{addr.street}, {addr.city}, {addr.district}{addr.province ? `, ${addr.province}` : ''}{addr.zipCode ? ` - ${addr.zipCode}` : ''}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!addr.isDefault && (
                    <Button size="sm" variant="ghost" onClick={() => handleSetDefault(addr._id)} title="Set as default">
                      <Star size={14} />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(addr)} title="Edit">
                    <Pencil size={14} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(addr._id)} title="Delete">
                    <Trash2 size={14} className="text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
