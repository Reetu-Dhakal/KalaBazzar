import { body } from 'express-validator';

export const reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('comment').notEmpty().isLength({ max: 2000 }).withMessage('Review comment required'),
  body('title').optional().isLength({ max: 200 }),
];

export const orderValidation = [
  body('shippingAddress.fullName').notEmpty().withMessage('Full name required'),
  body('shippingAddress.phone').notEmpty().withMessage('Phone required'),
  body('shippingAddress.address').notEmpty().withMessage('Address required'),
  body('shippingAddress.city').notEmpty().withMessage('City required'),
  body('shippingAddress.district').notEmpty().withMessage('District required'),
  body('paymentMethod').isIn(['khalti', 'esewa', 'cod']).withMessage('Invalid payment method'),
];
