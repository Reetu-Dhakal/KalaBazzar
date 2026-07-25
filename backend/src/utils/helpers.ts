export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateUniqueSlug(baseSlug: string, exists: (slug: string) => Promise<boolean>): Promise<string> {
  return (async function findUniqueSlug(): Promise<string> {
    let slug = baseSlug;
    let counter = 1;
    
    while (await exists(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return slug;
  })();
}

export function generateSKU(name: string, categoryCode: string = 'PRD'): string {
  const prefix = categoryCode.toUpperCase().substring(0, 3);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  return `${prefix}-${timestamp}-${random}`;
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `KB-${timestamp}-${random}`;
}

export function slugify(text: string): string {
  const a = 'àáäâãåăæąçćčđďèéěėëêęğǵḧìíïîįłḿǹńňñòóöôõøœṗŕřßşśšșťṫùúüûųůýÿźžż'.split('');
  const b = 'aaaaaaaacecdddeeeeeegghiiiilmnnnnoooooooprrssssttuuuuuuyyzzz'.split('');
  const map: Record<string, string> = {};
  a.forEach((char, i) => map[char] = b[i]);
  
  return text
    .toLowerCase()
    .trim()
    .split('')
    .map(char => map[char] || char)
    .join('')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function createPaginationMeta(page: number, limit: number, total: number) {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function parseQueryFilters(query: any) {
  const filters: Record<string, any> = {};
  const options: any = {
    page: parseInt(query.page) || 1,
    limit: Math.min(parseInt(query.limit) || 20, 100),
    sort: query.sort || '-createdAt',
    select: query.select,
    populate: query.populate,
  };

  if (query.search) {
    filters.$text = { $search: query.search };
  }

  if (query.category) filters.category = query.category;
  if (query.craft) filters.craft = query.craft;
  if (query.region) filters.region = query.region;
  if (query.seller) filters.seller = query.seller;
  if (query.status) filters.status = query.status;
  if (query.isFeatured !== undefined) filters.isFeatured = query.isFeatured === 'true';
  if (query.isActive !== undefined) filters.isActive = query.isActive === 'true';

  if (query.minPrice || query.maxPrice) {
    filters.basePrice = {};
    if (query.minPrice) filters.basePrice.$gte = parseFloat(query.minPrice);
    if (query.maxPrice) filters.basePrice.$lte = parseFloat(query.maxPrice);
  }

  if (query.minRating) {
    filters['analytics.averageRating'] = { $gte: parseFloat(query.minRating) };
  }

  if (query.tags) {
    filters.tags = { $in: query.tags.split(',').map((t: string) => t.trim().toLowerCase()) };
  }

  if (query.startDate || query.endDate) {
    filters.createdAt = {};
    if (query.startDate) filters.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filters.createdAt.$lte = new Date(query.endDate);
  }

  return { filters, options };
}

export function formatCurrency(amount: number, currency: string = 'NPR'): string {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-NP').format(num);
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

export function calculateReadTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}