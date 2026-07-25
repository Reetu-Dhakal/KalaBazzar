import { Router } from 'express';
import { createOrder, getMyOrders, getSellerOrders, getOrderById, updateOrderStatus, cancelOrder, addTrackingNumber, getAllOrders, getOrderStats } from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createOrder);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/seller', authenticate, authorize('seller', 'admin'), getSellerOrders);
router.get('/admin/stats', authenticate, authorize('admin'), getOrderStats);
router.get('/', authenticate, authorize('admin'), getAllOrders);
router.get('/:id', authenticate, getOrderById);
router.put('/:id/status', authenticate, authorize('admin', 'seller'), updateOrderStatus);
router.put('/:id/cancel', authenticate, cancelOrder);
router.put('/:id/tracking', authenticate, authorize('seller'), addTrackingNumber);

export default router;