import { Request, Response, NextFunction } from 'express';
import Order, { IOrder } from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import User from '../models/User';
import SellerProfile from '../models/SellerProfile';
import Coupon from '../models/Coupon';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/ApiError';
import { generateOrderNumber } from '../utils/helpers';
import { getPaginationParams } from '../utils/pagination';
import { OrderStatus, PaymentMethod, PaymentStatus, UserRole } from '../config/constants';
import { emailService } from '../services/emailService';
import { notify, notifyAll } from '../services/notificationService';
import { createNotification } from './notificationController';
import { startTransaction } from '../utils/transaction';
import { AuthRequest } from '../middleware/auth';

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
};

const ORDER_STATUS_NOTIFICATIONS: Record<string, { type: any; title: string; message: string }> = {
  [OrderStatus.CONFIRMED]: {
    type: 'order_confirmed',
    title: 'Order confirmed',
    message: 'Your order has been confirmed and is being prepared.',
  },
  [OrderStatus.PROCESSING]: {
    type: 'order_processing',
    title: 'Order is being processed',
    message: 'Your order is now being processed by the artisan.',
  },
  [OrderStatus.SHIPPED]: {
    type: 'order_shipped',
    title: 'Your order has shipped',
    message: 'Your order is on its way. Track it from your order details.',
  },
  [OrderStatus.DELIVERED]: {
    type: 'order_delivered',
    title: 'Order delivered',
    message: 'Your order has been delivered. We hope you love it!',
  },
  [OrderStatus.CANCELLED]: {
    type: 'order_cancelled',
    title: 'Order cancelled',
    message: 'Your order has been cancelled.',
  },
  [OrderStatus.REFUNDED]: {
    type: 'refund_completed',
    title: 'Order refunded',
    message: 'Your order has been refunded.',
  },
};

const VALLEY_DESTINATIONS = ['kathmandu', 'lalitpur', 'bhaktapur', 'kirtipur', 'madhyapur thimi'];
const NEARBY_DESTINATIONS = ['kavrepalanchok', 'kavre', 'dhading', 'nuwakot', 'makwanpur'];

function getShippingCost(city: string, state: string): number {
  const destination = `${city} ${state}`.toLowerCase().trim();
  if (VALLEY_DESTINATIONS.some((place) => destination.includes(place))) return 100;
  if (NEARBY_DESTINATIONS.some((place) => destination.includes(place))) return 200;
  return 300;
}

