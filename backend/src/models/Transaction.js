import mongoose from 'mongoose';
import { PAYMENT_STATUS, PAYMENT_METHODS } from '../config/constants.js';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PAYMENT_METHODS),
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.PENDING,
  },
  gatewayResponse: mongoose.Schema.Types.Mixed,
  pidx: String,
  transactionId: String,
  refId: String,
  verifiedAt: Date,
}, {
  timestamps: true,
});

transactionSchema.index({ order: 1 });
transactionSchema.index({ pidx: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
