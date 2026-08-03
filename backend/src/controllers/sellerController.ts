import { Request, Response } from 'express';
import mongoose from 'mongoose';
import SellerProfile from '../models/SellerProfile';
import Product from '../models/Product';
import User from '../models/User';
import Order from '../models/Order';
import { ApiError, asyncHandler } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';
import { generateSlug, generateUniqueSlug } from '../utils/helpers';
import { getPaginationParams, getSortObject } from '../utils/pagination';
import { SellerStatus, UserRole, ProductStatus } from '../config/constants';
import { emailService } from '../services/emailService';

export const applyAsSeller = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const {
    storeName,
    district,
    craftType,
    craftStory,
    verificationPath,
    socialMediaLinks,
    workshopPhotos,
    yearsOfExperience,
    specialization,
    region,
  } = req.body;

  if (!storeName || !district || !craftType || !verificationPath) {
    throw ApiError.badRequest('storeName, district, craftType, and verificationPath are required');
  }

  const validPaths = ['social-media', 'marketplace', 'offline-artisan'];
  if (!validPaths.includes(verificationPath)) {
    throw ApiError.badRequest(`verificationPath must be one of: ${validPaths.join(', ')}`);
  }

  if (verificationPath === 'social-media') {
    if (!socialMediaLinks || Object.keys(socialMediaLinks).length === 0) {
      throw ApiError.badRequest('socialMediaLinks are required for social-media verification path');
    }
  }

  if (verificationPath === 'offline-artisan') {
    if (!workshopPhotos || workshopPhotos.length === 0) {
      throw ApiError.badRequest('workshopPhotos are required for offline-artisan verification path');
    }
    if (!craftStory) {
      throw ApiError.badRequest('craftStory is required for offline-artisan verification path');
    }
  }

  const existingProfile = await SellerProfile.findOne({ user: userId });
  if (existingProfile && existingProfile.status === SellerStatus.APPROVED) {
    throw ApiError.conflict('You are already an approved seller');
  }

  if (existingProfile && existingProfile.status === SellerStatus.PENDING) {
    throw ApiError.conflict('Your application is already pending review');
  }

  const baseSlug = generateSlug(storeName);
  const slug = await generateUniqueSlug(baseSlug, async (s) => {
    const exists = await SellerProfile.findOne({ slug: s });
    return !!exists;
  });

  const profileData: any = {
    user: userId,
    storeName,
    slug,
    region: region || undefined,
    crafts: craftType ? (Array.isArray(craftType) ? craftType : [craftType]) : [],
    verificationPath: verificationPath === 'social-media' ? 'social' : verificationPath === 'offline-artisan' ? 'offline' : 'marketplace',
    status: SellerStatus.PENDING,
  };

  if (socialMediaLinks) {
    profileData.socialLinks = socialMediaLinks;
  }

  if (verificationPath === 'offline-artisan') {
    profileData.verificationDocuments = {
      workshopPhotos: workshopPhotos || [],
      craftStory,
      district,
      yearsOfExperience: yearsOfExperience || 0,
      specialization: specialization || [],
    };
  } else {
    profileData.verificationDocuments = {
      workshopPhotos: [],
      district,
      yearsOfExperience: yearsOfExperience || 0,
      specialization: specialization || [],
    };
  }

  let profile;
  if (existingProfile) {
    profile = await SellerProfile.findByIdAndUpdate(existingProfile._id, profileData, { new: true, runValidators: true });
  } else {
    profile = await SellerProfile.create(profileData);
  }

  emailService.sendSellerApplicationReceived(req.user.email, req.user.firstName)
    .catch(err => console.error('Failed to send seller application email:', err));

  res.status(201).json(
    ApiResponse.created(profile, 'Seller application submitted successfully')
  );
});

export const getSellerApplicationStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profile = await SellerProfile.findOne({ user: req.user._id })
    .populate('region', 'name')
    .populate('crafts', 'name');

  if (!profile) {
    throw ApiError.notFound('No seller application found');
  }

  res.json(ApiResponse.success(profile, 'Seller application status retrieved'));
});

