import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType = 
  | 'order_placed' | 'order_confirmed' | 'order_processing' | 'order_shipped' | 'order_delivered' | 'order_cancelled'
  | 'payment_received' | 'payment_failed' | 'refund_initiated' | 'refund_completed'
  | 'review_received' | 'review_approved'
  | 'seller_application_submitted' | 'seller_approved' | 'seller_rejected' | 'seller_needs_more_info'
  | 'product_approved' | 'product_rejected' | 'product_under_review'
  | 'low_stock' | 'out_of_stock'
  | 'new_message' | 'promotion' | 'system' | 'welcome';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  relatedEntity?: {
    type: 'order' | 'product' | 'review' | 'seller' | 'story';
    id: mongoose.Types.ObjectId;
  };
  isRead: boolean;
  readAt?: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true, enum: [
    'order_placed', 'order_confirmed', 'order_processing', 'order_shipped', 'order_delivered', 'order_cancelled',
    'payment_received', 'payment_failed', 'refund_initiated', 'refund_completed',
    'review_received', 'review_approved',
    'seller_application_submitted', 'seller_approved', 'seller_rejected', 'seller_needs_more_info',
    'product_approved', 'product_rejected', 'product_under_review',
    'low_stock', 'out_of_stock',
    'new_message', 'promotion', 'system', 'welcome'
  ]},
  title: { type: String, required: true, maxlength: 200 },
  message: { type: String, required: true, maxlength: 1000 },
  data: { type: Schema.Types.Mixed, default: {} },
  relatedEntity: {
    type: { type: String, enum: ['order', 'product', 'review', 'seller', 'story'] },
    id: { type: Schema.Types.ObjectId },
  },
  isRead: { type: Boolean, default: false },
  readAt: Date,
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  expiresAt: Date,
}, {
  timestamps: true,
});

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<INotification>('Notification', notificationSchema);