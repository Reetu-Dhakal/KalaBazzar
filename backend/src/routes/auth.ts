import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, logout, refresh, verifyEmail, resendVerification, forgotPassword, resetPassword, changePassword, getMe, updateProfile, uploadUserAvatar } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation, changePasswordValidation, updateProfileValidation } from '../validators/authValidator';
import { authLimiter } from '../middleware/rateLimiter';
import { addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../services/authService';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/register', authLimiter, validate(registerValidation), register);
router.post('/login', authLimiter, validate(loginValidation), login);
router.post('/logout', authenticate, logout);
router.post('/refresh', refresh);

router.post('/verify-email', validate([body('token').notEmpty().withMessage('Token required')]), verifyEmail);
router.post('/resend-verification', authLimiter, validate([body('email').isEmail().withMessage('Valid email required')]), resendVerification);

router.post('/forgot-password', authLimiter, validate(forgotPasswordValidation), forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordValidation), resetPassword);

router.put('/password', authenticate, validate(changePasswordValidation), changePassword);
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, validate(updateProfileValidation), updateProfile);
router.post('/avatar', authenticate, upload.single('avatar'), uploadUserAvatar);

router.post('/addresses', authenticate, validate([
  body('label').isIn(['home', 'work', 'other']).withMessage('Invalid label'),
  body('street').notEmpty().withMessage('Street required'),
  body('city').notEmpty().withMessage('City required'),
  body('state').notEmpty().withMessage('State required'),
  body('zipCode').notEmpty().withMessage('Zip code required'),
  body('isDefault').optional().isBoolean(),
]), async (req: any, res: any, next: any) => {
  try {
    const addresses = await addAddress(req.user._id, req.body);
    res.status(201).json({ success: true, data: addresses });
  } catch (error) {
    next(error);
  }
});

router.put('/addresses/:addressId', authenticate, validate([
  body('label').optional().isIn(['home', 'work', 'other']),
  body('street').optional().notEmpty(),
  body('city').optional().notEmpty(),
  body('state').optional().notEmpty(),
  body('zipCode').optional().notEmpty(),
  body('isDefault').optional().isBoolean(),
]), async (req: any, res: any, next: any) => {
  try {
    const addresses = await updateAddress(req.user._id, req.params.addressId, req.body);
    res.json({ success: true, data: addresses });
  } catch (error) {
    next(error);
  }
});

router.delete('/addresses/:addressId', authenticate, async (req: any, res: any, next: any) => {
  try {
    const addresses = await deleteAddress(req.user._id, req.params.addressId);
    res.json({ success: true, data: addresses });
  } catch (error) {
    next(error);
  }
});

router.put('/addresses/:addressId/default', authenticate, async (req: any, res: any, next: any) => {
  try {
    const addresses = await setDefaultAddress(req.user._id, req.params.addressId);
    res.json({ success: true, data: addresses });
  } catch (error) {
    next(error);
  }
});

export default router;