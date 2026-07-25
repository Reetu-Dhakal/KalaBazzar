import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlistItem {
  product: mongoose.Types.ObjectId;
  addedAt: Date;
}

export interface IWishlist extends Document {
  customer: mongoose.Types.ObjectId;
  items: IWishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const wishlistItemSchema = new Schema<IWishlistItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  addedAt: { type: Date, default: Date.now },
}, { _id: false });

const wishlistSchema = new Schema<IWishlist>({
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: {
    type: [wishlistItemSchema],
    default: [],
  },
}, {
  timestamps: true,
});

wishlistSchema.index({ 'items.product': 1 });

export default mongoose.model<IWishlist>('Wishlist', wishlistSchema);