export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { shippingAddress, paymentMethod, notes, couponCode, selectedProductIds } = req.body;
  const userId = req.user._id;

  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.phone || !shippingAddress.recipientName) {
    throw ApiError.badRequest('Valid shipping address is required');
  }

  if (!paymentMethod || !Object.values(PaymentMethod).includes(paymentMethod)) {
    throw ApiError.badRequest('Valid payment method is required (cod, khalti, esewa)');
  }

  const cart = await Cart.findOne({ customer: userId });
  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest('Cart is empty');
  }

  const selectedIds = Array.isArray(selectedProductIds) && selectedProductIds.length > 0
    ? new Set(selectedProductIds.map((id: string) => id.toString()))
    : null;
  const orderCartItems = selectedIds
    ? cart.items.filter(item => selectedIds.has(item.product.toString()))
    : cart.items;

  if (orderCartItems.length === 0) {
    throw ApiError.badRequest('Select at least one cart item');
  }

  const productIds = orderCartItems.map(item => item.product);
  const products = await Product.find({ _id: { $in: productIds } });

  const productMap = new Map(products.map(p => [p._id.toString(), p]));

  const orderItems = [];
  let subtotal = 0;

  for (const cartItem of orderCartItems) {
    const product = productMap.get(cartItem.product.toString());
    if (!product) {
      throw ApiError.badRequest(`Product not found: ${cartItem.product}`);
    }

    if (product.status !== 'approved') {
      throw ApiError.badRequest(`Product "${product.name}" is not available`);
    }

    if (product.variants.length > 0) {
      const totalInventory = product.variants.reduce((sum, v) => sum + v.inventory, 0);
      if (totalInventory < cartItem.quantity) {
        throw ApiError.badRequest(`Insufficient stock for "${product.name}"`);
      }
    }

    const itemTotal = cartItem.price * cartItem.quantity;
    subtotal += itemTotal;

    const mainVariant = product.variants.length > 0 ? product.variants[0] : null;

    orderItems.push({
      product: product._id,
      seller: product.seller,
      quantity: cartItem.quantity,
      price: cartItem.price,
      total: itemTotal,
      selectedVariants: cartItem.selectedVariants || {},
      customization: cartItem.customization || {},
      productSnapshot: {
        name: product.name,
        slug: product.slug,
        images: mainVariant?.images || [],
        sku: mainVariant?.sku,
      },
    });
  }

  const shippingCost = getShippingCost(shippingAddress.city, shippingAddress.state);
  const taxAmount = Math.round(subtotal * 0.13);

  let discountAmount = 0;
  let couponDoc: any = null;
  if (couponCode) {
    couponDoc = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!couponDoc || !couponDoc.isActive) {
      throw ApiError.badRequest('Invalid coupon code');
    }
    if (couponDoc.expiresAt && couponDoc.expiresAt < new Date()) {
      throw ApiError.badRequest('This coupon has expired');
    }
    if (couponDoc.usageLimit !== undefined && couponDoc.usedCount >= couponDoc.usageLimit) {
      throw ApiError.badRequest('This coupon has reached its usage limit');
    }
    if (couponDoc.minPurchase > 0 && subtotal < couponDoc.minPurchase) {
      throw ApiError.badRequest(`Minimum purchase amount of Rs. ${couponDoc.minPurchase} required`);
    }

    if (couponDoc.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * couponDoc.discountValue) / 100);
      if (couponDoc.maxDiscount !== undefined && discountAmount > couponDoc.maxDiscount) {
        discountAmount = couponDoc.maxDiscount;
      }
    } else {
      discountAmount = Math.min(couponDoc.discountValue, subtotal);
    }
  }

  const totalAmount = subtotal + shippingCost + taxAmount - discountAmount;

  let orderNumber = generateOrderNumber();
  let exists = await Order.findOne({ orderNumber });
  while (exists) {
    orderNumber = generateOrderNumber();
    exists = await Order.findOne({ orderNumber });
  }

  const lowStockAlerts: any[] = [];

  const { session, inTransaction } = await startTransaction();

  try {
    const order = await Order.create([{
      orderNumber,
      customer: userId,
      items: orderItems,
      subtotal,
      shippingCost,
      taxAmount,
      discountAmount,
      totalAmount,
      status: OrderStatus.PENDING,
      paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      shippingAddress,
      notes,
      statusHistory: [{
        status: OrderStatus.PENDING,
        timestamp: new Date(),
        note: 'Order placed',
        updatedBy: userId,
      }],
    }], { session: session ?? undefined });

    for (const cartItem of orderCartItems) {
      const product = await Product.findById(cartItem.product).session(session);
      if (!product) continue;

      if (product.variants.length > 0) {
        const totalInventory = product.variants.reduce((sum, v) => sum + v.inventory, 0);
        if (totalInventory < cartItem.quantity) {
          throw new Error(`Insufficient stock for "${product.name}"`);
        }
        let remaining = cartItem.quantity;
        for (const variant of product.variants) {
          if (remaining <= 0) break;
          const deduct = Math.min(variant.inventory, remaining);
          variant.inventory -= deduct;
          remaining -= deduct;
          if (variant.inventory <= 5) {
            lowStockAlerts.push({
              seller: product.seller,
              product: product._id,
              productName: product.name,
              inventory: variant.inventory,
            });
          }
        }
        product.markModified('variants');
      }

      product.analytics.purchases += cartItem.quantity;
      await product.save({ session: session ?? undefined });
    }

    if (selectedIds) {
      cart.items = cart.items.filter(item => !selectedIds.has(item.product.toString()));
      await cart.save({ session: session ?? undefined });
    } else {
      await Cart.deleteOne({ customer: userId }, { session: session ?? undefined });
    }

    if (couponDoc) {
      couponDoc.usedCount += 1;
      await couponDoc.save({ session: session ?? undefined });
    }

    if (inTransaction && session) await session.commitTransaction();

    const customer = await User.findById(userId);

    emailService.sendOrderConfirmation(
      customer!.email,
      orderNumber,
      customer!.firstName,
      totalAmount
    ).catch(err => console.error('Failed to send order confirmation email:', err));

    const sellerIds = Array.from(new Set(orderItems.map((item: any) => item.seller.toString())));
    const sellerLabels = new Map<string, string>();
    orderItems.forEach((item: any) => {
      const key = item.seller.toString();
      sellerLabels.set(key, `${sellerLabels.get(key) ? sellerLabels.get(key) + ', ' : ''}${item.productSnapshot.name} (x${item.quantity})`);
    });

    await notifyAll(
      sellerIds,
      'order_placed',
      'New order received',
      `Great news! A customer just placed order ${orderNumber}. Items: ${Array.from(sellerLabels.values()).join('; ')}.`,
      { relatedEntity: { type: 'order', id: order[0]._id }, priority: 'high' },
    );

    await notify(
      userId,
      'order_placed',
      'Order placed successfully',
      `Thank you! Your order ${orderNumber} (NPR ${totalAmount.toLocaleString()}) has been placed. We'll keep you updated.`,
      { relatedEntity: { type: 'order', id: order[0]._id }, priority: 'high' },
    );

    for (const alert of lowStockAlerts) {
      await notify(
        alert.seller,
        'low_stock',
        `${alert.productName} is low on stock`,
        `Only ${alert.inventory} left of "${alert.productName}". Consider restocking soon.`,
        { relatedEntity: { type: 'product', id: alert.product }, priority: 'normal' },
      );
    }

    res.status(201).json(
      ApiResponse.created(order[0], 'Order created successfully')
    );
  } catch (error) {
    if (inTransaction && session) await session.abortTransaction();
    throw error;
  } finally {
    session?.endSession();
  }
});

