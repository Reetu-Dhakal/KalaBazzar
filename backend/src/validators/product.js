import { body } from 'express-validator';

export const productValidation = [
  body('name').trim().notEmpty().isLength({ max: 200 }).withMessage('Product name required (max 200 chars)'),
  body('description').notEmpty().isLength({ max: 10000 }).withMessage('Description required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('category').isMongoId().withMessage('Valid category ID required'),
  body('region').optional().isMongoId(),
  body('tags').optional().isArray(),
  body('materialsUsed').optional().isArray(),
  body('isCustomizable').optional().isBoolean(),
  body('madeToOrder').optional().isBoolean(),
  body('estimatedDeliveryDays').optional().isInt({ min: 1 }),
  body('comparePrice').optional().isFloat({ min: 0 }),
];