export const updateSellerProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const {
    storeName,
    storeDescription,
    bio,
    description,
    craftType,
    specialization,
    location,
    coverImage,
    logo,
    policies,
    isStoreOpen,
    storeHours,
  } = req.body;

  const profile = await SellerProfile.findOne({ user: userId });
  if (!profile) {
    throw ApiError.notFound('Seller profile not found');
  }

  if (profile.status !== SellerStatus.APPROVED) {
    throw ApiError.forbidden('Only approved sellers can update their profile');
  }

  if (storeName && storeName !== profile.storeName) {
    const baseSlug = generateSlug(storeName);
    profile.slug = await generateUniqueSlug(baseSlug, async (s) => {
      const exists = await SellerProfile.findOne({ slug: s, _id: { $ne: profile._id } });
      return !!exists;
    });
    profile.storeName = storeName;
  }

  if (description !== undefined) {
    profile.description = description;
  } else if (bio !== undefined) {
    profile.description = bio;
  } else if (storeDescription !== undefined) {
    profile.description = storeDescription;
  }
  if (craftType) profile.crafts = Array.isArray(craftType) ? craftType : [craftType];
  if (specialization) {
    if (profile.verificationDocuments) {
      profile.verificationDocuments.specialization = Array.isArray(specialization) ? specialization : [specialization];
    }
  }
  if (location !== undefined) {
    if (profile.verificationDocuments) {
      profile.verificationDocuments.district = location;
    }
  }
  if (coverImage !== undefined) profile.coverImage = coverImage;
  if (logo !== undefined) profile.logo = logo;
  if (policies !== undefined) profile.policies = policies;
  if (isStoreOpen !== undefined) profile.isStoreOpen = isStoreOpen;
  if (storeHours !== undefined) profile.storeHours = storeHours;

  await profile.save();

  res.json(ApiResponse.success(profile, 'Seller profile updated successfully'));
});

export const updatePayoutDetails = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const { bankName, accountNumber, accountHolderName, branch, swiftCode, panNumber, vatNumber, khaltiId, esewaId, imeiPayId } = req.body;

  const profile = await SellerProfile.findOne({ user: userId });
  if (!profile) {
    throw ApiError.notFound('Seller profile not found');
  }

  if (profile.status !== SellerStatus.APPROVED) {
    throw ApiError.forbidden('Only approved sellers can update payout details');
  }

  profile.payoutDetails = {
    bankName: bankName ?? profile.payoutDetails.bankName,
    accountNumber: accountNumber ?? profile.payoutDetails.accountNumber,
    accountHolderName: accountHolderName ?? profile.payoutDetails.accountHolderName,
    branch: branch ?? profile.payoutDetails.branch,
    swiftCode: swiftCode ?? profile.payoutDetails.swiftCode,
    panNumber: panNumber ?? profile.payoutDetails.panNumber,
    vatNumber: vatNumber ?? profile.payoutDetails.vatNumber,
    khaltiId: khaltiId ?? profile.payoutDetails.khaltiId,
    esewaId: esewaId ?? profile.payoutDetails.esewaId,
    imeiPayId: imeiPayId ?? profile.payoutDetails.imeiPayId,
  };

  await profile.save();

  res.json(ApiResponse.success(profile.payoutDetails, 'Payout details updated successfully'));
});

export const getSellerDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;

  const profile = await SellerProfile.findOne({ user: userId });
  if (!profile) {
    throw ApiError.notFound('Seller profile not found');
  }

  const [totalProducts, publishedProducts, orderStats, recentOrders, lowStockProducts] = await Promise.all([
    Product.countDocuments({ seller: userId }),
    Product.countDocuments({ seller: userId, status: ProductStatus.APPROVED }),
    Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.seller': new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalOrders: { $addToSet: '$_id' },
          totalRevenue: { $sum: '$items.total' },
        },
      },
      {
        $project: {
          _id: 0,
          totalOrders: { $size: '$totalOrders' },
          totalRevenue: 1,
        },
      },
    ]),
    Order.find({ 'items.seller': userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customer', 'firstName lastName email')
      .lean(),
    Product.find({
      seller: userId,
      status: ProductStatus.APPROVED,
      'variants.inventory': { $lte: 5 },
    })
      .select('name slug variants basePrice analytics.views')
      .limit(10)
      .lean(),
  ]);

  const stats = orderStats[0] || { totalOrders: 0, totalRevenue: 0 };

  res.json(
    ApiResponse.success({
      totalProducts,
      publishedProducts,
      totalOrders: stats.totalOrders,
      totalRevenue: stats.totalRevenue,
      averageRating: profile.rating,
      recentOrders,
      lowStockProducts,
    }, 'Dashboard stats retrieved')
  );
});

