import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';

import toast from 'react-hot-toast';

export default function SellerApplication() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    district: '',
    storeName: '',
    bio: '',
    craftStory: '',
    yearsOfExperience: '',
    specialization: '',
    familyTradition: '',
    trainingInfo: '',
    verificationPath: 'new_artisan',
    socialUrl: '',
    marketplaceUrl: '',
    craftStatement: '',
  });

  if (user?.role === 'seller') {
    navigate('/seller/dashboard');
    return null;
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        yearsOfExperience: parseInt(form.yearsOfExperience) || 0,
        specialization: form.specialization.split(',').map((s) => s.trim()).filter(Boolean),
      };
      await api.post('/sellers/apply', payload);
      toast.success('Application submitted! We will review and get back to you.');
      navigate('/seller/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">Become a Seller</h1>
        <p className="text-text-secondary">Join Kala Bazaar's community of artisans and showcase your crafts to Nepal</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seller Application</CardTitle>
          <CardDescription>Tell us about yourself and your craft</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium mb-1">District *</label>
                <Input name="district" value={form.district} onChange={handleChange} required placeholder="e.g., Bhaktapur" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium mb-1">Store Name</label>
                <Input name="storeName" value={form.storeName} onChange={handleChange} placeholder="e.g., Hari Woodcrafts" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Brief introduction about yourself" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Craft Story</label>
              <textarea name="craftStory" value={form.craftStory} onChange={handleChange} rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Tell us about your journey as an artisan..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Years of Experience</label>
                <Input type="number" name="yearsOfExperience" value={form.yearsOfExperience} onChange={handleChange} min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Specialization</label>
                <Input name="specialization" value={form.specialization} onChange={handleChange} placeholder="Wood carving, pottery (comma separated)" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Family Tradition</label>
              <textarea name="familyTradition" value={form.familyTradition} onChange={handleChange} rows={2} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Any family history in this craft..." />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Verification Path</label>
              <select name="verificationPath" value={form.verificationPath} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="new_artisan">New Artisan (no prior online presence)</option>
                <option value="social">Social Media Presence</option>
                <option value="marketplace">Other Marketplace Seller</option>
              </select>
            </div>

            {form.verificationPath === 'social' && (
              <div>
                <label className="block text-sm font-medium mb-1">Social Media URL</label>
                <Input name="socialUrl" value={form.socialUrl} onChange={handleChange} placeholder="Link to your Instagram, Facebook, etc." />
              </div>
            )}
            {form.verificationPath === 'marketplace' && (
              <div>
                <label className="block text-sm font-medium mb-1">Marketplace Profile URL</label>
                <Input name="marketplaceUrl" value={form.marketplaceUrl} onChange={handleChange} placeholder="Link to your profile on other marketplace" />
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Submit Application'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
