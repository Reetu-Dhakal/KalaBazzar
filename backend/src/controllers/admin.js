import User from '../models/User.js';
import SellerProfile from '../models/SellerProfile.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Category from '../models/Category.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { paginate, paginationMeta } from '../utils/pagination.js';
import { SELLER_STATUS, ROLES } from '../config/constants.js';
import { sendSellerApprovalEmail } from '../utils/sendEmail.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalSellers, totalProducts, totalOrders, totalRevenue] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'seller' }),
    Product.countDocuments({ status: 'published' }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
  ]);

  res.json(ApiResponse.success({
    totalUsers,
    totalSellers,
    totalProducts,
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
  }));
});

export const getPendingSellers = asyncHandler(async (req, res) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);
  const [sellers, total] = await Promise.all([
    SellerProfile.find({ verificationStatus: SELLER_STATUS.PENDING })
      .populate('user', 'name email avatar phone')
      .sort({ createdAt: 1 })
      .skip(skip).limit(limit),
    SellerProfile.countDocuments({ verificationStatus: SELLER_STATUS.PENDING }),
  ]);

  res.json(ApiResponse.success({ sellers, pagination: paginationMeta(total, page, limit) }));
});

export const approveSeller = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const profile = await SellerProfile.findById(id);
  if (!profile) throw ApiError.notFound('Seller profile not found');

  profile.verificationStatus = SELLER_STATUS.APPROVED;
  profile.isVerifiedArtisan = true;
  profile.verifiedAt = new Date();
  profile.verifiedBy = req.user._id;
  await profile.save();

  await User.findByIdAndUpdate(profile.user, { role: ROLES.SELLER });

  const approvedUser = await User.findById(profile.user);
  sendSellerApprovalEmail(approvedUser.email, approvedUser.name).catch(() => {});

  res.json(ApiResponse.success(profile, 'Seller approved'));
});

export const rejectSeller = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const profile = await SellerProfile.findById(id);
  if (!profile) throw ApiError.notFound('Seller profile not found');

  profile.verificationStatus = SELLER_STATUS.REJECTED;
  profile.verificationNotes = reason;
  await profile.save();

  res.json(ApiResponse.success(profile, 'Seller rejected'));
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);
  const filter = {};
  if (req.query.role) filter.role = req.query.role;

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.json(ApiResponse.success({ users, pagination: paginationMeta(total, page, limit) }));
});

export const getAllCategories = asyncHandler(async (req, res) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);
  const [categories, total] = await Promise.all([
    Category.find().sort({ order: 1 }).skip(skip).limit(limit),
    Category.countDocuments(),
  ]);

  res.json(ApiResponse.success({ categories, pagination: paginationMeta(total, page, limit) }));
});

export const manageUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const user = await User.findByIdAndUpdate(id, { isActive }, { new: true });
  if (!user) throw ApiError.notFound('User not found');

  res.json(ApiResponse.success(user.toPublicJSON(), `User ${isActive ? 'activated' : 'deactivated'}`));
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [orders, total] = await Promise.all([
    Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json(ApiResponse.success({ orders, pagination: paginationMeta(total, page, limit) }));
});

export const getAllReviews = asyncHandler(async (req, res) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [reviews, total] = await Promise.all([
    Review.find(filter).populate('user', 'name email').populate('product', 'name images').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Review.countDocuments(filter),
  ]);

  res.json(ApiResponse.success({ reviews, pagination: paginationMeta(total, page, limit) }));
});

export const adminDeleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw ApiError.notFound('Review not found');
  const productId = review.product;
  await Review.findByIdAndDelete(req.params.id);
  await Review.calculateAverageRating(productId);
  res.json(ApiResponse.success(null, 'Review deleted'));
});

export const adminUpdateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await Order.findById(id);
  if (!order) throw ApiError.notFound('Order not found');

  order.status = status;
  if (status === 'delivered') order.deliveredAt = new Date();
  await order.save();

  res.json(ApiResponse.success(order, `Order ${status}`));
});
