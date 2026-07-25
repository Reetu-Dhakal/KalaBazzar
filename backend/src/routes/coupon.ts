import { Router } from 'express';
import { getCoupons, getCouponById, createCoupon, updateCoupon, deleteCoupon, toggleCouponStatus, validateCoupon, applyCoupon } from '../controllers/couponController';
import { authenticate, authorize } from '../middleware/auth';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';

const router = Router();

router.get('/validate/:code', authenticate, validateCoupon);
router.post('/apply', authenticate, applyCoupon);

router.get('/', authenticate, authorize('admin'), getCoupons);
router.get('/:id', authenticate, authorize('admin'), getCouponById);
router.post('/', authenticate, authorize('admin'), validate([
  body('code').notEmpty().withMessage('Coupon code required'),
  body('discountType').isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
  body('discountValue').isFloat({ min: 0 }).withMessage('Discount value must be positive'),
]), createCoupon);
router.put('/:id', authenticate, authorize('admin'), updateCoupon);
router.delete('/:id', authenticate, authorize('admin'), deleteCoupon);
router.put('/:id/toggle', authenticate, authorize('admin'), toggleCouponStatus);

export default router;