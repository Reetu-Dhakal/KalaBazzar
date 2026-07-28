import mongoose, { Document, Schema } from 'mongoose';
import { ProductStatus, type ProductStatus as ProductStatusType } from '../config/constants';

export interface IProductVariant {
  name: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
  images: string[];
  attributes: Record<string, string>;
}

export interface IProduct extends Document {
  seller: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  story?: string;
  category: mongoose.Types.ObjectId;
  craft: mongoose.Types.ObjectId;
  region: mongoose.Types.ObjectId;
  collections: mongoose.Types.ObjectId[];
  variants: IProductVariant[];
  basePrice: number;
  compareAtPrice?: number;
  costPrice?: number;
  status: ProductStatusType;
  rejectionReason?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  tags: string[];
  materials: string[];
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
    unit: string;
  };
  careInstructions?: string;
  isFeatured: boolean;
  isActive: boolean;
  isHandmade: boolean;
  isCustomizable: boolean;
  customOptions?: {
    name: string;
    type: 'text' | 'select' | 'checkbox';
    options?: string[];
    required: boolean;
    priceAdjustment?: number;
  }[];
  shippingClass: string;
  processingTime: number;
  analytics: {
    views: number;
    purchases: number;
    addToCartCount: number;
    wishlistCount: number;
    averageRating: number;
    reviewCount: number;
  };
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const productVariantSchema = new Schema<IProductVariant>({
  name: { type: String, required: true, trim: true },
  sku: { type: String, trim: true, uppercase: true },
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, min: 0 },
  inventory: { type: Number, required: true, min: 0, default: 0 },
  images: [{ type: String }],
  attributes: { type: Schema.Types.Mixed, default: {} },
}, { _id: false });

const seoSchema = new Schema({
  title: { type: String, maxlength: 60 },
  description: { type: String, maxlength: 160 },
  keywords: [{ type: String, trim: true }],
}, { _id: false });

const dimensionsSchema = new Schema({
  length: Number,
  width: Number,
  height: Number,
  weight: Number,
  unit: { type: String, default: 'cm', enum: ['cm', 'mm', 'in', 'ft'] },
}, { _id: false });

const customOptionSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['text', 'select', 'checkbox'], required: true },
  options: [{ type: String }],
  required: { type: Boolean, default: false },
  priceAdjustment: { type: Number, default: 0 },
}, { _id: false });

const analyticsSchema = new Schema({
  views: { type: Number, default: 0 },
  purchases: { type: Number, default: 0 },
  addToCartCount: { type: Number, default: 0 },
  wishlistCount: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
}, { _id: false });

const productSchema = new Schema<IProduct>({
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  shortDescription: {
    type: String,
    maxlength: 300,
  },
  story: {
    type: String,
    maxlength: 3000,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  craft: {
    type: Schema.Types.ObjectId,
    ref: 'Craft',
    required: true,
  },
  region: {
    type: Schema.Types.ObjectId,
    ref: 'Region',
    required: true,
  },
  collections: [{
    type: Schema.Types.ObjectId,
    ref: 'Collection',
  }],
  variants: {
    type: [productVariantSchema],
    default: [],
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  compareAtPrice: { type: Number, min: 0 },
  costPrice: { type: Number, min: 0 },
  status: {
    type: String,
    enum: Object.values(ProductStatus),
    default: ProductStatus.DRAFT,
  },
  rejectionReason: String,
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  seo: { type: seoSchema, default: () => ({}) },
  tags: [{ type: String, trim: true, lowercase: true }],
  materials: [{ type: String, trim: true }],
  dimensions: dimensionsSchema,
  careInstructions: { type: String, maxlength: 1000 },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isHandmade: { type: Boolean, default: true },
  isCustomizable: { type: Boolean, default: false },
  customOptions: { type: [customOptionSchema], default: [] },
  shippingClass: { type: String, default: 'standard' },
  processingTime: { type: Number, default: 1, min: 0 },
  analytics: { type: analyticsSchema, default: () => ({}) },
  publishedAt: Date,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

productSchema.index({ seller: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ isFeatured: 1, status: 1 });
productSchema.index({ 'analytics.averageRating': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

productSchema.virtual('isInStock').get(function(this: IProduct) {
  const v = this.variants;
  if (!v || v.length === 0) return true;
  return v.some(variant => variant.inventory > 0);
});

productSchema.virtual('lowestPrice').get(function(this: IProduct) {
  const v = this.variants;
  if (!v || v.length === 0) return this.basePrice;
  return Math.min(...v.map(variant => variant.price));
});

productSchema.virtual('highestPrice').get(function(this: IProduct) {
  const v = this.variants;
  if (!v || v.length === 0) return this.basePrice;
  return Math.max(...v.map(variant => variant.price));
});

productSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === ProductStatus.APPROVED && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  if (this.variants.length > 0) {
    const mainVariant = this.variants[0];
    this.basePrice = mainVariant.price;
    this.compareAtPrice = mainVariant.compareAtPrice;
  }
  next();
});

export default mongoose.model<IProduct>('Product', productSchema);