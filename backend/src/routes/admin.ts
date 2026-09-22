import { Router } from 'express';
import { getDashboardStats, getDayDetails, getAllUsers, getUserById, updateUserStatus, getSellerApplications, approveSellerApplication, rejectSellerApplication, getSellerApplicationsV2, approveSellerApplicationV2, rejectSellerApplicationV2, getAllOrders, updateOrderStatus, getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../controllers/adminController';
import { reviewRefund } from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/dashboard/day', getDayDetails);

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/status', updateUserStatus);

router.get('/sellers', getSellerApplications);
router.put('/sellers/:id/approve', approveSellerApplication);
router.put('/sellers/:id/reject', rejectSellerApplication);

const sellerApplicationIdValidation = [
  param('id').isMongoId().withMessage('Invalid application ID'),
];

router.get('/seller-applications', getSellerApplicationsV2);
router.put('/seller-applications/:id/approve', validate(sellerApplicationIdValidation), approveSellerApplicationV2);
router.put('/seller-applications/:id/reject', validate([
  ...sellerApplicationIdValidation,
  body('reason').trim().notEmpty().withMessage('Rejection reason / note is required'),
]), rejectSellerApplicationV2);

router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/refund', reviewRefund);

router.get('/coupons', getCoupons);
router.post('/coupons', validate([
  body('code').notEmpty().withMessage('Coupon code required'),
  body('discountType').isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
  body('discountValue').isNumeric().withMessage('Discount value required'),
]), createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

export default router;