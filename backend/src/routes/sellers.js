import { Router } from 'express';
import { applyAsSeller, getMySellerProfile, updateSellerProfile, updatePayoutInfo, toggleStore, getSellerRevenue, getSellerEarnings, getPublicSellerProfile } from '../controllers/seller.js';
import { createPost, getMyPosts, deletePost } from '../controllers/sellerPost.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sellerApplicationValidation, updateSellerProfileValidation, payoutValidation } from '../validators/seller.js';

const router = Router();

router.post('/apply', authenticate, validate(sellerApplicationValidation), applyAsSeller);
router.get('/me', authenticate, getMySellerProfile);
router.put('/profile', authenticate, validate(updateSellerProfileValidation), updateSellerProfile);
router.put('/payout', authenticate, validate(payoutValidation), updatePayoutInfo);
router.put('/toggle-store', authenticate, toggleStore);
router.get('/revenue', authenticate, getSellerRevenue);
router.get('/earnings', authenticate, getSellerEarnings);
router.get('/public/:slug', getPublicSellerProfile);
router.post('/posts', authenticate, authorize('seller'), createPost);
router.get('/posts', authenticate, authorize('seller'), getMyPosts);
router.delete('/posts/:id', authenticate, authorize('seller'), deletePost);

export default router;
