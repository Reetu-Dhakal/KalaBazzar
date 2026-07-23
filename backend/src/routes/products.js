import { Router } from 'express';
import { createProduct, getMyProducts, updateProduct, deleteProduct, getProductById, getPublishedProducts, getFeaturedProducts, trackProductView } from '../controllers/product.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { productValidation } from '../validators/product.js';

const router = Router();

router.get('/published', getPublishedProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:slug', getProductById);
router.post('/:slug/view', trackProductView);
router.post('/', authenticate, authorize('seller'), validate(productValidation), createProduct);
router.get('/', authenticate, authorize('seller'), getMyProducts);
router.put('/:id', authenticate, authorize('seller'), validate(productValidation), updateProduct);
router.delete('/:id', authenticate, authorize('seller'), deleteProduct);

export default router;
