import { body, param, query } from 'express-validator';

export const sellerApplicationValidation = [
  body('storeName')
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('Store name must be 3-150 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description max 2000 characters'),
  body('region')
    .isMongoId()
    .withMessage('Valid region ID required'),
  body('craftType')
    .isArray({ min: 1 })
    .withMessage('At least one craft required'),
  body('craftType.*')
    .isMongoId()
    .withMessage('Valid craft IDs required'),
  body('verificationPath')
    .isIn(['social-media', 'marketplace', 'offline-artisan'])
    .withMessage('Invalid verification path'),
  body('district')
    .trim()
    .notEmpty()
    .withMessage('District required'),
  body('yearsOfExperience')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Years of experience 0-100'),
  body('specialization')
    .optional()
    .isArray()
    .withMessage('Specialization must be an array'),
  body('specialization.*')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Specialization entries can not be empty'),
  body('socialMediaLinks')
    .optional()
    .isObject()
    .withMessage('Social media links must be an object'),
  body('socialMediaLinks.*')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Social media link values can not be empty'),
  body('workshopPhotos')
    .optional()
    .isArray({ min: 1, max: 10 })
    .withMessage('1-10 workshop photos required'),
  body('workshopPhotos.*')
    .optional()
    .isURL()
    .withMessage('Workshop photos must be valid URLs'),
  body('craftStory')
    .optional()
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Craft story must be 20-5000 characters'),
];

export const updateSellerProfileValidation = [
  body('storeName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('Store name must be 3-150 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description max 2000 characters'),
  body('logo')
    .optional()
    .isURL()
    .withMessage('Valid logo URL required'),
  body('coverImage')
    .optional()
    .isURL()
    .withMessage('Valid cover image URL required'),
  body('region')
    .optional()
    .isMongoId()
    .withMessage('Valid region ID required'),
  body('crafts')
    .optional()
    .isArray(),
  body('crafts.*')
    .optional()
    .isMongoId()
    .withMessage('Valid craft IDs required'),
  body('socialLinks')
    .optional()
    .isObject(),
  body('socialLinks.facebook')
    .optional()
    .isURL()
    .withMessage('Valid Facebook URL'),
  body('socialLinks.instagram')
    .optional()
    .isURL()
    .withMessage('Valid Instagram URL'),
  body('socialLinks.tiktok')
    .optional()
    .isURL()
    .withMessage('Valid TikTok URL'),
  body('socialLinks.youtube')
    .optional()
    .isURL()
    .withMessage('Valid YouTube URL'),
  body('socialLinks.website')
    .optional()
    .isURL()
    .withMessage('Valid website URL'),
  body('policies.returnPolicy')
    .optional()
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Return policy max 3000 characters'),
  body('policies.shippingPolicy')
    .optional()
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Shipping policy max 3000 characters'),
  body('policies.customOrderPolicy')
    .optional()
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Custom order policy max 3000 characters'),
];

export const payoutValidation = [
  body('bankName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Bank name required'),
  body('accountNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Account number required'),
  body('accountHolderName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Account holder name required'),
  body('branch')
    .optional()
    .trim(),
  body('swiftCode')
    .optional()
    .trim()
    .isLength({ min: 8, max: 11 })
    .withMessage('Invalid SWIFT code'),
  body('panNumber')
    .optional()
    .trim()
    .toUpperCase()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/)
    .withMessage('Invalid PAN format (e.g., ABCDE1234F)'),
  body('vatNumber')
    .optional()
    .trim()
    .toUpperCase()
    .matches(/^\d{9}$/)
    .withMessage('Invalid VAT format (9 digits)'),
  body('khaltiId')
    .optional()
    .trim(),
  body('esewaId')
    .optional()
    .trim(),
  body('imePayId')
    .optional()
    .trim(),
];

export const sellerIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid seller ID'),
];

export const sellerSlugValidation = [
  param('slug')
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Invalid seller slug'),
];

export const sellerQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }),
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'suspended']),
  query('region')
    .optional()
    .isMongoId(),
  query('craft')
    .optional()
    .isMongoId(),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  query('sort')
    .optional()
    .isIn(['newest', 'oldest', 'rating', 'sales', 'name']),
];

export const adminSellerActionValidation = [
  body('action')
    .isIn(['approve', 'reject', 'request_more_info'])
    .withMessage('Invalid action'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes max 1000 characters'),
];

export const sellerProductQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }),
  query('status')
    .optional()
    .isIn(['draft', 'pending_review', 'approved', 'rejected', 'out_of_stock']),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }),
];