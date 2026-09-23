import { Request, Response } from 'express';
import Order from '../models/Order';
import Notification from '../models/Notification';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';
import { PaymentMethod, PaymentStatus } from '../config/constants';
import { paymentConfig, isLivePayment } from '../config/payment';
import {
  initiateKhaltiPayment,
  lookupKhaltiPayment,
  isKhaltiCompleted,
} from '../services/khaltiService';
import {
  buildEsewaPaymentParams,
  getEsewaPaymentFormUrl,
  decodeEsewaCallback,
  getEsewaTransactionStatus,
  isEsewaComplete,
} from '../services/esewaService';

const orderNotFound = () => ApiError.notFound('Order not found');

export const initiatePayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderId, paymentMethod } = req.body;
  const userId = req.user._id;

  if (!orderId) {
    throw ApiError.badRequest('Order ID is required');
  }
  if (![PaymentMethod.KHALTI, PaymentMethod.ESEWA].includes(paymentMethod)) {
    throw ApiError.badRequest('Valid online payment method is required (khalti, esewa)');
  }

  const order = await Order.findById(orderId).populate('customer', 'firstName lastName email phone');
  if (!order) {
    throw orderNotFound();
  }
  if (order.customer._id.toString() !== userId.toString()) {
    throw ApiError.forbidden('You can only initiate payment for your own orders');
  }
  if (order.paymentMethod !== paymentMethod) {
    throw ApiError.badRequest(`This order is set for ${order.paymentMethod} payment`);
  }
  if (order.status === 'cancelled') {
    throw ApiError.badRequest('Cannot pay for a cancelled order');
  }
  if (order.paymentStatus === PaymentStatus.PAID || order.paymentDetails?.transactionId) {
    const redirectUrl = `${paymentConfig.clientUrl}/order-success/${order._id}`;
    return res.json(ApiResponse.success({ alreadyPaid: true, redirectUrl, orderId: order._id }, 'Order already paid'));
  }

  if (!isLivePayment()) {
    if (paymentConfig.mode === 'mock') {
      const redirectUrl = `${paymentConfig.clientUrl}/payment/mock/${paymentMethod}/${order._id}`;
      return res.json(ApiResponse.success({ gateway: 'mock', redirectUrl, orderId: order._id }, 'Payment initiated'));
    }
    return res.json(ApiResponse.success({ offline: true, orderId: order._id }, 'Payment not required (offline mode)'));
  }

  if (paymentMethod === PaymentMethod.KHALTI) {
    const returnUrl = `${paymentConfig.clientUrl}/payment/return?method=khalti&orderId=${order._id}`;
    const purchaseOrderId = order.orderNumber;
    const customer = order.customer as any;

    const initiated = await initiateKhaltiPayment({
      amount: Math.round(order.totalAmount * 100),
      returnUrl,
      websiteUrl: paymentConfig.clientUrl,
      purchaseOrderId,
      purchaseOrderName: `Order ${order.orderNumber}`,
      customerInfo: {
        name: [customer.firstName, customer.lastName].filter(Boolean).join(' '),
        email: customer.email,
        phone: customer.phone,
      },
    });

    order.paymentDetails = {
      ...(order.paymentDetails || {}),
      pidx: initiated.pidx,
      purchaseOrderId,
      initiatedAt: new Date(),
    };
    await order.save();

    return res.json(ApiResponse.success({ gateway: 'khalti', redirectUrl: initiated.paymentUrl, orderId: order._id }, 'Payment initiated'));
  }

  // eSewa — return the auto-submitting eSewa form page URL
  const transactionUuid = `${order.orderNumber.replace(/[^A-Z0-9-]/gi, '')}-${Date.now()}`;
  order.paymentDetails = {
    ...(order.paymentDetails || {}),
    transactionUuid,
    initiatedAt: new Date(),
  };
  await order.save();

  const redirectUrl = `${paymentConfig.backendUrl}/api/payment/esewa/pay-form?orderId=${order._id}`;
  return res.json(ApiResponse.success({ gateway: 'esewa', redirectUrl, orderId: order._id }, 'Payment initiated'));
});