export const getMyOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req);

  const filter: any = { customer: userId };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.seller', 'firstName lastName')
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.json(
    ApiResponse.paginated(orders, 'Orders retrieved successfully', page, limit, total)
  );
});

export const getOrderById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user;

  const order = await Order.findById(id)
    .populate('customer', 'firstName lastName email phone')
    .populate('items.seller', 'firstName lastName');

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (user.role === UserRole.CUSTOMER) {
    const customerId = (order.customer as any)?._id?.toString() || order.customer.toString();
    if (customerId !== user._id.toString()) {
      throw ApiError.forbidden('You can only view your own orders');
    }
  }

  if (user.role === UserRole.SELLER) {
    const sellerProfile = await SellerProfile.findOne({ user: user._id });
    if (!sellerProfile) {
      throw ApiError.forbidden('Seller profile not found');
    }
    const hasSellerProducts = order.items.some(
      item => item.seller._id.toString() === user._id.toString()
    );
    if (!hasSellerProducts) {
      throw ApiError.forbidden('You can only view orders containing your products');
    }
  }

  res.json(ApiResponse.success(order, 'Order retrieved successfully'));
});

export const updateOrderStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const user = req.user;

  if (!status || !Object.values(OrderStatus).includes(status)) {
    throw ApiError.badRequest('Valid order status is required');
  }

  const order = await Order.findById(id).populate('customer', 'firstName lastName email');
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (user.role === UserRole.SELLER) {
    const hasSellerProducts = order.items.some(
      item => item.seller.toString() === user._id.toString()
    );
    if (!hasSellerProducts) {
      throw ApiError.forbidden('You can only update orders containing your products');
    }
    if (status === OrderStatus.CANCELLED) {
      throw ApiError.forbidden('Sellers cannot cancel orders');
    }
  }

  const allowedTransitions = VALID_STATUS_TRANSITIONS[order.status];
  if (!allowedTransitions || !allowedTransitions.includes(status as OrderStatus)) {
    throw ApiError.badRequest(
      `Cannot transition from "${order.status}" to "${status}"`
    );
  }

  if (status === OrderStatus.REFUNDED && user.role === UserRole.ADMIN) {
    const refundAmount = req.body.refundAmount !== undefined ? Number(req.body.refundAmount) : order.totalAmount;
    const refundReason = req.body.refundReason || order.refundReason || 'Refund processed';
    if (!refundAmount || refundAmount <= 0 || refundAmount > order.totalAmount) {
      throw ApiError.badRequest('Valid refund amount required (must not exceed order total)');
    }
    order.refundAmount = refundAmount;
    order.refundReason = refundReason;
    order.refundStatus = 'approved';
    order.refundReviewedAt = new Date();
    order.refundedAt = new Date();
    order.paymentStatus = PaymentStatus.REFUNDED;
  }

  await order.addStatusHistory(status as OrderStatus, note, user._id);

  const updatedOrder = await Order.findById(id)
    .populate('customer', 'firstName lastName email')
    .populate('items.product', 'name slug images')
    .populate('items.seller', 'firstName lastName');

  emailService.sendOrderStatusUpdate(
    (order.customer as any).email,
    order.orderNumber,
    status,
    (order.customer as any).firstName
  ).catch(err => console.error('Failed to send status update email:', err));

  const statusMeta = ORDER_STATUS_NOTIFICATIONS[status as string]
    || { type: 'order_confirmed' as const, title: 'Order updated', message: `Your order ${order.orderNumber} status is now "${status}".` };
  await notify(
    (order.customer as any)._id,
    statusMeta.type,
    statusMeta.title,
    statusMeta.message,
    { relatedEntity: { type: 'order', id: order._id }, priority: ['shipped', 'delivered'].includes(status) ? 'high' : 'normal' },
  );

  res.json(ApiResponse.success(updatedOrder, `Order status updated to "${status}"`));
});

