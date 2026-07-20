const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  commission: { type: Number, default: 10 },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'returned',
    ],
    default: 'pending',
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      district: { type: String, required: true },
      province: { type: String, required: true },
      zipCode: { type: String },
    },
    billingAddress: {
      fullName: { type: String },
      phone: { type: String },
      street: { type: String },
      city: { type: String },
      district: { type: String },
      province: { type: String },
      zipCode: { type: String },
    },
    paymentMethod: {
      type: String,
      enum: ['esewa', 'khalti', 'cod'],
      required: [true, 'Please select a payment method'],
    },
    paymentInfo: {
      id: { type: String },
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
      },
      paidAt: Date,
      transactionId: { type: String },
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    discountPrice: {
      type: Number,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    coupon: {
      code: { type: String },
      discount: { type: Number, default: 0 },
    },
    orderStatus: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'returned',
      ],
      default: 'pending',
    },
    deliveredAt: Date,
    cancelledAt: Date,
    cancellationReason: { type: String },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    invoiceNumber: { type: String, unique: true },
    notes: { type: String },
    refundRequest: {
      isRequested: { type: Boolean, default: false },
      reason: { type: String },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
      },
      requestedAt: Date,
      resolvedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Generate invoice number
orderSchema.pre('save', function (next) {
  if (!this.invoiceNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    this.invoiceNumber = `KB-${timestamp}${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);