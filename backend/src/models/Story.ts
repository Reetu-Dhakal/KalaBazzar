import mongoose, { Document, Schema } from 'mongoose';

export interface IStory extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  author: mongoose.Types.ObjectId;
  artisan?: mongoose.Types.ObjectId;
  craft?: mongoose.Types.ObjectId;
  region?: mongoose.Types.ObjectId;
  tags: string[];
  isPublished: boolean;
  publishedAt?: Date;
  readTime?: number;
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const storySchema = new Schema<IStory>({
  title: {
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
  excerpt: { type: String, maxlength: 300 },
  content: { type: String, required: true },
  featuredImage: String,
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  artisan: { type: Schema.Types.ObjectId, ref: 'SellerProfile' },
  craft: { type: Schema.Types.ObjectId, ref: 'Craft' },
  region: { type: Schema.Types.ObjectId, ref: 'Region' },
  tags: [{ type: String, trim: true, lowercase: true }],
  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
  readTime: { type: Number, default: 1, min: 1 },
  seo: {
    title: { type: String, maxlength: 60 },
    description: { type: String, maxlength: 160 },
    keywords: [String],
  },
}, {
  timestamps: true,
});

storySchema.index({ isPublished: 1, publishedAt: -1 });
storySchema.index({ artisan: 1 });
storySchema.index({ tags: 1 });

storySchema.pre('save', function(next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export default mongoose.model<IStory>('Story', storySchema);