export const cancelOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const userId = req.user._id;

  const order = await Order.findById(id);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (order.customer.toString() !== userId.toString()) {
    throw ApiError.forbidden('You can only cancel your own orders');
  }

  if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status as typeof OrderStatus.PENDING | typeof OrderStatus.CONFIRMED)) {
    throw ApiError.badRequest('Order can only be cancelled when status is pending or confirmed');
  }

  const { session, inTransaction } = await startTransaction();

  try {
    for (const item of order.items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) continue;

      if (product.variants.length > 0 && item.selectedVariants) {
        const variantIndex = product.variants.findIndex(
          (v) => v.name === item.selectedVariants?.name || v.sku === item.selectedVariants?.sku
        );
        if (variantIndex >= 0) {
          product.variants[variantIndex].inventory += item.quantity;
        } else {
          product.variants[0].inventory += item.quantity;
        }
        product.markModified('variants');
      } else if (product.variants.length > 0) {
        product.variants[0].inventory += item.quantity;
        product.markModified('variants');
      }

      product.analytics.purchases = Math.max(0, product.analytics.purchases - item.quantity);
      await product.save({ session: session ?? undefined });
    }

    order.statusHistory.push({
      status: OrderStatus.CANCELLED,
      timestamp: new Date(),
      note: reason || 'Cancelled by customer',
      updatedBy: userId,
    } as any);
    order.status = OrderStatus.CANCELLED;
    order.cancelledAt = new Date();
    order.cancellationReason = reason;
    await order.save({ session: session ?? undefined });

    if (inTransaction && session) await session.commitTransaction();

    const cancelledSellerIds = Array.from(
      new Set(order.items.map((item: any) => item.seller.toString()))
    );
    await notifyAll(
      cancelledSellerIds,
      'order_cancelled',
      'Order cancelled',
      `Order ${order.orderNumber} was cancelled by the customer${reason ? ` (Reason: ${reason})` : ''}.`,
      { relatedEntity: { type: 'order', id: order._id }, priority: 'normal' },
    );

    res.json(ApiResponse.success(order, 'Order cancelled successfully'));
  } catch (error) {
    if (inTransaction && session) await session.abortTransaction();
    throw error;
  } finally {
    session?.endSession();
  }
});

