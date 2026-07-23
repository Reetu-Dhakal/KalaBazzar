import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { paginate, paginationMeta } from '../utils/pagination.js';

export const createReview = asyncHandler(async (req, res) => {
  const { product: productId, rating, title, comment, images } = req.body;

  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound('Product not found');

  const existing = await Review.findOne({ product: productId, user: req.user._id });
  if (existing) throw ApiError.badRequest('You already reviewed this product');

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    rating,
    title,
    comment,
    images,
  });

  await Review.calculateAverageRating(productId);

  res.status(201).json(ApiResponse.created(review, 'Review submitted'));
});

export const getProductReviews = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);

  let productId = slug;
  if (!mongoose.Types.ObjectId.isValid(slug)) {
    const product = await Product.findOne({ slug });
    if (product) productId = product._id;
    else throw ApiError.notFound('Product not found');
  }

  const filter = { product: productId, status: 'approved' };

  const [reviews, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate('user', 'name avatar'),
    Review.countDocuments(filter),
  ]);

  res.json(ApiResponse.success({ reviews, pagination: paginationMeta(total, page, limit) }));
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw ApiError.notFound('Review not found');

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized');
  }

  const productId = review.product;
  await Review.findByIdAndDelete(req.params.id);
  await Review.calculateAverageRating(productId);

  res.json(ApiResponse.success(null, 'Review deleted'));
});

export const markHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw ApiError.notFound('Review not found');

  const userId = req.user._id.toString();
  const alreadyVoted = review.helpfulBy?.includes(userId);

  if (alreadyVoted) {
    review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    review.helpfulBy = review.helpfulBy.filter((id) => id.toString() !== userId);
  } else {
    review.helpfulCount = (review.helpfulCount || 0) + 1;
    if (!review.helpfulBy) review.helpfulBy = [];
    review.helpfulBy.push(req.user._id);
  }

  await review.save();
  res.json(ApiResponse.success({ helpfulCount: review.helpfulCount, helpful: !alreadyVoted }));
});
