export type UserRole = 'guest' | 'customer' | 'seller' | 'admin';
export type SellerStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type ProductStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'out_of_stock';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentMethod = 'cod' | 'khalti' | 'esewa';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type AddressLabel = 'home' | 'work' | 'other';
export type VerificationPath = 'social' | 'marketplace' | 'offline';
export type DimensionUnit = 'cm' | 'mm' | 'in' | 'ft';
export type CustomOptionType = 'text' | 'select' | 'checkbox';
export type ShippingClass = 'standard' | 'express' | 'free';
export type DiscountType = 'percentage' | 'fixed';
export type BannerPosition = 'hero' | 'hero_secondary' | 'category_banner' | 'collection_banner' | 'artisan_spotlight' | 'footer' | 'sidebar';
export type LinkType = 'none' | 'url' | 'product' | 'collection' | 'artisan' | 'category' | 'region' | 'craft';
export type ButtonStyle = 'primary' | 'secondary' | 'outline' | 'ghost';
export type Alignment = 'left' | 'center' | 'right';
export type TargetAudience = 'all' | 'guests' | 'customers' | 'sellers' | 'admins';
export type NotificationType =
  | 'order_placed' | 'order_confirmed' | 'order_processing' | 'order_shipped' | 'order_delivered' | 'order_cancelled'
  | 'payment_received' | 'payment_failed' | 'refund_initiated' | 'refund_completed'
  | 'review_received' | 'review_approved'
  | 'seller_application_submitted' | 'seller_approved' | 'seller_rejected' | 'seller_needs_more_info'
  | 'product_approved' | 'product_rejected' | 'product_under_review'
  | 'low_stock' | 'out_of_stock'
  | 'new_message' | 'promotion' | 'system' | 'welcome';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type RelatedEntityType = 'order' | 'product' | 'review' | 'seller' | 'story';
