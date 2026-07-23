import mongoose from 'mongoose';
import { SELLER_STATUS, VERIFICATION_PATH } from '../config/constants.js';

const sellerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  bio: {
    type: String,
    maxlength: 2000,
  },
  craftStory: {
    type: String,
    maxlength: 5000,
  },
  district: {
    type: String,
    required: true,
  },
  yearsOfExperience: {
    type: Number,
    min: 0,
  },
  specialization: [{
    type: String,
  }],
  familyTradition: {
    type: String,
    maxlength: 2000,
  },
  trainingInfo: {
    type: String,
    maxlength: 2000,
  },
  verificationStatus: {
    type: String,
    enum: Object.values(SELLER_STATUS),
    default: SELLER_STATUS.PENDING,
  },
  verificationPath: {
    type: String,
    enum: Object.values(VERIFICATION_PATH),
  },
  verificationDocuments: {
    socialUrl: String,
    marketplaceUrl: String,
    workPhotos: [{ url: String, publicId: String }],
    workVideo: { url: String, publicId: String },
    craftStatement: String,
  },
  verificationNotes: {
    type: String,
  },
  verifiedAt: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isVerifiedArtisan: {
    type: Boolean,
    default: false,
  },
  verificationSourceUrl: {
    type: String,
  },
  isStoreOpen: {
    type: Boolean,
    default: false,
  },
  slug: {
    type: String,
    lowercase: true,
    unique: true,
    sparse: true,
  },
  storeName: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  storeBanner: {
    url: String,
    publicId: String,
  },
  payoutInfo: {
    bankName: String,
    bankAccount: String,
    bankHolderName: String,
    esewaId: String,
    khaltiId: String,
    bankQr: { url: String, publicId: String },
    esewaQr: { url: String, publicId: String },
    khaltiQr: { url: String, publicId: String },
  },
  commissionRate: {
    type: Number,
    default: 10,
    min: 0,
    max: 100,
  },
  totalProducts: {
    type: Number,
    default: 0,
  },
  totalSales: {
    type: Number,
    default: 0,
  },
  totalRevenue: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

sellerProfileSchema.pre('save', function (next) {
  if (this.isModified('storeName') && this.storeName && !this.slug) {
    this.slug = this.storeName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

sellerProfileSchema.index({ verificationStatus: 1 });
sellerProfileSchema.index({ district: 1 });
sellerProfileSchema.index({ isVerifiedArtisan: 1 });

const SellerProfile = mongoose.model('SellerProfile', sellerProfileSchema);
export default SellerProfile;
