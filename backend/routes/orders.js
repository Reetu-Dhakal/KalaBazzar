const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
  requestRefund,
  getSellerOrders,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/me', protect, getMyOrders);
router.get('/seller/me', protect, authorize('seller'), getSellerOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('seller', 'admin'), updateOrderStatus);
router.put('/:id/payment', protect, authorize('admin'), updatePaymentStatus);
router.post('/:id/refund', protect, requestRefund);

module.exports = router;