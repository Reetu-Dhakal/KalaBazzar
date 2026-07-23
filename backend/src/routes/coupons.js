import { Router } from 'express';
import { validateCoupon, createCoupon, getAllCoupons, toggleCoupon, deleteCoupon } from '../controllers/coupon.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/validate', validateCoupon);
router.get('/', authenticate, authorize('admin'), getAllCoupons);
router.post('/', authenticate, authorize('admin'), createCoupon);
router.put('/:id/toggle', authenticate, authorize('admin'), toggleCoupon);
router.delete('/:id', authenticate, authorize('admin'), deleteCoupon);

export default router;