export const requestRefund = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const userId = req.user._id;

  if (!reason || reason.trim().length < 10) {
    throw ApiError.badRequest('Please provide a refund reason (at least 10 characters)');
  }

  const order = await Order.findById(id);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (order.customer.toString() !== userId.toString()) {
    throw ApiError.forbidden('You can only request a refund for your own orders');
  }

  if (order.status !== OrderStatus.DELIVERED) {
    throw ApiError.badRequest('Refunds can only be requested for delivered orders');
  }

  if (order.refundStatus && order.refundStatus !== 'none') {
    throw ApiError.badRequest('A refund request has already been submitted for this order');
  }

  order.refundStatus = 'requested';
  order.refundReason = reason.trim();
  order.refundRequestedAt = new Date();
  await order.save();

  const admins = await User.find({ role: UserRole.ADMIN }).select('_id').lean();
  await Promise.all(admins.map((admin: any) =>
    createNotification({
      userId: admin._id,
      type: 'refund_initiated',
      title: 'Refund Requested',
      message: `Order ${order.orderNumber} has a refund request from ${req.user.firstName} ${req.user.lastName}: ${reason.trim()}`,
      relatedEntity: { type: 'order', id: order._id as any },
      priority: 'high',
    })
  ));

  emailService.sendRefundNotification(
    req.user.email,
    order.orderNumber,
    req.user.firstName,
    'requested'
  ).catch(err => console.error('Failed to send refund request email:', err));

  res.json(ApiResponse.success(order, 'Refund request submitted successfully'));
});

export const reviewRefund = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { action, amount, note } = req.body;

  if (!action || !['approve', 'reject'].includes(action)) {
    throw ApiError.badRequest('Valid action is required (approve or reject)');
  }

  const order = await Order.findById(id).populate('customer', 'firstName lastName email');
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (order.refundStatus !== 'requested') {
    throw ApiError.badRequest('There is no pending refund request for this order');
  }

  const customer = order.customer as any;

  if (action === 'approve') {
    const refundAmount = amount !== undefined ? Number(amount) : order.totalAmount;
    if (!refundAmount || refundAmount <= 0 || refundAmount > order.totalAmount) {
      throw ApiError.badRequest('Valid refund amount is required (must not exceed order total)');
    }

    order.status = OrderStatus.REFUNDED;
    order.paymentStatus = PaymentStatus.REFUNDED;
    order.refundStatus = 'approved';
    order.refundAmount = refundAmount;
    order.refundedAt = new Date();
    order.refundReviewedAt = new Date();
    order.refundReviewNote = note;
    order.statusHistory.push({
      status: OrderStatus.REFUNDED,
      timestamp: new Date(),
      note: `Refund approved — NPR ${refundAmount.toLocaleString()}${note ? ` (${note})` : ''}`,
      updatedBy: req.user._id,
    } as any);
    await order.save();

    createNotification({
      userId: order.customer as any,
      type: 'refund_completed',
      title: 'Refund Approved',
      message: `Your refund of NPR ${refundAmount.toLocaleString()} for order ${order.orderNumber} has been processed.`,
      relatedEntity: { type: 'order', id: order._id as any },
      priority: 'high',
    });

    emailService.sendRefundNotification(
      customer.email,
      order.orderNumber,
      customer.firstName,
      'approved',
      refundAmount
    ).catch(err => console.error('Failed to send refund approved email:', err));

    res.json(ApiResponse.success(order, 'Refund approved successfully'));
    return;
  }

  order.refundStatus = 'rejected';
  order.refundReviewedAt = new Date();
  order.refundReviewNote = note;
  await order.save();

  createNotification({
    userId: order.customer as any,
    type: 'refund_completed',
    title: 'Refund Request Rejected',
    message: `Your refund request for order ${order.orderNumber} was not approved.${note ? ` Reason: ${note}` : ''}`,
    relatedEntity: { type: 'order', id: order._id as any },
    priority: 'normal',
  });

  emailService.sendRefundNotification(
    customer.email,
    order.orderNumber,
    customer.firstName,
    'rejected',
    undefined,
    note
  ).catch(err => console.error('Failed to send refund rejected email:', err));

  res.json(ApiResponse.success(order, 'Refund request rejected'));
});

