import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';
import { Shield } from 'lucide-react';

export default function AdminLogin() {
  usePageTitle('Admin Login');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== 'admin') {
        toast.error('Access denied. Admin credentials required.');
        return;
      }
      toast.success('Welcome back!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-950">
      <Card className="w-full max-w-sm border-gray-800 bg-gray-900 text-white">
        <CardHeader className="text-center">
          <div className="mx-auto w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Shield size={28} className="text-secondary" />
          </div>
          <CardTitle className="text-xl">Admin Access</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-gray-800 border-gray-700 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-gray-800 border-gray-700 text-white" />
            </div>
            <Button type="submit" className="w-full bg-secondary text-gray-900 hover:bg-secondary/90" disabled={loading}>
              {loading ? 'Authenticating...' : 'Access Dashboard'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
