import mongoose, { Document, Schema } from 'mongoose';
import { SellerApplicationStatus, type SellerApplicationStatus as SellerApplicationStatusType } from '../config/constants';

export interface ISellerApplication extends Document {
  user: mongoose.Types.ObjectId;
  shopName: string;
  craftCategory: string;
  workshopLocation: string;
  bio?: string;
  portfolioLink: string;
  panNumber?: string;
  samplePhotos: string[];
  status: SellerApplicationStatusType;
  adminNote?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  appliedAt: Date;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sellerApplicationSchema = new Schema<ISellerApplication>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  shopName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150,
  },
  craftCategory: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  workshopLocation: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 2000,
  },
  portfolioLink: {
    type: String,
    required: true,
    trim: true,
  },
  panNumber: {
    type: String,
    trim: true,
    uppercase: true,
  },
  samplePhotos: [{ type: String, trim: true }],
  status: {
    type: String,
    enum: Object.values(SellerApplicationStatus),
    default: SellerApplicationStatus.PENDING,
  },
  adminNote: { type: String, maxlength: 1000 },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  appliedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

sellerApplicationSchema.index({ status: 1 });
sellerApplicationSchema.index({ user: 1, status: 1 });
sellerApplicationSchema.index({ shopName: 1 });

export default mongoose.model<ISellerApplication>('SellerApplication', sellerApplicationSchema);