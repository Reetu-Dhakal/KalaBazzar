export const UserRole = {
  GUEST: 'guest',
  CUSTOMER: 'customer',
  SELLER: 'seller',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const SellerStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
} as const;

export type SellerStatus = typeof SellerStatus[keyof typeof SellerStatus];

export const ProductStatus = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  OUT_OF_STOCK: 'out_of_stock',
} as const;

export type ProductStatus = typeof ProductStatus[keyof typeof ProductStatus];

export const OrderStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export const PaymentMethod = {
  COD: 'cod',
  KHALTI: 'khalti',
  ESEWA: 'esewa',
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

export const PaymentStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export const REGIONS = [
  'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kavre', 'Sindhupalchok',
  'Pokhara', 'Kaski', 'Tanahun', 'Syangja', 'Parbat',
  'Biratnagar', 'Morang', 'Sunsari', 'Jhapa', 'Ilam',
  'Janakpur', 'Dhanusha', 'Mahottari', 'Sarlahi', 'Rautahat',
  'Birgunj', 'Parsa', 'Bara', 'Rautahat',
  'Butwal', 'Rupandehi', 'Kapilvastu', 'Nawalparasi',
  'Dhangadhi', 'Kailali', 'Kanchanpur', 'Doti', 'Bajhang',
  'Surkhet', 'Dailekh', 'Jajarkot', 'Rukum', 'Salyan',
  'Nepalgunj', 'Banke', 'Bardiya',
  'Dang', 'Rolpa', 'Pyuthan',
  'Palpa', 'Gulmi', 'Arghakhanchi',
  'Baglung', 'Myagdi', 'Mustang',
  'Manang', 'Lamjung', 'Gorkha',
  'Dhading', 'Nuwakot', 'Rasuwa',
  'Sindhuli', 'Ramechhap', 'Dolakha',
  'Okhaldhunga', 'Khotang', 'Bhojpur',
  'Solukhumbu', 'Taplejung', 'Panchthar',
  'Tehrathum', 'Sankhuwasabha', 'Terhathum',
] as const;