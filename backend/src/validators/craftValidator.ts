import { body, param, query } from 'express-validator';

export const craftValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Craft name must be 2-100 characters'),
  body('slug')
    .trim()
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug: lowercase letters, numbers, hyphens only'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description max 2000 characters'),
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Short description max 300 characters'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Valid image URL'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 }),
  body('region')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Region must be a valid string'),
  body('techniques')
    .optional()
    .isArray(),
  body('techniques.*')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('materials')
    .optional()
    .isArray(),
  body('materials.*')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('history')
    .optional()
    .trim()
    .isLength({ max: 3000 }),
  body('culturalSignificance')
    .optional()
    .trim()
    .isLength({ max: 3000 }),
  body('isActive')
    .optional()
    .isBoolean(),
  body('isFeatured')
    .optional()
    .isBoolean(),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 }),
];

export const craftIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid craft ID'),
];

export const craftSlugValidation = [
  param('slug')
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Invalid craft slug'),
];

export const craftQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }),
  query('region')
    .optional()
    .isMongoId(),
  query('isActive')
    .optional()
    .isBoolean(),
  query('isFeatured')
    .optional()
    .isBoolean(),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }),
];