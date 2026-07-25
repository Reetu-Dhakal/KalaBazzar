import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Banner from '../models/Banner';
import { ApiError, asyncHandler } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';

export const getBanners = asyncHandler(async (req: Request, res: Response) => {
  const { position, targetAudience } = req.query;

  const filter: any = { isActive: true };

  if (position) filter.position = position;
  if (targetAudience) filter.targetAudience = targetAudience;

  const now = new Date();
  filter.$or = [
    { startDate: { $exists: false }, endDate: { $exists: false } },
    { startDate: { $lte: now }, endDate: { $exists: false } },
    { startDate: { $exists: false }, endDate: { $gte: now } },
    { startDate: { $lte: now }, endDate: { $gte: now } },
  ];

  const banners = await Banner.find(filter)
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  res.json(ApiResponse.success(banners, 'Banners retrieved'));
});

export const getBannerById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid banner ID');
  }

  const banner = await Banner.findById(id).lean();

  if (!banner) {
    throw ApiError.notFound('Banner not found');
  }

  res.json(ApiResponse.success(banner, 'Banner retrieved'));
});

export const createBanner = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    title, subtitle, description, image, mobileImage, position,
    linkType, linkValue, buttonText, buttonStyle, alignment,
    overlayOpacity, textColor, backgroundColor, isActive,
    startDate, endDate, sortOrder, targetAudience,
  } = req.body;

  if (!title || !image || !position) {
    throw ApiError.badRequest('Title, image, and position are required');
  }

  const banner = await Banner.create({
    title,
    subtitle,
    description,
    image,
    mobileImage,
    position,
    linkType: linkType || 'none',
    linkValue,
    buttonText,
    buttonStyle: buttonStyle || 'primary',
    alignment: alignment || 'center',
    overlayOpacity: overlayOpacity ?? 0.4,
    textColor: textColor || '#FFFFFF',
    backgroundColor,
    isActive: isActive !== false,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    sortOrder: sortOrder ?? 0,
    targetAudience: targetAudience || 'all',
  });

  res.status(201).json(ApiResponse.created(banner, 'Banner created successfully'));
});

export const updateBanner = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid banner ID');
  }

  const banner = await Banner.findById(id);
  if (!banner) {
    throw ApiError.notFound('Banner not found');
  }

  const allowedFields = [
    'title', 'subtitle', 'description', 'image', 'mobileImage', 'position',
    'linkType', 'linkValue', 'buttonText', 'buttonStyle', 'alignment',
    'overlayOpacity', 'textColor', 'backgroundColor', 'isActive',
    'startDate', 'endDate', 'sortOrder', 'targetAudience',
  ];

  const updates: Record<string, any> = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const updated = await Banner.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  res.json(ApiResponse.success(updated, 'Banner updated successfully'));
});

export const deleteBanner = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid banner ID');
  }

  const banner = await Banner.findById(id);
  if (!banner) {
    throw ApiError.notFound('Banner not found');
  }

  await Banner.findByIdAndDelete(id);

  res.json(ApiResponse.success(null, 'Banner deleted successfully'));
});

export const reorderBanners = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orders } = req.body;

  if (!orders || !Array.isArray(orders)) {
    throw ApiError.badRequest('Orders array is required');
  }

  const bulkOps = orders.map(({ id, sortOrder }: { id: string; sortOrder: number }) => ({
    updateOne: {
      filter: { _id: id },
      update: { sortOrder },
    },
  }));

  await Banner.bulkWrite(bulkOps);

  const banners = await Banner.find({ isActive: true })
    .sort({ sortOrder: 1 })
    .lean();

  res.json(ApiResponse.success(banners, 'Banners reordered successfully'));
});
