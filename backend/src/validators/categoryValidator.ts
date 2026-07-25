import { body, param, query } from 'express-validator';

export const categoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be 2-100 characters'),
  body('slug')
    .trim()
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description max 1000 characters'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Valid image URL required'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 }),
  body('parent')
    .optional()
    .isMongoId()
    .withMessage('Valid parent category ID'),
  body('isActive')
    .optional()
    .isBoolean(),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be non-negative'),
  body('seo.title')
    .optional()
    .trim()
    .isLength({ max: 60 }),
  body('seo.description')
    .optional()
    .trim()
    .isLength({ max: 160 }),
];

export const categoryIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid category ID'),
];

export const categorySlugValidation = [
  param('slug')
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Invalid category slug'),
];

export const categoryQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }),
  query('parent')
    .optional()
    .isMongoId(),
  query('isActive')
    .optional()
    .isBoolean(),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }),
];