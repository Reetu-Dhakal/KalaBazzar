import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product';
import Review from '../models/Review';
import SellerProfile from '../models/SellerProfile';
import { ApiError, asyncHandler } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';
import { generateSlug, generateUniqueSlug } from '../utils/helpers';
import { getPaginationParams, getSortObject } from '../utils/pagination';
import { ProductStatus, SellerStatus } from '../config/constants';

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  'price-asc': { basePrice: 1 },
  'price-desc': { basePrice: -1 },
  rating: { 'analytics.averageRating': -1 },
  popular: { 'analytics.purchases': -1, 'analytics.views': -1 },
};

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPaginationParams(req);
  const { search, category, craft, region, seller, minPrice, maxPrice, sort } = req.query;

  const filter: any = { isActive: { $ne: false } };

  if (search) {
    filter.$text = { $search: search as string };
  }
  if (category) filter.category = category;
  if (craft) filter.craft = craft;
  if (region) filter.region = region;
  if (seller) filter.seller = seller;
  if (minPrice || maxPrice) {
    filter.basePrice = {};
    if (minPrice) filter.basePrice.$gte = parseFloat(minPrice as string);
    if (maxPrice) filter.basePrice.$lte = parseFloat(maxPrice as string);
  }

  const sortObj = (sort && SORT_MAP[sort as string]) || getSortObject('createdAt', 'desc');

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .populate('seller', 'storeName slug logo')
      .populate('category', 'name slug')
      .populate('craft', 'name slug')
      .populate('region', 'name slug')
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.json(ApiResponse.paginated(products, 'Products retrieved', page, limit, total));
});

export const getFeaturedProducts = asyncHandler(async (req: Request, res: Response) => {
  const products = await Product.find({
    isFeatured: true,
    status: ProductStatus.APPROVED,
    isActive: { $ne: false },
  })
    .limit(12)
    .populate('seller', 'storeName slug logo')
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .lean();

  res.json(ApiResponse.success(products, 'Featured products retrieved'));
});

export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const product = await Product.findOne({ slug, isActive: { $ne: false } })
    .populate('seller', 'storeName slug logo region description')
    .populate('category', 'name slug')
    .populate('craft', 'name slug')
    .populate('region', 'name slug');

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  await Product.findByIdAndUpdate(
    product._id,
    { $inc: { 'analytics.views': 1 } }
  );

  const relatedProducts = await Product.find({
    category: product.category._id,
    _id: { $ne: product._id },
    status: ProductStatus.APPROVED,
    isActive: { $ne: false },
  })
    .limit(8)
    .populate('seller', 'storeName slug logo')
    .sort({ 'analytics.averageRating': -1, createdAt: -1 })
    .lean();

  res.json(ApiResponse.success({ product, relatedProducts }, 'Product retrieved'));
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid product ID');
  }

  const product = await Product.findById(id)
    .populate('seller', 'storeName slug logo region')
    .populate('category', 'name slug')
    .populate('craft', 'name slug')
    .populate('region', 'name slug');

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  res.json(ApiResponse.success({ product }, 'Product retrieved'));
});

export const createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sellerProfile = await SellerProfile.findOne({
    user: req.user._id,
    status: SellerStatus.APPROVED,
  });

  if (!sellerProfile) {
    throw ApiError.forbidden('Only approved sellers can create products');
  }

  const {
    name, description, shortDescription, story, category, craft, region,
    variants, basePrice, compareAtPrice, tags, materials, dimensions,
    careInstructions, isHandmade, isCustomizable, customOptions,
    shippingClass, processingTime, seo, collections, isFeatured,
  } = req.body;

  if (!name || !description || !category || !craft || !region) {
    throw ApiError.badRequest('Name, description, category, craft, and region are required');
  }

  const baseSlug = generateSlug(name);
  const slug = await generateUniqueSlug(baseSlug, async (s) => {
    const exists = await Product.findOne({ slug: s });
    return !!exists;
  });

  const product = await Product.create({
    seller: req.user._id,
    name,
    slug,
    description,
    shortDescription,
    story,
    category,
    craft,
    region,
    variants: variants || [],
    basePrice: basePrice || 0,
    compareAtPrice,
    tags: tags || [],
    materials: materials || [],
    dimensions,
    careInstructions,
    isHandmade: isHandmade !== false,
    isCustomizable: isCustomizable || false,
    customOptions: customOptions || [],
    shippingClass: shippingClass || 'standard',
    processingTime: processingTime || 1,
    seo: seo || {},
    collections: collections || [],
    isFeatured: isFeatured || false,
    status: ProductStatus.DRAFT,
  });

  res.status(201).json(ApiResponse.created(product, 'Product created successfully'));
});

