import { Request, Response, NextFunction } from 'express';
import Review from '../models/Review';
import Product from '../models/Product';
import Order from '../models/Order';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/ApiError';
import { getPaginationParams } from '../utils/pagination';
import { AuthRequest } from '../middleware/auth';

export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const productId = req.params.productId || req.body.productId;
  const { orderId, rating, title, comment, pros, cons } = req.body;

  if (!productId || !orderId || !rating || !comment) {
    throw ApiError.badRequest('Product ID, order ID, rating, and comment are required');
  }

  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    throw ApiError.badRequest('Rating must be an integer between 1 and 5');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (order.customer.toString() !== userId.toString()) {
    throw ApiError.forbidden('You can only review products from your own orders');
  }

  const hasProduct = order.items.some(
    (item) => item.product.toString() === productId
  );
  if (!hasProduct) {
    throw ApiError.badRequest('This order does not contain the specified product');
  }

  const existingReview = await Review.findOne({ product: productId, customer: userId });
  if (existingReview) {
    throw ApiError.conflict('You have already reviewed this product');
  }

  const review = await Review.create({
    product: productId,
    customer: userId,
    order: orderId,
    rating: ratingNum,
    title,
    comment,
    pros,
    cons,
    isVerifiedPurchase: true,
  });

  await Review.calculateAverageRating(productId);

  res.status(201).json(
    ApiResponse.created(review, 'Review created successfully')
  );
});

export const getPublicReviews = asyncHandler(async (req: Request, res: Response) => {
  const sort = req.query.sort as string || '-createdAt';
  const limit = parseInt(req.query.limit as string) || 10;

  const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
  const sortOrder = sort.startsWith('-') ? -1 : 1;

  const reviews = await Review.find({ isApproved: true })
    .sort({ [sortField]: sortOrder })
    .limit(limit)
    .populate('customer', 'firstName lastName')
    .populate('product', 'name slug')
    .lean();

  res.json(ApiResponse.success(reviews, 'Reviews retrieved successfully'));
});

export const getProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req);

  const filter: any = { product: productId, isApproved: true };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .populate('customer', 'firstName lastName')
      .lean(),
    Review.countDocuments(filter),
  ]);

  res.json(
    ApiResponse.paginated(reviews, 'Reviews retrieved successfully', page, limit, total)
  );
});

export const getMyReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req);

  const filter: any = { customer: userId };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .populate('product', 'name slug images')
      .lean(),
    Review.countDocuments(filter),
  ]);

  res.json(
    ApiResponse.paginated(reviews, 'Reviews retrieved successfully', page, limit, total)
  );
});

export const updateReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const { id } = req.params;
  const { rating, title, comment, pros, cons } = req.body;

  const review = await Review.findById(id);
  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  if (review.customer.toString() !== userId.toString()) {
    throw ApiError.forbidden('You can only update your own reviews');
  }

  if (rating !== undefined) {
    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      throw ApiError.badRequest('Rating must be an integer between 1 and 5');
    }
    review.rating = ratingNum;
  }

  if (title !== undefined) review.title = title;
  if (comment !== undefined) review.comment = comment;
  if (pros !== undefined) review.pros = pros;
  if (cons !== undefined) review.cons = cons;

  await review.save();

  await Review.calculateAverageRating(review.product);

  res.json(
    ApiResponse.success(review, 'Review updated successfully')
  );
});

export const deleteReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const { id } = req.params;

  const review = await Review.findById(id);
  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  if (review.customer.toString() !== userId.toString()) {
    throw ApiError.forbidden('You can only delete your own reviews');
  }

  const productId = review.product;
  await Review.findByIdAndDelete(id);

  await Review.calculateAverageRating(productId);

  res.json(
    ApiResponse.success(null, 'Review deleted successfully')
  );
});

export const voteReviewHelpful = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const { id } = req.params;

  const review = await Review.findById(id);
  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  if (review.customer.toString() === userId.toString()) {
    throw ApiError.badRequest('You cannot vote on your own review');
  }

  const hasVoted = review.helpfulBy.some(
    (voterId) => voterId.toString() === userId.toString()
  );

  if (hasVoted) {
    review.helpfulBy = review.helpfulBy.filter(
      (voterId) => voterId.toString() !== userId.toString()
    ) as any[];
    review.helpfulCount = Math.max(0, review.helpfulCount - 1);
  } else {
    review.helpfulBy.push(userId);
    review.helpfulCount += 1;
  }

  await review.save();

  res.json(
    ApiResponse.success(
      { helpfulCount: review.helpfulCount, hasVoted: !hasVoted },
      hasVoted ? 'Helpful vote removed' : 'Marked as helpful'
    )
  );
});

export const getAdminReviews = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(req);

  const filter: any = {};

  if (req.query.search) {
    const search = req.query.search as string;
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { comment: { $regex: search, $options: 'i' } },
    ];
  }

  if (req.query.rating) {
    filter.rating = Number(req.query.rating);
  }

  if (req.query.isApproved !== undefined) {
    filter.isApproved = req.query.isApproved === 'true';
  }

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .populate('customer', 'firstName lastName email')
      .populate('product', 'name slug')
      .lean(),
    Review.countDocuments(filter),
  ]);

  res.json(
    ApiResponse.paginated(reviews, 'Reviews retrieved successfully', page, limit, total)
  );
});

export const deleteAdminReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const review = await Review.findById(id);
  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  const productId = review.product;
  await Review.findByIdAndDelete(id);

  await Review.calculateAverageRating(productId);

  res.json(
    ApiResponse.success(null, 'Review deleted successfully')
  );
});
