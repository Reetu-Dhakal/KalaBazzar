import { useState, useEffect } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

export default function AdminReviews() {
  usePageTitle('Manage Reviews');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchReviews = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/reviews?page=${p}&limit=20`);
      setReviews(data.data.reviews);
      setPagination(data.data.pagination);
    } catch { toast.error('Failed to load reviews'); }
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      toast.success('Review deleted');
      fetchReviews(page);
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-heading font-bold mb-6">Manage Reviews</h1>

      <Card>
        <CardHeader><CardTitle>All Reviews ({pagination?.total || 0})</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center"><Spinner /></div>
          ) : reviews.length === 0 ? (
            <div className="p-8 text-center text-text-muted">No reviews found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Rating</th>
                    <th className="px-4 py-3 font-semibold">Review</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reviews.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 max-w-[180px] truncate">{r.product?.name || 'Deleted'}</td>
                      <td className="px-4 py-3">{r.user?.name || 'Unknown'}</td>
                      <td className="px-4 py-3">
                        <span className="text-amber-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      </td>
                      <td className="px-4 py-3 max-w-[250px]">
                        <p className="truncate">{r.comment}</p>
                      </td>
                      <td className="px-4 py-3 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="danger" onClick={() => handleDelete(r._id)}><Trash2 size={14} /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => { setPage(p); fetchReviews(p); }}>{p}</Button>
          ))}
        </div>
      )}
    </div>
  );
}
