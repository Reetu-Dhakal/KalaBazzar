import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Eye,
  Store,
  User,
  Mail,
  Phone,
  MapPin,
  Link2,
  CreditCard,
  FileText,
} from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, getStatusColor } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { SellerApplication, PaginationMeta } from '@/types';

const statusFilters = ['pending', 'approved', 'rejected'] as const;

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-lg" />
      ))}
    </div>
  );
}

export default function AdminSellerApplications() {
  usePageTitle('Seller Applications — कलाbazzar', 'Review and manage seller applications.');
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [viewApplication, setViewApplication] = useState<SellerApplication | null>(null);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; applicationId: string; shopName: string }>({
    open: false,
    applicationId: '',
    shopName: '',
  });
  const [rejectReason, setRejectReason] = useState('');

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      const { data } = await api.get('/admin/seller-applications', { params });
      setApplications(data.data || []);
      setPagination(data.meta?.pagination);
    } catch {
      toast.error('Failed to load seller applications');
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await api.put(`/admin/seller-applications/${id}/approve`);
      toast.success('Application approved — seller account activated');
      fetchApplications();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve application');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please enter a rejection reason');
      return;
    }
    setActionLoading(rejectModal.applicationId);
    try {
      await api.put(`/admin/seller-applications/${rejectModal.applicationId}/reject`, {
        reason: rejectReason,
      });
      toast.success('Application rejected');
      setRejectModal({ open: false, applicationId: '', shopName: '' });
      setRejectReason('');
      fetchApplications();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject application');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchApplications();
  };

  const applicantName = (application: SellerApplication): string => {
    const user = typeof application.user === 'object' ? application.user : null;
    return user ? `${user.firstName} ${user.lastName}` : '—';
  };

  const applicantEmail = (application: SellerApplication): string => {
    const user = typeof application.user === 'object' ? application.user : null;
    return user?.email || '—';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading text-foreground">Seller Applications</h1>
        <p className="text-muted-foreground mt-1">Review new seller applications and activate approved shops.</p>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? 'primary' : 'outline'}
            size="sm"
            onClick={() => { setStatusFilter(s); setPage(1); }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
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
            placeholder="Search by shop name..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          />
        </div>
        <Button type="submit" variant="outline" size="md">Search</Button>
      </form>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6"><TableSkeleton /></div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Store className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No seller applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Applicant</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Shop / Brand</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Craft Category</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Location</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Applied</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application._id} className="border-b border-border last:border-0">
                      <td className="p-4">
                        <p className="text-sm font-medium">{applicantName(application)}</p>
                        <p className="text-xs text-muted-foreground">{applicantEmail(application)}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {application.samplePhotos?.[0] ? (
                            <img
                              src={application.samplePhotos[0]}
                              alt={application.shopName}
                              className="h-8 w-8 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                              <Store className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <span className="text-sm font-medium">{application.shopName}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{application.craftCategory}</td>
                      <td className="p-4 text-sm">{application.workshopLocation}</td>
                      <td className="p-4">
                        <Badge className={getStatusColor(application.status)}>{application.status}</Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {formatDate(application.appliedAt)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setViewApplication(application)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          {application.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleApprove(application._id)}
                                disabled={actionLoading === application._id}
                                title="Approve"
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setRejectModal({
                                  open: true,
                                  applicationId: application._id,
                                  shopName: application.shopName,
                                })}
                                disabled={actionLoading === application._id}
                                title="Reject"
                              >
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
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

      {/* Details Modal */}
      {viewApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {viewApplication.shopName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-3 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4 shrink-0" />
                  {applicantName(viewApplication)}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground break-all">
                  <Mail className="h-4 w-4 shrink-0" />
                  {applicantEmail(viewApplication)}
                </p>
                {typeof viewApplication.user === 'object' && viewApplication.user.phone && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    {viewApplication.user.phone}
                  </p>
                )}
                <p className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {viewApplication.workshopLocation}
                </p>
                <p className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <a
                    href={viewApplication.portfolioLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline break-all"
                  >
                    {viewApplication.portfolioLink}
                  </a>
                </p>
                {viewApplication.panNumber && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="h-4 w-4 shrink-0" />
                    PAN: {viewApplication.panNumber}
                  </p>
                )}
              </div>

              {viewApplication.bio && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Bio</p>
                  <p className="text-sm whitespace-pre-wrap">{viewApplication.bio}</p>
                </div>
              )}

              {viewApplication.samplePhotos && viewApplication.samplePhotos.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                    Sample Photos
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {viewApplication.samplePhotos.map((src, i) => (
                      <img key={i} src={src} alt={`Sample ${i + 1}`} className="h-20 w-full object-cover rounded-lg" />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(viewApplication.status)}>{viewApplication.status}</Badge>
                  <span className="text-xs text-muted-foreground">
                    Applied {formatDate(viewApplication.appliedAt)}
                  </span>
                </div>
                {viewApplication.status === 'rejected' && viewApplication.adminNote && (
                  <span className="text-xs text-muted-foreground max-w-[50%] truncate" title={viewApplication.adminNote}>
                    {viewApplication.adminNote}
                  </span>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                {viewApplication.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRejectModal({
                          open: true,
                          applicationId: viewApplication._id,
                          shopName: viewApplication.shopName,
                        });
                        setViewApplication(null);
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => {
                        const id = viewApplication._id;
                        setViewApplication(null);
                        handleApprove(id);
                      }}
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                  </>
                )}
                <Button variant="ghost" onClick={() => setViewApplication(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Reject {rejectModal.shopName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Rejection Reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectModal({ open: false, applicationId: '', shopName: '' });
                    setRejectReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  isLoading={actionLoading === rejectModal.applicationId}
                >
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}