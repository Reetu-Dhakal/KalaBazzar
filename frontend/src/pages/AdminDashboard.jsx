import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import usePageTitle from '../hooks/usePageTitle';
import { Users, Store, Package, DollarSign, Check, X, Tag, ShoppingBag, Star, UserCog } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  usePageTitle('Admin Dashboard');
  const [stats, setStats] = useState(null);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, sellersRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/pending-sellers'),
      ]);
      setStats(statsRes.data.data);
      setPendingSellers(sellersRes.data.data.sellers);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/sellers/${id}/approve`);
      toast.success('Seller approved!');
      fetchData();
    } catch {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/admin/sellers/${id}/reject`, { reason: 'Application does not meet our criteria' });
      toast.success('Seller rejected');
      fetchData();
    } catch {
      toast.error('Failed to reject');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users },
    { label: 'Total Sellers', value: stats?.totalSellers || 0, icon: Store },
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: Package },
    { label: 'Revenue', value: `Rs. ${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-heading font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
                <s.icon className="text-primary" size={28} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Seller Applications ({pendingSellers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingSellers.length === 0 ? (
            <p className="text-text-secondary text-center py-8">No pending applications</p>
          ) : (
            <div className="space-y-4">
              {pendingSellers.map((seller) => (
                <Card key={seller._id} className="border-l-4 border-l-secondary">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{seller.user?.name}</h3>
                        <p className="text-sm text-text-muted">{seller.user?.email} | {seller.district}</p>
                        <p className="text-sm text-text-secondary mt-1">{seller.bio}</p>
                        {seller.storeName && <Badge variant="outline" className="mt-2">{seller.storeName}</Badge>}
                      </div>
                      <div className="flex gap-2 items-start">
                        <Button size="sm" variant="default" onClick={() => handleApprove(seller._id)}>
                          <Check size={16} className="mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleReject(seller._id)}>
                          <X size={16} className="mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link to="/admin/coupons"><Button variant="secondary"><Tag size={16} className="mr-2" /> Manage Coupons</Button></Link>
            <Link to="/admin/orders"><Button variant="secondary"><ShoppingBag size={16} className="mr-2" /> Manage Orders</Button></Link>
            <Link to="/admin/reviews"><Button variant="secondary"><Star size={16} className="mr-2" /> Manage Reviews</Button></Link>
            <Link to="/admin/users"><Button variant="secondary"><UserCog size={16} className="mr-2" /> Manage Users</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
