import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById, cancelOrder, getSellerOrders, updateOrderStatus, updateTrackingNumber } from '../controllers/order.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { orderValidation } from '../validators/order.js';

const router = Router();

router.post('/', authenticate, validate(orderValidation), createOrder);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/seller-orders', authenticate, authorize('seller'), getSellerOrders);
router.get('/:id', authenticate, getOrderById);
router.put('/:id/cancel', authenticate, cancelOrder);
router.put('/:id/status', authenticate, authorize('seller', 'admin'), updateOrderStatus);
router.put('/:id/tracking', authenticate, authorize('seller', 'admin'), updateTrackingNumber);

export default router;
