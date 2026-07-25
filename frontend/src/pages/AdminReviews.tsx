import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Star,
  MessageSquare,
} from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, truncateText } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { Review, PaginationMeta } from '@/types';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-lg" />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  usePageTitle('Manage Reviews — KalaBazzar', 'View and moderate customer reviews.');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | ''>('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (search.trim()) params.search = search.trim();
      if (ratingFilter !== '') params.rating = ratingFilter;
      const { data } = await api.get('/reviews/admin', { params });
      setReviews(data.data || []);
      setPagination(data.meta?.pagination);
    } catch {
      toast.error('Failed to load reviews');
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, ratingFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    setDeleteId(id);
    try {
      await api.delete(`/reviews/admin/${id}`);
      toast.success('Review deleted');
      fetchReviews();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    } finally {
      setDeleteId(null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading text-foreground">Manage Reviews</h1>
        <p className="text-muted-foreground mt-1">View and moderate customer reviews.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={ratingFilter === '' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => { setRatingFilter(''); setPage(1); }}
        >
          All Ratings
        </Button>
        {[5, 4, 3, 2, 1].map((r) => (
          <Button
            key={r}
            variant={ratingFilter === r ? 'primary' : 'outline'}
            size="sm"
            onClick={() => { setRatingFilter(r); setPage(1); }}
          >
            {r} <Star className="h-3 w-3 ml-1 fill-current" />
          </Button>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product or customer..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          />
        </div>
        <Button type="submit" variant="outline">Search</Button>
      </form>

      {/* Reviews Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6"><TableSkeleton /></div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No reviews found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Product</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Customer</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Rating</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Review</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Date</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => {
                    const customer = typeof review.customer === 'object' ? review.customer : null;
                    const product = typeof review.product === 'object' ? review.product : null;
                    return (
                      <tr key={review._id} className="border-b border-border last:border-0">
                        <td className="p-4 text-sm font-medium max-w-[200px] truncate">
                          {product ? product.name : '—'}
                        </td>
                        <td className="p-4 text-sm">
                          {customer ? `${customer.firstName} ${customer.lastName}` : '—'}
                        </td>
                        <td className="p-4">
                          <StarRating rating={review.rating} />
                        </td>
                        <td className="p-4 text-sm max-w-[250px]">
                          {review.title && (
                            <p className="font-medium">{review.title}</p>
                          )}
                          <p className="text-muted-foreground text-xs">
                            {truncateText(review.comment, 80)}
                          </p>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDelete(review._id)}
                              disabled={deleteId === review._id}
                              title="Delete review"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={!pagination.hasNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
