import Wishlist from '../models/Wishlist.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

export const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('items.product');
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, items: [] });
  }
  res.json(ApiResponse.success(wishlist));
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, items: [] });
  }

  const exists = wishlist.items.some((i) => i.product.toString() === productId);
  if (!exists) {
    wishlist.items.push({ product: productId });
    await wishlist.save();
  }

  await wishlist.populate('items.product');
  res.json(ApiResponse.success(wishlist, 'Added to wishlist'));
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (wishlist) {
    wishlist.items = wishlist.items.filter((i) => i.product.toString() !== req.params.productId);
    await wishlist.save();
  }
  res.json(ApiResponse.success(null, 'Removed from wishlist'));
});

export const clearWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (wishlist) {
    wishlist.items = [];
    await wishlist.save();
  }
  res.json(ApiResponse.success(null, 'Wishlist cleared'));
});

export const moveAllToCart = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist || wishlist.items.length === 0) {
    throw new ApiError(400, 'Wishlist is empty');
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  for (const item of wishlist.items) {
    const product = await Product.findById(item.product);
    if (product && product.isPublished && product.stock > 0) {
      const existing = cart.items.find((i) => i.product.toString() === product._id.toString());
      if (existing) {
        existing.quantity = Math.min(existing.quantity + 1, product.stock);
      } else {
        cart.items.push({ product: product._id, quantity: 1, price: product.price });
      }
    }
  }

  await cart.save();
  wishlist.items = [];
  await wishlist.save();

  res.json(ApiResponse.success(null, 'All items moved to cart'));
});