export type SortOrder = 'asc' | 'desc';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isEmailVerified: boolean;
  avatar?: string;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  label: AddressLabel;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface SellerProfile {
  _id: string;
  user: User | string;
  storeName: string;
  slug: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  region: Region | string;
  crafts: (Craft | string)[];
  payoutDetails: PayoutDetails;
  socialLinks: SocialLinks;
  verificationPath: VerificationPath;
  verificationDocuments?: VerificationDocuments;
  status: SellerStatus;
  adminNotes?: string;
  commissionRate: number;
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  rating: number;
  reviewCount: number;
  isStoreOpen: boolean;
  storeHours?: StoreHours;
  policies?: StorePolicies;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutDetails {
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  branch?: string;
  swiftCode?: string;
  panNumber?: string;
  vatNumber?: string;
  khaltiId?: string;
  esewaId?: string;
  imeiPayId?: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  website?: string;
}

export interface VerificationDocuments {
  workshopPhotos: string[];
  makingVideo?: string;
  craftStory?: string;
  district: string;
  yearsOfExperience: number;
  specialization: string[];
  idDocument?: string;
  panDocument?: string;
  vatDocument?: string;
}

export interface StoreHours {
  open: string;
  close: string;
  timezone: string;
}

export interface StorePolicies {
  returnPolicy?: string;
  shippingPolicy?: string;
  customOrderPolicy?: string;
}

export interface Product {
  _id: string;
  seller: SellerProfile | string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  story?: string;
  category: Category | string;
  craft: Craft | string;
  region: Region | string;
  collections: (Collection | string)[];
  variants: ProductVariant[];
  basePrice: number;
  compareAtPrice?: number;
  costPrice?: number;
  status: ProductStatus;
  rejectionReason?: string;
  seo?: ProductSeo;
  tags: string[];
  materials: string[];
  dimensions?: ProductDimensions;
  careInstructions?: string;
  isFeatured: boolean;
  isActive: boolean;
  isHandmade: boolean;
  isCustomizable: boolean;
  customOptions?: CustomOption[];
  shippingClass: string;
  processingTime: number;
  analytics: ProductAnalytics;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  isInStock?: boolean;
  lowestPrice?: number;
  highestPrice?: number;
}

export interface ProductVariant {
  name: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
  images: string[];
  attributes: Record<string, string>;
}

export interface ProductSeo {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  unit: DimensionUnit;
}

export interface CustomOption {
  name: string;
  type: CustomOptionType;
  options?: string[];
  required: boolean;
  priceAdjustment?: number;
}

export interface ProductAnalytics {
  views: number;
  purchases: number;
  addToCartCount: number;
  wishlistCount: number;
  averageRating: number;
  reviewCount: number;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parent?: Category | string;
  ancestors: (Category | string)[];
  level: number;
  isActive: boolean;
  sortOrder: number;
  seo?: {
    title?: string;
    description?: string;
  };
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Craft {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  image?: string;
  icon?: string;
  region?: string;
  techniques: string[];
  materials: string[];
  history?: string;
  culturalSignificance?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  seo?: {
    title?: string;
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Region {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  image?: string;
  mapImage?: string;
  crafts: (Craft | string)[];
  districts: string[];
  province?: string;
  isActive: boolean;
  sortOrder: number;
  seo?: {
    title?: string;
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  image?: string;
  banner?: string;
  products: (Product | string)[];
  artisans: (SellerProfile | string)[];
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  _id: string;
  customer: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product | string;
  quantity: number;
  selectedVariants?: Record<string, string>;
  price: number;
  addedAt: string;
}

export interface Wishlist {
  _id: string;
  customer: string;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  product: Product | string;
  addedAt: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: User | string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDetails?: PaymentDetails;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  notes?: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  trackingNumber?: string;
  refundAmount?: number;
  refundReason?: string;
  statusHistory: StatusHistory[];
  createdAt: string;
  updatedAt: string;
  isPaid?: boolean;
  canCancel?: boolean;
}

export interface OrderItem {
  product: Product | string;
  seller: SellerProfile | string;
  quantity: number;
  price: number;
  total: number;
  selectedVariants?: Record<string, string>;
  productSnapshot: {
    name: string;
    slug: string;
    images: string[];
    sku?: string;
  };
}

export interface ShippingAddress {
  label?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  recipientName: string;
}

export interface PaymentDetails {
  transactionId?: string;
  paidAt?: string;
  failureReason?: string;
}

export interface StatusHistory {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface Review {
  _id: string;
  product: Product | string;
  customer: User | string;
  order: Order | string;
  rating: number;
  title?: string;
  comment: string;
  pros?: string;
  cons?: string;
  images: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  helpfulBy: string[];
  reportedCount: number;
  sellerResponse?: {
    comment: string;
    respondedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Story {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  author: User | string;
  artisan?: SellerProfile | string;
  craft?: Craft | string;
  region?: Region | string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  readTime?: number;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  relatedEntity?: {
    type: RelatedEntityType;
    id: string;
  };
  isRead: boolean;
  readAt?: string;
  priority: NotificationPriority;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  mobileImage?: string;
  position: BannerPosition;
  linkType: LinkType;
  linkValue?: string;
  buttonText?: string;
  buttonStyle: ButtonStyle;
  alignment: Alignment;
  overlayOpacity: number;
  textColor: string;
  backgroundColor?: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  sortOrder: number;
  targetAudience: TargetAudience;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  role?: 'customer' | 'seller';
}

export interface ProductFormData {
  name: string;
  description: string;
  shortDescription?: string;
  story?: string;
  category: string;
  craft: string;
  region: string;
  collections?: string[];
  variants?: Omit<ProductVariant, '_id'>[];
  basePrice: number;
  compareAtPrice?: number;
  tags?: string[];
  materials?: string[];
  dimensions?: ProductDimensions;
  careInstructions?: string;
  isHandmade?: boolean;
  isCustomizable?: boolean;
  customOptions?: CustomOption[];
  shippingClass?: string;
  processingTime?: number;
}

export interface OrderFormData {
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  paymentMethod: PaymentMethod;
  notes?: string;
  couponCode?: string;
}

export interface AddressFormData {
  label: AddressLabel;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  isDefault?: boolean;
}

export interface SellerApplicationFormData {
  storeName: string;
  description?: string;
  region: string;
  crafts: string[];
  verificationPath: VerificationPath;
  verificationDocuments: {
    district: string;
    yearsOfExperience: number;
    specialization: string[];
    craftStory?: string;
    workshopPhotos?: File[];
    makingVideo?: string;
    idDocument?: File;
    panDocument?: File;
    vatDocument?: File;
  };
  payoutDetails: PayoutDetails;
  socialLinks?: SocialLinks;
}
