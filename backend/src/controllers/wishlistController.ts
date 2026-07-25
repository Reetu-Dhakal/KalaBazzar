import { Response } from 'express';
import Wishlist from '../models/Wishlist';
import Product from '../models/Product';
import { ApiError, asyncHandler } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';

const POPULATE_OPTIONS = {
  path: 'items.product',
  select: 'name price basePrice images variants stock status slug seller',
  populate: { path: 'seller', select: 'firstName lastName' },
};

export const getWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;

  let wishlist = await Wishlist.findOne({ customer: userId }).populate(POPULATE_OPTIONS);

  if (!wishlist) {
    wishlist = await Wishlist.create({ customer: userId, items: [] });
  }

  res.json(
    ApiResponse.success(
      { wishlist },
      'Wishlist fetched successfully'
    )
  );
});

export const addToWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const { productId } = req.body;

  if (!productId) {
    throw ApiError.badRequest('Product ID is required');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  const wishlist = await Wishlist.findOneAndUpdate(
    { customer: userId },
    {
      $addToSet: {
        items: { product: productId, addedAt: new Date() },
      },
    },
    { new: true, upsert: true }
  ).populate(POPULATE_OPTIONS);

  await Product.findByIdAndUpdate(productId, {
    $inc: { 'analytics.wishlistCount': 1 },
  });

  res.json(
    ApiResponse.success(
      { wishlist },
      'Product added to wishlist'
    )
  );
});

export const removeFromWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const { productId } = req.params;

  if (!productId) {
    throw ApiError.badRequest('Product ID is required');
  }

  const wishlist = await Wishlist.findOne({ customer: userId });
  if (!wishlist) {
    throw ApiError.notFound('Wishlist not found');
  }

  const itemExists = wishlist.items.some(
    (item) => item.product.toString() === productId
  );

  if (!itemExists) {
    throw ApiError.notFound('Product not found in wishlist');
  }

  await Wishlist.findOneAndUpdate(
    { customer: userId },
    { $pull: { items: { product: productId } } },
    { new: true }
  );

  await Product.findByIdAndUpdate(productId, {
    $inc: { 'analytics.wishlistCount': -1 },
  });

  const updatedWishlist = await Wishlist.findOne({ customer: userId }).populate(POPULATE_OPTIONS);

  res.json(
    ApiResponse.success(
      { wishlist: updatedWishlist },
      'Product removed from wishlist'
    )
  );
});

export const checkWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const { productId } = req.params;

  if (!productId) {
    throw ApiError.badRequest('Product ID is required');
  }

  const wishlist = await Wishlist.findOne({ customer: userId });

  const isInWishlist = wishlist
    ? wishlist.items.some((item) => item.product.toString() === productId)
    : false;

  res.json(
    ApiResponse.success(
      { isInWishlist },
      'Wishlist status checked'
    )
  );
});

export const clearWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;

  const wishlist = await Wishlist.findOne({ customer: userId });
  if (!wishlist) {
    throw ApiError.notFound('Wishlist not found');
  }

  if (wishlist.items.length === 0) {
    return res.json(
      ApiResponse.success(
        { wishlist },
        'Wishlist is already empty'
      )
    );
  }

  const productIds = wishlist.items.map((item) => item.product);

  await Product.updateMany(
    { _id: { $in: productIds } },
    { $inc: { 'analytics.wishlistCount': -1 } }
  );

  wishlist.items = [];
  await wishlist.save();

  res.json(
    ApiResponse.success(
      { wishlist },
      'Wishlist cleared successfully'
    )
  );
});
