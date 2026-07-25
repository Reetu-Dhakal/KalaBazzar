import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parent?: mongoose.Types.ObjectId;
  ancestors: mongoose.Types.ObjectId[];
  level: number;
  isActive: boolean;
  sortOrder: number;
  seo: {
    title?: string;
    description?: string;
  };
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const seoSchema = new Schema({
  title: { type: String, maxlength: 60 },
  description: { type: String, maxlength: 160 },
}, { _id: false });

const categorySchema = new Schema<ICategory>({
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
  image: String,
  icon: String,
  parent: { type: Schema.Types.ObjectId, ref: 'Category' },
  ancestors: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  level: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  seo: { type: seoSchema, default: () => ({}) },
  productCount: { type: Number, default: 0 },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1, sortOrder: 1 });

categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
});

categorySchema.pre('save', async function(next) {
  if (this.isModified('parent')) {
    if (this.parent) {
      const parentCategory = await mongoose.model('Category').findById(this.parent);
      if (parentCategory) {
        this.ancestors = [...parentCategory.ancestors, parentCategory._id];
        this.level = parentCategory.level + 1;
      }
    } else {
      this.ancestors = [];
      this.level = 0;
    }
  }
  next();
});

export default mongoose.model<ICategory>('Category', categorySchema);