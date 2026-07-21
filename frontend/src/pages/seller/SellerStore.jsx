import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineSave, HiOutlineOfficeBuilding } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { Button, Container } from '../../components/ui';
import toast from 'react-hot-toast';

const SellerStore = () => {
  const { user, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    storeName: user?.sellerProfile?.storeName || '',
    story: user?.sellerProfile?.story || '',
    district: user?.sellerProfile?.district || '',
    province: user?.sellerProfile?.province || '',
    specialization: (user?.sellerProfile?.specialization || []).join(', '),
    yearsOfExperience: user?.sellerProfile?.yearsOfExperience || 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        sellerProfile: {
          storeName: form.storeName,
          story: form.story,
          district: form.district,
          province: form.province,
          specialization: form.specialization
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          yearsOfExperience: Number(form.yearsOfExperience),
        },
      });
      toast.success('Store profile updated!');
    } catch {
      // toast already shown by context
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-24">
      <Container>
        <div className="py-8 max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-2">
                  <HiOutlineOfficeBuilding className="w-8 h-8 text-primary" />
              <h1 className="font-heading text-4xl font-semibold text-text">Store Profile</h1>
            </div>
            <p className="text-text-muted">Manage your store settings and information</p>
          </motion.div>

          {/* Store Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-border/50 p-6 mb-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                {user?.sellerProfile?.storeLogo?.url ? (
                  <img
                    src={user.sellerProfile.storeLogo.url}
                    alt="Store logo"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
              <HiOutlineOfficeBuilding className="w-8 h-8 text-primary" />
                )}
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold text-text">
                  {user?.sellerProfile?.storeName || 'Your Store'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    user?.isSellerVerified
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {user?.isSellerVerified ? 'Verified Seller' : 'Pending Verification'}
                  </span>
                  <span className="text-xs text-text-muted">
                    Commission: {user?.sellerProfile?.commission || 10}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Store Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-border/50 p-6 md:p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text mb-2">Store Name</label>
                <input
                  type="text"
                  name="storeName"
                  value={form.storeName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="Your store name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Store Story</label>
                <textarea
                  name="story"
                  value={form.story}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                  placeholder="Tell customers about your craft and what makes your products special..."
                />
              </div>

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

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    placeholder="e.g. Pottery, Textiles, Woodwork"
                  />
                  <p className="text-xs text-text-muted mt-1">Separate with commas</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Years of Experience</label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={form.yearsOfExperience}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" icon={HiOutlineSave} loading={saving} disabled={saving} size="lg">
                  Save Changes
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </Container>
    </div>
  );
};

export default SellerStore;
