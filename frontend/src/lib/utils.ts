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
    pending: 'bg-amber-50 text-amber-700 border border-amber-200',
    confirmed: 'bg-red-50 text-[#7A1F2B] border border-red-200',
    processing: 'bg-gold-100 text-gold-700 border border-gold-200',
    shipped: 'bg-red-50 text-[#7A1F2B] border border-red-200',
    delivered: 'bg-green-50 text-green-700 border border-green-200',
    cancelled: 'bg-red-50 text-red-700 border border-red-200',
    refunded: 'bg-gray-50 text-gray-700 border border-gray-200',
    paid: 'bg-green-50 text-green-700 border border-green-200',
    failed: 'bg-red-50 text-red-700 border border-red-200',
    approved: 'bg-green-50 text-green-700 border border-green-200',
    rejected: 'bg-red-50 text-red-700 border border-red-200',
    suspended: 'bg-amber-50 text-amber-700 border border-amber-200',
    draft: 'bg-gray-50 text-gray-700 border border-gray-200',
    out_of_stock: 'bg-red-50 text-red-700 border border-red-200',
  };
  return colors[status] || 'bg-gray-50 text-gray-700 border border-gray-200';
}
