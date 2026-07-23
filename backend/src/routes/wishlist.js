import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist, clearWishlist, moveAllToCart } from '../controllers/wishlist.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getWishlist);
router.post('/add', authenticate, addToWishlist);
router.delete('/remove/:productId', authenticate, removeFromWishlist);
router.delete('/clear', authenticate, clearWishlist);
router.post('/move-to-cart', authenticate, moveAllToCart);

export default router;
