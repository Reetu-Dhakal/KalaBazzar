import * as paymentService from '../services/payment.js';
import Order from '../models/Order.js';
import Transaction from '../models/Transaction.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { PAYMENT_STATUS } from '../config/constants.js';

export const initiateKhaltiPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');
  if (order.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized');
  }

  const result = await paymentService.initiateKhalti(order.total, orderId, req.user);

  await Transaction.create({
    user: req.user._id,
    order: orderId,
    paymentMethod: 'khalti',
    amount: order.total,
    status: PAYMENT_STATUS.PENDING,
    pidx: result.pidx,
  });

  res.json(ApiResponse.success(result));
});

export const verifyKhaltiPayment = asyncHandler(async (req, res) => {
  const { pidx } = req.body;
  const result = await paymentService.verifyKhalti(pidx);

  if (result.verified) {
    const transaction = await Transaction.findOne({ pidx });
    if (transaction) {
      transaction.status = PAYMENT_STATUS.COMPLETED;
      transaction.transactionId = result.transactionId;
      transaction.verifiedAt = new Date();
      await transaction.save();

      await Order.findByIdAndUpdate(transaction.order, {
        paymentStatus: PAYMENT_STATUS.COMPLETED,
        paymentInfo: {
          transactionId: result.transactionId,
          pidx,
          paidAt: new Date(),
        },
        status: 'confirmed',
      });
    }
  }

  res.json(ApiResponse.success(result));
});

export const initiateESewaPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');

  const result = await paymentService.initiateESewa(order.total, orderId);
  res.json(ApiResponse.success(result));
});

export const verifyESewaPayment = asyncHandler(async (req, res) => {
  const { refId, oid, amt } = req.body;
  const result = await paymentService.verifyESewa(refId, oid, amt);

  if (result.verified) {
    await Transaction.findOneAndUpdate(
      { order: oid, paymentMethod: 'esewa' },
      {
        status: PAYMENT_STATUS.COMPLETED,
        transactionId: result.transactionId,
        verifiedAt: new Date(),
      }
    );

    await Order.findByIdAndUpdate(oid, {
      paymentStatus: PAYMENT_STATUS.COMPLETED,
      status: 'confirmed',
    });
  }

  res.json(ApiResponse.success(result));
});
