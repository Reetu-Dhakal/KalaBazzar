import mongoose from 'mongoose';
import SellerProfile from '../models/SellerProfile.js';
import Order from '../models/Order.js';
import * as sellerService from '../services/seller.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

export const applyAsSeller = asyncHandler(async (req, res) => {
  const profile = await sellerService.applyAsSeller(req.user._id, req.body);
  res.status(201).json(ApiResponse.created(profile, 'Seller application submitted'));
});

export const getMySellerProfile = asyncHandler(async (req, res) => {
  const profile = await sellerService.getSellerProfile(req.user._id);
  res.json(ApiResponse.success(profile));
});

export const updateSellerProfile = asyncHandler(async (req, res) => {
  const profile = await sellerService.updateSellerProfile(req.user._id, req.body);
  res.json(ApiResponse.success(profile, 'Profile updated'));
});

export const updatePayoutInfo = asyncHandler(async (req, res) => {
  const profile = await sellerService.updatePayoutInfo(req.user._id, req.body);
  res.json(ApiResponse.success(profile, 'Payout info updated'));
});

export const toggleStore = asyncHandler(async (req, res) => {
  const profile = await sellerService.toggleStoreStatus(req.user._id);
  res.json(ApiResponse.success({ isStoreOpen: profile.isStoreOpen }, 'Store status toggled'));
});

export const getSellerRevenue = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;
  const days = parseInt(req.query.days) || 30;

  const start = new Date();
  start.setDate(start.getDate() - days);

  const orders = await Order.find({
    'items.seller': sellerId,
    createdAt: { $gte: start },
    status: { $ne: 'cancelled' },
  });

  const revenueMap = {};
  for (let d = new Date(start); d <= new Date(); d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    revenueMap[key] = 0;
  }

  let totalRevenue = 0;
  for (const order of orders) {
    const dateKey = order.createdAt.toISOString().slice(0, 10);
    for (const item of order.items) {
      if (item.seller?.toString() === sellerId.toString()) {
        const rev = item.subtotal || item.price * item.quantity;
        revenueMap[dateKey] = (revenueMap[dateKey] || 0) + rev;
        totalRevenue += rev;
      }
    }
  }

  const chartData = Object.entries(revenueMap).map(([date, revenue]) => ({ date, revenue }));

  res.json(ApiResponse.success({ chartData, totalRevenue, orderCount: orders.length }));
});

export const getSellerEarnings = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);

  const filter = { 'items.seller': sellerId, status: { $ne: 'cancelled' } };
  if (req.query.status) filter.status = req.query.status;

  const [orders, total, totals] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name email'),
    Order.countDocuments(filter),
    Order.aggregate([
      { $match: { 'items.seller': sellerId, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { $match: { 'items.seller': sellerId } },
      { $group: { _id: null, totalEarnings: { $sum: '$items.subtotal' }, totalOrders: { $addToSet: '$_id' } } },
    ]),
  ]);

  const ordersWithEarnings = orders.map((o) => {
    const sellerItems = o.items.filter((i) => i.seller?.toString() === sellerId.toString());
    const earnings = sellerItems.reduce((sum, i) => sum + (i.subtotal || i.price * i.quantity), 0);
    return { ...o.toObject(), earnings, sellerItems };
  });

  const summary = totals[0] || { totalEarnings: 0, totalOrders: [] };

  res.json(ApiResponse.success({
    orders: ordersWithEarnings,
    summary: { totalEarnings: summary.totalEarnings, totalOrders: summary.totalOrders.length },
    pagination: paginationMeta(total, page, limit),
  }));
});

export const getPublicSellerProfile = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  let profile = await SellerProfile.findOne({ slug }).populate('user', 'name email avatar phone');
  if (!profile && mongoose.Types.ObjectId.isValid(slug)) {
    profile = await SellerProfile.findOne({ user: slug }).populate('user', 'name email avatar phone');
    if (!profile) {
      profile = await SellerProfile.findById(slug).populate('user', 'name email avatar phone');
    }
  }
  if (!profile) throw ApiError.notFound('Seller profile not found');
  res.json(ApiResponse.success(profile));
});
