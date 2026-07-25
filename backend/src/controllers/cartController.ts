import { Request, Response } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { ApiError, asyncHandler } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';
import { ProductStatus } from '../config/constants';

export const getCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;

  let cart = await Cart.findOne({ customer: userId }).populate({
    path: 'items.product',
    select: 'name price images basePrice seller status slug',
    populate: { path: 'seller', select: 'firstName lastName' },
  });

  if (!cart) {
    cart = await Cart.create({ customer: userId, items: [] });
  }

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  res.json(
    ApiResponse.success(
      { cart: { ...cart.toObject(), subtotal, itemCount: totalItems } },
      'Cart fetched successfully'
    )
  );
});

export const addToCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const { productId, quantity = 1, selectedVariants = {} } = req.body;

  if (!productId) {
    throw ApiError.badRequest('Product ID is required');
  }

  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1) {
    throw ApiError.badRequest('Quantity must be a positive integer');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  if (product.status !== ProductStatus.APPROVED) {
    throw ApiError.badRequest('Product is not available for purchase');
  }

  const totalInventory = product.variants.length > 0
    ? product.variants.reduce((sum, v) => sum + v.inventory, 0)
    : product.variants.length;

  if (totalInventory <= 0 && product.variants.length > 0) {
    throw ApiError.badRequest('Product is out of stock');
  }

  const cart = await Cart.findOne({ customer: userId });
  const existingItem = cart?.items.find(
    (item) => item.product.toString() === productId
  );

  const newQty = existingItem ? existingItem.quantity + qty : qty;

  if (product.variants.length > 0 && newQty > totalInventory) {
    throw ApiError.badRequest(
      `Only ${totalInventory} items available in stock`
    );
  }

  const price = product.variants.length > 0 ? product.variants[0].price : product.basePrice;

  let updatedCart;

  if (existingItem) {
    updatedCart = await Cart.findOneAndUpdate(
      { customer: userId, 'items.product': productId },
      {
        $set: {
          'items.$.quantity': newQty,
          'items.$.price': price,
          'items.$.selectedVariants': selectedVariants,
        },
      },
      { new: true }
    );
  } else {
    updatedCart = await Cart.findOneAndUpdate(
      { customer: userId },
      {
        $push: {
          items: {
            product: productId,
            quantity: qty,
            price,
            selectedVariants,
            addedAt: new Date(),
          },
        },
      },
      { new: true, upsert: true }
    );
  }

  if (!updatedCart) {
    throw ApiError.internal('Failed to update cart');
  }

  await updatedCart.save();

  res.json(
    ApiResponse.success(
      { cart: updatedCart },
      'Item added to cart successfully'
    )
  );
});

export const updateCartItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!productId) {
    throw ApiError.badRequest('Product ID is required');
  }

  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 0) {
    throw ApiError.badRequest('Quantity must be a non-negative integer');
  }

  const cart = await Cart.findOne({ customer: userId });
  if (!cart) {
    throw ApiError.notFound('Cart not found');
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    throw ApiError.notFound('Item not found in cart');
  }

  if (qty === 0) {
    cart.items.splice(itemIndex, 1);
    await cart.save();

    return res.json(
      ApiResponse.success(
        { cart },
        'Item removed from cart'
      )
    );
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  const totalInventory = product.variants.length > 0
    ? product.variants.reduce((sum, v) => sum + v.inventory, 0)
    : 0;

  if (product.variants.length > 0 && qty > totalInventory) {
    throw ApiError.badRequest(
      `Only ${totalInventory} items available in stock`
    );
  }

  cart.items[itemIndex].quantity = qty;
  await cart.save();

  res.json(
    ApiResponse.success(
      { cart },
      'Cart updated successfully'
    )
  );
});

export const removeFromCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const { productId } = req.params;

  if (!productId) {
    throw ApiError.badRequest('Product ID is required');
  }

  const cart = await Cart.findOne({ customer: userId });
  if (!cart) {
    throw ApiError.notFound('Cart not found');
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    throw ApiError.notFound('Item not found in cart');
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();

  res.json(
    ApiResponse.success(
      { cart },
      'Item removed from cart'
    )
  );
});

export const clearCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;

  const cart = await Cart.findOne({ customer: userId });
  if (!cart) {
    throw ApiError.notFound('Cart not found');
  }

  cart.items = [];
  await cart.save();

  res.json(
    ApiResponse.success(
      { cart },
      'Cart cleared successfully'
    )
  );
});