export const verifyPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderId, paymentMethod, pidx, refId, result } = req.body;
  const userId = req.user._id;

  if (!orderId) {
    throw ApiError.badRequest('Order ID is required');
  }

  const order = await Order.findById(orderId).populate('customer', 'firstName lastName email');
  if (!order) {
    throw orderNotFound();
  }
  if (order.customer._id.toString() !== userId.toString()) {
    throw ApiError.forbidden('You can only verify payment for your own orders');
  }
  if (order.paymentStatus === PaymentStatus.PAID) {
    return res.json(ApiResponse.success({ paid: true, orderId: order._id }, 'Order already paid'));
  }

  if (order.paymentMethod !== paymentMethod) {
    throw ApiError.badRequest(`This order is set for ${order.paymentMethod} payment`);
  }
  if (order.status === 'cancelled' || order.paymentStatus !== PaymentStatus.PENDING) {
    throw ApiError.badRequest('This order is not payable');
  }

  let paid = false;
  let transactionId: string | undefined;

  if (!isLivePayment()) {
    paid = result === 'success' && paymentMethod === order.paymentMethod;
    transactionId = paid ? `MOCK-TXN-${Date.now()}` : undefined;
  } else if (paymentMethod === PaymentMethod.KHALTI && pidx) {
    if (order.paymentDetails?.pidx !== pidx) {
      throw ApiError.badRequest('Invalid Khalti payment reference');
    }
    const lookup = await lookupKhaltiPayment(pidx);
    const expectedAmount = Math.round(order.totalAmount * 100);
    paid = isKhaltiCompleted(lookup.status) && lookup.totalAmount === expectedAmount;
    transactionId = lookup.transactionId || undefined;
  } else if (paymentMethod === PaymentMethod.ESEWA && refId) {
    const uuid = order.paymentDetails?.transactionUuid;
    if (uuid) {
      const status = await getEsewaTransactionStatus(uuid, order.totalAmount);
      paid = isEsewaComplete(status.status)
        && status.transaction_uuid === uuid
        && status.total_amount === order.totalAmount;
      transactionId = status.ref_id || refId;
    }
  } else {
    paid = false;
  }

  if (paid) {
    await markOrderPaid(order, transactionId);
  } else if (order.paymentStatus === PaymentStatus.PENDING) {
    await markOrderFailed(order, req.body.failureReason || 'Payment was not completed');
  }

  return res.json(ApiResponse.success({ paid, orderId: order._id }, paid ? 'Payment successful' : 'Payment not completed'));
});

export const renderEsewaPayForm = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.query;
  if (!orderId) {
    return res.redirect(`${paymentConfig.clientUrl}/payment/return?method=esewa&status=failed`);
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return res.redirect(`${paymentConfig.clientUrl}/payment/return?method=esewa&status=failed`);
  }
  if (order.paymentMethod !== PaymentMethod.ESEWA) {
    return res.redirect(`${paymentConfig.clientUrl}/payment/return?method=esewa&status=failed`);
  }

  const transactionUuid = order.paymentDetails?.transactionUuid || `${order.orderNumber.replace(/[^A-Z0-9-]/gi, '')}-${Date.now()}`;
  const params = buildEsewaPaymentParams({
    amount: order.totalAmount,
    totalAmount: order.totalAmount,
    transactionUuid,
    successUrl: `${paymentConfig.backendUrl}/api/payment/esewa/callback?orderId=${order._id}`,
    failureUrl: `${paymentConfig.backendUrl}/api/payment/esewa/callback?orderId=${order._id}&failed=1`,
  });

  if (!order.paymentDetails?.transactionUuid) {
    order.paymentDetails = { ...(order.paymentDetails || {}), transactionUuid, initiatedAt: new Date() };
    await order.save();
  }

  const inputs = Object.entries(params)
    .map(([name, value]) => `<input type="hidden" name="${name}" value="${value}">`)
    .join('\n');

  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=${getEsewaPaymentFormUrl()}">
  <title>Redirecting to eSewa...</title>
