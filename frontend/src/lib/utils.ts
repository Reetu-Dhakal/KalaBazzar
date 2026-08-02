import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'NPR'): string {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KB-${timestamp}-${random}`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border border-amber-200/60',
    confirmed: 'bg-blue-50 text-blue-700 border border-blue-200/60',
    processing: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
    shipped: 'bg-purple-50 text-purple-700 border border-purple-200/60',
    delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    cancelled: 'bg-red-50 text-red-700 border border-red-200/60',
    refunded: 'bg-gray-50 text-gray-700 border border-gray-200/60',
    paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    failed: 'bg-red-50 text-red-700 border border-red-200/60',
    approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    rejected: 'bg-red-50 text-red-700 border border-red-200/60',
    suspended: 'bg-orange-50 text-orange-700 border border-orange-200/60',
    draft: 'bg-gray-50 text-gray-700 border border-gray-200/60',
    out_of_stock: 'bg-red-50 text-red-700 border border-red-200/60',
  };
  return colors[status] || 'bg-gray-50 text-gray-700 border border-gray-200/60';
}
