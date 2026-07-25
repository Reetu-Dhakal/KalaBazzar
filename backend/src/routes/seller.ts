import { Router } from 'express';
import {
  applyAsSeller,
  getSellerApplicationStatus,
  updateSellerProfile,
  updatePayoutDetails,
  getSellerDashboardStats,
  getSellerProducts,
  getSellerPublicProfile,
  getAllSellers,
  approveSeller,
  rejectSeller,
} from '../controllers/sellerController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  sellerApplicationValidation,
  updateSellerProfileValidation,
  payoutValidation,
  sellerIdValidation,
  sellerQueryValidation,
  sellerProductQueryValidation,
} from '../validators/sellerValidator';

const router = Router();

router.post('/apply', authenticate, validate(sellerApplicationValidation), applyAsSeller);
router.get('/application/status', authenticate, getSellerApplicationStatus);

router.put('/profile', authenticate, authorize('seller'), validate(updateSellerProfileValidation), updateSellerProfile);
router.put('/payout', authenticate, authorize('seller'), validate(payoutValidation), updatePayoutDetails);
router.get('/dashboard/stats', authenticate, authorize('seller'), getSellerDashboardStats);
router.get('/dashboard/products', authenticate, authorize('seller'), validate(sellerProductQueryValidation), getSellerProducts);

router.get('/:idOrSlug', getSellerPublicProfile);

router.get('/', authenticate, authorize('admin'), validate(sellerQueryValidation), getAllSellers);
router.put('/:sellerId/approve', authenticate, authorize('admin'), validate(sellerIdValidation), approveSeller);
router.put('/:sellerId/reject', authenticate, authorize('admin'), validate(sellerIdValidation), rejectSeller);

export default router;
