import { body, query } from 'express-validator';

export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain number')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must contain special character'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be 2-50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be 2-50 characters'),
  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^(\+977|0)?[1-9]\d{9}$/)
    .withMessage('Valid Nepali phone number required'),
  body('role')
    .optional()
    .isIn(['customer', 'seller'])
    .withMessage('Invalid role'),
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required'),
  body('password')
    .notEmpty()
    .withMessage('Password required'),
];

export const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required'),
];

export const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain number')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must contain special character'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain number')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must contain special character'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match'),
];

export const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be 2-50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be 2-50 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^(\+977|0)?[1-9]\d{9}$/)
    .withMessage('Valid Nepali phone number required'),
];

export const addressValidation = [
  body('label')
    .isIn(['home', 'work', 'other'])
    .withMessage('Label must be home, work, or other'),
  body('street')
    .trim()
    .notEmpty()
    .withMessage('Street address required'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City required'),
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State/Province required'),
  body('zipCode')
    .trim()
    .notEmpty()
    .withMessage('Postal code required'),
  body('country')
    .optional()
    .trim()
    .default('Nepal'),
  body('isDefault')
    .optional()
    .isBoolean(),
];

export const sellerRegisterValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain number')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must contain special character'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be 2-50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be 2-50 characters'),
  body('phone')
    .trim()
    .matches(/^(\+977|0)?[1-9]\d{9}$/)
    .withMessage('Valid Nepali phone number required'),
];