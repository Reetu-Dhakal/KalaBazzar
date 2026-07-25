import mongoose, { Document, Schema } from 'mongoose';
import { SellerStatus, type SellerStatus as SellerStatusType } from '../config/constants';

export interface IPayoutDetails {
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

export interface ISocialLinks {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  website?: string;
}

export interface IVerificationDocuments {
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

export interface ISellerProfile extends Document {
  user: mongoose.Types.ObjectId;
  storeName: string;
  slug: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  region: mongoose.Types.ObjectId;
  crafts: mongoose.Types.ObjectId[];
  payoutDetails: IPayoutDetails;
  socialLinks: ISocialLinks;
  verificationPath: 'social' | 'marketplace' | 'offline';
  verificationDocuments?: IVerificationDocuments;
  status: SellerStatusType;
  adminNotes?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  commissionRate: number;
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  rating: number;
  reviewCount: number;
  isStoreOpen: boolean;
  storeHours?: {
    open: string;
    close: string;
    timezone: string;
  };
  policies?: {
    returnPolicy?: string;
    shippingPolicy?: string;
    customOrderPolicy?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const payoutDetailsSchema = new Schema<IPayoutDetails>({
  bankName: { type: String, trim: true },
  accountNumber: { type: String, trim: true },
  accountHolderName: { type: String, trim: true },
  branch: { type: String, trim: true },
  swiftCode: { type: String, trim: true },
  panNumber: { type: String, trim: true, uppercase: true },
  vatNumber: { type: String, trim: true, uppercase: true },
  khaltiId: { type: String, trim: true },
  esewaId: { type: String, trim: true },
  imeiPayId: { type: String, trim: true },
}, { _id: false });

const socialLinksSchema = new Schema<ISocialLinks>({
  facebook: { type: String, trim: true },
  instagram: { type: String, trim: true },
  tiktok: { type: String, trim: true },
  youtube: { type: String, trim: true },
  website: { type: String, trim: true },
}, { _id: false });

const verificationDocsSchema = new Schema<IVerificationDocuments>({
  workshopPhotos: [{ type: String }],
  makingVideo: String,
  craftStory: { type: String, maxlength: 5000 },
  district: { type: String, trim: true, maxlength: 100 },
  yearsOfExperience: { type: Number, min: 0, max: 100 },
  specialization: [{ type: String, trim: true }],
  idDocument: String,
  panDocument: String,
  vatDocument: String,
}, { _id: false });

const sellerProfileSchema = new Schema<ISellerProfile>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  storeName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
  },
  description: { type: String, maxlength: 2000 },
  logo: String,
  coverImage: String,
  region: {
    type: Schema.Types.ObjectId,
    ref: 'Region',
    required: true,
  },
  crafts: [{
    type: Schema.Types.ObjectId,
    ref: 'Craft',
  }],
  payoutDetails: { type: payoutDetailsSchema, default: () => ({}) },
  socialLinks: { type: socialLinksSchema, default: () => ({}) },
  verificationPath: {
    type: String,
    enum: ['social', 'marketplace', 'offline'],
    required: true,
  },
  verificationDocuments: verificationDocsSchema,
  status: {
    type: String,
    enum: Object.values(SellerStatus),
    default: SellerStatus.PENDING,
  },
  adminNotes: { type: String, maxlength: 1000 },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  commissionRate: { type: Number, default: 10, min: 0, max: 50 },
  totalSales: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalProducts: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  isStoreOpen: { type: Boolean, default: true },
  storeHours: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '18:00' },
    timezone: { type: String, default: 'Asia/Kathmandu' },
  },
  policies: {
    returnPolicy: { type: String, maxlength: 3000 },
    shippingPolicy: { type: String, maxlength: 3000 },
    customOrderPolicy: { type: String, maxlength: 3000 },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

sellerProfileSchema.index({ user: 1 });
sellerProfileSchema.index({ slug: 1 });
sellerProfileSchema.index({ status: 1 });
sellerProfileSchema.index({ region: 1, status: 1 });
sellerProfileSchema.index({ crafts: 1 });
sellerProfileSchema.index({ storeName: 'text', description: 'text' });

sellerProfileSchema.virtual('userDetails', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
});

sellerProfileSchema.virtual('products', {
  ref: 'Product',
  localField: 'user',
  foreignField: 'seller',
});

sellerProfileSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === SellerStatus.APPROVED && !this.reviewedAt) {
    this.reviewedAt = new Date();
  }
  next();
});

export default mongoose.model<ISellerProfile>('SellerProfile', sellerProfileSchema);