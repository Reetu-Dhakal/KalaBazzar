import { Router } from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  publishProduct,
  unpublishProduct,
  addProductReview,
  getProductReviews,
  voteReviewHelpful,
  incrementViewCount,
} from '../controllers/productController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  productValidation,
  productIdValidation,
  productSlugValidation,
  productQueryValidation,
  reviewValidation,
} from '../validators/productValidator';

const router = Router();

router.get('/', validate(productQueryValidation), getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/id/:id', validate(productIdValidation), getProductById);
router.get('/:slug', validate(productSlugValidation), getProductBySlug);

router.post('/', authenticate, authorize('seller'), validate(productValidation), createProduct);
router.put('/:id', authenticate, authorize('seller'), validate([...productIdValidation, ...productValidation]), updateProduct);
router.delete('/:id', authenticate, authorize('seller'), validate(productIdValidation), deleteProduct);
router.put('/:id/publish', authenticate, authorize('seller'), validate(productIdValidation), publishProduct);
router.put('/:id/unpublish', authenticate, authorize('seller'), validate(productIdValidation), unpublishProduct);

router.post('/:id/reviews', authenticate, validate([...productIdValidation, ...reviewValidation]), addProductReview);
router.get('/:id/reviews', validate(productIdValidation), getProductReviews);
router.put('/reviews/:reviewId/helpful', authenticate, voteReviewHelpful);

router.post('/:id/view', validate(productIdValidation), incrementViewCount);

export default router;
