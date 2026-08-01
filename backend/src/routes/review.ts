import { Router } from 'express';
import { createReview, getProductReviews, getMyReviews, updateReview, deleteReview, voteReviewHelpful, getAdminReviews, deleteAdminReview, getPublicReviews } from '../controllers/reviewController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getPublicReviews);
router.get('/my-reviews', authenticate, getMyReviews);
router.get('/admin', authenticate, authorize('admin'), getAdminReviews);
router.get('/product/:productId', getProductReviews);
router.post('/product/:productId', authenticate, createReview);
router.delete('/admin/:id', authenticate, authorize('admin'), deleteAdminReview);
router.put('/:id/helpful', authenticate, voteReviewHelpful);
router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

export default router;