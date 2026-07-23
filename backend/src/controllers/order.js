import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { paginate, paginationMeta } from '../utils/pagination.js';
import { sendOrderConfirmationEmail, sendEmail } from '../utils/sendEmail.js';

export const createOrder = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest('Cart is empty');
  }

  const items = cart.items.map((item) => ({
    product: item.product._id,
    seller: item.product.seller,
    name: item.product.name,
    image: item.product.images?.[0]?.url || '',
    price: item.product.price,
    quantity: item.quantity,
    subtotal: item.product.price * item.quantity,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const shippingCost = subtotal > 2000 ? 0 : 200;
  const total = subtotal + shippingCost;

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress: req.body.shippingAddress,
    paymentMethod: req.body.paymentMethod,
    subtotal,
    shippingCost,
    total,
    statusHistory: [{ status: 'pending', note: 'Order placed' }],
  });

  cart.items = [];
  await cart.save();

  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { numSold: item.quantity, stock: -item.quantity } });
  }

  const orderUser = await User.findById(req.user._id);
  sendOrderConfirmationEmail(orderUser.email, order).catch(() => {});

  res.status(201).json(ApiResponse.created(order, 'Order created'));
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);
  const filter = { user: req.user._id };

  if (req.query.status) filter.status = req.query.status;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json(ApiResponse.success({ orders, pagination: paginationMeta(total, page, limit) }));
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized');
  }

  res.json(ApiResponse.success(order));
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');

  if (order.user.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized');
  }

  if (!['pending', 'confirmed'].includes(order.status)) {
    throw ApiError.badRequest('Order cannot be cancelled');
  }

  order.status = 'cancelled';
  order.cancelledAt = new Date();
  order.cancellationReason = req.body.reason || 'Cancelled by customer';
  order.statusHistory.push({ status: 'cancelled', note: order.cancellationReason });
  await order.save();

  res.json(ApiResponse.success(order, 'Order cancelled'));
});

export const getSellerOrders = asyncHandler(async (req, res) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);
  const filter = { 'items.seller': req.user._id };

  if (req.query.status) filter.status = req.query.status;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json(ApiResponse.success({ orders, pagination: paginationMeta(total, page, limit) }));
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');

  order.status = status;
  order.statusHistory.push({ status, note: note || `Status updated to ${status}`, updatedBy: req.user._id });

  if (status === 'delivered') order.deliveredAt = new Date();

  await order.save();

  const orderUser = await User.findById(order.user);
  sendEmail({
    to: orderUser.email,
    subject: `Order ${status} - Kala Bazaar`,
    html: `<p>Dear ${orderUser.name},</p><p>Your order #${order._id.toString().slice(-8).toUpperCase()} is now <strong>${status}</strong>.</p>${note ? `<p>Note: ${note}</p>` : ''}<p><a href="${process.env.CLIENT_URL}/orders/${order._id}">View order</a></p>`,
  }).catch(() => {});

  res.json(ApiResponse.success(order, 'Order status updated'));
});

export const updateTrackingNumber = asyncHandler(async (req, res) => {
  const { trackingNumber } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');

  const hasSellerItem = order.items.some((i) => i.seller?.toString() === req.user._id.toString());
  if (!hasSellerItem && req.user.role !== 'admin') throw ApiError.forbidden('Not your order');

  order.trackingNumber = trackingNumber;
  order.statusHistory.push({ status: order.status, note: `Tracking number added: ${trackingNumber}`, updatedBy: req.user._id });
  await order.save();
  res.json(ApiResponse.success(order, 'Tracking number updated'));
});
