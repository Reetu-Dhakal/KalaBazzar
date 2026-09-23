import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product';
import Review from '../models/Review';
import SellerProfile from '../models/SellerProfile';
import Category from '../models/Category';
import Craft from '../models/Craft';
import Region from '../models/Region';
import Collection from '../models/Collection';
import Cart from '../models/Cart';
import Wishlist from '../models/Wishlist';
import User from '../models/User';
import { notify, notifyAll } from '../services/notificationService';
import { ApiError, asyncHandler } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';
import { generateSlug, generateUniqueSlug } from '../utils/helpers';
import { getPaginationParams, getSortObject } from '../utils/pagination';
import { ProductStatus, SellerStatus } from '../config/constants';
const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  'price-asc': { basePrice: 1 },
  'price-desc': { basePrice: -1 },
  rating: { 'analytics.averageRating': -1 },
  popular: { 'analytics.purchases': -1, 'analytics.views': -1 },
  popularity: { 'analytics.purchases': -1, 'analytics.views': -1 },
  name_asc: { name: 1 },
  name_desc: { name: -1 },
};

const isMongoId = (value: unknown): value is string =>
  typeof value === 'string' && mongoose.isValidObjectId(value);

const resolveSlugId = async (
  Model: any,
  value: string,
): Promise<mongoose.Types.ObjectId | null | undefined> => {
  if (isMongoId(value)) return new mongoose.Types.ObjectId(value);
  const doc = await Model.findOne({ slug: value }, { _id: 1 }).lean();
  return doc ? (doc._id as mongoose.Types.ObjectId) : null;
};

const resolveCustomCategory = async (customCategory?: string) => {
  if (!customCategory || !customCategory.trim()) return undefined;
  const name = customCategory.trim();
  const existing = await Category.findOne({ name });
  if (existing) return existing._id;
  const slug = await generateUniqueSlug(generateSlug(name), async (s) => {
    const exists = await Category.findOne({ slug: s }, { _id: 1 });
    return !!exists;
  });
  const created = await Category.create({ name, slug, isActive: true });
  return created._id;
};

