import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowRight, HiOutlineShieldCheck } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const BecomeSeller = () => {
  const [formData, setFormData] = useState({
    storeName: '',
    district: '',
    province: '',
    story: '',
    specialization: '',
    yearsOfExperience: '',
  });
  const [loading, setLoading] = useState(false);
  const { becomeSeller, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await becomeSeller({
        storeName: formData.storeName,
        district: formData.district,
        province: formData.province,
        story: formData.story,
        specialization: formData.specialization.split(',').map(s => s.trim()),
        yearsOfExperience: parseInt(formData.yearsOfExperience),
      });
      navigate('/');
    } catch (error) {
      // Handled in context
    } finally {
      setLoading(false);
    }
  };

  if (user?.role === 'seller') {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="text-center">
          <HiOutlineShieldCheck className="w-16 h-16 text-success mx-auto mb-4" />
          <h1 className="text-3xl font-heading font-bold text-text mb-2">You're Already a Seller!</h1>
          <p className="text-text-muted mb-6">Visit your seller dashboard to manage your store.</p>
          <button onClick={() => navigate('/seller/dashboard')} className="px-6 py-3 bg-primary text-white rounded-xl">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-text mb-4">
              Become a <span className="text-primary">Seller</span>
            </h1>
            <p className="text-text-muted max-w-xl mx-auto">
              Join hundreds of Nepali artisans selling their handmade products on Kala Bazaar. 
              Set up your free store in minutes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { step: '1', title: 'Create Profile', desc: 'Tell us about your craft and store' },
              { step: '2', title: 'Upload Products', desc: 'List your handmade products with photos' },
              { step: '3', title: 'Start Selling', desc: 'Receive orders and grow your business' },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl p-6 text-center">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                  {item.step}
                </div>
                <h3 className="font-heading font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-text-muted">{item.desc}</p>
              </div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm p-8"
          >
            <h2 className="text-2xl font-heading font-bold mb-6">Seller Application</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Store Name *</label>
                  <input
                    type="text"
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    placeholder="e.g., Sita's Pottery Studio"
                    className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary bg-background"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">District *</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="e.g., Bhaktapur"
                    className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary bg-background"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Province</label>
                  <select
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary bg-background"
                  >
                    <option value="">Select Province</option>
                    <option value="Province 1">Province 1</option>
                    <option value="Madhesh">Madhesh</option>
                    <option value="Bagmati">Bagmati</option>
                    <option value="Gandaki">Gandaki</option>
                    <option value="Lumbini">Lumbini</option>
                    <option value="Karnali">Karnali</option>
                    <option value="Sudurpashchim">Sudurpashchim</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Years of Experience</label>
                  <input
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                    placeholder="e.g., 5"
                    className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Specialization (comma separated)</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g., Pottery, Ceramics, Traditional Arts"
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Your Story</label>
                <textarea
                  value={formData.story}
                  onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                  placeholder="Tell us about your craft, your journey, and what makes your products special..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary bg-background resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
                <HiOutlineArrowRight className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BecomeSeller;