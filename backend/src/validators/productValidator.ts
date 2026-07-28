import { body, param, query } from 'express-validator';

export const productValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Product name must be 3-200 characters'),
  body('slug')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug: lowercase letters, numbers, hyphens only'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be 10-5000 characters'),
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Short description max 300 characters'),
  body('story')
    .optional()
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Story max 3000 characters'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Valid category required'),
  body('craft')
    .optional()
    .isMongoId()
    .withMessage('Valid craft required'),
  body('region')
    .optional()
    .isMongoId()
    .withMessage('Valid region required'),
  body('collections')
    .optional()
    .isArray()
    .withMessage('Collections must be array'),
  body('collections.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid collection ID'),
  body('variants')
    .optional()
    .isArray()
    .withMessage('Variants must be array'),
  body('variants.*.name')
    .if(body('variants').exists())
    .trim()
    .notEmpty()
    .withMessage('Variant name required'),
  body('variants.*.price')
    .if(body('variants').exists())
    .isFloat({ min: 0 })
    .withMessage('Variant price must be positive'),
  body('variants.*.inventory')
    .if(body('variants').exists())
    .isInt({ min: 0 })
    .withMessage('Variant inventory must be non-negative'),
  body('basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price required and must be positive'),
  body('compareAtPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Compare at price must be positive'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be array'),
  body('tags.*')
    .optional()
    .trim()
    .toLowerCase()
    .isLength({ max: 50 })
    .withMessage('Tag max 50 characters'),
  body('materials')
    .optional()
    .isArray()
    .withMessage('Materials must be array'),
  body('materials.*')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('dimensions.length')
    .optional()
    .isFloat({ min: 0 }),
  body('dimensions.width')
    .optional()
    .isFloat({ min: 0 }),
  body('dimensions.height')
    .optional()
    .isFloat({ min: 0 }),
  body('dimensions.weight')
    .optional()
    .isFloat({ min: 0 }),
  body('dimensions.unit')
    .optional()
    .isIn(['cm', 'mm', 'in', 'ft']),
  body('careInstructions')
    .optional()
    .trim()
    .isLength({ max: 1000 }),
  body('isCustomizable')
    .optional()
    .isBoolean(),
  body('customOptions')
    .optional()
    .isArray(),
  body('customOptions.*.name')
    .optional()
    .trim()
    .notEmpty(),
  body('customOptions.*.type')
    .optional()
    .isIn(['text', 'select', 'checkbox']),
  body('customOptions.*.options')
    .optional()
    .isArray(),
  body('customOptions.*.required')
    .optional()
    .isBoolean(),
  body('customOptions.*.priceAdjustment')
    .optional()
    .isFloat(),
  body('shippingClass')
    .optional()
    .isIn(['standard', 'fragile', 'oversized', 'custom']),
  body('processingTime')
    .optional()
    .isInt({ min: 0, max: 30 })
    .withMessage('Processing time 0-30 days'),
];

export const productIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
];

export const productSlugValidation = [
  param('slug')
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Invalid product slug'),
];

export const productQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }),
  query('category')
    .optional()
    .isMongoId(),
  query('craft')
    .optional()
    .isMongoId(),
  query('region')
    .optional()
    .isMongoId(),
  query('seller')
    .optional()
    .isMongoId(),
  query('collection')
    .optional()
    .isMongoId(),
  query('status')
    .optional()
    .isIn(['draft', 'pending_review', 'approved', 'rejected', 'out_of_stock']),
  query('isFeatured')
    .optional()
    .isBoolean(),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 }),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 }),
  query('minRating')
    .optional()
    .isFloat({ min: 0, max: 5 }),
  query('tags')
    .optional()
    .trim(),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  query('sort')
    .optional()
    .isIn(['newest', 'oldest', 'price_asc', 'price_desc', 'rating', 'popularity', 'name_asc', 'name_desc']),
  query('inStock')
    .optional()
    .isBoolean(),
];

export const productStatusValidation = [
  body('status')
    .isIn(['draft', 'pending_review', 'approved', 'rejected', 'out_of_stock'])
    .withMessage('Invalid status'),
  body('rejectionReason')
    .if(body('status').equals('rejected'))
    .trim()
    .notEmpty()
    .withMessage('Rejection reason required'),
];

export const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be 1-5'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title max 200 characters'),
  body('comment')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Comment must be 10-2000 characters'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be array'),
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Valid image URLs required'),
];