const resolveCustomCraft = async (customCraft?: string) => {
  if (!customCraft || !customCraft.trim()) return undefined;
  const name = customCraft.trim();
  const existing = await Craft.findOne({ name });
  if (existing) return existing._id;
  const slug = await generateUniqueSlug(generateSlug(name), async (s) => {
    const exists = await Craft.findOne({ slug: s }, { _id: 1 });
    return !!exists;
  });
  const created = await Craft.create({ name, slug, isActive: true });
  return created._id;
};

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPaginationParams(req);
  const { search, category, craft, region, seller, collection, minPrice, maxPrice, sort } = req.query;

  const [categoryId, craftId, regionId, sellerId, collectionId] = await Promise.all([
    category ? resolveSlugId(Category, category as string) : Promise.resolve(undefined),
    craft ? resolveSlugId(Craft, craft as string) : Promise.resolve(undefined),
    region ? resolveSlugId(Region, region as string) : Promise.resolve(undefined),
    seller ? resolveSlugId(SellerProfile, seller as string) : Promise.resolve(undefined),
    collection ? resolveSlugId(Collection, collection as string) : Promise.resolve(undefined),
  ]);

  if ([categoryId, craftId, regionId, sellerId, collectionId].some((id) => id === null)) {
    res.json(ApiResponse.paginated([], 'Products retrieved', page, limit, 0));
    return;
  }

  const filter: any = {
    isActive: { $ne: false },
    status: ProductStatus.APPROVED,
  };

  if (search) {
    filter.$text = { $search: search as string };
  }
  if (categoryId) {
    const subcategories = await Category.find({ ancestors: categoryId }).select('_id').lean();
    filter.category = { $in: [categoryId, ...subcategories.map((c: any) => c._id)] };
  }
  if (craftId) filter.craft = craftId;
  if (regionId) filter.region = regionId;
  if (sellerId) filter.seller = sellerId;
  if (collectionId) filter.collections = collectionId;
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

  const product = await Product.findOne({
    slug,
    isActive: { $ne: false },
    status: ProductStatus.APPROVED,
  })
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
    customCategory, customCraft,
  } = req.body;

  const hasCategory = category || (customCategory && customCategory.trim());
  const hasCraft = craft || (customCraft && customCraft.trim());

  if (!name || !description || !hasCategory || !hasCraft || !region) {
    throw ApiError.badRequest('Name, description, category, craft, and region are required');
  }

  const resolvedCategory = (await resolveCustomCategory(customCategory)) || category;
  const resolvedCraft = (await resolveCustomCraft(customCraft)) || craft;

  const baseSlug = generateSlug(name);
  const slug = await generateUniqueSlug(baseSlug, async (s) => {
    const exists = await Product.findOne({ slug: s });
    return !!exists;
  });

  let finalVariants = variants || [];
  if (req.body.images && Array.isArray(req.body.images) && req.body.images.length > 0) {
    if (finalVariants.length > 0) {
      finalVariants = finalVariants.map((v: any, i: number) =>
        i === 0 ? { ...v, images: req.body.images } : v
      );
    } else {
      finalVariants = [{ name: 'Default', price: basePrice || 0, inventory: 0, images: req.body.images }];
    }
  }

  const product = await Product.create({
    seller: req.user._id,
    name,
    slug,
    description,
    shortDescription,
    story,
    category: resolvedCategory,
    craft: resolvedCraft,
    region,
    variants: finalVariants,
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

  const admins = await User.find({ role: 'admin' }).select('_id').lean();
  await notifyAll(
    admins.map((admin: any) => admin._id),
    'product_under_review',
    'New product awaiting review',
    `"${product.name}" was submitted by a seller and is awaiting review.`,
    { relatedEntity: { type: 'product', id: product._id }, priority: 'normal' },
  );

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

  if (req.body.customCategory && req.body.customCategory.trim()) {
    const resolvedCategory = await resolveCustomCategory(req.body.customCategory);
    if (resolvedCategory) {
      updates.category = resolvedCategory;
    }
  }

  if (req.body.customCraft && req.body.customCraft.trim()) {
    const resolvedCraft = await resolveCustomCraft(req.body.customCraft);
    if (resolvedCraft) {
      updates.craft = resolvedCraft;
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

  const lowStockVariants = (updated?.variants || []).filter((v: any) => v.inventory <= 5);
  if (lowStockVariants.length > 0) {
    await notify(
      req.user._id,
      'low_stock',
      `${updated!.name} is running low on stock`,
      `Only ${lowStockVariants.map((v: any) => v.inventory).join(', ')} units left. Consider restocking.`,
      { relatedEntity: { type: 'product', id: updated!._id }, priority: 'normal' },
    );
  }

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

  await Promise.all([
    Product.findByIdAndDelete(id),
    Cart.updateMany({ 'items.product': id }, { $pull: { items: { product: id } } }),
    Wishlist.updateMany({ 'items.product': id }, { $pull: { items: { product: id } } }),
    Collection.updateMany({ products: id }, { $pull: { products: id } }),
    Review.deleteMany({ product: id }),
  ]);

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

  const admins = await User.find({ role: 'admin' }).select('_id').lean();
  await notifyAll(
    admins.map((admin: any) => admin._id),
    'product_under_review',
    'Product published for review',
    `"${product.name}" was published by a seller.`,
    { relatedEntity: { type: 'product', id: product._id }, priority: 'normal' },
  );

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

  await notify(
    product.seller,
    'review_received',
    'You received a new review',
    `Your product "${product.name}" received a ${rating}-star review from ${req.user.firstName}.`,
    { relatedEntity: { type: 'review', id: review._id }, priority: 'normal' },
  );

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
