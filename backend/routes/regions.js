const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const {
  getRegions,
  getRegionBySlug,
  getRegionById,
  createRegion,
  updateRegion,
  deleteRegion,
} = require('../controllers/regionController');

const { protect, authorize } = require('../middleware/auth');

const regionValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Region name is required')
    .isLength({ max: 50 })
    .withMessage('Region name cannot exceed 50 characters'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('image')
    .optional()
    .isObject()
    .withMessage('Image must be an object with public_id and url'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
];

const regionIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid region ID'),
];

const regionSlugValidation = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('Region slug is required'),
];

// Public routes
router.get('/', getRegions);
router.get('/slug/:slug', regionSlugValidation, getRegionBySlug);
router.get('/:id', regionIdValidation, getRegionById);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize('admin'));

router.post('/', regionValidation, createRegion);
router.put('/:id', [...regionIdValidation, ...regionValidation], updateRegion);
router.delete('/:id', regionIdValidation, deleteRegion);

module.exports = router;