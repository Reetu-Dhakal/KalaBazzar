import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';

export default function Register() {
  usePageTitle('Create Account');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Create Account</CardTitle>
          <CardDescription>Join Kala Bazaar's community</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <Input name="name" value={form.name} onChange={handleChange} required placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone (Optional)</label>
              <Input name="phone" value={form.phone} onChange={handleChange} placeholder="98XXXXXXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="At least 8 characters" />
              {form.password && (
                <div className="mt-1.5 space-y-1">
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${form.password.length < 6 ? 'w-1/4 bg-red-500' : form.password.length < 10 ? 'w-2/4 bg-amber-500' : form.password.length < 14 ? 'w-3/4 bg-yellow-500' : 'w-full bg-green-500'}`} />
                  </div>
                  <p className={`text-xs ${form.password.length < 6 ? 'text-red-500' : form.password.length < 10 ? 'text-amber-500' : form.password.length < 14 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {form.password.length < 6 ? 'Weak' : form.password.length < 10 ? 'Fair' : form.password.length < 14 ? 'Good' : 'Strong'}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <Input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required placeholder="Repeat password" />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-text-secondary">
              Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
            </p>
            <p className="text-sm">
              <Link to="/seller/register" className="text-text-muted hover:text-primary text-xs">Register as an artisan</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
