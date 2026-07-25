import { body, param, query } from 'express-validator';

export const orderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item required'),
  body('items.*.product')
    .isMongoId()
    .withMessage('Valid product ID required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('items.*.selectedVariants')
    .optional()
    .isObject()
    .withMessage('Selected variants must be object'),
  body('shippingAddress')
    .isObject()
    .withMessage('Shipping address required'),
  body('shippingAddress.fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name required'),
  body('shippingAddress.phone')
    .matches(/^(\+977|0)?[1-9]\d{9}$/)
    .withMessage('Valid Nepali phone required'),
  body('shippingAddress.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required'),
  body('shippingAddress.addressLine1')
    .trim()
    .notEmpty()
    .withMessage('Address line 1 required'),
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City required'),
  body('shippingAddress.district')
    .trim()
    .notEmpty()
    .withMessage('District required'),
  body('shippingAddress.province')
    .trim()
    .notEmpty()
    .withMessage('Province required'),
  body('shippingAddress.postalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal code required'),
  body('shippingAddress.country')
    .optional()
    .trim()
    .default('Nepal'),
  body('shippingAddress.recipientName')
    .optional()
    .trim(),
  body('billingAddress')
    .optional()
    .isObject(),
  body('paymentMethod')
    .isIn(['cod', 'khalti', 'esewa'])
    .withMessage('Invalid payment method'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes max 1000 characters'),
  body('couponCode')
    .optional()
    .trim()
    .isLength({ max: 50 }),
];

export const orderIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID'),
];

export const orderNumberValidation = [
  param('orderNumber')
    .trim()
    .matches(/^KB-[A-Z0-9]+-[A-Z0-9]+$/)
    .withMessage('Invalid order number format'),
];

export const orderQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }),
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
  query('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'failed', 'refunded']),
  query('paymentMethod')
    .optional()
    .isIn(['cod', 'khalti', 'esewa']),
  query('startDate')
    .optional()
    .isISO8601(),
  query('endDate')
    .optional()
    .isISO8601(),
  query('sort')
    .optional()
    .isIn(['newest', 'oldest', 'total_asc', 'total_desc']),
];

export const orderStatusValidation = [
  body('status')
    .isIn(['confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Invalid status'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note max 500 characters'),
  body('tracking.carrier')
    .if(body('status').equals('shipped'))
    .trim()
    .notEmpty()
    .withMessage('Carrier required for shipped status'),
  body('tracking.trackingNumber')
    .if(body('status').equals('shipped'))
    .trim()
    .notEmpty()
    .withMessage('Tracking number required for shipped status'),
  body('tracking.url')
    .optional()
    .isURL()
    .withMessage('Valid tracking URL'),
  body('cancellationReason')
    .if(body('status').equals('cancelled'))
    .trim()
    .notEmpty()
    .withMessage('Cancellation reason required'),
  body('refundReason')
    .if(body('status').equals('refunded'))
    .trim()
    .notEmpty()
    .withMessage('Refund reason required'),
  body('refundAmount')
    .if(body('status').equals('refunded'))
    .isFloat({ min: 0 })
    .withMessage('Valid refund amount required'),
];

export const sellerOrderStatusValidation = [
  body('status')
    .isIn(['confirmed', 'processing', 'shipped'])
    .withMessage('Sellers can only confirm, process, or ship orders'),
  body('tracking.carrier')
    .if(body('status').equals('shipped'))
    .trim()
    .notEmpty()
    .withMessage('Carrier required for shipped status'),
  body('tracking.trackingNumber')
    .if(body('status').equals('shipped'))
    .trim()
    .notEmpty()
    .withMessage('Tracking number required for shipped status'),
  body('tracking.url')
    .optional()
    .isURL()
    .withMessage('Valid tracking URL'),
];

export const cancelOrderValidation = [
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be 10-500 characters'),
];