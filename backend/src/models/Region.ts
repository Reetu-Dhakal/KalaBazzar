import mongoose, { Document, Schema } from 'mongoose';

export interface IRegion extends Document {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  image?: string;
  mapImage?: string;
  crafts: mongoose.Types.ObjectId[];
  districts: string[];
  province?: string;
  isActive: boolean;
  sortOrder: number;
  seo: {
    title?: string;
    description?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const regionSchema = new Schema<IRegion>({
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
  mapImage: String,
  crafts: [{ type: Schema.Types.ObjectId, ref: 'Craft' }],
  districts: [{ type: String, trim: true }],
  province: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  seo: {
    title: { type: String, maxlength: 60 },
    description: { type: String, maxlength: 160 },
  },
}, {
  timestamps: true,
});

regionSchema.index({ isActive: 1 });
regionSchema.index({ province: 1 });
regionSchema.index({ sortOrder: 1 });

export default mongoose.model<IRegion>('Region', regionSchema);