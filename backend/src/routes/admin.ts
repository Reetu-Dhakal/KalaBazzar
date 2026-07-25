import { Router } from 'express';
import { getDashboardStats, getAllUsers, getUserById, updateUserStatus, getSellerApplications, approveSellerApplication, rejectSellerApplication, getAllOrders, updateOrderStatus, getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboardStats);

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/status', updateUserStatus);

router.get('/sellers', getSellerApplications);
router.put('/sellers/:id/approve', approveSellerApplication);
router.put('/sellers/:id/reject', rejectSellerApplication);

router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

router.get('/coupons', getCoupons);
router.post('/coupons', validate([
  body('code').notEmpty().withMessage('Coupon code required'),
  body('discountType').isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
  body('discountValue').isNumeric().withMessage('Discount value required'),
]), createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

export default router;