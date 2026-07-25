import mongoose, { Document, Schema } from 'mongoose';

export interface ICollection extends Document {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  image?: string;
  banner?: string;
  products: mongoose.Types.ObjectId[];
  artisans: mongoose.Types.ObjectId[];
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const collectionSchema = new Schema<ICollection>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
  },
  description: { type: String, maxlength: 1000 },
  shortDescription: { type: String, maxlength: 300 },
  image: String,
  banner: String,
  products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  artisans: [{ type: Schema.Types.ObjectId, ref: 'SellerProfile' }],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  seo: {
    title: { type: String, maxlength: 60 },
    description: { type: String, maxlength: 160 },
    keywords: [String],
  },
}, {
  timestamps: true,
});

collectionSchema.index({ isActive: 1, isFeatured: 1 });
collectionSchema.index({ sortOrder: 1 });

export default mongoose.model<ICollection>('Collection', collectionSchema);