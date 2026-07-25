import { Request, Response } from 'express';
import HomepageSettings from '../models/HomepageSettings';
import SellerProfile from '../models/SellerProfile';
import Review from '../models/Review';
import { ApiError, asyncHandler } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';
import { SellerStatus } from '../config/constants';

export const getHomepageSettings = asyncHandler(async (req: Request, res: Response) => {
  let settings = await HomepageSettings.findOne()
    .populate('featuredCategories', 'name slug image')
    .populate('featuredCollections', 'name slug image')
    .populate('featuredArtisans', 'storeName slug logo region')
    .populate('featuredProducts', 'name slug basePrice images')
    .populate('artisanSpotlight.artisans', 'storeName slug logo')
    .sort({ updatedAt: -1 })
    .lean();

  if (!settings) {
    const created = await HomepageSettings.create({
      hero: {
        headline: 'Welcome to KalaBazzar',
        subheadline: 'Discover authentic Nepali handicrafts',
        ctaText: 'Shop Now',
        ctaLink: '/shop',
        backgroundImage: '',
        overlayOpacity: 0.5,
        textAlignment: 'center',
      },
      featuredCategories: [],
      featuredCollections: [],
      featuredArtisans: [],
      featuredProducts: [],
      artisanSpotlight: { title: '', description: '', artisans: [] },
      storySection: { title: '', description: '', stories: [] },
      trustBadges: [],
      newsletter: {
        headline: '',
        subheadline: '',
        placeholder: 'Enter your email',
        buttonText: 'Subscribe',
      },
      footer: {
        aboutText: '',
        socialLinks: {},
        quickLinks: [],
        policies: [],
      },
      seo: { title: 'KalaBazzar', description: 'Nepali Handicraft Marketplace' },
      updatedBy: (req as AuthRequest).user?._id || null,
    });
    settings = JSON.parse(JSON.stringify(created));
  }

  res.json(ApiResponse.success(settings, 'Homepage settings retrieved'));
});

export const updateHomepageSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const updates = req.body;

  const allowedFields = [
    'hero', 'featuredCategories', 'featuredCollections', 'featuredArtisans',
    'featuredProducts', 'artisanSpotlight', 'storySection', 'trustBadges',
    'newsletter', 'footer', 'seo',
  ];

  const filteredUpdates: Record<string, any> = {};
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      filteredUpdates[field] = updates[field];
    }
  }

  filteredUpdates.updatedBy = req.user._id;

  let settings = await HomepageSettings.findOne();

  if (settings) {
    const updated = await HomepageSettings.findByIdAndUpdate(
      settings._id,
      filteredUpdates,
      { new: true, runValidators: true }
    )
      .populate('featuredCategories', 'name slug image')
      .populate('featuredCollections', 'name slug image')
      .populate('featuredArtisans', 'storeName slug logo region')
      .populate('featuredProducts', 'name slug basePrice images');
    settings = updated;
  } else {
    settings = await HomepageSettings.create({
      ...filteredUpdates,
      updatedBy: req.user._id,
    });
  }

  res.json(ApiResponse.success(settings, 'Homepage settings updated'));
});

export const getFeaturedSellers = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 12 } = req.query;

  const sellers = await SellerProfile.find({ status: SellerStatus.APPROVED })
    .populate('user', 'firstName lastName avatar')
    .populate('region', 'name slug')
    .populate('crafts', 'name slug')
    .sort({ rating: -1, totalSales: -1 })
    .limit(Math.min(parseInt(limit as string) || 12, 50))
    .lean();

  res.json(ApiResponse.success(sellers, 'Featured sellers retrieved'));
});

export const getTestimonials = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 6 } = req.query;

  const reviews = await Review.find({ isApproved: true, rating: { $gte: 4 } })
    .populate('customer', 'firstName lastName avatar')
    .populate('product', 'name slug images')
    .sort({ helpfulCount: -1, rating: -1, createdAt: -1 })
    .limit(Math.min(parseInt(limit as string) || 6, 20))
    .lean();

  res.json(ApiResponse.success(reviews, 'Testimonials retrieved'));
});