export const updateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid product ID');
  }

  const product = await Product.findById(id);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  if (product.seller.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You can only update your own products');
  }

  const allowedFields = [
    'name', 'description', 'shortDescription', 'story', 'category', 'craft',
    'region', 'variants', 'basePrice', 'compareAtPrice', 'costPrice', 'tags',
    'materials', 'dimensions', 'careInstructions', 'isHandmade', 'isCustomizable',
    'customOptions', 'shippingClass', 'processingTime', 'seo', 'collections',
    'isFeatured', 'status',
  ];

  const updates: Record<string, any> = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (req.body.images && Array.isArray(req.body.images)) {
    if (updates.variants && updates.variants.length > 0) {
      updates.variants[0].images = req.body.images;
    } else if (product.variants.length > 0) {
      updates.variants = product.variants.map((v, i) =>
        i === 0 ? { ...v, images: req.body.images } : v
      );
    }
  }

  if (updates.name && updates.name !== product.name) {
    const baseSlug = generateSlug(updates.name);
    updates.slug = await generateUniqueSlug(baseSlug, async (s) => {
      const exists = await Product.findOne({ slug: s, _id: { $ne: product._id } });
      return !!exists;
    });
  }

  const updated = await Product.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  res.json(ApiResponse.success(updated, 'Product updated successfully'));
});

export const deleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid product ID');
  }

  const product = await Product.findById(id);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  if (product.seller.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You can only delete your own products');
  }

  await Product.findByIdAndUpdate(id, { isActive: false });

  res.json(ApiResponse.success(null, 'Product deleted successfully'));
});

export const publishProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid product ID');
  }

  const product = await Product.findById(id);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  if (product.seller.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You can only publish your own products');
  }

  if (product.status === ProductStatus.APPROVED) {
    throw ApiError.badRequest('Product is already published');
  }

  product.status = ProductStatus.APPROVED;
  product.publishedAt = new Date();
  await product.save();

  res.json(ApiResponse.success(product, 'Product published successfully'));
});

export const unpublishProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid product ID');
  }

  const product = await Product.findById(id);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  if (product.seller.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You can only unpublish your own products');
  }

  product.status = ProductStatus.DRAFT;
  await product.save();

  res.json(ApiResponse.success(product, 'Product unpublished successfully'));
});

export const addProductReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id: productId } = req.params;
  const { rating, comment, title, order } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw ApiError.badRequest('Invalid product ID');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  if (!rating || !comment) {
    throw ApiError.badRequest('Rating and comment are required');
  }

  if (rating < 1 || rating > 5) {
    throw ApiError.badRequest('Rating must be between 1 and 5');
  }

  const existingReview = await Review.findOne({
    product: productId,
    customer: req.user._id,
  });

  if (existingReview) {
    throw ApiError.conflict('You have already reviewed this product');
  }

  const review = await Review.create({
    product: productId,
    customer: req.user._id,
    order: order || undefined,
    rating,
    title,
    comment,
  });

  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), isApproved: true } },
    {
      $group: {
        _id: null,
        average: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      'analytics.averageRating': Math.round(stats[0].average * 10) / 10,
      'analytics.reviewCount': stats[0].count,
    });
  }

  res.status(201).json(ApiResponse.created(review, 'Review added successfully'));
});

export const getProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const { id: productId } = req.params;
  const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req);

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw ApiError.badRequest('Invalid product ID');
  }

  const filter = { product: productId, isApproved: true };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('customer', 'firstName lastName avatar')
      .sort(getSortObject(sortBy, sortOrder))
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
  ]);

  res.json(ApiResponse.paginated(reviews, 'Reviews retrieved', page, limit, total));
});

export const voteReviewHelpful = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id: reviewId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw ApiError.badRequest('Invalid review ID');
  }

  const review = await Review.findById(reviewId);
  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  const userId = req.user._id;
  const helpfulBy = (review as any).helpfulBy || [];
  const hasVoted = helpfulBy.some((id: mongoose.Types.ObjectId) => id.toString() === userId.toString());

  if (hasVoted) {
    (review as any).helpfulBy = helpfulBy.filter((id: mongoose.Types.ObjectId) => id.toString() !== userId.toString());
    review.helpfulCount = Math.max(0, review.helpfulCount - 1);
  } else {
    helpfulBy.push(userId);
    (review as any).helpfulBy = helpfulBy;
    review.helpfulCount += 1;
  }

  await review.save();

  res.json(
    ApiResponse.success(
      { helpfulCount: review.helpfulCount, hasVoted: !hasVoted },
      hasVoted ? 'Vote removed' : 'Marked as helpful',
    ),
  );
});

export const incrementViewCount = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid product ID');
  }

  const product = await Product.findByIdAndUpdate(
    id,
    { $inc: { 'analytics.views': 1 } },
    { new: true },
  );

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  res.json(ApiResponse.success({ views: product.analytics.views }, 'View count incremented'));
});
