import { Router } from 'express';
import {
  getDashboardStats, getPendingSellers, approveSeller, rejectSeller,
  getAllUsers, manageUserStatus, getAllOrders, adminUpdateOrderStatus,
  getAllReviews, adminDeleteReview,
} from '../controllers/admin.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', authenticate, authorize('admin'), getDashboardStats);
router.get('/pending-sellers', authenticate, authorize('admin'), getPendingSellers);
router.put('/sellers/:id/approve', authenticate, authorize('admin'), approveSeller);
router.put('/sellers/:id/reject', authenticate, authorize('admin'), rejectSeller);
router.get('/users', authenticate, authorize('admin'), getAllUsers);
router.put('/users/:id/status', authenticate, authorize('admin'), manageUserStatus);
router.get('/orders', authenticate, authorize('admin'), getAllOrders);
router.put('/orders/:id/status', authenticate, authorize('admin'), adminUpdateOrderStatus);
router.get('/reviews', authenticate, authorize('admin'), getAllReviews);
router.delete('/reviews/:id', authenticate, authorize('admin'), adminDeleteReview);

export default router;
