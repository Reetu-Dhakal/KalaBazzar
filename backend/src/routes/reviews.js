import { Router } from 'express';
import { createReview, getProductReviews, deleteReview, markHelpful } from '../controllers/review.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { reviewValidation } from '../validators/order.js';

const router = Router();

router.post('/', authenticate, validate(reviewValidation), createReview);
router.get('/product/:slug', getProductReviews);
router.delete('/:id', authenticate, deleteReview);
router.post('/:id/helpful', authenticate, markHelpful);

export default router;
