import mongoose, { Document, Schema } from 'mongoose';

export type BannerPosition = 'hero' | 'hero_secondary' | 'category_banner' | 'collection_banner' | 'artisan_spotlight' | 'footer' | 'sidebar';

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  mobileImage?: string;
  position: BannerPosition;
  linkType: 'none' | 'url' | 'product' | 'collection' | 'artisan' | 'category' | 'region' | 'craft';
  linkValue?: string;
  buttonText?: string;
  buttonStyle: 'primary' | 'secondary' | 'outline' | 'ghost';
  alignment: 'left' | 'center' | 'right';
  overlayOpacity: number;
  textColor: string;
  backgroundColor?: string;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  sortOrder: number;
  targetAudience: 'all' | 'guests' | 'customers' | 'sellers' | 'admins';
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  subtitle: { type: String, trim: true, maxlength: 300 },
  description: { type: String, trim: true, maxlength: 1000 },
  image: { type: String, required: true },
  mobileImage: String,
  position: {
    type: String,
    required: true,
    enum: ['hero', 'hero_secondary', 'category_banner', 'collection_banner', 'artisan_spotlight', 'footer', 'sidebar'],
  },
  linkType: {
    type: String,
    default: 'none',
    enum: ['none', 'url', 'product', 'collection', 'artisan', 'category', 'region', 'craft'],
  },
  linkValue: String,
  buttonText: { type: String, maxlength: 50 },
  buttonStyle: { type: String, enum: ['primary', 'secondary', 'outline', 'ghost'], default: 'primary' },
  alignment: { type: String, enum: ['left', 'center', 'right'], default: 'center' },
  overlayOpacity: { type: Number, default: 0.4, min: 0, max: 1 },
  textColor: { type: String, default: '#FFFFFF' },
  backgroundColor: String,
  isActive: { type: Boolean, default: true },
  startDate: Date,
  endDate: Date,
  sortOrder: { type: Number, default: 0 },
  targetAudience: {
    type: String,
    enum: ['all', 'guests', 'customers', 'sellers', 'admins'],
    default: 'all',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

bannerSchema.index({ position: 1, isActive: 1, sortOrder: 1 });
bannerSchema.index({ startDate: 1, endDate: 1 });
bannerSchema.index({ targetAudience: 1 });

bannerSchema.virtual('isCurrent').get(function(this: IBanner) {
  const now = new Date();
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  return true;
});

export default mongoose.model<IBanner>('Banner', bannerSchema);