</head>
<body>
  <form id="esewa-form" action="${getEsewaPaymentFormUrl()}" method="POST">
${inputs}
    <noscript>
      <button type="submit">Continue to eSewa</button>
    </noscript>
  </form>
  <script>document.getElementById('esewa-form').submit();</script>
</body>
</html>`);
});

export const esewaCallback = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, failed } = req.query as { orderId?: string; failed?: string };

  if (!orderId) {
    return res.redirect(`${paymentConfig.clientUrl}/payment/return?method=esewa&status=failed`);
  }

  const redirectFailed = (reason = 'Payment was cancelled or failed') =>
    res.redirect(`${paymentConfig.clientUrl}/payment/return?method=esewa&status=failed&orderId=${orderId}`);

  const order = await Order.findById(orderId);
  if (!order) {
    return redirectFailed('Order not found');
  }
  if (order.paymentStatus === PaymentStatus.PAID) {
    return res.redirect(`${paymentConfig.clientUrl}/order-success/${order._id}`);
  }

  try {
    if (failed) {
      throw ApiError.badRequest('Payment failed');
    }
    const payload = decodeEsewaCallback(String(req.query.data || ''));
    const expectedUuid = order.paymentDetails?.transactionUuid;
    const expectedMerchantCode = paymentConfig.esewa.merchantCode;
    if (!expectedUuid || payload.transaction_uuid !== expectedUuid) {
      throw ApiError.badRequest('eSewa transaction does not match this order');
    }
    if (expectedMerchantCode && payload.product_code !== expectedMerchantCode) {
      throw ApiError.badRequest('eSewa merchant code does not match');
    }
    if (payload.total_amount !== order.totalAmount) {
      throw ApiError.badRequest('eSewa payment amount does not match this order');
    }
    const confirmed = isEsewaComplete(payload.status);
    const statusCheck = await getEsewaTransactionStatus(expectedUuid, order.totalAmount);
    const verified = isEsewaComplete(statusCheck.status)
      && statusCheck.transaction_uuid === expectedUuid
      && statusCheck.product_code === expectedMerchantCode
      && statusCheck.total_amount === order.totalAmount;

    if (confirmed && verified) {
      await markOrderPaid(order, payload.transaction_code || statusCheck.ref_id || undefined);
      return res.redirect(`${paymentConfig.clientUrl}/order-success/${order._id}`);
    }
    return redirectFailed('Payment was not completed');
  } catch (err) {
    if (err instanceof ApiError && err.statusCode < 500) {
      return redirectFailed(err.message);
    }
    throw err;
  }
});

const markOrderPaid = async (order: any, transactionId?: string) => {
  order.paymentStatus = PaymentStatus.PAID;
  order.paymentDetails = {
    ...(order.paymentDetails || {}),
    transactionId,
    paidAt: new Date(),
  };
  order.statusHistory.push({
    status: order.status,
    timestamp: new Date(),
    note: transactionId ? `Payment received (${transactionId})` : 'Payment received',
  });
  await order.save();

  const customerId = order.customer._id || order.customer;
  await Notification.create({
    user: customerId,
    type: 'payment_received',
    title: 'Payment received',
    message: `Your payment for order ${order.orderNumber} was successful.`,
    relatedEntity: { type: 'order', id: order._id },
    priority: 'high',
  }).catch(() => {});
};

const markOrderFailed = async (order: any, reason: string) => {
  order.paymentStatus = PaymentStatus.FAILED;
  order.paymentDetails = {
    ...(order.paymentDetails || {}),
    failureReason: reason,
    failedAt: new Date(),
  };
  await order.save();

  const customerId = order.customer._id || order.customer;
  await Notification.create({
    user: customerId,
    type: 'payment_failed',
    title: 'Payment failed',
    message: `Your payment for order ${order.orderNumber} could not be completed. Please try again.`,
    relatedEntity: { type: 'order', id: order._id },
    priority: 'high',
  }).catch(() => {});
};