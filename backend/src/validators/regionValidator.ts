import { body, param, query } from 'express-validator';

export const regionValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Region name 2-100 characters'),
  body('slug')
    .trim()
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug: lowercase, numbers, hyphens'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }),
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 300 }),
  body('image')
    .optional()
    .isURL(),
  body('mapImage')
    .optional()
    .isURL(),
  body('crafts')
    .optional()
    .isArray(),
  body('crafts.*')
    .optional()
    .isMongoId(),
  body('districts')
    .optional()
    .isArray(),
  body('districts.*')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('province')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('isActive')
    .optional()
    .isBoolean(),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 }),
];

export const regionIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid region ID'),
];

export const regionSlugValidation = [
  param('slug')
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Invalid region slug'),
];

export const regionQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }),
  query('province')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  query('isActive')
    .optional()
    .isBoolean(),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }),
];