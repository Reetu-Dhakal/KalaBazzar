import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Store, ToggleLeft, ToggleRight, Upload, X } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';

export default function SellerSettings() {
  usePageTitle('Seller Settings');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [form, setForm] = useState({
    storeName: '', bio: '', craftStory: '', familyTradition: '', trainingInfo: '',
    specialization: '',
  });
  const [payout, setPayout] = useState({
    bankName: '', bankAccount: '', bankHolderName: '', esewaId: '', khaltiId: '',
    bankQr: null, esewaQr: null, khaltiQr: null,
  });
  const bankQrRef = useRef(null);
  const esewaQrRef = useRef(null);
  const khaltiQrRef = useRef(null);

  useEffect(() => {
    api.get('/sellers/me')
      .then(({ data }) => {
        setProfile(data.data);
        setForm({
          storeName: data.data.storeName || '',
          bio: data.data.bio || '',
          craftStory: data.data.craftStory || '',
          familyTradition: data.data.familyTradition || '',
          trainingInfo: data.data.trainingInfo || '',
          specialization: (data.data.specialization || []).join(', '),
        });
        setPayout({
          bankName: data.data.payoutInfo?.bankName || '',
          bankAccount: data.data.payoutInfo?.bankAccount || '',
          bankHolderName: data.data.payoutInfo?.bankHolderName || '',
          esewaId: data.data.payoutInfo?.esewaId || '',
          khaltiId: data.data.payoutInfo?.khaltiId || '',
          bankQr: data.data.payoutInfo?.bankQr || null,
          esewaQr: data.data.payoutInfo?.esewaQr || null,
          khaltiQr: data.data.payoutInfo?.khaltiQr || null,
        });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleQrUpload = async (e, key) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(key);
    try {
      const formData = new FormData();
      formData.append('images', file);
      const { data } = await api.post('/upload', formData);
      const uploaded = data.data?.[0];
      if (uploaded?.url) {
        setPayout((p) => ({ ...p, [key]: { url: uploaded.url, publicId: uploaded.publicId } }));
        toast.success(`QR uploaded`);
      }
    } catch {
      toast.error('Failed to upload QR');
    } finally {
      setUploading(null);
    }
  };

  const handleQrRemove = async (key, qr) => {
    if (qr?.publicId) {
      try { await api.delete('/upload', { data: { publicId: qr.publicId } }); } catch { /* ignore */ }
    }
    setPayout((p) => ({ ...p, [key]: null }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/sellers/profile', {
        ...form,
        specialization: form.specialization.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setProfile(data.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePayout = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/sellers/payout', payout);
      toast.success('Payout info updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleStore = async () => {
    try {
      const { data } = await api.put('/sellers/toggle-store');
      setProfile((p) => ({ ...p, isStoreOpen: data.data.isStoreOpen }));
      toast.success(`Store ${data.data.isStoreOpen ? 'opened' : 'closed'}`);
    } catch {
      toast.error('Failed to toggle store');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!profile) return <div className="text-center py-20">Profile not found</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Store size={28} className="text-primary" />
        <h1 className="text-3xl font-heading font-bold">Store Settings</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Store Status</CardTitle>
                <CardDescription>Toggle your store open/closed for customers</CardDescription>
              </div>
              <button onClick={toggleStore} className="flex items-center gap-2 text-sm">
                {profile.isStoreOpen ? <ToggleRight size={32} className="text-green-600" /> : <ToggleLeft size={32} className="text-gray-400" />}
                <Badge variant={profile.isStoreOpen ? 'success' : 'default'}>{profile.isStoreOpen ? 'Open' : 'Closed'}</Badge>
              </button>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store Profile</CardTitle>
            <CardDescription>Update your store name, bio, and craft details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Store Name</label>
                <Input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} maxLength={100} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" maxLength={2000} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Craft Story</label>
                <textarea value={form.craftStory} onChange={(e) => setForm({ ...form, craftStory: e.target.value })} rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" maxLength={5000} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Specialization (comma separated)</label>
                <Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="Wood carving, pottery" />
              </div>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Button>
            </form>
          </CardContent>
        </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payout Information</CardTitle>
              <CardDescription>Where you'll receive payments for orders</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePayout} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Bank Name</label><Input value={payout.bankName} onChange={(e) => setPayout({ ...payout, bankName: e.target.value })} /></div>
                  <div><label className="block text-sm font-medium mb-1">Account Number</label><Input value={payout.bankAccount} onChange={(e) => setPayout({ ...payout, bankAccount: e.target.value })} /></div>
                  <div className="col-span-2"><label className="block text-sm font-medium mb-1">Account Holder Name</label><Input value={payout.bankHolderName} onChange={(e) => setPayout({ ...payout, bankHolderName: e.target.value })} /></div>
                  <div><label className="block text-sm font-medium mb-1">eSewa ID</label><Input value={payout.esewaId} onChange={(e) => setPayout({ ...payout, esewaId: e.target.value })} /></div>
                  <div><label className="block text-sm font-medium mb-1">Khalti ID</label><Input value={payout.khaltiId} onChange={(e) => setPayout({ ...payout, khaltiId: e.target.value })} /></div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-3">Payment QR Codes</p>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { key: 'bankQr', label: 'Bank QR', ref: bankQrRef },
                      { key: 'esewaQr', label: 'eSewa QR', ref: esewaQrRef },
                      { key: 'khaltiQr', label: 'Khalti QR', ref: khaltiQrRef },
                    ].map(({ key, label, ref }) => (
                      <div key={key} className="border rounded-lg p-3 text-center">
                        <p className="text-xs font-medium mb-2">{label}</p>
                        {payout[key]?.url ? (
                          <div className="relative inline-block">
                            <img src={payout[key].url} alt={label} className="w-24 h-24 object-contain mx-auto rounded border" />
                            <button type="button" onClick={() => handleQrRemove(key, payout[key])} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => ref.current?.click()} disabled={uploading === key} className="w-24 h-24 mx-auto border-2 border-dashed rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-colors">
                            {uploading === key ? <Spinner size="sm" /> : <Upload size={24} />}
                          </button>
                        )}
                        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => handleQrUpload(e, key)} />
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit" variant="secondary" disabled={saving}>{saving ? 'Saving...' : 'Save Payout Info'}</Button>
              </form>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
