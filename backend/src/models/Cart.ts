import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  selectedVariants?: Record<string, string>;
  price: number;
  addedAt: Date;
}

export interface ICart extends Document {
  customer: mongoose.Types.ObjectId;
  items: ICartItem[];
  subtotal: number;
  itemCount: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  selectedVariants: { type: Schema.Types.Mixed, default: {} },
  price: { type: Number, required: true, min: 0 },
  addedAt: { type: Date, default: Date.now },
}, { _id: false });

const cartSchema = new Schema<ICart>({
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: {
    type: [cartItemSchema],
    default: [],
  },
  subtotal: { type: Number, default: 0, min: 0 },
  itemCount: { type: Number, default: 0, min: 0 },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
}, {
  timestamps: true,
});

cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

cartSchema.pre('save', function(next) {
  this.itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  next();
});

export default mongoose.model<ICart>('Cart', cartSchema);