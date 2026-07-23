import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';
import { Store, Eye, EyeOff, Check, X } from 'lucide-react';

export default function SellerRegister() {
  usePageTitle('Join as an Artisan');
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
  });

  const passwordStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = passwordStrength(form.password);
  const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength - 1] || '';
  const strengthColor = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'][strength - 1] || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      toast.success('Account created! Now complete your artisan application.');
      navigate('/seller/apply');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary/5 to-secondary/5">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Store size={32} className="text-primary" />
          </div>
          <CardTitle className="text-2xl">Join as an Artisan</CardTitle>
          <CardDescription>Create your artisan account to start selling on Kala Bazaar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="98XXXXXXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password *</label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="Min. 8 characters" className="pr-10" minLength={8} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${strengthColor} transition-all`} style={{ width: `${(strength / 5) * 100}%` }} />
                  </div>
                  <p className="text-xs text-text-muted mt-1">{strengthLabel}</p>
                </div>
              )}
              <ul className="mt-2 space-y-1">
                {[
                  { check: form.password.length >= 8, label: 'At least 8 characters' },
                  { check: /[A-Z]/.test(form.password), label: 'One uppercase letter' },
                  { check: /[a-z]/.test(form.password), label: 'One lowercase letter' },
                  { check: /[0-9]/.test(form.password), label: 'One number' },
                ].map((rule) => (
                  <li key={rule.label} className={`text-xs flex items-center gap-1 ${rule.check ? 'text-green-600' : 'text-text-muted'}`}>
                    {rule.check ? <Check size={12} /> : <X size={12} />} {rule.label}
                  </li>
                ))}
              </ul>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Artisan Account'}
            </Button>
          </form>
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-text-secondary">
              Already have an artisan account?{' '}
              <Link to="/seller/login" className="text-primary font-medium hover:underline">Sign in</Link>
            </p>
            <p className="text-sm">
              <Link to="/register" className="text-text-muted hover:text-primary text-xs">Customer registration</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
