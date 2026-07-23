import Coupon from '../models/Coupon.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, amount } = req.body;

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
    validFrom: { $lte: new Date() },
    validUntil: { $gte: new Date() },
  });

  if (!coupon) throw ApiError.badRequest('Invalid or expired coupon');

  if (coupon.usedCount >= coupon.usageLimit) {
    throw ApiError.badRequest('Coupon usage limit reached');
  }

  if (amount < coupon.minPurchase) {
    throw ApiError.badRequest(`Minimum purchase of Rs. ${coupon.minPurchase} required`);
  }

  let discount = coupon.discountType === 'percentage'
    ? Math.round((amount * coupon.discountValue) / 100)
    : coupon.discountValue;

  if (coupon.maxDiscount) {
    discount = Math.min(discount, coupon.maxDiscount);
  }

  coupon.usedCount += 1;
  await coupon.save();

  res.json(ApiResponse.success({ discount, code: coupon.code }));
});

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json(ApiResponse.success(coupon, 'Coupon created'));
});

export const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(ApiResponse.success(coupons));
});

export const toggleCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw ApiError.notFound('Coupon not found');
  coupon.isActive = !coupon.isActive;
  await coupon.save();
  res.json(ApiResponse.success(coupon, `Coupon ${coupon.isActive ? 'activated' : 'deactivated'}`));
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json(ApiResponse.success(null, 'Coupon deleted'));
});
