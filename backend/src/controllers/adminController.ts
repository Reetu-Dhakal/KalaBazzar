import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import SellerProfile from '../models/SellerProfile';
import Product from '../models/Product';
import Order from '../models/Order';
import Coupon from '../models/Coupon';
import { ApiError, asyncHandler } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';
import { getPaginationParams, getSortObject } from '../utils/pagination';
import { UserRole, SellerStatus, OrderStatus, PaymentStatus } from '../config/constants';
import { emailService } from '../services/emailService';
import { generateSlug, generateUniqueSlug } from '../utils/helpers';

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
};

export const getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const [
    totalUsers,
    totalSellers,
    totalProducts,
    totalOrders,
    revenueResult,
    pendingSellers,
    recentOrders,
    ordersByStatus,
    revenueByMonth,
  ] = await Promise.all([
    User.countDocuments({ role: { $ne: UserRole.ADMIN } }),
    SellerProfile.countDocuments({ status: SellerStatus.APPROVED }),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: PaymentStatus.PAID } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    SellerProfile.countDocuments({ status: SellerStatus.PENDING }),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customer', 'firstName lastName email')
      .lean(),
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { paymentStatus: PaymentStatus.PAID } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
  ]);

  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

  const ordersByStatusMap: Record<string, number> = {};
  ordersByStatus.forEach((item: any) => {
    ordersByStatusMap[item._id] = item.count;
  });

  const stats = {
    totalUsers,
    totalSellers,
    totalProducts,
    totalOrders,
    totalRevenue,
    pendingSellers,
    recentOrders,
    ordersByStatus: ordersByStatusMap,
    revenueByMonth: revenueByMonth.map((item: any) => ({
      year: item._id.year,
      month: item._id.month,
      revenue: item.revenue,
      orders: item.orders,
    })),
  };

  res.json(ApiResponse.success(stats, 'Dashboard stats retrieved successfully'));
});

export const getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req);
  const { search, role } = req.query;

  const filter: any = {};

  if (role) {
    filter.role = role;
  }
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort(getSortObject(sortBy, sortOrder))
      .skip(skip)
      .limit(limit)
      .select('-password -refreshToken -emailVerificationToken -passwordResetToken')
      .lean(),
    User.countDocuments(filter),
  ]);

  res.json(
    ApiResponse.paginated(users, 'Users retrieved successfully', page, limit, total)
  );
});

export const getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select('-password -refreshToken -emailVerificationToken -passwordResetToken');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  let sellerProfile = null;
  if (user.role === UserRole.SELLER || user.role === UserRole.ADMIN) {
    sellerProfile = await SellerProfile.findOne({ user: id })
      .populate('region', 'name')
      .populate('crafts', 'name');
  }

  res.json(
    ApiResponse.success(
      { user, sellerProfile },
      'User retrieved successfully'
    )
  );
});

export const updateUserStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    throw ApiError.badRequest('isActive must be a boolean');
  }

  const user = await User.findById(id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.role === UserRole.ADMIN) {
    throw ApiError.forbidden('Cannot modify admin user status');
  }

  user.isActive = isActive;
  await user.save();

  res.json(
    ApiResponse.success(
      { id: user._id, isActive },
      `User ${isActive ? 'activated' : 'deactivated'} successfully`
    )
  );
});

export const getSellerApplications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req);
  const { status, search } = req.query;

  const filter: any = {};

  if (status) {
    filter.status = status;
  } else {
    filter.status = SellerStatus.PENDING;
  }

  if (search) {
    filter.$or = [
      { storeName: { $regex: search, $options: 'i' } },
    ];
  }

  const [applications, total] = await Promise.all([
    SellerProfile.find(filter)
      .sort(getSortObject(sortBy, sortOrder))
      .skip(skip)
      .limit(limit)
      .populate('user', 'firstName lastName email phone avatar')
      .populate('region', 'name')
      .populate('crafts', 'name')
      .populate('reviewedBy', 'firstName lastName')
      .lean(),
    SellerProfile.countDocuments(filter),
  ]);

  res.json(
    ApiResponse.paginated(applications, 'Seller applications retrieved successfully', page, limit, total)
  );
});

export const approveSellerApplication = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { commissionRate } = req.body;

  const profile = await SellerProfile.findById(id).populate('user', 'firstName lastName email');
  if (!profile) {
    throw ApiError.notFound('Seller application not found');
  }

  if (profile.status === SellerStatus.APPROVED) {
    throw ApiError.badRequest('Seller is already approved');
  }

  profile.status = SellerStatus.APPROVED;
  profile.reviewedBy = req.user._id;
  profile.reviewedAt = new Date();
  if (commissionRate !== undefined) {
    profile.commissionRate = commissionRate;
  }

  await profile.save();

  await User.findByIdAndUpdate(profile.user._id, {
    role: UserRole.SELLER,
  });

  const user = profile.user as any;
  emailService.sendSellerApprovalEmail(
    user.email,
    user.firstName,
    'approved'
  ).catch(err => console.error('Failed to send seller approval email:', err));

  res.json(ApiResponse.success(profile, 'Seller approved successfully'));
});

