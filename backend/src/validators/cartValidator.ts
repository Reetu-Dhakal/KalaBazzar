import { body, param, query } from 'express-validator';

export const addToCartValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID required'),
  body('quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be 1-100'),
  body('selectedVariants')
    .optional()
    .isObject(),
  body('customization')
    .optional()
    .isObject()
    .withMessage('Customization must be an object'),
  body('customization.note')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Customization note must be at most 1000 characters'),
  body('customization.designImage')
    .optional()
    .isString(),
];

export const updateCartItemValidation = [
  param('productId')
    .isMongoId()
    .withMessage('Invalid cart item ID'),
  body('quantity')
    .isInt({ min: 0, max: 100 })
    .withMessage('Quantity must be 0-100'),
];

export const cartItemIdValidation = [
  param('productId')
    .isMongoId()
    .withMessage('Invalid cart item ID'),
];

export const addToWishlistValidation = [
  body('product')
    .isMongoId()
    .withMessage('Valid product ID required'),
];

export const wishlistProductValidation = [
  param('productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
];

export const moveToCartValidation = [
  body('products')
    .isArray({ min: 1 })
    .withMessage('At least one product required'),
  body('products.*')
    .isMongoId()
    .withMessage('Valid product IDs required'),
];