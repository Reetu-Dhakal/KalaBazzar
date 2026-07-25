import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Package,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency, getStatusColor } from '@/lib/utils';
import api from '@/lib/api';
import type { Product, PaginationMeta } from '@/types';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'approved', label: 'Published' },
  { value: 'out_of_stock', label: 'Out of Stock' },
] as const;

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: '-basePrice', label: 'Price: High to Low' },
  { value: 'basePrice', label: 'Price: Low to High' },
  { value: '-createdAt', label: 'Newest' },
  { value: 'createdAt', label: 'Oldest' },
] as const;

export default function SellerProducts() {
  usePageTitle('My Products — KalaBazzar', 'Manage your product listings.');
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const [searchInput, setSearchInput] = useState(search);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      if (sort) params.set('sort', sort);

      const { data } = await api.get(`/sellers/dashboard/products?${params.toString()}`);
      setProducts(data.data.products || []);
      setPagination(data.data.pagination || null);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParams = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  const handleSearch = () => {
    updateParams('search', searchInput);
  };

  const handlePublishToggle = async (product: Product) => {
    try {
      if (product.status === 'approved') {
        await api.put(`/products/${product._id}/unpublish`);
        toast.success('Product unpublished');
      } else {
        await api.put(`/products/${product._id}/publish`);
        toast.success('Product published');
      }
      fetchProducts();
    } catch {
      toast.error('Failed to update product status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      setDeleteId(null);
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const getStockInfo = (product: Product) => {
    const totalStock = product.variants?.reduce((sum, v) => sum + v.inventory, 0) ?? 0;
    if (totalStock === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (totalStock <= 5) return { label: `${totalStock} left`, variant: 'warning' as const };
    return { label: `${totalStock} in stock`, variant: 'default' as const };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-heading text-foreground">My Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product listings.</p>
        </div>
        <Button asChild>
          <Link to="/seller/products/new">
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => updateParams('status', e.target.value)}
            className="h-10 rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {STATUS_FILTERS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => updateParams('sort', e.target.value)}
            className="h-10 rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">
              {search || status ? 'Try adjusting your filters.' : 'Start by adding your first product.'}
            </p>
            {!search && !status && (
              <Button asChild>
                <Link to="/seller/products/new">
                  <Plus className="h-4 w-4" />
                  Add Product
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Product</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Price</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Stock</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const stockInfo = getStockInfo(product);
                    const image =
                      product.variants?.[0]?.images?.[0] || '/placeholder.jpg';
                    return (
                      <tr key={product._id} className="border-b border-border last:border-0">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={image}
                              alt={product.name}
                              className="h-12 w-12 rounded-lg object-cover bg-muted"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                                {product.name}
                              </p>
                              {typeof product.category === 'object' && product.category && (
                                <p className="text-xs text-muted-foreground">
                                  {product.category.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-medium">{formatCurrency(product.basePrice)}</p>
                          {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
                            <p className="text-xs text-muted-foreground line-through">
                              {formatCurrency(product.compareAtPrice)}
                            </p>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge variant={stockInfo.variant}>{stockInfo.label}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(product.status)}>
                            {product.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handlePublishToggle(product)}
                              title={
                                product.status === 'approved' ? 'Unpublish' : 'Publish'
                              }
                            >
                              {product.status === 'approved' ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button asChild variant="ghost" size="icon-sm">
                              <Link to={`/seller/products/${product._id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setDeleteId(product._id)}
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
          </Card>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} products
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrev}
                  onClick={() => updateParams('page', String(page - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNext}
                  onClick={() => updateParams('page', String(page + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-sm mx-4">
            <CardContent className="p-6">
              <h3 className="text-lg font-heading font-semibold mb-2">Delete Product?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                This action cannot be undone. The product will be permanently removed.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDeleteId(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(deleteId)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
