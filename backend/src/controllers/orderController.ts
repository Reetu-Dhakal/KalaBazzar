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
import mongoose from 'mongoose';
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

export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { shippingAddress, paymentMethod, notes, couponCode } = req.body;
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

  const productIds = cart.items.map(item => item.product);
  const products = await Product.find({ _id: { $in: productIds } });

  const productMap = new Map(products.map(p => [p._id.toString(), p]));

  const orderItems = [];
  let subtotal = 0;

  for (const cartItem of cart.items) {
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
      productSnapshot: {
        name: product.name,
        slug: product.slug,
        images: mainVariant?.images || [],
        sku: mainVariant?.sku,
      },
    });
  }

  const shippingCost = subtotal >= 5000 ? 0 : 150;
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

  const session = await mongoose.startSession();
  session.startTransaction();

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
    }], { session });

    for (const cartItem of cart.items) {
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
        }
        product.markModified('variants');
      }

      product.analytics.purchases += cartItem.quantity;
      await product.save({ session });
    }

    await Cart.deleteOne({ customer: userId }, { session });

    if (couponDoc) {
      couponDoc.usedCount += 1;
      await couponDoc.save({ session });
    }

    await session.commitTransaction();

    const customer = await User.findById(userId);

    emailService.sendOrderConfirmation(
      customer!.email,
      orderNumber,
      customer!.firstName,
      totalAmount
    ).catch(err => console.error('Failed to send order confirmation email:', err));

    res.status(201).json(
      ApiResponse.created(order[0], 'Order created successfully')
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
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

  const session = await mongoose.startSession();
  session.startTransaction();

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
      await product.save({ session });
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
    await order.save({ session });

    await session.commitTransaction();

    res.json(ApiResponse.success(order, 'Order cancelled successfully'));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
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
    (order.items[itemIndex] as any).trackingNumber = trackingNumber;
  } else {
    for (let i = 0; i < order.items.length; i++) {
      if (order.items[i].seller.toString() === user._id.toString()) {
        (order.items[i] as any).trackingNumber = trackingNumber;
      }
    }
  }

  await order.save();

  res.json(ApiResponse.success(order, 'Tracking number added successfully'));
});

export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req);

  const filter: any = {};

  if (req.query.status) {
    filter.status = req.query.status;
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
