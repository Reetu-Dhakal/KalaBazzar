import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist, checkWishlist, clearWishlist } from '../controllers/wishlistController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getWishlist);
router.post('/', authenticate, addToWishlist);
router.get('/check/:productId', authenticate, checkWishlist);
router.delete('/:productId', authenticate, removeFromWishlist);
router.delete('/', authenticate, clearWishlist);

export default router;