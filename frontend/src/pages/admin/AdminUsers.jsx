import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlineCheckCircle,
  HiOutlineUser,
  HiOutlineOfficeBuilding,
} from 'react-icons/hi';
import API from '../../utils/axios';
import { Container, LoadingSkeleton } from '../../components/ui';
import toast from 'react-hot-toast';

const roleColors = {
  customer: 'bg-blue-100 text-blue-700',
  seller: 'bg-primary/10 text-primary',
  admin: 'bg-purple-100 text-purple-700',
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [verifyingId, setVerifyingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/admin/users?limit=100');
      setUsers(data.data || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySeller = async (userId) => {
    setVerifyingId(userId);
    try {
      await API.put(`/admin/verify-seller/${userId}`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isSellerVerified: true } : u))
      );
      toast.success('Seller verified!');
    } catch {
      toast.error('Failed to verify seller');
    } finally {
      setVerifyingId(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen pt-24">
      <Container>
        <div className="py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-heading text-4xl font-semibold text-text">Users</h1>
            <p className="text-text-muted mt-1">{users.length} registered users</p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            <div className="flex gap-2">
              {[
                { id: '', label: 'All', count: users.length },
                { id: 'customer', label: 'Customers', count: roleCounts.customer || 0 },
                { id: 'seller', label: 'Sellers', count: roleCounts.seller || 0 },
                { id: 'admin', label: 'Admins', count: roleCounts.admin || 0 },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setRoleFilter(f.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    roleFilter === f.id
                      ? 'bg-primary text-white'
                      : 'bg-white border border-border text-text-muted hover:text-text'
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-border/50 overflow-hidden"
          >
            {loading ? (
              <div className="p-6"><LoadingSkeleton variant="list" count={5} /></div>
            ) : filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-background/50">
                      <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">User</th>
                      <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">Role</th>
                      <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">Joined</th>
                      <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">Status</th>
                      <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((user) => (
                      <tr key={user._id} className="border-b border-border last:border-0 hover:bg-background/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              {user.avatar?.url ? (
                                <img src={user.avatar.url} alt="" className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <HiOutlineUser className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-text truncate">{user.name}</p>
                              <p className="text-xs text-text-muted truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${roleColors[user.role] || ''}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-muted">
                          {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          {user.role === 'seller' ? (
                            <span className={`text-xs font-medium ${user.isSellerVerified ? 'text-green-600' : 'text-amber-600'}`}>
                              {user.isSellerVerified ? 'Verified' : 'Pending'}
                            </span>
                          ) : (
                            <span className={`text-xs font-medium ${user.isVerified ? 'text-green-600' : 'text-text-muted'}`}>
                              {user.isVerified ? 'Verified' : 'Unverified'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {user.role === 'seller' && !user.isSellerVerified && (
                            <button
                              onClick={() => handleVerifySeller(user._id)}
                              disabled={verifyingId === user._id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                            >
                              <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                              {verifyingId === user._id ? 'Verifying...' : 'Verify'}
                            </button>
                          )}
                          {user.role === 'seller' && user.isSellerVerified && (
                            <div className="flex items-center gap-1 text-xs text-text-muted">
                              <HiOutlineOfficeBuilding className="w-3.5 h-3.5" />
                              {user.sellerProfile?.storeName || 'No store'}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <HiOutlineSearch className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <p className="text-text-muted">No users match your search</p>
              </div>
            )}
          </motion.div>
        </div>
      </Container>
    </div>
  );
};

export default AdminUsers;
