const { body, param, query } = require('express-validator');

const regionValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Region name is required')
      .isLength({ max: 50 })
      .withMessage('Region name cannot exceed 50 characters'),
    body('imageUrl')
      .optional()
      .isURL()
      .withMessage('Image URL must be a valid URL'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    body('order')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Order must be a non-negative integer'),
  ],

  update: [
    param('id').isMongoId().withMessage('Invalid region ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Region name cannot exceed 50 characters'),
    body('imageUrl')
      .optional()
      .isURL()
      .withMessage('Image URL must be a valid URL'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    body('order')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Order must be a non-negative integer'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
  ],

  getById: [
    param('id').isMongoId().withMessage('Invalid region ID'),
  ],

  getBySlug: [
    param('slug').trim().notEmpty().withMessage('Region slug is required'),
  ],
};

module.exports = regionValidation;