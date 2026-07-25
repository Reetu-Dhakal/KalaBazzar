import { Request, Response } from 'express';
import Coupon from '../models/Coupon';
import { ApiError, asyncHandler } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';
import { getPaginationParams, getSortObject } from '../utils/pagination';

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

export const getCouponById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw ApiError.notFound('Coupon not found');
  }

  res.json(ApiResponse.success(coupon, 'Coupon retrieved successfully'));
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

export const toggleCouponStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw ApiError.notFound('Coupon not found');
  }

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  res.json(
    ApiResponse.success(
      { id: coupon._id, isActive: coupon.isActive },
      `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`
    )
  );
});

export const validateCoupon = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { code, subtotal } = req.body;

  if (!code) {
    throw ApiError.badRequest('Coupon code is required');
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) {
    throw ApiError.notFound('Invalid coupon code');
  }

  if (!coupon.isActive) {
    throw ApiError.badRequest('This coupon is no longer active');
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw ApiError.badRequest('This coupon has expired');
  }

  if (coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
    throw ApiError.badRequest('This coupon has reached its usage limit');
  }

  const orderSubtotal = Number(subtotal) || 0;
  if (coupon.minPurchase > 0 && orderSubtotal < coupon.minPurchase) {
    throw ApiError.badRequest(
      `Minimum purchase amount of Rs. ${coupon.minPurchase} required`
    );
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = Math.round((orderSubtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount !== undefined && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else {
    discountAmount = Math.min(coupon.discountValue, orderSubtotal);
  }

  res.json(
    ApiResponse.success(
      {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        maxDiscount: coupon.maxDiscount,
        minPurchase: coupon.minPurchase,
        expiresAt: coupon.expiresAt,
      },
      'Coupon is valid'
    )
  );
});

export const applyCoupon = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { code, subtotal } = req.body;

  if (!code) {
    throw ApiError.badRequest('Coupon code is required');
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) {
    throw ApiError.notFound('Invalid coupon code');
  }

  if (!coupon.isActive) {
    throw ApiError.badRequest('This coupon is no longer active');
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw ApiError.badRequest('This coupon has expired');
  }

  if (coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
    throw ApiError.badRequest('This coupon has reached its usage limit');
  }

  const orderSubtotal = Number(subtotal) || 0;
  if (coupon.minPurchase > 0 && orderSubtotal < coupon.minPurchase) {
    throw ApiError.badRequest(
      `Minimum purchase amount of Rs. ${coupon.minPurchase} required`
    );
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = Math.round((orderSubtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount !== undefined && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else {
    discountAmount = Math.min(coupon.discountValue, orderSubtotal);
  }

  res.json(
    ApiResponse.success(
      {
        couponId: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
      'Coupon applied successfully'
    )
  );
});
