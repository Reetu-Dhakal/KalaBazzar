import mongoose, { Document, Schema } from 'mongoose';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../config/constants';

export interface IOrderItem extends Document {
  product: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  total: number;
  selectedVariants?: Record<string, string>;
  productSnapshot: {
    name: string;
    slug: string;
    images: string[];
    sku?: string;
  };
}

export interface IShippingAddress {
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  recipientName: string;
}

export interface IOrderMethods {
  addStatusHistory(status: OrderStatus, note?: string, updatedBy?: mongoose.Types.ObjectId): Promise<IOrder>;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDetails?: {
    transactionId?: string;
    paidAt?: Date;
    failureReason?: string;
  };
  shippingAddress: IShippingAddress;
  billingAddress?: IShippingAddress;
  notes?: string;
  estimatedDelivery?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  refundAmount?: number;
  refundReason?: string;
  statusHistory: {
    status: OrderStatus;
    timestamp: Date;
    note?: string;
    updatedBy?: mongoose.Types.ObjectId;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

type OrderModel = mongoose.Model<IOrder, {}, IOrderMethods>;

const orderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  selectedVariants: { type: Schema.Types.Mixed, default: {} },
  productSnapshot: {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    images: [{ type: String }],
    sku: String,
  },
}, { _id: false });

const addressSchema = new Schema<IShippingAddress>({
  label: String,
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, default: 'Nepal' },
  phone: { type: String, required: true },
  recipientName: { type: String, required: true },
}, { _id: false });

const statusHistorySchema = new Schema({
  status: { type: String, enum: Object.values(OrderStatus), required: true },
  timestamp: { type: Date, default: Date.now },
  note: String,
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { _id: false });

const orderSchema = new Schema<IOrder>({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: (items: IOrderItem[]) => items.length > 0,
      message: 'Order must have at least one item',
    },
  },
  subtotal: { type: Number, required: true, min: 0 },
  shippingCost: { type: Number, default: 0, min: 0 },
  taxAmount: { type: Number, default: 0, min: 0 },
  discountAmount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING,
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
  },
  paymentDetails: {
    transactionId: String,
    paidAt: Date,
    failureReason: String,
  },
  shippingAddress: { type: addressSchema, required: true },
  billingAddress: addressSchema,
  notes: { type: String, maxlength: 1000 },
  estimatedDelivery: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  refundAmount: { type: Number, min: 0 },
  refundReason: String,
  statusHistory: {
    type: [statusHistorySchema],
    default: [],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ 'items.seller': 1, status: 1 });

orderSchema.virtual('isPaid').get(function(this: IOrder) {
  return this.paymentStatus === PaymentStatus.PAID;
});

orderSchema.virtual('canCancel').get(function(this: IOrder) {
  return [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(this.status as typeof OrderStatus.PENDING | typeof OrderStatus.CONFIRMED);
});

orderSchema.methods.addStatusHistory = function(status: OrderStatus, note?: string, updatedBy?: mongoose.Types.ObjectId) {
  this.statusHistory.push({ status, timestamp: new Date(), note, updatedBy });
  this.status = status;

  if (status === OrderStatus.SHIPPED) this.shippedAt = new Date();
  if (status === OrderStatus.DELIVERED) this.deliveredAt = new Date();
  if (status === OrderStatus.CANCELLED) this.cancelledAt = new Date();

  return this.save();
};

export default mongoose.model<IOrder, OrderModel>('Order', orderSchema);