export const getSellerProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req);
  const { search, status, category, minPrice, maxPrice } = req.query;

  const filter: any = { seller: userId };

  if (status) filter.status = status;
  if (category && mongoose.Types.ObjectId.isValid(category as string)) filter.category = category;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [(search as string).toLowerCase()] } },
    ];
  }
  if (minPrice || maxPrice) {
    filter.basePrice = {};
    if (minPrice) filter.basePrice.$gte = parseFloat(minPrice as string);
    if (maxPrice) filter.basePrice.$lte = parseFloat(maxPrice as string);
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(getSortObject(sortBy, sortOrder))
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug')
      .populate('craft', 'name')
      .populate('region', 'name')
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.json(
    ApiResponse.paginated(products, 'Seller products retrieved', page, limit, total)
  );
});

export const getSellerPublicProfile = asyncHandler(async (req: Request, res: Response) => {
  const { idOrSlug } = req.params;

  let profile;
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    profile = await SellerProfile.findOne({ _id: idOrSlug, status: SellerStatus.APPROVED })
      .populate('user', 'firstName lastName avatar')
      .populate('region', 'name')
      .populate('crafts', 'name slug');
  } else {
    profile = await SellerProfile.findOne({ slug: idOrSlug, status: SellerStatus.APPROVED })
      .populate('user', 'firstName lastName avatar')
      .populate('region', 'name')
      .populate('crafts', 'name slug');
  }

  if (!profile) {
    throw ApiError.notFound('Seller not found');
  }

  if (profile.status !== SellerStatus.APPROVED) {
    throw ApiError.notFound('Seller not found');
  }

  const products = await Product.find({ seller: profile.user._id, status: ProductStatus.APPROVED })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  res.json(
    ApiResponse.success({ profile, products }, 'Seller public profile retrieved')
  );
});

export const getAllSellers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req);
  const { search, status } = req.query;

  const filter: any = {};

  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { storeName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const [sellers, total] = await Promise.all([
    SellerProfile.find(filter)
      .sort(getSortObject(sortBy, sortOrder))
      .skip(skip)
      .limit(limit)
      .populate('user', 'firstName lastName email avatar')
      .populate('region', 'name')
      .populate('crafts', 'name')
      .lean(),
    SellerProfile.countDocuments(filter),
  ]);

  res.json(
    ApiResponse.paginated(sellers, 'All sellers retrieved', page, limit, total)
  );
});

export const approveSeller = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { sellerId } = req.params;
  const { commissionRate } = req.body;

  const profile = await SellerProfile.findById(sellerId).populate('user', 'firstName lastName email');
  if (!profile) {
    throw ApiError.notFound('Seller profile not found');
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
    isEmailVerified: true,
  });

  const user = profile.user as any;
  emailService.sendSellerApprovalEmail(
    user.email,
    user.firstName,
    'approved'
  ).catch(err => console.error('Failed to send seller approval email:', err));

  res.json(ApiResponse.success(profile, 'Seller approved successfully'));
});

export const rejectSeller = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { sellerId } = req.params;
  const { reason, adminNotes } = req.body;

  if (!reason) {
    throw ApiError.badRequest('Rejection reason is required');
  }

  const profile = await SellerProfile.findById(sellerId).populate('user', 'firstName lastName email');
  if (!profile) {
    throw ApiError.notFound('Seller profile not found');
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

  res.json(ApiResponse.success(profile, 'Seller rejected'));
});
