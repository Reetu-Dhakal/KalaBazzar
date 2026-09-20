import { Router } from 'express';
import { createOrder, getMyOrders, getSellerOrders, getOrderById, updateOrderStatus, cancelOrder, requestRefund, reviewRefund, addTrackingNumber, getAllOrders, getOrderStats } from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { orderValidation } from '../validators/orderValidator';

const router = Router();

router.post('/', authenticate, validate(orderValidation), createOrder);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/seller', authenticate, authorize('seller', 'admin'), getSellerOrders);
router.get('/admin/stats', authenticate, authorize('admin'), getOrderStats);
router.get('/', authenticate, authorize('admin'), getAllOrders);
router.get('/:id', authenticate, getOrderById);
router.put('/:id/status', authenticate, authorize('admin', 'seller'), updateOrderStatus);
router.put('/:id/cancel', authenticate, cancelOrder);
router.post('/:id/refund-request', authenticate, requestRefund);
router.put('/:id/refund', authenticate, authorize('admin'), reviewRefund);
router.put('/:id/tracking', authenticate, authorize('seller'), addTrackingNumber);

export default router;