import mongoose, { Document, Schema } from 'mongoose';

export interface ICraft extends Document {
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
  seo: {
    title?: string;
    description?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const craftSchema = new Schema<ICraft>({
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
  description: { type: String, maxlength: 2000 },
  shortDescription: { type: String, maxlength: 300 },
  image: String,
  icon: String,
  region: { type: String, trim: true },
  techniques: [{ type: String, trim: true }],
  materials: [{ type: String, trim: true }],
  history: { type: String, maxlength: 3000 },
  culturalSignificance: { type: String, maxlength: 3000 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  seo: {
    title: { type: String, maxlength: 60 },
    description: { type: String, maxlength: 160 },
  },
}, {
  timestamps: true,
});

craftSchema.index({ isActive: 1, isFeatured: 1 });
craftSchema.index({ region: 1 });
craftSchema.index({ sortOrder: 1 });

export default mongoose.model<ICraft>('Craft', craftSchema);