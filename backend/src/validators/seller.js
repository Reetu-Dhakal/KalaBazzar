import { body } from 'express-validator';

export const sellerApplicationValidation = [
  body('district').notEmpty().withMessage('District is required'),
  body('verificationPath').isIn(['social', 'marketplace', 'new_artisan']).withMessage('Invalid verification path'),
  body('bio').optional().isLength({ max: 2000 }),
  body('craftStory').optional().isLength({ max: 5000 }),
  body('storeName').optional().isLength({ max: 100 }),
  body('yearsOfExperience').optional().isInt({ min: 0 }),
];

export const updateSellerProfileValidation = [
  body('bio').optional().isLength({ max: 2000 }),
  body('craftStory').optional().isLength({ max: 5000 }),
  body('storeName').optional().isLength({ max: 100 }),
  body('specialization').optional().isArray(),
];

export const payoutValidation = [
  body('bankName').optional().trim(),
  body('bankAccount').optional().trim(),
  body('bankHolderName').optional().trim(),
  body('esewaId').optional().trim(),
  body('khaltiId').optional().trim(),
  body('bankQr').optional().isObject(),
  body('esewaQr').optional().isObject(),
  body('khaltiQr').optional().isObject(),
];
