import mongoose, { Document, Schema } from 'mongoose';

export interface INewsletter extends Document {
  email: string;
  status: 'subscribed' | 'unsubscribed';
  createdAt: Date;
  updatedAt: Date;
}

const newsletterSchema = new Schema<INewsletter>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  status: { type: String, enum: ['subscribed', 'unsubscribed'], default: 'subscribed' },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

newsletterSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<INewsletter>('Newsletter', newsletterSchema);