export const addTrackingNumber = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { trackingNumber, itemIndex } = req.body;
  const user = req.user;

  if (!trackingNumber) {
    throw ApiError.badRequest('Tracking number is required');
  }

  const order = await Order.findById(id);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  const hasSellerProducts = order.items.some(
    item => item.seller.toString() === user._id.toString()
  );
  if (!hasSellerProducts) {
    throw ApiError.forbidden('You can only add tracking to orders containing your products');
  }

  if (typeof itemIndex === 'number') {
    if (itemIndex < 0 || itemIndex >= order.items.length) {
      throw ApiError.badRequest('Invalid item index');
    }
    if (order.items[itemIndex].seller.toString() !== user._id.toString()) {
      throw ApiError.forbidden('You can only update tracking for your own items');
    }
    (order.items[itemIndex] as any).trackingNumber = trackingNumber;
  } else {
    for (let i = 0; i < order.items.length; i++) {
      if (order.items[i].seller.toString() === user._id.toString()) {
        (order.items[i] as any).trackingNumber = trackingNumber;
      }
    }
  }

  await order.save();

  await notify(
    (order.customer as any),
    'order_shipped',
    'Tracking number added',
    `Your order ${order.orderNumber} now has tracking number: ${trackingNumber}.`,
    { relatedEntity: { type: 'order', id: order._id }, priority: 'high' },
  );

  res.json(ApiResponse.success(order, 'Tracking number added successfully'));
});

export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req);

  const filter: any = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.refundStatus) {
    filter.refundStatus = req.query.refundStatus;
  }

  if (req.query.search) {
    const search = req.query.search as string;
    filter.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
    ];

    const matchingUsers = await User.find({
      $or: [
        { email: { $regex: search, $options: 'i' } },
      ],
    }).select('_id').lean();

    if (matchingUsers.length > 0) {
      filter.$or.push({ customer: { $in: matchingUsers.map(u => u._id) } });
    }
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .populate('customer', 'firstName lastName email')
      .populate('items.seller', 'firstName lastName storeName')
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.json(
    ApiResponse.paginated(orders, 'Orders retrieved successfully', page, limit, total)
  );
});

export const getSellerOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req);

  const sellerProfile = await SellerProfile.findOne({ user: userId });
  if (!sellerProfile) {
    throw ApiError.notFound('Seller profile not found');
  }

  const filter: any = { 'items.seller': userId };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.search) {
    const search = req.query.search as string;
    filter.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .populate('customer', 'firstName lastName email')
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.json(
    ApiResponse.paginated(orders, 'Seller orders retrieved successfully', page, limit, total)
  );
});

export const getOrderStats = asyncHandler(async (req: Request, res: Response) => {
  const [
    totalOrders,
    revenueResult,
    ordersByStatus,
    recentOrders,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: PaymentStatus.PAID } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customer', 'firstName lastName email')
      .lean(),
  ]);

  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

  const statusMap: Record<string, number> = {};
  ordersByStatus.forEach((item: any) => {
    statusMap[item._id] = item.count;
  });

  const stats = {
    totalOrders,
    totalRevenue,
    ordersByStatus: statusMap,
    recentOrders,
  };

  res.json(ApiResponse.success(stats, 'Order statistics retrieved successfully'));
});