export const rejectSellerApplication = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { reason, adminNotes } = req.body;

  if (!reason) {
    throw ApiError.badRequest('Rejection reason is required');
  }

  const profile = await SellerProfile.findById(id).populate('user', 'firstName lastName email');
  if (!profile) {
    throw ApiError.notFound('Seller application not found');
  }

  if (profile.status === SellerStatus.REJECTED) {
    throw ApiError.badRequest('Seller is already rejected');
  }

  profile.status = SellerStatus.REJECTED;
  profile.reviewedBy = req.user._id;
  profile.reviewedAt = new Date();
  profile.adminNotes = adminNotes || reason;

  await profile.save();

  const user = profile.user as any;
  emailService.sendSellerApprovalEmail(
    user.email,
    user.firstName,
    'rejected',
    reason
  ).catch(err => console.error('Failed to send seller rejection email:', err));

  res.json(ApiResponse.success(profile, 'Seller application rejected'));
});

export const getAllOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req);
  const { status, search } = req.query;

  const filter: any = {};

  if (status) {
    filter.status = status;
  }

  if (search) {
    const searchStr = search as string;
    filter.$or = [
      { orderNumber: { $regex: searchStr, $options: 'i' } },
    ];

    const matchingUsers = await User.find({
      $or: [
        { email: { $regex: searchStr, $options: 'i' } },
        { firstName: { $regex: searchStr, $options: 'i' } },
        { lastName: { $regex: searchStr, $options: 'i' } },
      ],
    }).select('_id').lean();

    if (matchingUsers.length > 0) {
      filter.$or.push({ customer: { $in: matchingUsers.map(u => u._id) } });
    }
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort(getSortObject(sortBy, sortOrder))
      .skip(skip)
      .limit(limit)
      .populate('customer', 'firstName lastName email')
      .populate('items.seller', 'firstName lastName')
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.json(
    ApiResponse.paginated(orders, 'Orders retrieved successfully', page, limit, total)
  );
});

export const updateOrderStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, note } = req.body;

  if (!status || !Object.values(OrderStatus).includes(status)) {
    throw ApiError.badRequest('Valid order status is required');
  }

  const order = await Order.findById(id).populate('customer', 'firstName lastName email');
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  const allowedTransitions = VALID_STATUS_TRANSITIONS[order.status];
  if (!allowedTransitions || !allowedTransitions.includes(status as OrderStatus)) {
    throw ApiError.badRequest(
      `Cannot transition from "${order.status}" to "${status}"`
    );
  }

  await (order as any).addStatusHistory(status as OrderStatus, note, req.user._id);

  emailService.sendOrderStatusUpdate(
    (order.customer as any).email,
    order.orderNumber,
    status,
    (order.customer as any).firstName
  ).catch(err => console.error('Failed to send status update email:', err));

  res.json(ApiResponse.success(order, `Order status updated to "${status}"`));
});

export const getCoupons = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req);
  const { search, isActive } = req.query;

  const filter: any = {};

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }
  if (search) {
    filter.$or = [
      { code: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const [coupons, total] = await Promise.all([
    Coupon.find(filter)
      .sort(getSortObject(sortBy, sortOrder))
      .skip(skip)
      .limit(limit)
      .lean(),
    Coupon.countDocuments(filter),
  ]);

  res.json(
    ApiResponse.paginated(coupons, 'Coupons retrieved successfully', page, limit, total)
  );
});

export const createCoupon = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minPurchase,
    maxDiscount,
    usageLimit,
    expiresAt,
    isActive,
  } = req.body;

  if (!code || !discountType || discountValue === undefined) {
    throw ApiError.badRequest('code, discountType, and discountValue are required');
  }

  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    throw ApiError.conflict('Coupon code already exists');
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    description,
    discountType,
    discountValue,
    minPurchase: minPurchase || 0,
    maxDiscount,
    usageLimit,
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    isActive: isActive !== undefined ? isActive : true,
    createdBy: req.user._id,
  });

  res.status(201).json(
    ApiResponse.created(coupon, 'Coupon created successfully')
  );
});

export const updateCoupon = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const {
    code,
    description,
    discountType,
    discountValue,
    minPurchase,
    maxDiscount,
    usageLimit,
    expiresAt,
    isActive,
  } = req.body;

  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw ApiError.notFound('Coupon not found');
  }

  if (code && code.toUpperCase() !== coupon.code) {
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase(), _id: { $ne: id } });
    if (existingCoupon) {
      throw ApiError.conflict('Coupon code already exists');
    }
    coupon.code = code.toUpperCase();
  }

  if (description !== undefined) coupon.description = description;
  if (discountType) coupon.discountType = discountType;
  if (discountValue !== undefined) coupon.discountValue = discountValue;
  if (minPurchase !== undefined) coupon.minPurchase = minPurchase;
  if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
  if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
  if (expiresAt !== undefined) coupon.expiresAt = expiresAt ? new Date(expiresAt) : undefined;
  if (isActive !== undefined) coupon.isActive = isActive;

  await coupon.save();

  res.json(ApiResponse.success(coupon, 'Coupon updated successfully'));
});

export const deleteCoupon = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw ApiError.notFound('Coupon not found');
  }

  await Coupon.findByIdAndDelete(id);

  res.json(ApiResponse.success(null, 'Coupon deleted successfully'));
});
