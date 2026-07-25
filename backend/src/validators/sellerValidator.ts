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
  body('crafts')
    .isArray({ min: 1 })
    .withMessage('At least one craft required'),
  body('crafts.*')
    .isMongoId()
    .withMessage('Valid craft IDs required'),
  body('verificationPath')
    .isIn(['social', 'marketplace', 'offline'])
    .withMessage('Invalid verification path'),
  body('verificationDocuments')
    .isObject()
    .withMessage('Verification documents required'),
  body('verificationDocuments.workshopPhotos')
    .isArray({ min: 3, max: 10 })
    .withMessage('3-10 workshop photos required'),
  body('verificationDocuments.makingVideo')
    .optional()
    .isURL()
    .withMessage('Valid video URL required'),
  body('verificationDocuments.craftStory')
    .trim()
    .isLength({ min: 100, max: 5000 })
    .withMessage('Craft story must be 100-5000 characters'),
  body('verificationDocuments.district')
    .trim()
    .notEmpty()
    .withMessage('District required'),
  body('verificationDocuments.yearsOfExperience')
    .isInt({ min: 0, max: 100 })
    .withMessage('Years of experience 0-100'),
  body('verificationDocuments.specialization')
    .isArray({ min: 1 })
    .withMessage('At least one specialization required'),
  body('verificationDocuments.idDocument')
    .optional()
    .isURL()
    .withMessage('Valid ID document URL'),
  body('verificationDocuments.panDocument')
    .optional()
    .isURL()
    .withMessage('Valid PAN document URL'),
  body('verificationDocuments.vatDocument')
    .optional()
    .isURL()
    .withMessage('Valid VAT document URL'),
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